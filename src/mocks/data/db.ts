import {
  Seller,
  Role,
  User,
  RoleHistory,
  Customer,
  Title,
  TitleHistory,
  UserStatus,
  TitleStatus,
} from "@/types";

// Helper to generate IDs
const uuid = () => Math.random().toString(36).substring(2, 11);

// Helper to generate non-sequential codes for sellers
export const generateSellerCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Initial Roles
export const INITIAL_ROLES: Role[] = [
  {
    id: "role-owner",
    name: "Owner",
    hierarchyLevel: 1,
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role-gerente",
    name: "Gerente",
    hierarchyLevel: 2,
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role-supervisor",
    name: "Supervisor",
    hierarchyLevel: 3,
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role-vendedor",
    name: "Vendedor",
    hierarchyLevel: 3,
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role-funcionario",
    name: "Funcionário",
    hierarchyLevel: 4,
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role-inativo",
    name: "Cargo Antigo",
    hierarchyLevel: 4,
    status: "INACTIVE",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

// Initial Sellers
export const INITIAL_SELLERS: Seller[] = [
  {
    id: "s-1",
    code: "4821",
    cpf: "123.456.789-00",
    name: "João Silva",
    email: "joao.silva@empresa.com",
    phone: "(11) 98888-8888",
    status: "ACTIVE",
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "s-2",
    code: "8912",
    cpf: "234.567.890-11",
    name: "Maria Santos",
    email: "maria.santos@empresa.com",
    phone: "(11) 97777-7777",
    status: "ACTIVE",
    createdAt: "2026-01-11T11:00:00Z",
    updatedAt: "2026-01-11T11:00:00Z",
  },
  {
    id: "s-3",
    code: "3045",
    cpf: "345.678.901-22",
    name: "Carlos Oliveira",
    email: "carlos.oliveira@empresa.com",
    phone: "(21) 96666-6666",
    status: "ACTIVE",
    createdAt: "2026-01-12T12:00:00Z",
    updatedAt: "2026-01-12T12:00:00Z",
  },
  {
    id: "s-4",
    code: "7721",
    cpf: "456.789.012-33",
    name: "Ana Souza",
    email: "ana.souza@empresa.com",
    phone: "(31) 95555-5555",
    status: "ACTIVE",
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "s-5",
    code: "5012",
    cpf: "567.890.123-44",
    name: "Paulo Lima",
    email: "paulo.lima@empresa.com",
    phone: "(11) 94444-4444",
    status: "INACTIVE",
    createdAt: "2026-01-16T14:30:00Z",
    updatedAt: "2026-01-20T17:00:00Z",
  },
  {
    id: "s-6",
    code: "1102",
    cpf: "678.901.234-55",
    name: "Juliana Costa",
    email: "juliana.costa@empresa.com",
    phone: "(11) 93333-3333",
    status: "ACTIVE",
    createdAt: "2026-02-01T08:00:00Z",
    updatedAt: "2026-02-01T08:00:00Z",
  },
  {
    id: "s-7",
    code: "2093",
    cpf: "789.012.345-66",
    name: "Ricardo Pereira",
    email: "ricardo.pereira@empresa.com",
    phone: "(21) 92222-2222",
    status: "ACTIVE",
    createdAt: "2026-02-02T10:15:00Z",
    updatedAt: "2026-02-02T10:15:00Z",
  },
  {
    id: "s-8",
    code: "9910",
    cpf: "890.123.456-77",
    name: "Fernanda Rocha",
    email: "fernanda.rocha@empresa.com",
    phone: "(11) 91111-1111",
    status: "ACTIVE",
    createdAt: "2026-02-05T16:00:00Z",
    updatedAt: "2026-02-05T16:00:00Z",
  },
  {
    id: "s-9",
    code: "3382",
    cpf: "901.234.567-88",
    name: "Roberto Almeida",
    email: "roberto.almeida@empresa.com",
    phone: "(19) 90000-0000",
    status: "ACTIVE",
    createdAt: "2026-02-10T11:00:00Z",
    updatedAt: "2026-02-10T11:00:00Z",
  },
  {
    id: "s-10",
    code: "5561",
    cpf: "012.345.678-99",
    name: "Aline Martins",
    email: "aline.martins@empresa.com",
    phone: "(31) 98777-6655",
    status: "ACTIVE",
    createdAt: "2026-02-12T13:45:00Z",
    updatedAt: "2026-02-12T13:45:00Z",
  },
  {
    id: "s-11",
    code: "6020",
    cpf: "123.098.456-11",
    name: "Lucas Gomes",
    email: "lucas.gomes@empresa.com",
    phone: "(11) 96543-2109",
    status: "ACTIVE",
    createdAt: "2026-02-15T09:30:00Z",
    updatedAt: "2026-02-15T09:30:00Z",
  },
  {
    id: "s-12",
    code: "4452",
    cpf: "234.123.567-22",
    name: "Camila Rodrigues",
    email: "camila.rodrigues@empresa.com",
    phone: "(11) 91234-5678",
    status: "ACTIVE",
    createdAt: "2026-02-18T10:00:00Z",
    updatedAt: "2026-02-18T10:00:00Z",
  },
  {
    id: "s-13",
    code: "8092",
    cpf: "345.234.678-33",
    name: "Eduardo Martins",
    email: "eduardo.martins@empresa.com",
    phone: "(21) 92345-6789",
    status: "ACTIVE",
    createdAt: "2026-02-20T14:00:00Z",
    updatedAt: "2026-02-20T14:00:00Z",
  },
  {
    id: "s-14",
    code: "1299",
    cpf: "456.345.789-44",
    name: "Patrícia Vieira",
    email: "patricia.vieira@empresa.com",
    phone: "(31) 93456-7890",
    status: "ACTIVE",
    createdAt: "2026-02-22T16:20:00Z",
    updatedAt: "2026-02-22T16:20:00Z",
  },
  {
    id: "s-15",
    code: "7730",
    cpf: "567.456.890-55",
    name: "Gabriel Alves",
    email: "gabriel.alves@empresa.com",
    phone: "(11) 94567-8901",
    status: "ACTIVE",
    createdAt: "2026-02-25T08:15:00Z",
    updatedAt: "2026-02-25T08:15:00Z",
  },
  {
    id: "s-16",
    code: "6615",
    cpf: "678.567.901-66",
    name: "Beatriz Barbosa",
    email: "beatriz.barbosa@empresa.com",
    phone: "(11) 95678-9012",
    status: "ACTIVE",
    createdAt: "2026-02-27T11:00:00Z",
    updatedAt: "2026-02-27T11:00:00Z",
  },
  {
    id: "s-17",
    code: "5540",
    cpf: "789.678.012-77",
    name: "Marcelo Castro",
    email: "marcelo.castro@empresa.com",
    phone: "(21) 96789-0123",
    status: "ACTIVE",
    createdAt: "2026-03-01T15:30:00Z",
    updatedAt: "2026-03-01T15:30:00Z",
  },
];

// Initial Users
export const INITIAL_USERS: User[] = [
  {
    id: "u-1",
    name: "Danilo Souza",
    email: "danilo@empresa.com",
    role: INITIAL_ROLES[0],
    status: "ACTIVE",
    lastLoginAt: "2026-07-20T23:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "u-2",
    name: "Gerente Financeiro",
    email: "gerente@empresa.com",
    role: INITIAL_ROLES[1],
    status: "ACTIVE",
    lastLoginAt: "2026-07-20T22:30:00Z",
    createdAt: "2026-01-02T10:00:00Z",
  },
  {
    id: "u-3",
    name: "Vendedor João",
    email: "joao.silva@empresa.com",
    role: INITIAL_ROLES[3],
    status: "ACTIVE",
    lastLoginAt: "2026-07-20T18:15:00Z",
    createdAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "u-4",
    name: "Maria Convidada",
    email: "maria@convite.com",
    role: INITIAL_ROLES[4],
    status: "PENDING_INVITATION",
    createdAt: "2026-07-18T14:00:00Z",
  },
  {
    id: "u-5",
    name: "Ex-Funcionário",
    email: "demitido@empresa.com",
    role: INITIAL_ROLES[4],
    status: "INACTIVE",
    createdAt: "2026-01-05T09:00:00Z",
  },
];

// Initial Role Change History
export const INITIAL_ROLE_HISTORY: RoleHistory[] = [
  {
    id: "h-1",
    userId: "u-3",
    userName: "Vendedor João",
    userEmail: "joao.silva@empresa.com",
    fromRoleName: "Funcionário",
    toRoleName: "Vendedor",
    type: "PERMANENT",
    reason: "Promoção por atingimento de metas no trimestre",
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "h-2",
    userId: "u-2",
    userName: "Gerente Financeiro",
    userEmail: "gerente@empresa.com",
    fromRoleName: "Vendedor",
    toRoleName: "Gerente",
    type: "TEMPORARY",
    reason: "Cobertura de férias da gerência financeira",
    startDate: "2026-06-01T00:00:00Z",
    endDate: "2026-06-30T23:59:59Z",
    createdAt: "2026-05-25T14:30:00Z",
  },
];

// Initial Customers
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "c-1",
    document: "12.345.678/0001-90",
    documentType: "CNPJ",
    name: "Mercado Pague Menos Ltda",
    email: "financeiro@paguemenos.com",
    phone: "(11) 3344-5566",
    sellerCode: "4821",
    sellerName: "João Silva",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "c-2",
    document: "456.789.012-34",
    documentType: "CPF",
    name: "Roberto de Souza",
    email: "roberto.souza@gmail.com",
    phone: "(11) 99887-7665",
    sellerCode: "8912",
    sellerName: "Maria Santos",
    createdAt: "2026-01-20T14:20:00Z",
    updatedAt: "2026-01-20T14:20:00Z",
  },
  {
    id: "c-3",
    document: "98.765.432/0001-10",
    documentType: "CNPJ",
    name: "Construtora Forte S.A.",
    email: "contabilidade@forte.com.br",
    phone: "(21) 2233-4455",
    sellerCode: "3045",
    sellerName: "Carlos Oliveira",
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "c-4",
    document: "321.654.987-00",
    documentType: "CPF",
    name: "Ana Cláudia Martins",
    email: "ana.martins@outlook.com",
    phone: "(31) 98765-4321",
    sellerCode: "7721",
    sellerName: "Ana Souza",
    createdAt: "2026-02-05T11:30:00Z",
    updatedAt: "2026-02-05T11:30:00Z",
  },
  {
    id: "c-5",
    document: "11.222.333/0001-44",
    documentType: "CNPJ",
    name: "Distribuidora Aliança",
    email: "comercial@alianca.com.br",
    phone: "(11) 4004-1234",
    sellerCode: "4821",
    sellerName: "João Silva",
    createdAt: "2026-02-10T16:00:00Z",
    updatedAt: "2026-02-10T16:00:00Z",
  },
  {
    id: "c-6",
    document: "555.666.777-88",
    documentType: "CPF",
    name: "Fernanda Lima Castro",
    email: "fernanda.lima@hotmail.com",
    phone: "(11) 95555-4444",
    sellerCode: "8912",
    sellerName: "Maria Santos",
    createdAt: "2026-02-15T15:10:00Z",
    updatedAt: "2026-02-15T15:10:00Z",
  },
  {
    id: "c-7",
    document: "55.444.333/0001-22",
    documentType: "CNPJ",
    name: "Consultoria Alfa",
    email: "alfa@alfa.com.br",
    phone: "(11) 3222-1111",
    sellerCode: "1102",
    sellerName: "Juliana Costa",
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-03-01T09:00:00Z",
  },
];

