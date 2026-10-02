# Sharon Meal Plan

Four-week family dinner planner built for ChatGPT Sites with Vinext, React and a Cloudflare Worker.

## Project shape

- `app/` — planner UI, recipes, shopping data, freshness calculations and styles
- `app/components/` — planner-specific components
- `components/ui/` — the shared UI primitives used by the planner
- `public/` — hero imagery, local meal imagery, favicon, manifest and service worker
- `worker/` — the Vinext/Cloudflare Worker entry point and image optimisation
- `tests/` — cookbook, interaction-contract, local persistence and rendered HTML checks

The planner is deliberately single-user and browser-local. One `localStorage` record holds the selected week, view and recipe alongside shopping ticks, cooked meals, favourites, ratings, meal order, categories, extra items, cooking-step progress, freshness lots and the remaining-items preference. No account, database, API or online save service is required.

The freshness planner is deterministic application code. It allocates recipe quantities from separately recorded packs using earliest-use-by-first, checks purchase and use-by boundaries and the one-day roast-leftover rule, and enumerates safe dinner orders while preserving cooked dinners.

## Commands

```bash
npm run install:ci
npm run dev
npm run build
npm test
npm run lint
```

`install:ci` and `build` use the project-scoped Sites runtime under `.sites-runtime/`. That directory is disposable and ignored by Git.

## Product constraints

Preserve all 28 recipes and the Monday-to-Sunday ordering of each week. The four-week rotation is anchored to Monday 7 September 2026 and advances automatically with the device calendar. Browsing another week must not change that schedule. Meals are sized for two adults, and the shopping list reflects the recipe quantities and pack sizes rather than a fixed weekly budget.

The UI should remain a practical kitchen-ledger tool rather than a marketing page. Preserve week switching, recipe search, favourites, ratings, cooked state, reordering, recipe reading/cooking progress, shopping ticks/category moves, normal recipe/week sharing, printing, dark mode and offline registration.

Normal sharing creates a week, view or recipe deep link only. It never transfers local planner progress.

The private Sharon Meal Plan Site has its own Sites project identity. Its shopping estimates use named-brand Morrisons products and normal shelf prices checked on 9 September 2026. It is separate from the finished Massey-Sutton Site and must never target or reuse that Site's hosting, database, gateway or secrets.
