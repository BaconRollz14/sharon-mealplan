import type { Cookbook, Recipe, ShoppingItem, WeekPlan } from "./cookbook-data";

export const money = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export const shortWeekTitles: Record<number, string> = {
  1: "Family favourites",
  2: "Pasta and traybakes",
  3: "Roast and leftovers",
  4: "Cheesy bakes and pastry",
};

export function slugify(value: string) {
  return value
    .toLocaleLowerCase("en-GB")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function shoppingItemKey(
  weekNumber: number,
  sectionTitle: string,
  item: ShoppingItem,
) {
  const itemKey = item.productId ?? item.id ?? `${slugify(item.name)}-${slugify(item.amount)}`;
  return `w${weekNumber}-${slugify(sectionTitle)}-${itemKey}`;
}

export function legacyShoppingItemKey(
  weekNumber: number,
  sectionTitle: string,
  item: ShoppingItem,
) {
  const itemKey = item.legacyId ?? item.id ?? `${slugify(item.name)}-${slugify(item.amount)}`;
  return `w${weekNumber}-${slugify(sectionTitle)}-${itemKey}`;
}

export function minutesFromLabel(label: string) {
  const hours = Number(label.match(/(\d+)\s*hr/)?.[1] ?? 0);
  const explicitMinutes = label.match(/(\d+)\s*min/)?.[1];
  const minutesAfterHours = label.match(/\d+\s*hr\s+(\d+)/)?.[1];
  const minutes = Number(explicitMinutes ?? minutesAfterHours ?? 0);
  return hours * 60 + minutes;
}

export function totalMinutes(recipe: Recipe) {
  return minutesFromLabel(recipe.prep) + minutesFromLabel(recipe.cook);
}

export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (!hours) return `${remaining} min`;
  if (!remaining) return `${hours} hr`;
  return `${hours} hr ${remaining} min`;
}

const weekdayOrder = new Map([
  ["Monday", 0],
  ["Tuesday", 1],
  ["Wednesday", 2],
  ["Thursday", 3],
  ["Friday", 4],
  ["Saturday", 5],
  ["Sunday", 6],
]);

function calendarOrderedMeals(week: WeekPlan) {
  return [...week.meals].sort(
    (left, right) => (weekdayOrder.get(left.day) ?? Number.MAX_SAFE_INTEGER) - (weekdayOrder.get(right.day) ?? Number.MAX_SAFE_INTEGER),
  );
}

export function orderedMeals(week: WeekPlan, order?: string[]) {
  const calendarMeals = calendarOrderedMeals(week);
  if (!order?.length) return calendarMeals;
  const byId = new Map(calendarMeals.map((meal) => [meal.id, meal]));
  const sorted = order.map((id) => byId.get(id)).filter((meal): meal is Recipe => Boolean(meal));
  const missing = calendarMeals.filter((meal) => !order.includes(meal.id));
  return [...sorted, ...missing];
}

export function mealDateOffsetForRecipe(recipe: Recipe, slotIndex: number) {
  return Number.isInteger(recipe.mealDateOffset) ? recipe.mealDateOffset as number : slotIndex;
}

/**
 * Return the recipes in their chosen display order while retaining the
 * authoritative day assignment for each position in the week.  The cookbook
 * deliberately stores the day labels on the template meals, so deriving the
 * label from the recipe after a reorder makes search results and deep links
 * lie about when a dinner is planned.
 */
export function assignedMeals(week: WeekPlan, order?: string[]) {
  const calendarDays = calendarOrderedMeals(week).map((meal) => meal.day);
  return orderedMeals(week, order).map((recipe, index) => ({
    recipe,
    displayDay: calendarDays[index] ?? recipe.day,
    dateOffset: mealDateOffsetForRecipe(recipe, index),
  }));
}

export function normalisePriceDate(value: string) {
  const [start, end] = value.split(" to ");
  if (!start || !end) return value;
  return `${start}–${end}`;
}

export function validateCookbook(cookbook: Cookbook) {
  const errors: string[] = [];
  const recipeIds = new Set<string>();

  if (cookbook.weeks.length !== 4) errors.push("The cookbook must contain four weeks.");

  cookbook.weeks.forEach((week) => {
    if (week.meals.length !== 7) errors.push(`Week ${week.number} must contain seven meals.`);

    const weekRecipeIds = new Set(week.meals.map((meal) => meal.id));
    week.mealRelationships?.forEach((relationship) => {
      if (relationship.type !== "cooked-leftover" || !weekRecipeIds.has(relationship.sourceRecipeId) || !weekRecipeIds.has(relationship.targetRecipeId)) {
        errors.push(`Invalid meal relationship in Week ${week.number}.`);
      }
      if (!relationship.productId || !Number.isFinite(relationship.quantity) || relationship.quantity <= 0 || !Number.isInteger(relationship.maxDaysAfter) || relationship.maxDaysAfter < 1) {
        errors.push(`Invalid leftover quantity or timing in Week ${week.number}.`);
      }
    });

    week.meals.forEach((meal) => {
      if (recipeIds.has(meal.id)) errors.push(`Duplicate recipe ID: ${meal.id}.`);
      recipeIds.add(meal.id);

      if (!meal.costBreakdown?.length) errors.push(`Missing cost breakdown: ${meal.id}.`);
      if (!meal.portionMode) errors.push(`Missing portion mode: ${meal.id}.`);
      const calculatedRecipeCost = meal.costBreakdown
        ?.reduce((total, line) => {
          if (!line.productId) errors.push(`Missing priced product ID: ${meal.id}.`);
          return total + line.attributedCost;
        }, 0) ?? 0;
      if (Math.abs(calculatedRecipeCost - meal.cost) > 0.011) {
        errors.push(`Recipe cost breakdown does not match: ${meal.id}.`);
      }
    });

    const itemKeys = new Set<string>();
    const calculatedTotal = week.shopping
      .flatMap((section) =>
        section.items.map((item) => {
          if (!item.productId) errors.push(`Missing priced product ID: Week ${week.number} ${item.name}.`);
          if (item.productId && item.id !== item.productId) errors.push(`Shopping item ID is not canonical: ${item.productId}.`);
          if (!Number.isInteger(item.packCount) || (item.packCount ?? -1) < 0) {
            errors.push(`Invalid shopping pack count: Week ${week.number} ${item.name}.`);
          }
          const key = shoppingItemKey(week.number, section.title, item);
          if (itemKeys.has(key)) errors.push(`Duplicate shopping item key: ${key}.`);
          itemKeys.add(key);
          return item.price;
        }),
      )
      .reduce((total, price) => total + price, 0);

    if (Math.abs(calculatedTotal - week.checkoutTotal) > 0.011) {
      errors.push(`Week ${week.number} shopping items do not match its checkout total.`);
    }
  });

  if (recipeIds.size !== 28) errors.push("The cookbook must contain 28 unique recipes.");
  const calculatedFourWeekTotal = cookbook.weeks.reduce((total, week) => total + week.checkoutTotal, 0);
  if (Math.abs(calculatedFourWeekTotal - cookbook.fourWeekTotal) > 0.011) {
    errors.push("Weekly checkout totals do not match the four-week total.");
  }
  return errors;
}
