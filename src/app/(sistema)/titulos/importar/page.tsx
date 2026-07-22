"use client";

import React, { useState, useRef, useMemo } from "react";
import { TitlesService } from "@/features/titulos/services/titles.service";
import {
  UploadCloud,
  CheckCircle2,
  AlertOctagon,
  ClipboardCopy,
  ClipboardCheck,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import styles from "./importar.module.css";
import uiStyles from "@/components/ui/ui.module.css";
import tableStyles from "@/components/data-table/data-table.module.css";
import { validateCsvFormat, formatFileSize } from "./validate-csv";

type ImportResults = {
  successCount: number;
  failedCount: number;
  rejectedLines: { line: number; content: string; reason: string }[];
};

type LoadedFile = {
  name: string;
  size: number;
};

export default function ImportTitlesPage() {
  const [csvText, setCsvText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [showManualEditor, setShowManualEditor] = useState(false);
  const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleCSV = `DocumentoCliente;NomeCliente;EmailCliente;CelularCliente;ValorOriginal;DataVencimento;CodigoVendedor;IDTituloUnico
12.345.678/0001-90;Mercado Pague Menos Ltda;financeiro@paguemenos.com;(11) 3344-5566;2500,50;2026-08-30;4821;imp-pix-1001
456.789.012-34;Roberto de Souza;roberto.souza@gmail.com;(11) 99887-7665;1250,00;2026-08-25;8912;imp-pix-1002
123.456;Cliente Invalido;erro@email.com;;500,00;2026-09-01;9999;imp-fail-01
456.789.012-34;Roberto de Souza;roberto.souza@gmail.com;;-150,00;2026-08-25;8912;imp-fail-02`;

  const csvValidation = useMemo(() => validateCsvFormat(csvText), [csvText]);
  const canProcess = csvText.trim().length > 0 && csvValidation.valid;

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
      setLoadedFile({ name: file.name, size: file.size });
      setResults(null);
    };
    reader.readAsText(file);
  };

  const handleProcess = async () => {
    if (!canProcess) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await TitlesService.importTitles(csvText);
      setResults(response);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao processar arquivo de importação.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCsvText("");
    setResults(null);
    setError("");
    setLoadedFile(null);
    setShowManualEditor(false);
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
    setLoadedFile(null);
    setShowManualEditor(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCsvChange = (value: string) => {
    setCsvText(value);
    setResults(null);
    if (loadedFile) {
      setLoadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const formatError =
    csvText.trim().length > 0 && !csvValidation.valid ? csvValidation.message : "";

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Importador de Títulos (CSV)</h1>
        <p>Importe faturas e títulos em lote a partir de um arquivo CSV.</p>
      </div>

      {error && <div className={styles.alertError}>{error}</div>}

      <div className={styles.mainGrid}>
        <div className={styles.uploadColumn}>
          <div className={styles.dropzoneBlock}>
            <div
              className={`${styles.dragDropArea} ${dragActive ? styles.dragDropAreaActive : ""} ${loadedFile ? styles.dragDropAreaLoaded : ""}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".csv"
                onChange={handleFileChange}
              />
              {loadedFile ? (
                <>
                  <FileText size={28} style={{ color: "var(--status-paid-text)" }} />
                  <div className={styles.dragDropCopy}>
                    <p className={styles.loadedFileName}>{loadedFile.name}</p>
                    <p className={styles.loadedFileMeta}>
                      {formatFileSize(loadedFile.size)} — clique ou arraste para trocar o arquivo
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud size={28} style={{ color: "var(--colors-accent)" }} />
                  <div className={styles.dragDropCopy}>
                    <p className={styles.dragDropTitle}>
                      Arraste seu arquivo CSV aqui ou clique para selecionar
                    </p>
                    <p className={styles.dragDropHint}>
                      Apenas arquivos .csv. Salve a planilha como CSV antes de enviar.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={styles.manualBlock}>
            <button
              type="button"
              className={styles.manualToggle}
              onClick={() => setShowManualEditor((prev) => !prev)}
              aria-expanded={showManualEditor}
            >
              Ou colar CSV manualmente
              {showManualEditor ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showManualEditor && (
              <div className={`${uiStyles.card} ${styles.sectionCard} ${styles.manualEditor}`}>
                <span className="label">Conteúdo CSV</span>
                <textarea
                  className={styles.textarea}
                  placeholder="Cole as linhas separadas por ponto e vírgula..."
                  value={csvText}
                  onChange={(e) => handleCsvChange(e.target.value)}
                />

                {formatError && <div className={styles.alertError}>{formatError}</div>}

                <div className={styles.actionBar}>
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={loading || !csvText}
                    className={`${uiStyles.btn} ${uiStyles.btnSecondary} ${styles.btnAction}`}
                  >
                    <RotateCcw size={14} />
                    Limpar Tudo
                  </button>
                  <button
                    type="button"
                    onClick={handleProcess}
                    disabled={loading || !canProcess}
                    className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${styles.btnAction}`}
                    title={
                      formatError
                        ? formatError
                        : !csvText.trim()
                          ? "Informe um CSV válido para processar"
                          : undefined
                    }
                  >
                    <Play size={14} />
                    {loading ? "Processando..." : "Processar Importação"}
                  </button>
                </div>
              </div>
            )}

            {!showManualEditor && csvText.trim().length > 0 && (
              <div className={`${uiStyles.card} ${styles.sectionCard}`}>
                {formatError && <div className={styles.alertError}>{formatError}</div>}
                <div className={styles.actionBar}>
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={loading}
                    className={`${uiStyles.btn} ${uiStyles.btnSecondary} ${styles.btnAction}`}
                  >
                    <RotateCcw size={14} />
                    Limpar Tudo
                  </button>
                  <button
                    type="button"
                    onClick={handleProcess}
                    disabled={loading || !canProcess}
                    className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${styles.btnAction}`}
                    title={formatError || undefined}
                  >
                    <Play size={14} />
                    {loading ? "Processando..." : "Processar Importação"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`${uiStyles.card} ${styles.sectionCard} ${styles.guideCard}`}>
          <h3 className={styles.guideTitle}>Guia do Formato</h3>
          <p className={styles.guideIntro}>
            O CSV deve ser separado por <strong>ponto e vírgula (;)</strong> com as colunas na ordem
            abaixo:
          </p>
          <ol className={styles.guideList}>
            <li>CPF / CNPJ do Cliente</li>
            <li>Nome do Cliente</li>
            <li>E-mail</li>
            <li>Celular</li>
            <li>Valor do Título (decimal com vírgula)</li>
            <li>Vencimento (AAAA-MM-DD)</li>
            <li>Código do Vendedor</li>
            <li>ID Único (opcional)</li>
          </ol>
        </div>

        <div className={`${uiStyles.card} ${styles.sectionCard} ${styles.exampleCard}`}>
          <div className={styles.sampleHeader}>
            <span className="label">Exemplo de CSV</span>
            <div className={styles.sampleHeaderActions}>
              <button
                type="button"
                onClick={handleFillSample}
                className={`${uiStyles.btn} ${uiStyles.btnSecondary} ${styles.btnCompact}`}
                title="Preencher editor com exemplo — substitui o conteúdo pelo CSV abaixo"
              >
                Usar exemplo
              </button>
              <button
                type="button"
                onClick={handleCopyTemplate}
                className={`${uiStyles.btn} ${uiStyles.btnSecondary} ${styles.btnIconOnly}`}
                title="Copiar exemplo para a área de transferência"
                aria-label="Copiar template CSV"
              >
                {copied ? (
                  <ClipboardCheck size={16} style={{ color: "var(--status-paid-text)" }} />
                ) : (
                  <ClipboardCopy size={16} />
                )}
              </button>
            </div>
          </div>
          <div className={styles.templateScroll}>
            <pre className={styles.templateBox}>{sampleCSV}</pre>
          </div>
        </div>
      </div>

      {results && (
        <div className={`${uiStyles.card} ${styles.sectionCard}`}>
          <h2 className={styles.resultsTitle}>Resultado do Processamento</h2>

          <div className={styles.resultsGrid}>
            <div className={`${styles.summaryCard} ${styles.summaryCardSuccess}`}>
              <div className={styles.summaryCardHeader}>
                <CheckCircle2 size={18} style={{ color: "var(--status-paid-text)" }} />
                <span className={styles.summaryCardSuccessTitle}>Títulos Importados</span>
              </div>
              <span className={`${styles.summaryCardSuccessValue} tabular-nums`}>
                {results.successCount}
              </span>
              <p className={`${styles.summaryCardNote} ${styles.summaryCardNoteSuccess}`}>
                Títulos gravados com sucesso no banco de dados.
              </p>
            </div>

            <div className={`${styles.summaryCard} ${styles.summaryCardFailed}`}>
              <div className={styles.summaryCardHeader}>
                <AlertOctagon size={18} style={{ color: "var(--status-late-text)" }} />
                <span className={styles.summaryCardFailedTitle}>Linhas Rejeitadas</span>
              </div>
              <span className={`${styles.summaryCardFailedValue} tabular-nums`}>
                {results.failedCount}
              </span>
              <p className={`${styles.summaryCardNote} ${styles.summaryCardNoteFailed}`}>
                Linhas descartadas por erros de validação.
              </p>
            </div>
          </div>

          {results.failedCount > 0 && (
            <div className={styles.rejectionsSection}>
              <h3 className={styles.rejectionsHeading}>Detalhes das Rejeições</h3>
              <p className={styles.rejectionsIntro}>
                Corrija os dados das linhas abaixo e reenvie no importador:
              </p>

              <div className={`${tableStyles.tableWrapper} ${styles.rejectionsTableWrapper}`}>
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
                        <td className={`${tableStyles.td} tabular-nums ${styles.cellLine}`}>
                          {rej.line}
                        </td>
                        <td className={`${tableStyles.td} ${styles.cellContent}`}>{rej.content}</td>
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
