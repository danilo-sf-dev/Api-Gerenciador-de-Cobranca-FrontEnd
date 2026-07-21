import { db, calculateTitleStatus } from "@/mocks/data/db";
import { Title, PageResponse, TitleStatus, PaymentMethod, TitleHistory, Customer } from "@/types";

export class TitlesService {
  static async getTitles(params: {
    page: number;
    size?: number;
    statuses?: TitleStatus[]; // Multiple selection filter
    sellerCode?: string;
    dueDateStart?: string;
    dueDateEnd?: string;
    search?: string; // Search by client name or CPF/CNPJ
    sort?: string;
  }): Promise<PageResponse<Title>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const size = params.size || 15;
    const page = params.page || 1;

    let items = db.getTitles(); // Get titles with calculated fields

    // 1. Filter by status (multiple select)
    if (params.statuses && params.statuses.length > 0) {
      items = items.filter((t) => params.statuses!.includes(t.status));
    }

    // 2. Filter by seller
    if (params.sellerCode) {
      items = items.filter((t) => t.sellerCode === params.sellerCode);
    }

    // 3. Filter by due date range
    if (params.dueDateStart) {
      const start = new Date(params.dueDateStart).getTime();
      items = items.filter((t) => new Date(t.dueDate).getTime() >= start);
    }
    if (params.dueDateEnd) {
      const end = new Date(params.dueDateEnd).getTime();
      items = items.filter((t) => new Date(t.dueDate).getTime() <= end);
    }

    // 4. Search by client name or document
    if (params.search) {
      const cleanSearch = params.search.toLowerCase().trim();
      const digits = cleanSearch.replace(/\D/g, "");
      items = items.filter(
        (t) =>
          t.customerName.toLowerCase().includes(cleanSearch) ||
          t.customerDocument.replace(/\D/g, "").includes(digits) ||
          t.id.toLowerCase().includes(cleanSearch),
      );
    }

    // 5. Sort
    if (params.sort) {
      const [field, direction] = params.sort.split(",");
      items = [...items].sort((a: any, b: any) => {
        const valA = a[field] ?? "";
        const valB = b[field] ?? "";
        if (typeof valA === "string") {
          return direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return direction === "asc" ? valA - valB : valB - valA;
        }
      });
    } else {
      // Default: show late, overdue and upcoming first, ordered by due date
      const statusPriority: Record<TitleStatus, number> = {
        LATE: 1,
        OVERDUE: 2,
        UPCOMING: 3,
        PAID: 4,
        RENEGOTIATED: 5,
        CANCELED: 6,
      };
      items = [...items].sort((a, b) => {
        const prio = statusPriority[a.status] - statusPriority[b.status];
        if (prio !== 0) return prio;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    }

    const totalElements = items.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = (page - 1) * size;
    const content = items.slice(start, start + size);

    return {
      content,
      page,
      size,
      totalElements,
      totalPages,
    };
  }

  static async getTitleById(id: string): Promise<Title> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const title = db.getTitles().find((t) => t.id === id);
    if (!title) throw new Error("Título não encontrado.");
    return title;
  }

