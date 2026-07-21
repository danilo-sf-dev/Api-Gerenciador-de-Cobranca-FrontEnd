"use client";

import React, { ReactNode } from "react";
import styles from "./ui.module.css";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className={styles.tooltip}>
      {children}
      <div className={styles.tooltipContent}>{content}</div>
    </div>
  );
}
