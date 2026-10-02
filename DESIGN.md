---
name: "Sharon Meal Plan"
description: "A practical kitchen ledger for a four-week family meal rotation"
colors:
  cream-paper: "#f1eadf"
  cream-surface: "#fbf8f1"
  cream-bright: "#fffdf8"
  oat-soft: "#e8ded0"
  aubergine-ink: "#2d2025"
  aubergine-ink-soft: "#514349"
  aubergine-ink-muted: "#66575e"
  aubergine-action: "#6b3352"
  aubergine-action-strong: "#4e2139"
  aubergine-blush: "#f0e3ea"
  aubergine-deep: "#34222a"
  olive: "#4f5e43"
  olive-soft: "#e4e8dc"
  butter: "#e9b853"
  butter-soft: "#f7ebcb"
  butter-strong: "#7a4f00"
  oat-line: "#d4c6b8"
  oat-line-strong: "#a99687"
  marigold: "#f0bd56"
  espresso-paper: "#171311"
  espresso-surface: "#241d1a"
  espresso-strong: "#302621"
  espresso-soft: "#3a2f28"
  espresso-line: "#57483f"
  espresso-line-strong: "#7a6759"
  cream-ink: "#f4ece1"
  cream-ink-muted: "#bcae9f"
  brass: "#d2a568"
  brass-light: "#f0ce98"
  brass-tint: "#493724"
  brass-fill: "#4a3a2a"
  sage-light: "#b9c79f"
  print-paper: "#ffffff"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  control: "10px"
  card: "14px"
  panel: "18px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.aubergine-action}"
    textColor: "{colors.cream-bright}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "10px 16px"
  button-primary-dark:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.espresso-paper}"
    rounded: "{rounded.pill}"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.cream-surface}"
    textColor: "{colors.aubergine-ink}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "10px 16px"
  tonight-card:
    backgroundColor: "{colors.aubergine-deep}"
    textColor: "{colors.cream-bright}"
    rounded: "{rounded.panel}"
    padding: "32px 48px"
  week-tab-active:
    backgroundColor: "{colors.aubergine-ink}"
    textColor: "{colors.cream-bright}"
    rounded: "0"
    padding: "8px 12px"
  meal-entry:
    backgroundColor: "{colors.cream-bright}"
    textColor: "{colors.aubergine-ink}"
    rounded: "0"
    padding: "17px 14px 14px"
  shopping-section:
    backgroundColor: "{colors.cream-bright}"
    textColor: "{colors.aubergine-ink}"
    rounded: "{rounded.card}"
---

# Design System: Sharon Meal Plan

## Overview

**Creative North Star: "The Kitchen Ledger"**

A working kitchen planner with the warmth of a home cookbook and the order of a marked-up weekly ledger. It should feel calm, direct and already in use. The page opens on tonight's dinner (photo, name, time, Start cooking) because that is why people open it; the week, the shop and the use-by dates follow in the order they are needed.

The interface is information-rich without reading like administration. Georgia carries meals and orientation; the system sans carries actions, costs and instructions. Ruled grids hold days, meals and shopping items; rounded containment is reserved for the tools around them. Photography identifies a dinner at a glance and never decorates.

Light and dark are one product. Light mode is cream paper with aubergine ink and aubergine actions; dark mode is espresso with cream text and a single muted brass accent. Neither theme uses navy, steel, gradients or glow.

**Key Characteristics:**

- Tonight first, then the week, then the shop.
- Cream paper and aubergine ink in light; espresso, cream and brass in dark.
- Georgia for meals and headings, system sans for everything you act on.
- Flat ruled grids inside rounded working surfaces.
- Kitchen-scale targets: 44px minimum everywhere, 64px for cooking steps.

## Colors

Warm, domestic and low in chroma: kitchen-table cream, aubergine and olive, with butter reserved for food-safety attention. Tokens are named by role in `app/globals.css`; the swatch names below are for people.