  static async getTitleHistory(titleId: string): Promise<TitleHistory[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return db.titleHistory
      .filter((h) => h.titleId === titleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async createTitle(data: {
    customerId: string;
    originalAmount: number;
    dueDate: string;
    issueDate: string;
  }): Promise<Title> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const customer = db.customers.find((c) => c.id === data.customerId);
    if (!customer) throw new Error("Cliente não cadastrado no sistema.");

    // Look up seller
    const seller = db.sellers.find((s) => s.code === customer.sellerCode);
    if (!seller) throw new Error(`Vendedor do cliente (${customer.sellerCode}) inválido.`);
    if (seller.status !== "ACTIVE") {
      throw new Error(`O vendedor associado a este cliente (${seller.name}) está inativo.`);
    }

    if (data.originalAmount <= 0) {
      throw new Error("O valor original do título deve ser maior que zero.");
    }

    const newTitle: Title = {
      id: "t-" + Math.random().toString(36).substring(2, 11),
      customerId: customer.id,
      customerName: customer.name,
      customerDocument: customer.document,
      sellerCode: seller.code,
      sellerName: seller.name,
      originalAmount: data.originalAmount,
      updatedAmount: data.originalAmount,
      fineAmount: 0,
      interestAmount: 0,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      status: "UPCOMING",
      isPaidByRenegotiation: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.titles.push(newTitle);

    db.titleHistory.push({
      id: "th-" + Math.random().toString(36).substring(2, 11),
      titleId: newTitle.id,
      status: "UPCOMING",
      reason: "Cadastro manual de título",
      userName: db.currentUser.name,
      createdAt: new Date().toISOString(),
    });

    return newTitle;
  }

  static async updateTitle(
    id: string,
    data: {
      originalAmount?: number;
      dueDate?: string;
      issueDate?: string;
    },
  ): Promise<Title> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const title = db.titles.find((t) => t.id === id);
    if (!title) throw new Error("Título não encontrado.");

    // Only active/upcoming titles are editable
    const calculated = db.getCalculatedTitle(title);
    if (calculated.status !== "UPCOMING") {
      throw new Error('Apenas títulos no status "A vencer" podem ser editados.');
    }

    if (data.originalAmount !== undefined) {
      if (data.originalAmount <= 0) {
        throw new Error("O valor do título deve ser maior que zero.");
      }
      title.originalAmount = data.originalAmount;
      title.updatedAmount = data.originalAmount;
    }

    if (data.dueDate !== undefined) {
      title.dueDate = data.dueDate;
    }

    if (data.issueDate !== undefined) {
      title.issueDate = data.issueDate;
    }

    title.updatedAt = new Date().toISOString();

    db.titleHistory.push({
      id: "th-" + Math.random().toString(36).substring(2, 11),
      titleId: title.id,
      status: "UPCOMING",
      reason: "Edição manual do título",
      userName: db.currentUser.name,
      createdAt: new Date().toISOString(),
    });

    return db.getCalculatedTitle(title);
  }

  static async registerPayment(
    id: string,
    paymentMethod: PaymentMethod,
    paidAt: string,
  ): Promise<Title> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Find mutable title
    const title = db.titles.find((t) => t.id === id);
    if (!title) throw new Error("Título não encontrado.");

    // Calculate dynamic values first to save fine/interest applied at date of payment
    const calculated = db.getCalculatedTitle(title);

    if (calculated.status === "PAID") throw new Error("Este título já está pago.");
    if (calculated.status === "CANCELED")
      throw new Error("Não é possível dar baixa em título cancelado.");
    if (calculated.status === "RENEGOTIATED")
      throw new Error("Não é possível dar baixa direta em título renegociado.");

    title.status = "PAID";
    title.paymentMethod = paymentMethod;
    title.paidAt = paidAt;
    title.fineAmount = calculated.fineAmount;
    title.interestAmount = calculated.interestAmount;
    title.updatedAmount = calculated.updatedAmount;
    title.updatedAt = new Date().toISOString();

    db.titleHistory.push({
      id: "th-" + Math.random().toString(36).substring(2, 11),
      titleId: id,
      status: "PAID",
      reason: `Baixa de pagamento efetuada via ${paymentMethod}`,
      userName: db.currentUser.name,
      createdAt: new Date().toISOString(),
    });

    return db.getCalculatedTitle(title);
  }

  static async cancelTitle(id: string): Promise<Title> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const title = db.titles.find((t) => t.id === id);
    if (!title) throw new Error("Título não encontrado.");

    const calculated = db.getCalculatedTitle(title);

    // State machine check: can only cancel if UPCOMING
    if (calculated.status !== "UPCOMING") {
      throw new Error(
        `Transição de estado inválida: Não é permitido cancelar um título no status ${calculated.status}. Cancelamentos são permitidos apenas para títulos "A vencer".`,
      );
    }

