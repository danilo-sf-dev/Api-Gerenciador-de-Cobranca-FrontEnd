"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./data-table.module.css";

type PaginationProps = {
  page: number; // 1-indexed
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalElements === 0) return null;

  const startElement = (page - 1) * size + 1;
  const endElement = Math.min(page * size, totalElements);

  // Generate numbered buttons
  const getPages = () => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className={styles.pagination}>
      <div>
        Mostrando{" "}
        <span className="tabular-nums" style={{ fontWeight: 600 }}>
          {startElement}
        </span>{" "}
        a{" "}
        <span className="tabular-nums" style={{ fontWeight: 600 }}>
          {endElement}
        </span>{" "}
        de{" "}
        <span className="tabular-nums" style={{ fontWeight: 600 }}>
          {totalElements}
        </span>{" "}
        resultados
      </div>
      <div className={styles.paginationButtons}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={styles.pageBtn}
          title="Página Anterior"
        >
          <ChevronLeft size={16} />
        </button>
        {getPages().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ""}`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          className={styles.pageBtn}
          title="Próxima Página"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
