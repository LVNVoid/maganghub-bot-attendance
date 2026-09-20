# DESIGN.md — MagangHub Bot Attendance

> Design system berbasis Supabase (dark-first, developer-friendly).
> Adaptasi dari getdesign.md/supabase untuk konteks dashboard management app.

---

## Color Palette

### Brand & Accent
| Token | Value | Role |
| :--- | :--- | :--- |
| `--primary` | `#3ecf8e` | Brand primary, CTA accent, status active |
| `--primary-hover` | `#24b47e` | Pressed / hover state |
| `--primary-soft` | `rgba(62, 207, 142, 0.15)` | Subtle badge bg, success tint |
| `--accent` | `#00c573` | Interactive links |

### Neutral Scale (Dark Mode)
| Token | Value | Role |
| :--- | :--- | :--- |
| `--canvas` | `#171717` | Page background |
| `--canvas-deep` | `#0f0f0f` | Primary button bg, deepest surface |
| `--canvas-subtle` | `#1c1c1c` | Card / panel background |
| `--surface` | `#232323` | Elevated card, sidebar |
| `--surface-elevated` | `#2a2a2a` | Modal, dropdown, popover |

### Ink (Text)
| Token | Value | Role |
| :--- | :--- | :--- |
| `--ink-primary` | `#fafafa` | Primary text, headings |
| `--ink-secondary` | `#b4b4b4` | Secondary text, descriptions |
| `--ink-muted` | `#898989` | Muted text, placeholders, captions |

### Border & Divider
| Token | Value | Role |
| :--- | :--- | :--- |
| `--hairline` | `#2e2e2e` | Standard card/section border |
| `--hairline-subtle` | `#242424` | Barely visible divider |
| `--hairline-prominent` | `#363636` | Hover / interactive border |
| `--hairline-accent` | `rgba(62, 207, 142, 0.3)` | Brand-highlighted border |

### Semantic
| Token | Value | Role |
| :--- | :--- | :--- |
| `--success` | `#3ecf8e` | Submit berhasil |
| `--error` | `#f97583` | Submit gagal, error state |
| `--warning` | `#e3b341` | Peringatan, credential expire |
| `--info` | `#79c0ff` | Informational badge |

---

## Typography

### Font Stack
- **Primary**: `Inter`, fallback: `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
- **Mono**: `'JetBrains Mono'`, fallback: `ui-monospace, SFMono-Regular, Menlo, monospace`

### Scale
| Role | Size | Weight | Line Height | Letter Spacing | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Display | 36px | 600 | 1.15 | -0.02em | Page title |
| Heading | 24px | 600 | 1.30 | -0.01em | Section heading |
| Subheading | 18px | 500 | 1.40 | normal | Card title |
| Body | 16px | 400 | 1.55 | normal | Default text |
| Caption | 14px | 400 | 1.45 | normal | Metadata, helper |
| Small | 12px | 400 | 1.35 | normal | Fine print |
| Code Label | 12px (mono) | 500 | 1.35 | 0.05em | `text-transform: uppercase` |

---

## Border Radius Scale
| Token | Value | Use |
| :--- | :--- | :--- |
| `--radius-xs` | `4px` | Badge, small chip |
| `--radius-sm` | `6px` | Ghost button, input |
| `--radius-md` | `8px` | Card, container |
| `--radius-lg` | `12px` | Panel, modal |
| `--radius-xl` | `16px` | Feature card |
| `--radius-full` | `9999px` | Primary CTA pill button |

---

## Elevation & Depth

Depth melalui border hierarchy, bukan shadow. Dark mode membuat shadow tidak efektif.

| Level | Treatment | Use |
| :--- | :--- | :--- |
| Flat (L0) | Border `--hairline` | Default state |
| Hover (L1) | Border `--hairline-prominent` | Interactive hover |
| Focus (L2) | `ring-2 ring-primary/40` | Focus visible |
| Accent (L3) | Border `--hairline-accent` | Brand-highlighted |

---

## Component Patterns

### Buttons
- **Primary Pill**: `bg-canvas-deep text-ink-primary border border-ink-primary rounded-full px-6 py-2`
- **Secondary**: `bg-canvas-subtle text-ink-primary border border-hairline rounded-sm px-4 py-2`
- **Ghost**: `bg-transparent text-ink-primary hover:bg-surface rounded-sm px-3 py-2`

### Cards
- `bg-canvas-subtle border border-hairline rounded-md p-4`
- No shadow. Border defines edges.

### Inputs
- `bg-canvas-deep border border-hairline rounded-sm text-ink-primary placeholder:text-ink-muted focus:border-primary`

### Status Badge
- Success: `bg-primary-soft text-primary rounded-xs px-2 py-0.5`
- Error: `bg-error/15 text-error rounded-xs px-2 py-0.5`
- Warning: `bg-warning/15 text-warning rounded-xs px-2 py-0.5`

---

## Spacing
- Base unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
- Section gap: `py-16` to `py-24`
- Card internal: `p-4` to `p-6`

---

## Motion
- Default: `transition-all 150ms ease`
- Interactive hover: `transition-colors 200ms ease`
- No perpetual animations. Motion only on user interaction.

---

## Responsive
| Name | Width | Key Changes |
| :--- | :--- | :--- |
| Mobile | <640px | Single column, stacked, hamburger nav |
| Tablet | 640-1024px | 2-column grid |
| Desktop | >1024px | Full sidebar + content layout |
