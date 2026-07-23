import * as XLSX from "xlsx";

export const TEMPLATE_HEADERS = [
  "DocumentoCliente*",
  "NomeCliente*",
  "EmailCliente*",
  "CelularCliente",
  "ValorOriginal*",
  "NumeroPedido*",
  "NumeroNotaFiscal*",
  "TipoPagamento*",
  "QuantidadeParcelas*",
  "DataEmissao*",
  "DataVencimento*",
  "IntervaloDiasParcelas",
  "CodigoVendedor*",
  "IDTituloUnico",
];

export const TEMPLATE_EXAMPLES = [
  [
    "12345678000190",
    "Mercado Pague Menos Ltda",
    "financeiro@paguemenos.com",
    "1133445566",
    "2500,50",
    "1092",
    "4501",
    "PIX",
    "1",
    "2026-07-20",
    "2026-08-30",
    "",
    "4821",
    "1001",
  ],
  [
    "45678901234",
    "Roberto de Souza",
    "roberto.souza@gmail.com",
    "11998877665",
    "1250,00",
    "1093",
    "4502",
    "BOLETO",
    "3",
    "2026-07-20",
    "2026-08-25",
    "30",
    "8912",
    "1002",
  ],
  [
    "78912345600",
    "Ana Carolina Ferreira",
    "ana.ferreira@empresa.com.br",
    "21977665544",
    "4800,00",
    "1094",
    "4503",
    "CARD",
    "6",
    "2026-07-20",
    "2026-08-20",
    "30",
    "4821",
    "1003",
  ],
];

/**
 * Linhas da aba "Instruções" do template Excel.
 *
 * Cada entrada é uma row na coluna A da planilha.
 * `null` gera uma linha em branco (separador visual entre seções).
 *
 * IMPORTANTE — Portabilidade para o Backend:
 * Quando o backend Java (Apache POI) assumir a geração do template,
 * este array deve ser replicado como List<String> onde null = row vazia.
 * A row 0 (título) deve receber estilo bold + fonte 12pt.
 */
const INSTRUCTIONS_ROWS: (string | null)[] = [
  // ── Título ──
  "IMPORTAÇÃO DE TÍTULOS - INSTRUÇÕES",
  null,
  // ── Como usar ──
  "📘 COMO USAR ESTE TEMPLATE:",
  null,
  "✅ OPÇÃO 1 - USO SIMPLES (RECOMENDADO):",
  "   1. Vá para a planilha 'Template'",
  "   2. Preencha seus dados na planilha 'Template'",
  "   3. Salve o arquivo (.xlsx ou .xls)",
  "   4. Faça upload no Importador de Títulos do sistema",
  "   5. Pronto! Os títulos serão processados automaticamente",
  null,
  "✅ OPÇÃO 2 - PERSONALIZAÇÃO:",
  "   - Você pode excluir as planilhas 'Instruções' e 'Exemplo'",
  "   - Você pode renomear a planilha 'Template' para qualquer nome",
  "   - O sistema detectará automaticamente a planilha com dados",
  null,
  // ── Regras ──
  "📌 REGRAS DE PREENCHIMENTO:",
  "   - Todos os campos marcados com * são obrigatórios",
  "   - Não deixe linhas em branco entre os dados",
  "   - Preencha apenas na planilha 'Template' (ou sua planilha renomeada)",
  null,
  // ── Formato dos dados ──
  "📋 FORMATO DOS DADOS:",
  "   1. CPF/CNPJ (DocumentoCliente) deve conter apenas números (ex: 45678901234 ou 12345678000190)",
  "   2. Celular (CelularCliente) deve conter apenas números (ex: 1133334578 ou 11999998888)",
  "   3. Número do Pedido (NumeroPedido) deve conter apenas números (ex: 1092)",
  "   4. Número da Nota Fiscal (NumeroNotaFiscal) deve conter apenas números (ex: 4501)",
  "   5. ID Único do Título (IDTituloUnico) deve conter apenas números (ex: 1001)",
  "   6. Valor (ValorOriginal) aceita formatos: 2500.50 ou 2500,50",
  "   7. Datas devem estar no formato AAAA-MM-DD (ex: 2026-08-30)",
  "   8. Tipo de Pagamento: PIX, BOLETO ou CARD",
  "   9. Parcelas: PIX=1 (obrigatório), BOLETO=1 a 5, CARD=1 a 12",
  "   10. Intervalo entre Parcelas: 7, 15, 30 ou 60 dias (obrigatório quando Parcelas > 1)",
  "   11. Código do Vendedor deve ser de um vendedor já cadastrado e ativo no sistema",
  null,
  // ── Validações ──
  "⚠️ VALIDAÇÕES:",
  "   - Documento do cliente deve ser um CPF ou CNPJ válido (apenas dígitos)",
  "   - Se o cliente não existir no sistema, será cadastrado automaticamente",
  "   - Se o vendedor não existir ou estiver inativo, a linha será rejeitada",
  "   - Valor Original deve ser maior que zero",
  "   - Data de Vencimento não pode ser anterior à Data de Emissão",
  "   - Nº Pedido e Nº Nota Fiscal são obrigatórios (apenas dígitos)",
  "   - PIX só permite 1 parcela (À Vista)",
  "   - Boleto permite no máximo 5 parcelas",
  "   - Cartão permite no máximo 12 parcelas",
  null,
  // ── Dicas ──
  "💡 DICA:",
  "   - Veja a planilha 'Exemplo' para referência de preenchimento",
  "   - O sistema aceita o arquivo mesmo se você excluir outras planilhas",
  "   - O sistema aceita .csv, .xls e .xlsx",
];

export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // Aba 1: Instruções — cada entrada do array vira uma row na coluna A
  const instructionsAoa = INSTRUCTIONS_ROWS.map((row) => [row ?? ""]);
  const wsInstrucoes = XLSX.utils.aoa_to_sheet(instructionsAoa);
  wsInstrucoes["!cols"] = [{ wch: 90 }];

  // Aba 2: Template (vazio apenas com cabeçalhos)
  const wsTemplate = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS]);
  wsTemplate["!cols"] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));

  // Aba 3: Exemplo (cabeçalhos + 3 registros fictícios)
  const wsExemplo = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...TEMPLATE_EXAMPLES]);
  wsExemplo["!cols"] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));

  XLSX.utils.book_append_sheet(wb, wsInstrucoes, "Instruções");
  XLSX.utils.book_append_sheet(wb, wsTemplate, "Template");
  XLSX.utils.book_append_sheet(wb, wsExemplo, "Exemplo");

  XLSX.writeFile(wb, "template_importacao_titulos.xlsx");
}

export function downloadCsvTemplate() {
  const cleanHeaders = TEMPLATE_HEADERS.map((h) => h.replace(/\*$/, ""));
  const rows = [cleanHeaders, ...TEMPLATE_EXAMPLES];
  const csvContent = "\uFEFF" + rows.map((r) => r.join(";")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "template_importacao_titulos.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