    title.status = "CANCELED";
    title.updatedAt = new Date().toISOString();

    db.titleHistory.push({
      id: "th-" + Math.random().toString(36).substring(2, 11),
      titleId: id,
      status: "CANCELED",
      reason: "Cancelamento manual do título",
      userName: db.currentUser.name,
      createdAt: new Date().toISOString(),
    });

    // If it was a child title, check if all sibling children of the parent are cancelled.
    // "só retorna a Atraso se todos os títulos-filhos forem cancelados"
    if (title.parentTitleId) {
      const parent = db.titles.find((t) => t.id === title.parentTitleId);
      if (parent && parent.status === "RENEGOTIATED") {
        const siblings = db.titles.filter((t) => t.parentTitleId === parent.id);
        const allCancelled = siblings.every((s) => s.status === "CANCELED");
        if (allCancelled) {
          parent.status = "LATE";
          parent.updatedAt = new Date().toISOString();
          db.titleHistory.push({
            id: "th-" + Math.random().toString(36).substring(2, 11),
            titleId: parent.id,
            status: "LATE",
            reason: "Reversão de renegociação: todos os títulos-filhos foram cancelados.",
            userName: "Sistema",
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    return db.getCalculatedTitle(title);
  }

  static async renegotiateTitle(
    id: string,
    installments: { dueDate: string; amount: number }[],
    reason: string,
  ): Promise<Title> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const title = db.titles.find((t) => t.id === id);
    if (!title) throw new Error("Título não encontrado.");

    const calculated = db.getCalculatedTitle(title);

    // State machine check: must be in LATE (Atraso) status
    if (calculated.status !== "LATE") {
      throw new Error(
        `Não é permitido renegociar títulos que não estejam em Atraso. Status atual: ${calculated.status}`,
      );
    }

    if (installments.length === 0) {
      throw new Error("A renegociação exige a geração de pelo menos uma parcela.");
    }

    // Set parent title status to RENEGOTIATED
    title.status = "RENEGOTIATED";
    title.fineAmount = calculated.fineAmount;
    title.interestAmount = calculated.interestAmount;
    title.updatedAmount = calculated.updatedAmount;
    title.updatedAt = new Date().toISOString();

    const parentHistoryId = "th-" + Math.random().toString(36).substring(2, 11);
    db.titleHistory.push({
      id: parentHistoryId,
      titleId: id,
      status: "RENEGOTIATED",
      reason: `Título renegociado. Motivo: ${reason}`,
      userName: db.currentUser.name,
      createdAt: new Date().toISOString(),
    });

    // Create child titles
    const childIds: string[] = [];
    installments.forEach((inst, index) => {
      const childId = `${id}-child-${index + 1}-${Math.random().toString(36).substring(2, 5)}`;
      const childTitle: Title = {
        id: childId,
        customerId: title.customerId,
        customerName: title.customerName,
        customerDocument: title.customerDocument,
        sellerCode: title.sellerCode,
        sellerName: title.sellerName,
        originalAmount: inst.amount,
        updatedAmount: inst.amount,
        fineAmount: 0,
        interestAmount: 0,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: inst.dueDate,
        status: "UPCOMING",
        parentTitleId: title.id,
        isPaidByRenegotiation: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.titles.push(childTitle);
      childIds.push(childId);

      db.titleHistory.push({
        id: "th-" + Math.random().toString(36).substring(2, 11),
        titleId: childId,
        status: "UPCOMING",
        reason: `Parcela ${index + 1} de ${installments.length} gerada via renegociação do título ${title.id}`,
        userName: db.currentUser.name,
        createdAt: new Date().toISOString(),
      });
    });

    return db.getCalculatedTitle(title);
  }

  // Get full parent/child trace for visual tree
  static async getRenegotiationTree(id: string): Promise<{
    main: Title;
    parent?: Title;
    children: Title[];
  }> {
    const titles = db.getTitles();
    const main = titles.find((t) => t.id === id);
    if (!main) throw new Error("Título não encontrado.");

    const parent = main.parentTitleId ? titles.find((t) => t.id === main.parentTitleId) : undefined;
    const children = titles.filter((t) => t.parentTitleId === main.id);

    return {
      main,
      parent,
      children,
    };
  }

  // CSV Import Simulation
  static async importTitles(csvText: string): Promise<{
    successCount: number;
    failedCount: number;
    rejectedLines: { line: number; content: string; reason: string }[];
  }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const lines = csvText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let successCount = 0;
    let failedCount = 0;
    const rejectedLines: { line: number; content: string; reason: string }[] = [];

    // Format expected: DocumentoCliente;NomeCliente;EmailCliente;CelularCliente;ValorOriginal;DataVencimento;CodigoVendedor;IDTituloUnico
    // Skip header line if present
    const startIndex = lines[0].toLowerCase().includes("documento") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const content = lines[i];
      const parts = content.split(";").map((p) => p.trim());

      if (parts.length < 7) {
        failedCount++;
        rejectedLines.push({
          line: i + 1,
          content,
          reason:
            "Formato inválido. A linha deve conter pelo menos: Documento;Nome;Email;Celular;Valor;Vencimento;CodigoVendedor",
        });
        continue;
      }

      const [document, name, email, phone, rawValue, dueDate, sellerCode, externalId] = parts;

      // 1. Verify seller exists
      const seller = db.sellers.find((s) => s.code === sellerCode);
      if (!seller) {
        failedCount++;
        rejectedLines.push({
          line: i + 1,
          content,
          reason: `Vendedor com código "${sellerCode}" não cadastrado.`,
        });
        continue;
      }

      // 2. Check value
      const amount = parseFloat(rawValue.replace(",", "."));
      if (isNaN(amount) || amount <= 0) {
        failedCount++;
        rejectedLines.push({
          line: i + 1,
          content,
          reason: "Valor inválido (deve ser maior que zero).",
        });
        continue;
      }

      // 3. Check if title already exists (by externalId or auto-match)
      const titleId = externalId || `imp-${uuid()}`;
      const titleExists = db.titles.find((t) => t.id === titleId);
      if (titleExists) {
        failedCount++;
        rejectedLines.push({
          line: i + 1,
          content,
          reason: `Título com ID único "${titleId}" já cadastrado no sistema.`,
        });
        continue;
      }

      // 4. Client auto-create check
      const cleanDoc = document.replace(/\D/g, "");
      let customer = db.customers.find((c) => c.document.replace(/\D/g, "") === cleanDoc);

      if (!customer) {
        // Auto-create customer
        const isCnpj = cleanDoc.length === 14;
        customer = {
          id: "c-" + Math.random().toString(36).substring(2, 11),
          document,
          documentType: isCnpj ? "CNPJ" : "CPF",
          name,
          email: email || undefined,
          phone: phone || undefined,
          sellerCode: seller.code,
          sellerName: seller.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.customers.unshift(customer);
      }

      // 5. Create title
      const newTitle: Title = {
        id: titleId,
        customerId: customer.id,
        customerName: customer.name,
        customerDocument: customer.document,
        sellerCode: seller.code,
        sellerName: seller.name,
        originalAmount: amount,
        updatedAmount: amount,
        fineAmount: 0,
        interestAmount: 0,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: dueDate,
        status: "UPCOMING",
        isPaidByRenegotiation: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.titles.push(newTitle);

      db.titleHistory.push({
        id: "th-" + Math.random().toString(36).substring(2, 11),
        titleId: newTitle.id,
        status: "UPCOMING",
        reason: "Importação automática via arquivo CSV",
        userName: db.currentUser.name,
        createdAt: new Date().toISOString(),
      });

      successCount++;
    }

    return {
      successCount,
      failedCount,
      rejectedLines,
    };
  }
}

const uuid = () => Math.random().toString(36).substring(2, 8);
