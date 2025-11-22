# Plan: Linear-Inspired UI & Usability Upgrades (plan-005)

## Goals
- Lift usability and polish toward Linear-quality interactions while honoring Apple HIG principles (clarity, deference, depth; minimal chrome, crisp typography, meaningful motion).
- Focus on the highest-impact 10 improvements that speed CRUD flows and reduce friction in filters, list views, and create/edit forms.
- Keep responsive, keyboard-friendly, and accessible (focus outlines, contrast, reduced-motion support).

## Principles
- Clarity over chrome: quiet surfaces, tight spacing, high legibility, single accent color.
- Deference: content-first lists, unobtrusive controls, hover/active feedback only when needed.
- Depth: subtle elevation/shadow for modals/sheets/menus; smooth but restrained transitions; honor `prefers-reduced-motion`.

## Top 10 UI/UX Improvements (What to Deliver)
1) Filter bar + chips with saved views  
   - Horizontal filter bar with inline chips for active filters and “Clear all”.  
   - Saved views (e.g., Active/Planned/Completed) as quick toggles near the header.
2) Display controls & density preferences  
   - “Display” popover to toggle columns, row density, and grouping; persist per user.
3) Section headers with counts & status cues  
   - Group rows under headers (e.g., “In Review 10”, “In Progress 12”) with subtle dividers and badges.
4) Rich row metadata with pills/avatars  
   - Compact two-line rows: ID + title, metadata row with status/labels pills, owner avatar, date, and quick signals (priority/health).
5) Inline/hover actions & context menus  
   - Hover actions for open/edit/status/assign; three-dot menu for duplicate/delete; consistent placement and iconography.
6) Create/Edit sheets with chip selectors  
   - Wide sheet/modal with label-top fields, pill selectors for status/priority/labels, keyboard hints (Enter save, Esc close), and sticky action bar.
7) Detail split view / slide-over  
   - Split-pane or slide-over detail that keeps list context; persistent primary actions (status change, assign, labels) as inline chips/toggles.
8) Feedback states (skeletons, empty, toasts, undo)  
   - Skeletons for lists; empty states with reset-filter CTA; toasts for success/error; undo for destructive actions.
9) Keyboard & command palette  
   - Global command palette (Cmd/Ctrl+K) for jump-to and quick create; inline shortcuts on menus (e.g., “F” for filters).
10) Responsive + accessibility polish  
   - Mobile-friendly filter bar and primary actions; table-to-card collapse; focus rings, contrast compliance, and reduced-motion paths.

## Actionable Tasks (Priority Order)
1. Token pass: tighten spacing/typography defaults and status pill colors to match Apple/Linear tone.  
2. Shared primitives: Chips/Pills, FilterBar, SectionHeader with counts, DisplayPopover skeleton, ListRow hover states, skeleton/empty/toast refresh.  
3. Events screen pass: add filter chips with clear-all, saved views preset (e.g., “Recent”, “By agent”), display popover for density/columns, inline row actions, and section headers for grouped severity/type.  
4. Create/edit UX: replace modal with wide sheet, pill selectors for status/type/severity, sticky action bar with keyboard hints (Enter/Esc), undo toast for delete.  
5. Detail view: add split-pane/slide-over that keeps list context, with inline chips for status/labels/owners.  
6. Keyboard + command palette: Cmd/Ctrl+K for jump-to/create, “F” to focus filters, Enter/Esc shortcuts on sheets/menus.  
7. PAT/Inventory pass: reuse list row + filter bar + display popover + sheet patterns on tokens/admin inventories.  
8. Responsive polish: mobile filter bar collapse to drawer; cards for narrow widths; persistent primary CTA.  
9. Accessibility: focus rings, contrast check, reduced-motion variants for key transitions; aria labels on menus/popovers.  
10. QA: Playwright smoke for filter chips, saved views, sheet create, undo delete, command palette; unit tests for filter state helpers.

## Scope & Application
- Apply to Events/Items lists, PAT management, and Project/Initiative-style views; reuse components across screens.
- Update shared components: ListRow, Pill/Chip, FilterBar, DisplayPopover, Sheet, Toast, Skeleton, EmptyState.
- Keep backend/API unchanged; client-side only unless data needed for new metadata (owners/labels/status).

## Execution Steps
1) Component foundation: add/extend chips, pill status tokens, hoverable row, skeletons, empty states, toasts, sheet.  
2) Lists overhaul: implement filter bar + chips + saved views; section headers with counts; display popover with density/columns.  
3) CRUD flows: replace modals with sheets; add inline actions and context menu; add undo toast for deletes.  
4) Detail UX: add split-pane/slide-over detail with persistent key actions.  
5) Keyboard/command: wire Cmd/Ctrl+K palette, “F” filter focus, Enter/Esc in sheets.  
6) Responsive/a11y: verify breakpoints, focus states, contrast, reduced-motion variants.  
7) QA: run UI lint/build, add Playwright smoke for filters, saved view, sheet create, undo delete, and command palette.
