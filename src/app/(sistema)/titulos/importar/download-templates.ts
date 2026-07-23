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
    "12.345.678/0001-90",
    "Mercado Pague Menos Ltda",
    "financeiro@paguemenos.com",
    "(11) 3344-5566",
    "2500,50",
    "PED-1092",
    "NF-4501",
    "PIX",
    "1",
    "2026-07-20",
    "2026-08-30",
    "",
    "4821",
    "imp-pix-1001",
  ],
  [
    "456.789.012-34",
    "Roberto de Souza",
    "roberto.souza@gmail.com",
    "(11) 99887-7665",
    "1250,00",
    "PED-1093",
    "NF-4502",
    "BOLETO",
    "3",
    "2026-07-20",
    "2026-08-25",
    "30",
    "8912",
    "imp-bol-1002",
  ],
  [
    "789.123.456-00",
    "Ana Carolina Ferreira",
    "ana.ferreira@empresa.com.br",
    "(21) 97766-5544",
    "4800,00",
    "PED-1094",
    "NF-4503",
    "CARD",
    "6",
    "2026-07-20",
    "2026-08-20",
    "30",
    "4821",
    "imp-card-1003",
  ],
];

const INSTRUCTIONS_TEXT = `IMPORTAÇÃO DE TÍTULOS - INSTRUÇÕES

📘 COMO USAR ESTE TEMPLATE:

✅ OPÇÃO 1 - USO SIMPLES (RECOMENDADO):
   1. Vá para a planilha 'Template'
   2. Preencha seus dados na planilha 'Template'
   3. Salve o arquivo (.xlsx ou .xls)
   4. Faça upload no Importador de Títulos do sistema
   5. Pronto! Os títulos serão processados automaticamente

✅ OPÇÃO 2 - PERSONALIZAÇÃO:
   - Você pode excluir as planilhas 'Instruções' e 'Exemplo'
   - Você pode renomear a planilha 'Template' para qualquer nome
   - O sistema detectará automaticamente a planilha com dados

📌 REGRAS DE PREENCHIMENTO:
   - Todos os campos marcados com * são obrigatórios
   - Não deixe linhas em branco entre os dados
   - Preencha apenas na planilha 'Template' (ou sua planilha renomeada)

📋 FORMATO DOS DADOS:
 1. CPF/CNPJ aceita formatos: 123.456.789-09, 12345678909, 12.345.678/0001-90
 2. Valor aceita formatos: 2500.50, 2500,50 ou 2.500,50
 3. Datas devem estar no formato AAAA-MM-DD (ex: 2026-08-30)
 4. Tipo de Pagamento: PIX, BOLETO ou CARD
 5. Parcelas: PIX=1 (obrigatório), BOLETO=1 a 5, CARD=1 a 12
 6. Intervalo entre Parcelas: 7, 15, 30 ou 60 dias (obrigatório quando Parcelas > 1)
 7. Código do Vendedor deve ser de um vendedor já cadastrado e ativo no sistema

⚠️ VALIDAÇÕES:
- Documento do cliente deve ser um CPF ou CNPJ válido
- Se o cliente não existir no sistema, será cadastrado automaticamente
- Se o vendedor não existir ou estiver inativo, a linha será rejeitada
- Valor Original deve ser maior que zero
- Data de Vencimento não pode ser anterior à Data de Emissão
- Nº Pedido e Nº Nota Fiscal são obrigatórios
- PIX só permite 1 parcela (À Vista)
- Boleto permite no máximo 5 parcelas
- Cartão permite no máximo 12 parcelas

💡 DICA:
   - Veja a planilha 'Exemplo' para referência de preenchimento
   - O sistema aceita o arquivo mesmo se você excluir outras planilhas
   - O sistema aceita .csv, .xls e .xlsx`;

export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // Aba 1: Instruções
  const wsInstrucoes = XLSX.utils.aoa_to_sheet([[INSTRUCTIONS_TEXT]]);
  wsInstrucoes["!cols"] = [{ wch: 100 }];

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
