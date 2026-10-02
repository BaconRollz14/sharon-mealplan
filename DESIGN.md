---
name: "Sharon Meal Plan"
description: "A practical kitchen ledger for a four-week family meal rotation"
colors:
  aubergine-ink: "#2d2025"
  aubergine-deep: "#34222a"
  espresso-paper: "#171311"
  espresso-surface: "#241D1A"
  espresso-strong: "#302621"
  espresso-soft: "#3A2F28"
  espresso-line: "#57483F"
  brass: "#D2A568"
  brass-light: "#F0CE98"
  espresso-tint: "#493724"
  cream-paper: "#f1eadf"
  cream-surface: "#fbf8f1"
  cream-bright: "#fffdf8"
  oat-line: "#d4c6b8"
  olive: "#4f5e43"
  butter: "#e9b853"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(3rem, 5vw, 4.9rem)"
    fontWeight: 600
    lineHeight: 0.88
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.9rem, 3vw, 2.9rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.05em"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.78rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  control: "10px"
  surface: "18px"
  compact: "8px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "22px"
  lg: "42px"
components:
  action-button:
    backgroundColor: "{colors.cream-bright}"
    textColor: "{colors.aubergine-ink}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "9px 14px"
  active-week:
    backgroundColor: "{colors.aubergine-ink}"
    textColor: "{colors.cream-bright}"
    rounded: "0"
    padding: "11px 14px"
  meal-entry:
    backgroundColor: "{colors.cream-bright}"
    textColor: "{colors.aubergine-ink}"
    rounded: "0"
    padding: "17px 14px 14px"
---

# Design System: Sharon Meal Plan

## Overview

**Creative North Star: “The Kitchen Ledger”**

This is a working household planner with the warmth of a family cookbook and the order of a marked-up weekly ledger. It should feel calm, direct and already in use. Photography establishes appetite once; rules, days, costs and clear actions carry the rest of the experience.

The interface is deliberately information-rich without reading like administration. Large editorial headings provide orientation, while compact sans-serif labels and ruled entries make scanning quick. The first screen exposes the current rotation, weekly cost and the beginning of the meal plan.

**Key Characteristics:**

- Aubergine ground in light mode, black-graphite surfaces in dark mode, steel highlights and cream paper surfaces.
- Georgia display type paired with a practical system sans-serif.
- Flat ruled grids for weeks, meals, shopping items and cost detail.
- Rounded containment only around major tools; internal entries remain square and connected.
- Meal photography is used as a recognition cue on dinner cards and in the recipe reader; shopping stays text-first.

## Colors

The light palette is derived from a warm kitchen table. Dark mode uses a near-black canvas, separated graphite surfaces, ink-navy depth and cool steel highlights. The result stays calm under low light while giving the ledger clearer depth and hierarchy without purple, green, teal, copper, gold, gradients or glow effects.

- **Aubergine Ink** (`#2d2025`): primary text and active week ground.
- **Aubergine Deep** (`#34222a`): masthead ground.
- **Graphite Black** (`#0B0D10`) and **Graphite Surface** (`#141A22`): dark-mode canvas and working surface.
- **Graphite Strong** (`#1C2530`) and **Graphite Soft** (`#26313E`): dark-mode cards and secondary surfaces.
- **Slate Line** (`#3B4857`): dark-mode rules and dividers.
- **Ink Navy** (`#27384D`) and **Navy Active** (`#294764`): depth, selection and active-week states.
- **Steel** (`#9EBBD7`) and **Steel Light** (`#C7D9E8`): actions, costs and emphasis; use sparingly.
- **Pale Steel** (`#B9C9D8`): positive and supporting information without introducing a green semantic layer.
- **Cream Paper** (`#f1eadf`): page ground.
- **Cream Surface** (`#fbf8f1`) and **Cream Bright** (`#fffdf8`): working surfaces and meal entries.
- **Oat Line** (`#d4c6b8`): structural rules and dividers.
- **Olive** (`#4f5e43`): positive and supporting information.
- **Butter** (`#e9b853`): rare warmth and focus-adjacent detail.

**The Steel Rule.** Steel identifies action, selection or a useful figure. It does not decorate every container.

## Typography

**Display Font:** Georgia with Times New Roman and serif fallbacks  
**Body Font:** platform UI sans-serif stack

