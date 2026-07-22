export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type Seller = {
  id: string;
  code: string;
  cpf: string;
  name: string;
  email?: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
};

export type Role = {
  id: string;
  name: string;
  hierarchyLevel: number; // Owner = 1, Gerente = 2, Vendedor = 3, Funcionário = 4
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
};

export type UserStatus = "PENDING_INVITATION" | "ACTIVE" | "INACTIVE";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
};

export type RoleHistory = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  fromRoleName: string;
  toRoleName: string;
  type: "PERMANENT" | "TEMPORARY";
  reason: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
};

export type Customer = {
  id: string;
  document: string; // CPF or CNPJ
  documentType: "CPF" | "CNPJ";
  name: string;
  email?: string;
  phone?: string;
  sellerCode: string;
  sellerName: string;
  createdAt: string;
  updatedAt: string;
};

export type TitleStatus =
  | "UPCOMING" // A vencer
  | "OVERDUE" // Vencido (up to 2 days)
  | "LATE" // Atraso (3+ days)
  | "PAID" // Pago
  | "CANCELED" // Cancelado
  | "RENEGOTIATED"; // Renegociado

export type PaymentMethod = "PIX" | "BOLETO" | "CARD";

export type Title = {
  id: string;
  customerId: string;
  customerName: string;
  customerDocument: string;
  sellerCode: string;
  sellerName: string;
  originalAmount: number;
  updatedAmount: number; // Includes fine and interest calculations if overdue/late
  fineAmount: number;
  interestAmount: number;
  issueDate: string;
  dueDate: string;
  status: TitleStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  installmentNumber?: number; // Ex: 1 for 1/3, 2 for 2/3
  totalInstallments?: number; // Ex: 3 for 1/3
  orderNumber?: string; // Número do Pedido
  invoiceNumber?: string; // Número da Nota Fiscal
  parentTitleId?: string; // Reference to origin title if renegotiated
  renegotiationId?: string;
  isPaidByRenegotiation: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TitleHistory = {
  id: string;
  titleId: string;
  status: TitleStatus;
  reason: string;
  userName: string;
  createdAt: string;
};