// Helper to calculate status based on due date
// A vencer: inside deadline
// Vencido: past due up to 2 days
// Atraso: 3+ days past due
export const calculateTitleStatus = (
  dueDateStr: string,
  currentStatus: TitleStatus,
): TitleStatus => {
  if (
    currentStatus === "PAID" ||
    currentStatus === "CANCELED" ||
    currentStatus === "RENEGOTIATED"
  ) {
    return currentStatus;
  }
  const dueDate = new Date(dueDateStr);
  const now = new Date("2026-07-20T23:30:00Z"); // Current context date

  // Strip time for clean daily calculations
  dueDate.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (today.getTime() <= dueDate.getTime()) {
    return "UPCOMING";
  }

  const diffTime = Math.abs(today.getTime() - dueDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 2) {
    return "OVERDUE";
  }
  return "LATE";
};

// Initial Titles
export const INITIAL_TITLES: Title[] = [
  // Upcoming (A vencer)
  {
    id: "t-1",
    customerId: "c-1",
    customerName: "Mercado Pague Menos Ltda",
    customerDocument: "12.345.678/0001-90",
    sellerCode: "4821",
    sellerName: "João Silva",
    originalAmount: 1500.0,
    updatedAmount: 1500.0,
    fineAmount: 0,
    interestAmount: 0,
    issueDate: "2026-07-10",
    dueDate: "2026-08-10",
    status: "UPCOMING",
    isPaidByRenegotiation: false,
    createdAt: "2026-07-10T10:00:00Z",
    updatedAt: "2026-07-10T10:00:00Z",
  },
  // Overdue (Vencido, up to 2 days: e.g. due 2026-07-19)
  {
    id: "t-2",
    customerId: "c-2",
    customerName: "Roberto de Souza",
    customerDocument: "456.789.012-34",
    sellerCode: "8912",
    sellerName: "Maria Santos",
    originalAmount: 850.0,
    updatedAmount: 850.0, // 1st day (July 20) no charges, 2nd day (July 21) 2% fine. Let's compute details dynamically!
    fineAmount: 0,
    interestAmount: 0,
    issueDate: "2026-06-19",
    dueDate: "2026-07-19",
    status: "OVERDUE",
    isPaidByRenegotiation: false,
    createdAt: "2026-06-19T14:20:00Z",
    updatedAt: "2026-07-20T23:30:00Z",
  },
  // Late (Atraso, 3+ days: e.g. due 2026-07-10)
  {
    id: "t-3",
    customerId: "c-3",
    customerName: "Construtora Forte S.A.",
    customerDocument: "98.765.432/0001-10",
    sellerCode: "3045",
    sellerName: "Carlos Oliveira",
    originalAmount: 12000.0,
    updatedAmount: 12000.0,
    fineAmount: 0,
    interestAmount: 0,
    issueDate: "2026-06-10",
    dueDate: "2026-07-10",
    status: "LATE",
    isPaidByRenegotiation: false,
    createdAt: "2026-06-10T09:00:00Z",
    updatedAt: "2026-07-20T23:30:00Z",
  },
  // Paid (Pago)
  {
    id: "t-4",
    customerId: "c-4",
    customerName: "Ana Cláudia Martins",
    customerDocument: "321.654.987-00",
    sellerCode: "7721",
    sellerName: "Ana Souza",
    originalAmount: 450.0,
    updatedAmount: 450.0,
    fineAmount: 0,
    interestAmount: 0,
    issueDate: "2026-06-05",
    dueDate: "2026-07-05",
    status: "PAID",
    paymentMethod: "PIX",
    paidAt: "2026-07-04T15:20:00Z",
    isPaidByRenegotiation: false,
    createdAt: "2026-06-05T11:30:00Z",
    updatedAt: "2026-07-04T15:20:00Z",
  },
  // Renegotiated (Renegociado)
  {
    id: "t-5",
    customerId: "c-5",
    customerName: "Distribuidora Aliança",
    customerDocument: "11.222.333/0001-44",
    sellerCode: "4821",
    sellerName: "João Silva",
    originalAmount: 3000.0,
    updatedAmount: 3000.0,
    fineAmount: 0,
    interestAmount: 0,
    issueDate: "2026-05-15",
    dueDate: "2026-06-15",
    status: "RENEGOTIATED",
    isPaidByRenegotiation: false,
    createdAt: "2026-05-15T16:00:00Z",
    updatedAt: "2026-07-15T10:00:00Z",
  },
  // Children generated from t-5 renegotiation (Upcoming/Paid)
  {
    id: "t-5-child-1",
    customerId: "c-5",
    customerName: "Distribuidora Aliança",
    customerDocument: "11.222.333/0001-44",
    sellerCode: "4821",
    sellerName: "João Silva",
    originalAmount: 1600.0, // Includes interest added
    updatedAmount: 1600.0,
    fineAmount: 0,
    interestAmount: 0,
    issueDate: "2026-07-15",
    dueDate: "2026-08-15",
    status: "UPCOMING",
    parentTitleId: "t-5",
    isPaidByRenegotiation: true,
    createdAt: "2026-07-15T10:00:00Z",
    updatedAt: "2026-07-15T10:00:00Z",
  },
  {
    id: "t-5-child-2",
    customerId: "c-5",
    customerName: "Distribuidora Aliança",
    customerDocument: "11.222.333/0001-44",
    sellerCode: "4821",
    sellerName: "João Silva",
    originalAmount: 1600.0,
    updatedAmount: 1600.0,
    fineAmount: 0,
    interestAmount: 0,
    issueDate: "2026-07-15",
    dueDate: "2026-09-15",
    status: "UPCOMING",
    parentTitleId: "t-5",
    isPaidByRenegotiation: true,
    createdAt: "2026-07-15T10:00:00Z",
    updatedAt: "2026-07-15T10:00:00Z",
  },
  // Canceled (Cancelado)
  {
    id: "t-6",
    customerId: "c-6",
    customerName: "Fernanda Lima Castro",
    customerDocument: "555.666.777-88",
    sellerCode: "8912",
    sellerName: "Maria Santos",
    originalAmount: 120.0,
    updatedAmount: 120.0,
    fineAmount: 0,
    interestAmount: 0,
    issueDate: "2026-07-01",
    dueDate: "2026-07-25",
    status: "CANCELED",
    isPaidByRenegotiation: false,
    createdAt: "2026-07-01T15:10:00Z",
    updatedAt: "2026-07-10T12:00:00Z",
  },
];

