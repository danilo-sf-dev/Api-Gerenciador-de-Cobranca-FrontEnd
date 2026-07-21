import { db } from "@/mocks/data/db";
import { Customer, PageResponse } from "@/types";

export class CustomersService {
  static async getCustomers(params: {
    page: number;
    size?: number;
    search?: string;
    sort?: string;
  }): Promise<PageResponse<Customer>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const size = params.size || 15;
    const page = params.page || 1;
    const search = (params.search || "").toLowerCase().trim();

    let items = db.customers;
    if (search) {
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.document.replace(/\D/g, "").includes(search) ||
          c.sellerName.toLowerCase().includes(search) ||
          c.sellerCode.includes(search),
      );
    }

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

  static async getCustomerById(id: string): Promise<Customer> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const customer = db.customers.find((c) => c.id === id);
    if (!customer) throw new Error("Cliente não encontrado");
    return customer;
  }

  static async createCustomer(
    data: Omit<Customer, "id" | "createdAt" | "updatedAt">,
  ): Promise<Customer> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Verify document uniqueness
    const cleanDoc = data.document.replace(/\D/g, "");
    const exists = db.customers.find((c) => c.document.replace(/\D/g, "") === cleanDoc);
    if (exists) {
      throw new Error("Já existe um cliente cadastrado com este CPF/CNPJ.");
    }

    // Verify seller is active in database
    const seller = db.sellers.find((s) => s.code === data.sellerCode);
    if (!seller) {
      throw new Error(`Código de vendedor "${data.sellerCode}" inválido.`);
    }
    if (seller.status !== "ACTIVE") {
      throw new Error(
        `O vendedor associado "${seller.name}" está INATIVO. O cadastro exige um vendedor ativo.`,
      );
    }

    const newCustomer: Customer = {
      id: Math.random().toString(36).substring(2, 11),
      document: data.document,
      documentType: data.documentType,
      name: data.name,
      email: data.email,
      phone: data.phone,
      sellerCode: seller.code,
      sellerName: seller.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.customers.unshift(newCustomer);
    return newCustomer;
  }

  static async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const customer = db.customers.find((c) => c.id === id);
    if (!customer) throw new Error("Cliente não encontrado");

    if (data.document) {
      const cleanDoc = data.document.replace(/\D/g, "");
      const exists = db.customers.find(
        (c) => c.id !== id && c.document.replace(/\D/g, "") === cleanDoc,
      );
      if (exists) {
        throw new Error("Já existe um cliente cadastrado com este CPF/CNPJ.");
      }
      customer.document = data.document;
      if (data.documentType) customer.documentType = data.documentType;
    }

    if (data.sellerCode) {
      const seller = db.sellers.find((s) => s.code === data.sellerCode);
      if (!seller) {
        throw new Error(`Código de vendedor "${data.sellerCode}" inválido.`);
      }
      if (seller.status !== "ACTIVE") {
        throw new Error(`O vendedor associado "${seller.name}" está inativo.`);
      }
      customer.sellerCode = seller.code;
      customer.sellerName = seller.name;
    }

    if (data.name) customer.name = data.name;
    if (data.email !== undefined) customer.email = data.email;
    if (data.phone !== undefined) customer.phone = data.phone;
    customer.updatedAt = new Date().toISOString();

    return customer;
  }

  static async getActiveCustomerList(): Promise<Customer[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return db.customers;
  }
}
