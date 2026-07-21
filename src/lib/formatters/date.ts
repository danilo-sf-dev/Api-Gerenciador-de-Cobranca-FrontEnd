/**
 * Formats a Date object or ISO string to Brazilian format: DD/MM/YYYY
 */
export function formatDate(dateInput: Date | string | undefined | null): string {
  if (!dateInput) return "-";
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "-";

    // Add timezone offset correction if parsing a date-only ISO string (e.g. 2026-07-20)
    // to avoid displaying the previous day due to UTC conversion.
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const resolvedDate = typeof dateInput === "string" && dateInput.includes("T") ? date : utcDate;

    return resolvedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

/**
 * Formats a Date object or ISO string to Brazilian format with time: DD/MM/YYYY HH:mm
 */
export function formatDateTime(dateInput: Date | string | undefined | null): string {
  if (!dateInput) return "-";
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}
