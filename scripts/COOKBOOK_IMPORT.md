# Cookbook update workflow

The original Word cookbook is not required at runtime and is deliberately not shipped to website visitors.

1. Extract a deterministic review copy from a replacement DOCX:

   ```sh
   python3 scripts/extract-cookbook-source.py path/to/cookbook.docx > /tmp/cookbook-source.txt
   ```

2. Update the typed records in `app/cookbook-data.ts`. Keep existing recipe IDs stable when a recipe is edited; add a new ID only for a genuinely new recipe.
3. Run `npm test`. The planner tests reject missing weeks, missing recipes, duplicate recipe IDs, duplicate shopping keys and weekly checkout totals that do not match their shopping items.
4. Review Week 3 manually. Its roast must remain before the leftover risotto.

This keeps the extraction step reproducible while preserving human review for costs, quantities and cooking instructions where an automatic document conversion would be unsafe.

