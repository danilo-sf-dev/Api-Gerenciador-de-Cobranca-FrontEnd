import { db, generateSellerCode } from "@/mocks/data/db";
import { Seller, PageResponse } from "@/types";

export class SellersService {
  static async getSellers(params: {
    page: number;
    size?: number;
    search?: string;
    sort?: string; // Format: "field,asc" or "field,desc"
  }): Promise<PageResponse<Seller>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const size = params.size || 15;
    const page = params.page || 1;
    const search = (params.search || "").toLowerCase().trim();

    // 1. Filter
    let items = db.sellers;
    if (search) {
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.code.includes(search) ||
          s.cpf.replace(/\D/g, "").includes(search) ||
          (s.email && s.email.toLowerCase().includes(search)),
      );
    }

    // 2. Sort
    if (params.sort) {
      const [field, direction] = params.sort.split(",");
      items = [...items].sort((a: any, b: any) => {
        const valA = a[field] || "";
        const valB = b[field] || "";
        if (typeof valA === "string") {
          return direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return direction === "asc" ? valA - valB : valB - valA;
        }
      });
    } else {
      // Default sort by name ascending
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    }

    // 3. Paginate
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

  static async getSellerById(id: string): Promise<Seller> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const seller = db.sellers.find((s) => s.id === id);
    if (!seller) throw new Error("Vendedor não encontrado");
    return seller;
  }

  static async createSeller(
    data: Omit<Seller, "id" | "code" | "createdAt" | "updatedAt">,
  ): Promise<Seller> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Check CPF unique
    const cleanCpf = data.cpf.replace(/\D/g, "");
    const exists = db.sellers.find((s) => s.cpf.replace(/\D/g, "") === cleanCpf);
    if (exists) {
      throw new Error("Já existe um vendedor cadastrado com este CPF.");
    }

    const newSeller: Seller = {
      id: Math.random().toString(36).substring(2, 11),
      code: generateSellerCode(),
      cpf: data.cpf,
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: data.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.sellers.unshift(newSeller);
    return newSeller;
  }

  static async updateSeller(id: string, data: Partial<Seller>): Promise<Seller> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const seller = db.sellers.find((s) => s.id === id);
    if (!seller) throw new Error("Vendedor não encontrado");

    if (data.cpf) {
      const cleanCpf = data.cpf.replace(/\D/g, "");
      const exists = db.sellers.find((s) => s.id !== id && s.cpf.replace(/\D/g, "") === cleanCpf);
      if (exists) {
        throw new Error("Já existe um vendedor cadastrado com este CPF.");
      }
      seller.cpf = data.cpf;
    }

    if (data.name) seller.name = data.name;
    if (data.email !== undefined) seller.email = data.email;
    if (data.phone) seller.phone = data.phone;
    if (data.status) seller.status = data.status;
    seller.updatedAt = new Date().toISOString();

    // Sync seller name in customers & titles if name changed
    if (data.name) {
      db.customers = db.customers.map((c) =>
        c.sellerCode === seller.code ? { ...c, sellerName: seller.name } : c,
      );
      db.titles = db.titles.map((t) =>
        t.sellerCode === seller.code ? { ...t, sellerName: seller.name } : t,
      );
    }

    return seller;
  }

  static async changeSellerStatus(id: string, status: "ACTIVE" | "INACTIVE"): Promise<Seller> {
    return this.updateSeller(id, { status });
  }

  static async searchSellers(query: string): Promise<Seller[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return db.sellers.filter((s) => s.status === "ACTIVE");

    return db.sellers.filter(
      (s) =>
        s.status === "ACTIVE" &&
        (s.name.toLowerCase().includes(cleanQuery) || s.code.includes(cleanQuery)),
    );
  }
}
