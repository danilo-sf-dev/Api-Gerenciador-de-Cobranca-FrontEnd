import { test, expect } from "@playwright/test";

function generateValidCPF(): string {
  const digits: number[] = [];
  for (let i = 0; i < 9; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }

  // Calculate first verifier digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let rest = sum % 11;
  const d1 = rest < 2 ? 0 : 11 - rest;
  digits.push(d1);

  // Calculate second verifier digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  rest = sum % 11;
  const d2 = rest < 2 ? 0 : 11 - rest;
  digits.push(d2);

  return digits.join("");
}

function generateValidCNPJ(): string {
  const digits: number[] = [];
  for (let i = 0; i < 8; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }
  digits.push(0, 0, 0, 1); // 0001 filial standard

  // Calculate first verifier digit
  let weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weights[i];
  }
  let rest = sum % 11;
  const d1 = rest < 2 ? 0 : 11 - rest;
  digits.push(d1);

  // Calculate second verifier digit
  weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += digits[i] * weights[i];
  }
  rest = sum % 11;
  const d2 = rest < 2 ? 0 : 11 - rest;
  digits.push(d2);

  return digits.join("");
}

test.describe("Gestão Finance Billing System E2E Flow", () => {
  test("should login, create a seller, create a customer, and register a manual title", async ({
    page,
  }) => {
    // 1. Visit Login page
    await page.goto("/login");
    await expect(page.locator("h2")).toHaveText("Entrar no Gestão Finance");

    // Fill credentials
    await page.fill('input[type="email"]', "danilo@empresa.com");
    await page.fill('input[type="password"]', "qualquersenha");
    await page.click('button[type="submit"]');

    // Verify redirect to Dashboard
    await page.waitForURL("/");
    await expect(page.locator("h1")).toHaveText("Resumo Operacional");

    // Check that default metrics exist
    await expect(page.locator("text=A Vencer")).toBeVisible();
    await expect(page.locator("text=Vencidos (Tolerância)")).toBeVisible();

    // 2. Navigate to Sellers
    await page.click("text=Vendedores");
    await page.waitForURL("/vendedores");
    await expect(page.locator("h1")).toHaveText("Vendedores");

    // Create a new seller
    await page.click("text=Novo Vendedor");
    await page.waitForURL("/vendedores/novo");

    const validCpf = generateValidCPF();
    const uniquePhone = "119" + Math.floor(10000000 + Math.random() * 90000000).toString();
    const sellerName = "Vendedor Teste E2E " + Math.floor(Math.random() * 1000);
    const sellerEmail = `e2e.${Math.floor(Math.random() * 1000)}@empresa.com`;

    await page.fill('input[placeholder="Digite o nome do vendedor"]', sellerName);
    // CPF Input has mask formatting
    await page.fill('input[placeholder="000.000.000-00"]', validCpf);
    await page.fill('input[placeholder="(00) 00000-0000"]', uniquePhone);
    await page.fill('input[placeholder="vendedor@empresa.com"]', sellerEmail);

    await page.click('button:has-text("Salvar Vendedor")');

    // Verify redirect back and check seller is listed
    await page.waitForURL("/vendedores");

    // Fill search to find the new seller
    await page.fill('input[placeholder="Buscar por nome, código, CPF ou e-mail..."]', sellerName);
    await page.waitForTimeout(400); // Wait for debounce
    await expect(page.locator("tbody tr").first()).toContainText(sellerName);

    // Retrieve the seller code from the table
    const sellerCode = await page.locator("tbody tr td").first().textContent();
    console.log(`E2E: Created seller ${sellerName} with code ${sellerCode}`);

    // 3. Navigate to Customers
    await page.click("text=Clientes");
    await page.waitForURL("/clientes");
    await expect(page.locator("h1")).toHaveText("Clientes");

    // Create new customer
    await page.click("text=Novo Cliente");
    await page.waitForURL("/clientes/novo");

    const customerName = "Empresa Cliente E2E " + Math.floor(Math.random() * 1000);
    const validCnpj = generateValidCNPJ();

    await page.fill('input[placeholder="Digite o nome completo ou razão social"]', customerName);

    // Select CNPJ toggle
    await page.click("text=CNPJ");
    await page.fill('input[placeholder="00.000.000/0000-00"]', validCnpj);

    // Search and select seller
    await page.fill('input[placeholder="Digite o nome ou código do vendedor..."]', sellerName);
    // Wait for dropdown to show matches
    await page.click(`text=${sellerName}`);

    await page.click('button:has-text("Salvar Cliente")');

    // Verify customer creation
    await page.waitForURL("/clientes");
    await page.fill(
      'input[placeholder="Buscar por nome do cliente, documento ou vendedor..."]',
      customerName,
    );
    await page.waitForTimeout(400);
    await expect(page.locator("tbody tr").first()).toContainText(customerName);

    // 4. Navigate to Titles
    await page.click("text=Títulos");
    await page.waitForURL("/titulos");
    await expect(page.locator("h1")).toHaveText("Títulos e Cobranças");

    // Create manual title
    await page.click("text=Novo Título");
    await page.waitForURL("/titulos/novo");

    // Select customer in dropdown
    await page.fill('input[placeholder="Digite o nome ou CPF/CNPJ do cliente..."]', customerName);
    await page.click(`text=${customerName}`);

    // Fill value and dates
    await page.fill('input[placeholder="R$ 0,00"]', "250000"); // R$ 2.500,00
    await page.locator('input[type="date"]').first().fill("2026-07-21"); // Issue Date
    await page.locator('input[type="date"]').last().fill("2026-08-30"); // Due Date

    await page.click('button:has-text("Salvar Título")');

    // Verify Title list entry (redirects to Dashboard, then we navigate to Titles)
    await page.waitForURL("/");
    await page.click("text=Títulos");
    await page.waitForURL("/titulos");
    await page.fill('input[placeholder*="Nome do cliente"]', customerName);
    await page.waitForTimeout(400);

    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow).toContainText(customerName);
    await expect(firstRow).toContainText("R$ 2.500,00");

    // 5. Navigate to Detail Page and Register manual payment
    await page.click('a[title="Ver Detalhes do Título"]');

    // Check elements
    await expect(page.locator("text=Histórico de Alterações (Log de Auditoria)")).toBeVisible();

    // Trigger manual payment registration
    await page.click('button:has-text("Registrar Pagamento")');
    await page.waitForSelector("text=Registrar Pagamento");
    await page.click('button:has-text("Confirmar Pagamento")');

    // Verify status updated to PAID
    await page.click("text=Voltar para Títulos");
    await page.waitForURL("/titulos");
    await page.fill('input[placeholder*="Nome do cliente"]', customerName);
    await page.waitForTimeout(400);
    await expect(page.locator("tbody tr").first()).toContainText("Pago");
  });
});
