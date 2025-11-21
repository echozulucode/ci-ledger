# UI Upgrade Plan - CI Ledger (plan-003)

## Phase 1: Design System & Layout
- Define tokens: colors (neutral bg, text, single accent), type ramp (xl/lg/md/sm), spacing (4/8pt), radii, shadows, focus states.
- Create shared components/styles: buttons (primary/secondary/danger), chips/pills, cards/surfaces, form controls, table styles, modal/sheet base classes.
- Normalize page headers, sections, and filter panels with consistent padding and background tints.

## Phase 2: Events Experience
- Filters: align controls in a clean bar; show active filter chips and "clear all"; improve date range inputs with label-top; add tag chip filtering.
- List/Table: switch to a clean table (desktop) with key columns (time, title, type, severity badge, source, tags), hover highlight; cards for mobile.
- Timeline: replace ad-hoc grouping with a simplified timeline view (date rail + event stack, pastel badges) and gentle expand-on-click.
- Detail View: slide-over panel with grouped sections (summary, agents, tools, tags, metadata), admin delete with confirm prompt, read-only metadata block.
- Create/Edit: sheet/panel with labeled fields, progressive disclosure for advanced fields (metadata, versions), inline validation, disabled submit until valid; respect current filters for defaults.

## Phase 3: Inventory (Admin)
- Tables for agents/tools/tags with search, sortable headers, striped rows, compact action buttons.
- Create/Edit panels with label-top fields, grouping; add update flow alongside create; confirm delete with optional undo toast.
- Navigation: ensure Inventory nav state matches Events/other sections.

## Phase 4: Feedback, Accessibility, Motion
- Loading/empty/error states standardized with icons + concise text; toasts for create/delete success/error.
- Keyboard focus rings, aria labels, and `prefers-reduced-motion` for transitions (fade/slide in panels/sheets).
- Gentle micro-interactions on hover/focus and view toggles.

## Phase 5: Tests & Checks
- Playwright smoke flows: login, events list/table render, open detail panel, create/delete event (admin), navigate inventory create/delete.
- Vitest updates for new components (filters params, create form validation, table rendering).
- Run `npm run build` + lint; keep backend pytests green.