### Primary
- **Aubergine Action** (#6b3352 light) / **Brass** (#d2a568 dark): `--action`. Primary buttons, links, active icons, the day label on cards, the cooking-step highlight. White on aubergine is 9.5:1; espresso on brass is 7.8:1.
- **Aubergine Action Strong** (#4e2139 / #f0ce98): `--action-strong`. Text on tinted surfaces, hover text, costs.
- **Aubergine Blush** (#f0e3ea / Brass Tint #493724): `--action-soft` and `--surface-tint`. Selected and "next step" grounds.
- **Aubergine Deep** (#34222a, both themes): `--inverse-surface`. The Tonight card and basket summary, the two places the page speaks loudest. Text on it is `--inverse-ink` with `--inverse-accent` (Marigold #f0bd56 / Brass Light #f0ce98) for the word Tonight.

### Secondary
- **Olive** (#4f5e43 / Sage Light #b9c79f): `--positive`. Picked counts, cooked states, the cook's note, the "Dinner's up" panel.

### Tertiary
- **Butter** (#e9b853): `--highlight`. Text selection and food-safety attention grounds only (`--highlight-soft`). Any warning text or border on butter uses **Butter Strong** (#7a4f00 / #f0ce98), `--highlight-strong`.

### Neutral
- **Cream Paper** (#f1eadf) / **Espresso Paper** (#171311): `--paper`, the page ground.
- **Cream Surface** (#fbf8f1), **Cream Bright** (#fffdf8), **Oat Soft** (#e8ded0): `--surface`, `--surface-strong`, `--surface-soft`. Dark: #241d1a, #302621, #3a2f28.
- **Aubergine Ink** (#2d2025), **Ink Soft** (#514349), **Ink Muted** (#66575e): `--ink`, `--ink-soft`, `--ink-muted`. Dark: Cream Ink #f4ece1, #ddd0c2, #bcae9f. Muted ink passes 4.5:1 on every surface including the soft ones.
- **Oat Line** (#d4c6b8) and **Oat Line Strong** (#a99687): `--line`, `--line-strong`. Dark: #57483f, #7a6759.
- **Brand mark**: `--brand-mark-bg` / `--brand-mark-ink`, aubergine with marigold in light and brass with espresso in dark (never below 7:1).
- **Focus ring**: `--focus-ring`, solid aubergine ink in light (13:1 on paper) and Brass Light in dark. Always a 3px solid outline, never translucent.

### Named Rules
**The Role Name Rule.** A token is named for what it does (`--action`, `--positive`, `--highlight`), never for a colour. If the colour changes, the name stays true.

**The One Accent Rule.** Each theme has one accent colour for action. Olive means done; butter means look at the use-by dates. Nothing else gets colour.

**The No Grey Primary Rule.** A primary button is always `--action` on `--primary-foreground`. A grey button reads as disabled.

## Typography

**Display Font:** Georgia (with Times New Roman, serif)
**Body Font:** the platform UI sans (ui-sans-serif, system-ui, -apple-system, Segoe UI)

**Character:** Georgia makes Sharon's own recipes feel like a cookbook; the system sans keeps controls, prices and long methods fast to read and free to load (no web fonts).

### Hierarchy
The scale has five steps, exposed as `--text-sm` 0.8125rem, `--text-md` 0.9375rem, `--text-base` 1rem, `--text-lg` 1.25rem and `--text-xl` 2rem. Weights are 400 and 600 only.

- **Display / Headline** (Georgia 600, `--text-xl`, 1.05): the Tonight card dinner name, the open recipe title and the active week title. Context (the aubergine panel, the photo) separates them, not size.
- **Title** (Georgia 600, `--text-lg`, 1.1): meal names on cards, cooking-finish heading.
- **Body** (sans 400, 1rem, 1.5): descriptions, ingredients, method; methods stay within ~70ch. Cooking-mode steps step up to 1.25rem.
- **Secondary** (sans 400–600, `--text-md`): card descriptions, controls, notices.
- **Label** (sans 600, `--text-sm`): days, metadata, small controls. Nothing on screen is smaller than `--text-sm` (0.8125rem).

### Named Rules
**The Two-Voice Rule.** Serif carries meals and orientation. Sans carries actions, metadata, prices and instructions; prices use tabular sans numerals, never bold serif.

**The Gentle Tracking Rule.** Display tracking is never tighter than -0.02em; Georgia pinches below that.

## Layout

The shell is fluid to 1,380px with 24px gutters (16px under 780px). Order, top to bottom: one-line masthead (brand and theme switch), Tonight card, week tabs, then the planner panel with the week title, the Dinners/Shopping tabs and their tools.

- **Tonight card:** photo and text side by side on desktop (1.1fr / 1fr), stacked on phones with the photo at 16:9; fully visible on a 390×844 phone at load.
- **Dinners:** a ruled grid of the six other days (three columns at 1,400px+, two above 780px, one below). Past days step back (desaturated photo, softer title).
- **Shopping:** two ruled section columns plus a 300px basket summary on desktop. On phones one column, with the picked count and total pinned to the bottom of the screen. Use-by dates sit below the list as a one-line disclosure.
- **Week tabs:** four across everywhere. On phones they compact to "Week 1 / £50.26" in one row; the week's name is in the heading just below and stays in each tab's accessible name.

Spacing follows a 4px base: 4 / 8 / 16 / 24 / 40px. Tight spacing inside a meal or control group; 16–24px between task areas. Touch targets are at least 44px; cooking steps at least 64px.

## Elevation & Depth

Flat by default. Borders, tonal shifts and photography create depth. Shadows are tokens in `app/globals.css` and only appear on things that float or move with scroll; cards never carry a shadow at rest.

### Shadow Vocabulary
- **Control** (`--shadow-control`, `0 1px 4px rgb(45 32 37 / 25%)`): the theme-switch disk and switch thumbs.
- **Soft** (`--shadow-soft`, `0 8px 24px rgb(45 32 37 / 8%)`): the sticky recipe toolbar, the recipe reader and the next cooking step.
- **Menu** (`--shadow`, `0 18px 50px rgb(45 32 37 / 10%)`): dropdown menus and the desktop basket summary.
- **Lift** (`--shadow-lift`, `0 -6px 24px rgb(45 32 37 / 20%)`): the shopping bar pinned to the bottom of a phone screen.

Dark mode uses the same roles with black shadows at higher opacity.

## Shapes

Three radii, as tokens: **`--radius-control` 10px** (inputs, small buttons, menus), **`--radius-card` 14px** (shopping sections, use-by panel, cooking steps, notices), **`--radius-panel` 18px** (Tonight card, planner panel, recipe reader). Buttons are pills (999px); dots are circles. Ruled grid entries (meal cards, week tabs, shopping rows) are square and share borders. The SM mark alone uses an alternating 10/18px leaf corner, and checkboxes keep the platform-like 4px corner so they never read as radio buttons. A ticked shopping box fills with `--positive`.

## Print

Print is its own composition on white paper (`print-paper`): the Dinners view prints the week's menu as a ruled list, a recipe prints without its photo or controls, and the shopping list prints in two columns with prices beside each item. Status banners, the Tonight card, use-by panel, navigation and controls never print.

## Components

### Buttons
- **Shape:** pill (999px), 44px minimum height, 10px 16px padding.
- **Primary:** `--action` with `--primary-foreground`; on the Tonight card it inverts to cream on aubergine.
- **Secondary:** `--surface` with `--line` border and `--ink` text.
- **Hover / Focus:** 1px lift on hover; 3px solid `--focus-ring` outline offset 3px on focus.

### Week tabs
- Square, connected group with `--line-strong` keylines. The active week is `--active-fill` with an inset `--active-border` line. Each tab shows the week number, its name and its shop total (name hidden visually on phones).

### Reorder bar
- Reordering is a visible mode: a `--surface-tint` bar with a 2px `--active-border` says "Reordering Week N", with Reset order and a primary Done that takes focus. Each dinner offers Earlier, Later and a "Move to" day picker.

### Tonight card
- `--inverse-surface` panel, 18px radius. Georgia display name with an italic "Tonight" in `--inverse-accent`. Actions: Start cooking (primary), Open recipe (secondary); after cooking it shows Cooked and Open recipe only.

### Meal entry
- Square ruled cell on `--surface-strong`: day and date label, Georgia title, three-line description, time, and a star with a number only when rated. The whole cell is one button named "day, dinner, state".

### Cooking mode
- Cooking mode owns the screen: masthead, week tabs, planner toolbar, photo, cost and recipe actions step away; the sticky bar holds a tappable "Step 3 of 6" (jumps to the next step) and one "Exit cooking". Entering lands on the next step.
- Steps are full-width tick targets (64px+, 2px border, 14px radius) at 1.25rem. The next step gets `--active-border` and `--surface-tint`; done steps quieten to muted text. Ingredients become tick rows. The screen is kept awake. After the last step: "Dinner's up", Mark cooked, then the rating.

### Shopping row
- Checkbox, item name and pack size, price at the right in tabular sans, and a 44px move button. Rows share hairline rules inside a 14px-radius section. Each aisle heading has a quiet "Tick all" text button (Untick all once done); a finished aisle shows Done in olive.

### Inputs
- `--surface-strong` field, `--line-strong` border, 10px radius; focus moves the border to `--action` and adds the solid focus ring. Inputs are 16px or larger on phones.

## Do's and Don'ts

### Do:
- **Do** put tonight's dinner first and keep it reachable in one tap.
- **Do** name new tokens by role and add them to both theme blocks in `app/globals.css`.
- **Do** keep every text pair at 4.5:1 or better in both themes, including muted text on soft surfaces.
- **Do** use a full border plus an icon for food-safety warnings.
- **Do** keep text labels on Print and More at every width; under 430px the theme switch keeps its sun and moon icons and its accessible name.

### Don't:
- **Don't** reintroduce navy, steel or blue-grey; dark mode is espresso and brass.
- **Don't** use a coloured side stripe as the only accent on a card, alert or list item.
- **Don't** show controls disabled without a reason; hide them until they can be used.
- **Don't** dim text with opacity; pick a token that passes contrast.
- **Don't** truncate week names, dinner names or the brand on phones; let them wrap.
