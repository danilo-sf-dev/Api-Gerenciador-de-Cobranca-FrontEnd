export const EXPECTED_CSV_HEADERS = [
  "DocumentoCliente",
  "NomeCliente",
  "EmailCliente",
  "CelularCliente",
  "ValorOriginal",
  "DataVencimento",
  "CodigoVendedor",
  "IDTituloUnico",
] as const;

export type CsvValidationResult = { valid: true } | { valid: false; message: string };

export function validateCsvFormat(csvText: string): CsvValidationResult {
  const trimmed = csvText.trim();
  if (!trimmed) {
    return { valid: false, message: "Nenhum conteúdo CSV informado." };
  }

  const firstLine = trimmed.split(/\r?\n/)[0];

  if (!firstLine.includes(";")) {
    if (firstLine.includes(",")) {
      return {
        valid: false,
        message: "Separador incorreto: use ponto e vírgula (;) entre as colunas, não vírgula.",
      };
    }
    return {
      valid: false,
      message: "Formato inválido: o CSV deve usar ponto e vírgula (;) como separador.",
    };
  }

  const headers = firstLine.split(";").map((h) => h.trim());

  if (headers.length !== EXPECTED_CSV_HEADERS.length) {
    return {
      valid: false,
      message: `Número de colunas incorreto: encontradas ${headers.length}, esperadas ${EXPECTED_CSV_HEADERS.length}. Consulte o guia de formato.`,
    };
  }

  for (let i = 0; i < EXPECTED_CSV_HEADERS.length; i++) {
    if (headers[i].toLowerCase() !== EXPECTED_CSV_HEADERS[i].toLowerCase()) {
      return {
        valid: false,
        message: `Cabeçalho inválido na coluna ${i + 1}: esperado "${EXPECTED_CSV_HEADERS[i]}", encontrado "${headers[i] || "(vazio)"}".`,
      };
    }
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
