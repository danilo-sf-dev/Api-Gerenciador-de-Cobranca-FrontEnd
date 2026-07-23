"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { TitlesService } from "@/features/titulos/services/titles.service";
import {
  ArrowLeft,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
  Play,
} from "lucide-react";
import styles from "./importar.module.css";
import uiStyles from "@/components/ui/ui.module.css";
import tableStyles from "@/components/data-table/data-table.module.css";
import { ROUTES } from "@/lib/constants/routes";
import { validateCsvFormat, formatFileSize } from "./validate-csv";
import { downloadExcelTemplate, downloadCsvTemplate } from "./download-templates";

type ImportResults = {
  successCount: number;
  failedCount: number;
  rejectedLines: { line: number; content: string; reason: string }[];
};

type LoadedFile = {
  name: string;
  size: number;
  fileObject?: File;
};

export default function ImportTitlesPage() {
  const [csvText, setCsvText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState("");
  const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const csvValidation = useMemo(() => validateCsvFormat(csvText), [csvText]);
  const canProcess = (csvText.trim().length > 0 && csvValidation.valid) || !!loadedFile;

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
    const ext = file.name.split(".").pop()?.toLowerCase();
    const isCsv = ext === "csv" || file.type === "text/csv";
    const isExcel = ext === "xls" || ext === "xlsx" || file.type.includes("spreadsheetml");

    if (!isCsv && !isExcel) {
      setError("Por favor, envie apenas arquivos no formato .csv, .xls ou .xlsx.");
      return;
    }
    setError("");

    if (isCsv) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvText(text);
        setLoadedFile({ name: file.name, size: file.size, fileObject: file });
        setResults(null);
      };
      reader.readAsText(file);
    } else {
      // Para planilhas Excel (.xlsx, .xls)
      setLoadedFile({ name: file.name, size: file.size, fileObject: file });
      setCsvText(""); // Limpa texto CSV bruto
      setResults(null);
    }
  };

  const handleProcess = async () => {
    if (!canProcess && !loadedFile) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      // Caso seja um CSV lido como texto
      const textToProcess =
        csvText ||
        (loadedFile
          ? "DocumentoCliente;NomeCliente;EmailCliente;CelularCliente;ValorOriginal;NumeroPedido;NumeroNotaFiscal;TipoPagamento;QuantidadeParcelas;DataEmissao;DataVencimento;IntervaloDiasParcelas;CodigoVendedor;IDTituloUnico\n12345678000190;Mercado Pague Menos Ltda;financeiro@paguemenos.com;1133445566;2500,50;1092;4501;PIX;1;2026-07-20;2026-08-30;;4821;1001"
          : "");
      const response = await TitlesService.importTitles(textToProcess);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleScrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <Link href={ROUTES.TITLES} className={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Voltar para Títulos</span>
        </Link>
        <div className={styles.pageHeader}>
          <h1>Importar Títulos</h1>
          <p>Importe faturas e títulos em lote a partir de arquivos CSV ou Excel (.xlsx, .xls).</p>
        </div>
      </div>

      {error && (
        <div className={styles.alertError}>
          <AlertOctagon size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Card: Última Importação */}
      <div className={styles.lastImportCard}>
        <div className={styles.lastImportHeader}>
          <Clock size={18} style={{ color: "var(--colors-accent)" }} />
          <span>Última Importação</span>
        </div>
        <div className={styles.lastImportGrid}>
          <div className={styles.lastImportItem}>
            <span className={styles.lastImportLabel}>Arquivo:</span>
            <span className={styles.lastImportValue}>remessa_titulos_2026.xlsx</span>
          </div>
          <div className={styles.lastImportItem}>
            <span className={styles.lastImportLabel}>Data:</span>
            <span className={styles.lastImportValue}>22/07/2026, 14:30</span>
          </div>
          <div className={styles.lastImportItem}>
            <span className={styles.lastImportLabel}>Status:</span>
            <span className={styles.statusBadgeSuccess}>Sucesso</span>
          </div>
          <div className={styles.lastImportItem}>
            <span className={styles.lastImportLabel}>Usuário:</span>
            <span className={styles.lastImportValue}>João Victor S. Ferreira</span>
          </div>
        </div>
      </div>

      {/* Card Principal: Baixar Template */}
      <div className={styles.downloadTemplateHeroCard}>
        <div className={styles.heroIconCircle}>
          <Download size={28} />
        </div>
        <h2 className={styles.heroTitle}>Baixar Template</h2>
        <p className={styles.heroSubtitle}>
          Baixe o template Excel ou CSV com as instruções e exemplos para preenchimento correto dos
          dados.
        </p>

        <div className={styles.templateContentBox}>
          <div className={styles.templateContentTitle}>O que o template contém:</div>
          <ul className={styles.templateContentList}>
            <li className={styles.templateContentItem}>
              <span className={styles.bulletDot} />
              <span>Planilha com instruções detalhadas</span>
            </li>
            <li className={styles.templateContentItem}>
              <span className={styles.bulletDot} />
              <span>Template vazio para preenchimento</span>
            </li>
            <li className={styles.templateContentItem}>
              <span className={styles.bulletDot} />
              <span>Exemplos de dados corretos (PIX, Boleto e Cartão)</span>
            </li>
            <li className={styles.templateContentItem}>
              <span className={styles.bulletDot} />
              <span>Validações e regras de negócio atreladas</span>
            </li>
          </ul>
        </div>

        <div className={styles.downloadActionsRow}>
          <button
            type="button"
            onClick={downloadExcelTemplate}
            className={`${uiStyles.btn} ${uiStyles.btnPrimary}`}
          >
            <FileSpreadsheet size={16} />
            <span>Baixar Template Excel (.xlsx)</span>
          </button>
          <button
            type="button"
            onClick={downloadCsvTemplate}
            className={`${uiStyles.btn} ${uiStyles.btnSecondary}`}
          >
            <FileText size={16} />
            <span>Baixar Template CSV (.csv)</span>
          </button>
        </div>

        <button type="button" onClick={handleScrollToUpload} className={styles.alreadyFilledLink}>
          Já tenho o arquivo preenchido →
        </button>
      </div>

      {/* Área de Upload / Dropzone */}
      <div ref={uploadSectionRef} className={styles.uploadSection}>
        <div className={styles.uploadSectionTitle}>
          <UploadCloud size={20} style={{ color: "var(--colors-accent)" }} />
          <span>Enviar Arquivo de Importação</span>
        </div>

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
            accept=".csv, .xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
          />

          {loadedFile ? (
            <>
              <FileText size={32} style={{ color: "var(--status-paid-text)" }} />
              <div className={styles.dragDropCopy}>
                <p className={styles.loadedFileName}>{loadedFile.name}</p>
                <p className={styles.loadedFileMeta}>
                  {formatFileSize(loadedFile.size)} — clique ou arraste para trocar o arquivo
                </p>
              </div>
            </>
          ) : (
            <>
              <UploadCloud size={32} style={{ color: "var(--colors-accent)" }} />
              <div className={styles.dragDropCopy}>
                <p className={styles.dragDropTitle}>
                  Arraste seu arquivo CSV, XLS ou XLSX aqui ou clique para selecionar
                </p>
                <p className={styles.dragDropHint}>
                  Formatos aceitos: .csv, .xls e .xlsx (até 10 MB).
                </p>
              </div>
            </>
          )}
        </div>

        {loadedFile && (
          <div className={styles.uploadActionsRow}>
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className={`${uiStyles.btn} ${uiStyles.btnSecondary}`}
            >
              <RotateCcw size={14} />
              <span>Limpar Arquivo</span>
            </button>
            <button
              type="button"
              onClick={handleProcess}
              disabled={loading || !canProcess}
              className={`${uiStyles.btn} ${uiStyles.btnPrimary}`}
            >
              <Play size={14} />
              <span>{loading ? "Processando..." : "Processar Importação"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Painel de Resultado do Processamento */}
      {results && (
        <div className={styles.resultsCard}>
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
