---
name: Trustee Ledger
description: Audit-centric financial accounts receivable system with clean density and high contrast.
colors:
  primary: "#d21c38"
  neutral-bg: "#ffffff"
  neutral-surface: "#f8f9fa"
  neutral-border: "#e9ecef"
  neutral-ink: "#1a1a1a"
  neutral-muted: "#6c757d"
  accent: "#1c3d5a"
rounded:
  sm: "4px"
  md: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "#b2142d"
  input-field:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
---

# Design System: Trustee Ledger

## 1. Overview

**Creative North Star: "The Trustee Ledger"**

A high-density, transaction-first interface designed for financial controllers and billing administrators. The aesthetic is clean, structured, and deliberate, prioritizing absolute data clarity, logical alignments, and unambiguous interactive cues. The system rejects typical SaaS cliché gradients, over-rounded elements, and sketchy illustrations. Instead, it relies on sharp grids, structured borders, and high typographic contrast.

**Key Characteristics:**

- Restrained color strategy focusing on pure white, deep ink, and a single ruby-red primary brand anchor.
- High-contrast, highly legible sans-serif typography using the system-ui stack.
- Tight spatial grids with defined borders rather than soft wide shadows.
- Clear state indications for statuses: upcoming (indigo), overdue (amber), late (crimson/red), paid (green), canceled (dark gray), and renegotiated (purple).

## 2. Colors

A disciplined palette utilizing a crimson brand anchor combined with neutral light backgrounds and deep slate-blue accents for secure financial operations.

### Primary

- **Crimson Brand Anchor** (`#d21c38` / `oklch(0.55 0.22 355.3)`): Used for primary action buttons, selected navigation items, and critical alerts.

### Neutral

- **Pure White Bg** (`#ffffff` / `oklch(1.000 0.000 0)`): Base workspace background.
- **Cool Surface** (`#f8f9fa` / `oklch(0.975 0.002 250.0)`): Used for card backgrounds, tables, toolbars, and inactive controls.
- **Ledger Border** (`#e9ecef` / `oklch(0.930 0.002 250.0)`): Subtle gray borders separating rows, sections, and grids.
- **Deep Ink Text** (`#1a1a1a` / `oklch(0.120 0.000 0)`): High-contrast primary text for all copy and values.
- **Muted Metadata** (`#6c757d` / `oklch(0.520 0.000 0)`): Muted secondary text, labels, and captions.

### Accent

- **Trustee Blue** (`#1c3d5a` / `oklch(0.350 0.120 250.0)`): Used for badges, informational alerts, and status pills.

### Named Rules

**The 10% Anchor Rule.** Saturated crimson is used for less than 10% of any layout surface. Its scarcity enforces its function as a primary focal point.

**The Contrast Floor Rule.** Under no circumstances shall body text or label text drop below a 4.5:1 contrast ratio against its background. Placeholder text must adhere to the same constraint.

## 3. Typography

**Display Font:** System-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
**Body Font:** System-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
**Label/Mono Font:** ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace

**Character:** A single typography family carrying all headings, labels, and copy. Fixed `rem`-based scales prevent visual noise and preserve predictable density.

### Hierarchy

- **Display** (bold, 1.75rem, 1.2 line-height): Operational title sizes, used on the dashboard summary and main page headers.
- **Headline** (semibold, 1.5rem, 1.3 line-height): Section titles and group headers.
- **Title** (semibold, 1.125rem, 1.4 line-height): Subsections, table column headers, and modal titles.
- **Body** (regular, 1rem, 1.5 line-height): Standard descriptions, table rows, and fields. Max line length: 75ch.
- **Label** (medium, 0.875rem, 1.2 line-height, letter-spacing: 0.02em): Input labels, table headers, metadata.
- **Mono** (regular, 0.875rem, 1.2 line-height): Values, CPF/CNPJ, currency elements, dates.

### Named Rules

**The Tabular Number Rule.** All financial values, CPF/CNPJ, dates, and codes must use monospace digits (`font-variant-numeric: tabular-nums`) to ensure vertical columns align perfectly.

## 4. Elevation

The system is flat-by-default, relying on structural borders and background changes rather than drop shadows to delineate cards and controls.

### Shadow Vocabulary

- **Ambient Alert** (`box-shadow: 0 4px 12px rgba(26,26,26,0.05)`): Subtle drop shadow used only for overlay elements like dropdowns, tooltips, and modal boxes.

### Named Rules

**The Flat-By-Default Rule.** Visual components reside in a single flat plane. Depth is established through color contrast (white vs. light gray) and border strokes. Drop shadows are strictly reserved for absolute floating modals or popovers.

## 5. Components

### Buttons

- **Shape:** Soft square (4px radius).
- **Primary:** Crimson brand fill, white text, 8px vertical and 16px horizontal padding.
- **Hover / Focus:** Fills darken by 10% (`#b2142d`). Focus visible ring outline in Trustee Blue (`#1c3d5a`) with 2px offset.
- **Secondary:** Light gray surface fill, dark ink text, subtle border.

### Cards / Containers

- **Corner Style:** Rounded (8px radius).
- **Background:** Pure White or Cool Surface.
- **Border:** 1px solid Ledger Border (`#e9ecef`).
- **Internal Padding:** Spaced uniformly using the scale (`16px` to `24px`).

### Inputs / Fields

- **Style:** 1px solid Ledger Border, white background, soft square (4px radius).
- **Focus:** Border changes to Trustee Blue, subtle blue outline.
- **Error:** Border changes to status red (`oklch(0.55 0.22 20.0)`).

### Navigation

- **Style:** Collapsible sidebar using Cool Surface background. Active routes marked with Crimson Brand Anchor. Nav items use 8px gap and display label text with 0.875rem size.

## 6. Do's and Don'ts

### Do:

- **Do** align all currency values to the right in data tables.
- **Do** use uppercase and wide tracking for labels and table headings to enhance readability.
- **Do** provide clear focus indicator rings on all form inputs and button interactions.
- **Do** format all dates and documents using the monospace font stack.

### Don't:

- **Don't** use border-left/border-right greater than 1px as a colored status stripe on cards or list items.
- **Don't** use decorative gradient text or glassmorphic blur panels.
- **Don't** round corners of cards or inputs above 8px.
- **Don't** use generic placeholders; verify CPF, CNPJ, and currency values at presentation time.
