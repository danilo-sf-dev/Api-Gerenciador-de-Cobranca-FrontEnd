/**
 * Simple helper to join and conditionalize CSS class names for Vanilla CSS / CSS Modules
 */
export function cn(
  ...classes: (string | boolean | undefined | null | { [key: string]: boolean })[]
): string {
  const result: string[] = [];

  for (const item of classes) {
    if (!item) continue;
    if (typeof item === "string") {
      result.push(item);
    } else if (typeof item === "object") {
      for (const [key, value] of Object.entries(item)) {
        if (value) {
          result.push(key);
        }
      }
    }
  }

  return result.join(" ");
}
