# Product

## Register

product

## Platform

web

## Users

Small and medium-sized enterprises (SMEs) that sell products or services on installment/term plans and need a structured system for tracking receivables and managing defaults. Users inside a tenant are divided into hierarchical roles: Owner (approves management promotions and changes any level below), Gerente (manages users/sellers below and handles core titles), and Vendedor/Funcionário (operates CRUD tasks, view-only on general dashboard settings).

## Product Purpose

A multi-tenant billing and accounts receivable management system. It centralizes clients, sellers, and the billing collection lifecycle (rule calculations for fines, interest, and state transitions) as a state machine. It integrates with electronic payment systems (Pix, credit cards) and maintains trace history for renegotiations.

## Positioning

The title (charge) is the central entity, maintaining a complete, auditable renegotiation tree that tracks original parents and generated child titles.

## Brand Personality

- **Trustworthy**: Secure, transparent, and accurate calculations.
- **Efficient**: Optimizes daily workflows with fast navigation and clean dense layouts.
- **Professional**: Clear, high-contrast typography, restrained color usage, and clean state feedback.

## Anti-references

- Generic over-saturated SaaS templates with useless large graphics.
- sketch doodles, wavy grid lines, and diagonal stripes.
- Side-stripe borders for visual grouping.
- Cards nested within cards or repeated identical cards.

## Design Principles

1. **Information Density & Accuracy**: Display tabular lists with clear alignments, proper currency/number format (tabular-nums), and precise status indicators.
2. **Strict Hierarchy Representation**: Interface actions, modals, and navigation routes adapt visually based on user privileges and permissions.
3. **Traceable State Transitions**: Visually differentiate renegotiated, late, overdue, upcoming, and paid titles with clear visual cues and status logs.

## Accessibility & Inclusion

- WCAG contrast ratios of at least 4.5:1 for body and placeholder text.
- Focus-visible styling on all keyboard-navigable elements.
- Clean semantic HTML structure (table, button, dialog, main, nav).
- Responsive layouts adapting cleanly down to mobile viewports.
