# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Sharon uses this privately at home and while shopping or cooking. The primary assumed job is to see the current week's dinners and open tonight's recipe with very little effort.

## Product Purpose

Keep a four-week family dinner plan, complete recipes, portion guidance and weekly shopping lists in one practical place. Success means choosing, shopping for and cooking filling family meals with less planning friction.

## Positioning

This is the family's working cookbook and shopping companion: the meal plan, shop and cooking instructions are connected rather than kept in separate documents.

## Operating Context

The interface is used across desktop and mobile, including quick checks at mealtimes, following a recipe in the kitchen and ticking items off during a supermarket shop. Planner state is persisted in the current browser so the app remains useful without an account or online connection. Normal sharing carries a deliberate week, view or recipe deep link; it never carries local progress.

## Capabilities and Constraints

- Preserve all current recipes, week switching, search, favourites, ratings, cooked state, meal reordering, recipe sharing and printing.
- Preserve the weekly shopping lists, item checking, remaining-item view and category moves.
- Preserve deep links to weeks, views and recipes.
- Record individual fresh/chilled meat and fish packs with quantity, purchase date and use-by date; use deterministic earliest-expiry allocation to recommend a safe dinner order, while warning before manual moves create a deadline conflict.
- Keep planner state local to this browser in one durable storage record, with a visible warning and retry action when browser storage fails.
- Let the device calendar drive the fixed four-week rotation: show the active week date range, mark today on the matching meal entry, and roll to the next meal-plan week automatically each Monday without clearing progress. Do not add a separate clickable weekday rail.
- Keep the Vinext/Cloudflare runtime needed by the application and image optimisation. Sharon Meal Plan is privately published as a separate Site and must not reuse the finished Massey-Sutton Site identity.
- Meal quantities and serving guidance are sized for two adults, with a larger and a smaller adult serving where the dish benefits from it. Shopping uses named-brand Morrisons assumptions and normal-shelf-price estimates; there is no hard weekly spending cap.
- Meals should be filling, dinners varied, lunches should not require reheating, and weighing or measurement should be kept low-friction.

## Brand Commitments

Use the name “Sharon Meal Plan”. The voice should be direct, domestic and useful. Preserve factual meal, nutrition and price content; do not fabricate claims or replace the existing meal data.

## Evidence on Hand

- The existing application source, recipe data and generated food imagery in this repository.
- The current deployed Site is useful as incumbent evidence only; it is not visual authority for this redesign.
- Morrisons product prices were checked on 09/09/2026; pack labels and checkout prices remain the final authority where they differ. Portion guidance is practical meal-planning help, not medical or weight-management advice.

## Product Principles

- Put the current week and tonight's practical next step first.
- Reduce choices shown at once and reveal detail when it becomes useful.
- Make mobile shopping and cooking comfortable with one hand.
- Preserve the family's exact plan while making it easier to scan and act on.
- Keep important state visible and reversible.

## Accessibility & Inclusion

Use readable type, strong contrast, visible keyboard focus, touch targets of at least 44px and reduced-motion support. Keep the interaction low-friction for ADHD-style attention and task switching.