// Initial Title History Logs
export const INITIAL_TITLE_HISTORY: TitleHistory[] = [
  {
    id: "th-1",
    titleId: "t-1",
    status: "UPCOMING",
    reason: "Emissão original do título",
    userName: "João Silva",
    createdAt: "2026-07-10T10:00:00Z",
  },
  {
    id: "th-2",
    titleId: "t-2",
    status: "UPCOMING",
    reason: "Emissão original do título",
    userName: "Maria Santos",
    createdAt: "2026-06-19T14:20:00Z",
  },
  {
    id: "th-2-v",
    titleId: "t-2",
    status: "OVERDUE",
    reason: "Prazo vencido (tolerância 2 dias úteis)",
    userName: "Sistema",
    createdAt: "2026-07-20T00:00:00Z",
  },
  {
    id: "th-3",
    titleId: "t-3",
    status: "UPCOMING",
    reason: "Emissão original do título",
    userName: "Carlos Oliveira",
    createdAt: "2026-06-10T09:00:00Z",
  },
  {
    id: "th-3-v",
    titleId: "t-3",
    status: "OVERDUE",
    reason: "Prazo vencido",
    userName: "Sistema",
    createdAt: "2026-07-11T00:00:00Z",
  },
  {
    id: "th-3-l",
    titleId: "t-3",
    status: "LATE",
    reason: "Atraso superior a 2 dias úteis (régua juros/multa)",
    userName: "Sistema",
    createdAt: "2026-07-13T00:00:00Z",
  },
  {
    id: "th-4",
    titleId: "t-4",
    status: "UPCOMING",
    reason: "Emissão original do título",
    userName: "Ana Souza",
    createdAt: "2026-06-05T11:30:00Z",
  },
  {
    id: "th-4-p",
    titleId: "t-4",
    status: "PAID",
    reason: "Baixa efetuada via Pix",
    userName: "Gateway Pagamento",
    createdAt: "2026-07-04T15:20:00Z",
  },
  {
    id: "th-5",
    titleId: "t-5",
    status: "UPCOMING",
    reason: "Emissão original",
    userName: "João Silva",
    createdAt: "2026-05-15T16:00:00Z",
  },
  {
    id: "th-5-r",
    titleId: "t-5",
    status: "RENEGOTIATED",
    reason: "Título renegociado em 2 parcelas (t-5-child-1, t-5-child-2)",
    userName: "Gerente Financeiro",
    createdAt: "2026-07-15T10:00:00Z",
  },
  {
    id: "th-6",
    titleId: "t-6",
    status: "UPCOMING",
    reason: "Emissão original",
    userName: "Maria Santos",
    createdAt: "2026-07-01T15:10:00Z",
  },
  {
    id: "th-6-c",
    titleId: "t-6",
    status: "CANCELED",
    reason: "Cancelado por erro de digitação de valor",
    userName: "Gerente Financeiro",
    createdAt: "2026-07-10T12:00:00Z",
  },
];

