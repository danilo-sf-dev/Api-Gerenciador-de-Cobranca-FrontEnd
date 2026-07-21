"use client";

import React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import styles from "./data-table.module.css";

type SortableHeaderProps = {
  label: string;
  field: string;
  currentSort?: string; // Format: "field,asc" or "field,desc"
  onSort: (sortStr: string) => void;
  alignRight?: boolean;
};

export function SortableHeader({
  label,
  field,
  currentSort,
  onSort,
  alignRight = false,
}: SortableHeaderProps) {
  const [currentField, direction] = currentSort ? currentSort.split(",") : ["", ""];
  const isSorted = currentField === field;

  const handleClick = () => {
    if (!isSorted) {
      onSort(`${field},asc`);
    } else if (direction === "asc") {
      onSort(`${field},desc`);
    } else {
      onSort(""); // Clear sort
    }
  };

  return (
    <th
      onClick={handleClick}
      className={`${styles.th} ${styles.thSortable}`}
      style={{ textAlign: alignRight ? "right" : "left" }}
    >
      <span style={{ display: "inline-flex", alignItems: "center" }}>
        {label}
        <span className={styles.sortIcon}>
          {isSorted ? (
            direction === "asc" ? (
              <ArrowUp size={12} />
            ) : (
              <ArrowDown size={12} />
            )
          ) : (
            <ArrowUpDown size={12} style={{ opacity: 0.3 }} />
          )}
        </span>
      </span>
    </th>
  );
}