Georgia makes the family's material feel like a real cookbook. The system sans keeps controls, costs and long methods fast to read.

- **Display:** compact line-height and strong negative tracking; reserved for the masthead.
- **Headline:** fluid 1.9–2.9rem scale for the active week and major recipe titles.
- **Title:** roughly 1.15–1.85rem for meals and section names.
- **Body:** 1rem/1.5 for primary reading; long recipe prose should stay within 65–75 characters where practical.
- **Label:** 0.78rem minimum for routine controls and metadata; uppercase only for short day/recipe identifiers.

**The Two-Voice Rule.** Serif carries meals and orientation. Sans-serif carries actions, metadata and instructions.

## Layout

The desktop shell is fluid up to roughly 1,380px with 24px outer gutters. The masthead is a split composition with text on aubergine and food photography entering from the right. A single ruled ledger below it holds three live facts.

The four-week selector is a connected horizontal group. The active week and its controls share one compact row on desktop. Meal entries form a four-column ruled grid, falling to one column on mobile. Below 780px, the week selector scrolls horizontally, the planner controls stack, and content uses 10px outer gutters. Major touch controls remain at least 44px.

Spacing follows an 8/14/22/42px working rhythm. Tight spacing belongs inside a meal or control group; major task changes receive 22px or more.

## Elevation & Depth

The system is flat by default. Borders, tonal shifts and photography create depth. Soft ambient shadows remain available for the recipe reader and transient raised surfaces, never under every card.

**The Ruled-Surface Rule.** Connected information uses one shared border grid. Do not turn each row into a floating card.

## Shapes

Major planner surfaces use an 18px radius. Ordinary controls use 10–14px corners; small icon buttons may be circular. Week and meal entries remain square within their shared grid. The `SM` mark uses an asymmetric 10px/16px corner rhythm as the small brand signature.

## Components

### Buttons

Action buttons are at least 44px high. Primary emphasis comes from brass or aubergine fill; secondary actions use a cream surface with an oat border. Hover changes colour or surface tone without hard offset shadows. Focus uses a 3px high-contrast ring.

### Week selector

Four connected buttons show week, short theme and checkout price. The active week reverses to aubergine with cream text. On mobile the group scrolls horizontally and each week remains wide enough to scan.

### Date context

The active plan shows one concise date range beneath the week heading. Do not add a second Monday–Sunday navigation rail: the meal ledger already presents the dinners in week order. The meal matching the device date carries the quiet `Today` state inside the ledger.

### Meal ledger

Meal entries share borders in a responsive ruled grid. Each entry pairs a restrained food crop with a brass day label, serif meal name and bottom-anchored time. Each entry exposes a quiet read-only rating summary; the recipe reader owns the compact keyboard-accessible five-star control with the full meal context and a larger appetising crop.

### Inputs and filters

Search uses a bright cream field, oat line and 14px corners. Focus shifts the line to brass and adds a quiet ring. Filters remain compact secondary controls and wrap on small screens.

### Recipe reader

The reader expands to a full-width working surface. It preserves a visible return action, restores focus to the originating meal, and separates ingredients from the ordered method. Detailed costing stays collapsed until requested.

The portion guide makes its basis explicit for every recipe: counted items are served by count, mixed dishes use one finished-dish weight, and separate components retain their own cooked/served weights. Family labels stay consistent across every guide, and spare food is called out instead of being left implicit.

### Shopping list

Shopping is an aisle checklist with visible progress, 44px interactions and a sticky basket summary on wide screens. Supporting price provenance remains ordinary copy rather than a decorative label.

## Do's and Don'ts

### Do:

- **Do** show the active week, real meals and useful costs before secondary explanation.
- **Do** keep rules aligned so connected entries read as one working ledger.
- **Do** preserve visible recovery messages when saving or copying fails.
- **Do** keep recipe and shopping actions comfortable for one-handed mobile use.

### Don't:

- **Don't** reintroduce a generic marketing hero or feature-card grid before the planner.
- **Don't** let the rating control open the recipe card; keep rating and recipe-opening actions separate.
- **Don't** use brass as general decoration or rely on colour alone for state.
- **Don't** add eyebrow labels above headings; the heading must carry the hierarchy.
- **Don't** replace factual family meal, nutrition or price content with invented copy.