// Mutable state store for simulating in-memory DB persistence
class Database {
  currentUser: User = INITIAL_USERS[0]; // Default logged in user: Owner
  roles: Role[] = [...INITIAL_ROLES];
  sellers: Seller[] = [...INITIAL_SELLERS];
  users: User[] = [...INITIAL_USERS];
  roleHistory: RoleHistory[] = [...INITIAL_ROLE_HISTORY];
  customers: Customer[] = [...INITIAL_CUSTOMERS];
  titles: Title[] = [...INITIAL_TITLES];
  titleHistory: TitleHistory[] = [...INITIAL_TITLE_HISTORY];

  // Helper to re-calculate interest/fines dynamically for Late/Overdue titles
  // Rule:
  // - Overdue: up to 2 days after due date.
  //   - 1st business day: no charge.
  //   - 2nd business day: 2% fixed fine.
  // - Late: 3+ days after due date.
  //   - 2% fixed fine + 12% monthly interest calculated daily (12% / 30 = 0.4% per day)
  getCalculatedTitle(title: Title): Title {
    const updated = { ...title };

    // Status can change based on current time
    const computedStatus = calculateTitleStatus(title.dueDate, title.status);
    updated.status = computedStatus;

    if (computedStatus === "OVERDUE") {
      const dueDate = new Date(title.dueDate);
      const now = new Date("2026-07-20T23:30:00Z");
      dueDate.setHours(0, 0, 0, 0);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        updated.fineAmount = 0;
        updated.interestAmount = 0;
      } else {
        updated.fineAmount = parseFloat((title.originalAmount * 0.02).toFixed(2));
        updated.interestAmount = 0;
      }
      updated.updatedAmount = parseFloat((title.originalAmount + updated.fineAmount).toFixed(2));
    } else if (computedStatus === "LATE") {
      const dueDate = new Date(title.dueDate);
      const now = new Date("2026-07-20T23:30:00Z");
      dueDate.setHours(0, 0, 0, 0);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 2% fine
      const fine = parseFloat((title.originalAmount * 0.02).toFixed(2));
      // 12% per month simple interest fraccionado per day -> 12% / 30 = 0.4% daily -> 0.004 * diffDays
      const interest = parseFloat((title.originalAmount * 0.004 * diffDays).toFixed(2));

      updated.fineAmount = fine;
      updated.interestAmount = interest;
      updated.updatedAmount = parseFloat((title.originalAmount + fine + interest).toFixed(2));
    } else {
      updated.fineAmount = 0;
      updated.interestAmount = 0;
      updated.updatedAmount = title.originalAmount;
    }

    return updated;
  }

  getTitles(): Title[] {
    return this.titles.map((t) => this.getCalculatedTitle(t));
  }
}

export const db = new Database();
