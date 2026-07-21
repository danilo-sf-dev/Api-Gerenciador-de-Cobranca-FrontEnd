"use client";

import React, { useState, useRef } from "react";
import { TitlesService } from "@/features/titulos/services/titles.service";
import {
  UploadCloud,
  CheckCircle2,
  AlertOctagon,
  ClipboardCopy,
  ClipboardCheck,
  Play,
  RotateCcw,
} from "lucide-react";
import styles from "./importar.module.css";
import uiStyles from "@/components/ui/ui.module.css";
import tableStyles from "@/components/data-table/data-table.module.css";

type ImportResults = {
  successCount: number;
  failedCount: number;
  rejectedLines: { line: number; content: string; reason: string }[];
};

export default function ImportTitlesPage() {
  const [csvText, setCsvText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleCSV = `DocumentoCliente;NomeCliente;EmailCliente;CelularCliente;ValorOriginal;DataVencimento;CodigoVendedor;IDTituloUnico
12.345.678/0001-90;Mercado Pague Menos Ltda;financeiro@paguemenos.com;(11) 3344-5566;2500,50;2026-08-30;4821;imp-pix-1001
456.789.012-34;Roberto de Souza;roberto.souza@gmail.com;(11) 99887-7665;1250,00;2026-08-25;8912;imp-pix-1002
123.456;Cliente Invalido;erro@email.com;;500,00;2026-09-01;9999;imp-fail-01
456.789.012-34;Roberto de Souza;roberto.souza@gmail.com;;-150,00;2026-08-25;8912;imp-fail-02`;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Por favor, envie apenas arquivos no formato .csv.");
      return;
    }
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleProcess = async () => {
    if (!csvText.trim()) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await TitlesService.importTitles(csvText);
      setResults(response);
    } catch (err: any) {
      setError(err.message || "Erro ao processar arquivo de importação.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCsvText("");
    setResults(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleCSV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFillSample = () => {
    setCsvText(sampleCSV);
    setResults(null);
    setError("");
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)", maxWidth: 1000 }}
    >
      <div>
        <h1 style={{ fontWeight: 700 }}>Importador de Títulos (CSV)</h1>
        <p style={{ color: "var(--colors-muted)", fontSize: "0.875rem", marginTop: 4 }}>
          Simule a importação em lote de faturas e títulos a partir de um arquivo CSV.
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "10px 12px",
            backgroundColor: "var(--status-late-bg)",
            border: "1px solid var(--status-late-text)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.8125rem",
            color: "var(--status-late-text)",
          }}
        >
          {error}
        </div>
      )}

      {/* Main Grid: Upload & Instructions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "var(--space-lg)",
          alignItems: "start",
        }}
      >
        {/* Left column: input and text area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {/* File drop zone */}
          <div
            className={`${styles.dragDropArea} ${dragActive ? styles.dragDropAreaActive : ""}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".csv"
              onChange={handleFileChange}
            />
            <UploadCloud size={36} style={{ color: "var(--colors-accent)" }} />
            <div>
              <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                Arraste seu arquivo CSV aqui ou clique para selecionar
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--colors-muted)", marginTop: 4 }}>
                Apenas arquivos .csv codificados em UTF-8 são suportados.
              </p>
            </div>
          </div>

          {/* Pasted text option */}
          <div className={uiStyles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="label">Ou cole o texto CSV abaixo:</span>
              {csvText && (
                <button
                  onClick={handleClear}
                  className={`${uiStyles.btn} ${uiStyles.btnSecondary}`}
                  style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                >
                  Limpar Editor
                </button>
              )}
            </div>
            <textarea
              className={styles.textarea}
              placeholder="Cole as linhas separadas por ponto e vírgula..."
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-sm)" }}>
              <button
                type="button"
                onClick={handleClear}
                disabled={loading || !csvText}
                className={`${uiStyles.btn} ${uiStyles.btnSecondary}`}
              >
                <RotateCcw size={14} />
                Limpar Tudo
              </button>
              <button
                type="button"
                onClick={handleProcess}
                disabled={loading || !csvText.trim()}
                className={`${uiStyles.btn} ${uiStyles.btnPrimary}`}
              >
                <Play size={14} />
                {loading ? "Processando..." : "Processar Importação"}
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Formatting guide & sample template */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <div className={uiStyles.card}>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Guia do Formato</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--colors-muted)", lineHeight: 1.4 }}>
              O CSV deve ser separado por <strong>ponto e vírgula (;)</strong> com as colunas na
              ordem abaixo:
            </p>
            <ol
              style={{
                fontSize: "0.8125rem",
                color: "var(--colors-ink)",
                paddingLeft: "20px",
                lineHeight: 1.6,
              }}
            >
              <li>CPF / CNPJ do Cliente</li>
              <li>Nome do Cliente</li>
              <li>E-mail</li>
              <li>Celular</li>
              <li>Valor do Título (Decimal com vírgula)</li>
              <li>Vencimento (AAAA-MM-DD)</li>
              <li>Código do Vendedor</li>
              <li>ID Único (opcional)</li>
            </ol>
          </div>

          <div className={uiStyles.card} style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <span className="label">Exemplo de CSV</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={handleFillSample}
                  className={`${uiStyles.btn} ${uiStyles.btnSecondary}`}
                  style={{ padding: "2px 6px", fontSize: "0.75rem" }}
                  title="Copiar dados de exemplo para o editor"
                >
                  Preencher
                </button>
                <button
                  onClick={handleCopyTemplate}
                  className={`${uiStyles.btn} ${uiStyles.btnSecondary}`}
                  style={{ padding: "2px 6px", fontSize: "0.75rem" }}
                  title="Copiar exemplo para área de transferência"
                >
                  {copied ? (
                    <ClipboardCheck size={12} style={{ color: "var(--status-paid-text)" }} />
                  ) : (
                    <ClipboardCopy size={12} />
                  )}
                </button>
              </div>
            </div>
            <pre className={styles.templateBox}>{sampleCSV}</pre>
          </div>
        </div>
      </div>

      {/* Processing Results Section */}
      {results && (
        <div className={uiStyles.card} style={{ marginTop: "var(--space-md)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Resultado do Processamento</h2>

          <div className={styles.resultsGrid}>
            <div className={`${styles.summaryCard} ${styles.summaryCardSuccess}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={18} style={{ color: "var(--status-paid-text)" }} />
                <span className={styles.summaryCardSuccessTitle}>Títulos Importados</span>
              </div>
              <span className={`${styles.summaryCardSuccessValue} tabular-nums`}>
                {results.successCount}
              </span>
              <p style={{ fontSize: "0.75rem", color: "var(--status-paid-text)" }}>
                Títulos gravados com sucesso no banco de dados.
              </p>
            </div>

            <div className={`${styles.summaryCard} ${styles.summaryCardFailed}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertOctagon size={18} style={{ color: "var(--status-late-text)" }} />
                <span className={styles.summaryCardFailedTitle}>Linhas Rejeitadas</span>
              </div>
              <span className={`${styles.summaryCardFailedValue} tabular-nums`}>
                {results.failedCount}
              </span>
              <p style={{ fontSize: "0.75rem", color: "var(--status-late-text)" }}>
                Linhas descartadas por erros de validação.
              </p>
            </div>
          </div>

          {/* Rejected Rows Table */}
          {results.failedCount > 0 && (
            <div style={{ marginTop: "var(--space-lg)" }}>
              <div style={{ marginBottom: "var(--space-sm)" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--status-late-text)" }}>
                  Detalhes das Rejeições
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--colors-muted)", marginTop: 4 }}>
                  Corrija os dados das linhas abaixo e reenvie no importador:
                </p>
              </div>

              <div className={tableStyles.tableWrapper}>
                <table className={tableStyles.table}>
                  <thead className={tableStyles.thead}>
                    <tr>
                      <th className={tableStyles.th} style={{ width: 80, textAlign: "center" }}>
                        Linha
                      </th>
                      <th className={tableStyles.th}>Conteúdo da Linha</th>
                      <th className={tableStyles.th}>Motivo do Descarte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.rejectedLines.map((rej, idx) => (
                      <tr key={idx} className={`${tableStyles.tr} ${styles.rejectedRow}`}>
                        <td
                          className={`${tableStyles.td} tabular-nums`}
                          style={{ textAlign: "center", fontWeight: 600 }}
                        >
                          {rej.line}
                        </td>
                        <td
                          className={tableStyles.td}
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.75rem",
                            wordBreak: "break-all",
                          }}
                        >
                          {rej.content}
                        </td>
                        <td className={`${tableStyles.td} ${styles.cellReason}`}>{rej.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
