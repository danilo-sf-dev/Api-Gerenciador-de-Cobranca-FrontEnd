"use client";

import React from "react";
import styles from "./data-table.module.css";

type TableLoadingProps = {
  rowsCount?: number;
};

export function TableLoading({ rowsCount = 5 }: TableLoadingProps) {
  const rows = Array.from({ length: rowsCount });

  return (
    <div style={{ width: "100%" }}>
      {rows.map((_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <div className={styles.skeletonCell} style={{ width: "20%" }} />
          <div className={styles.skeletonCell} style={{ width: "35%" }} />
          <div className={styles.skeletonCell} style={{ width: "15%" }} />
          <div className={styles.skeletonCell} style={{ width: "15%" }} />
          <div className={styles.skeletonCell} style={{ width: "15%" }} />
        </div>
      ))}
    </div>
  );
}
