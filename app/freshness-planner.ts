import type { Recipe, WeekPlan } from "./cookbook-data";
import { mealDateOffsetForRecipe } from "./planner-utils";
import {
  recipeUsesByRecipeId,
  morrisonsProductKeyFromId,
  morrisonsProducts,
  morrisonsProductStorage,
  type ProductUnit,
  type RecipeUse,
  type MorrisonsProductId,
  type MorrisonsStorageClass,
} from "./morrisons-pricing";

export interface PurchasedLot {
  id: string;
  productId: MorrisonsProductId;
  productName: string;
  quantity: number;
  unit: ProductUnit;
  purchasedOn: string;
  useByDate: string;
}

export interface FreshnessProductOption {
  productId: MorrisonsProductId;
  productName: string;
  packSize: string;
  packQuantity: number;
  unit: ProductUnit;
  storage: MorrisonsStorageClass;
  defaultQuantity: number;
}

export type ScheduleIssueCode =
  | "missing-lot"
  | "invalid-lot"
  | "insufficient-quantity"
  | "not-yet-purchased"
  | "use-by"
  | "leftover-window";

export interface ScheduleIssue {
  code: ScheduleIssueCode;
  severity: "info" | "warning" | "error";
  recipeId?: string;
  recipeName?: string;
  productId?: MorrisonsProductId;
  productName?: string;
  lotId?: string;
  quantity?: number;
  unit?: ProductUnit;
  mealDate?: string;
  deadline?: string;
  message: string;
}

export interface LotAllocation {
  lotId: string;
  productId: MorrisonsProductId;
  recipeId: string;
  quantity: number;
  unit: ProductUnit;
  mealDate: string;
  useByDate: string;
  kind: "raw" | "cooked-leftover";
}

export interface ScheduleEvaluation {
  feasible: boolean;
  issues: ScheduleIssue[];
  allocations: LotAllocation[];
  order: string[];
}

export interface ScheduleInput {
  week: WeekPlan;
  weekStartISO: string;
  order?: string[];
  lots: PurchasedLot[];
}

export interface OptimiseScheduleInput extends ScheduleInput {
  lockedRecipeIds?: Iterable<string>;
}

export interface OptimiseScheduleResult {
  order: string[];
  validation: ScheduleEvaluation;
  changed: boolean;
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

function calendarMeals(week: WeekPlan) {
  return [...week.meals].sort(
    (left, right) => (weekdayOrder.get(left.day) ?? Number.MAX_SAFE_INTEGER) - (weekdayOrder.get(right.day) ?? Number.MAX_SAFE_INTEGER),
  );
}

function completeOrder(week: WeekPlan, order?: string[]) {
  const meals = calendarMeals(week);
  const validIds = new Set(meals.map((meal) => meal.id));
  const requested = (order ?? []).filter((id, index, values) => validIds.has(id) && values.indexOf(id) === index);
  return [...requested, ...meals.map((meal) => meal.id).filter((id) => !requested.includes(id))];
}

function recipeById(week: WeekPlan) {
  return new Map(week.meals.map((meal) => [meal.id, meal]));
}

function dateFromOffset(weekStartISO: string, offset: number) {
  const [year, month, day] = weekStartISO.split("-").map(Number);
  if (![year, month, day].every(Number.isInteger)) return "";
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function dateDistanceInDays(startISO: string, endISO: string) {
  const start = new Date(`${startISO}T00:00:00Z`).getTime();
  const end = new Date(`${endISO}T00:00:00Z`).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function isValidISODate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function productForRecipeUse(use: RecipeUse) {
  return morrisonsProducts[use.productId];
}

export function isValidPurchasedLot(lot: PurchasedLot) {
  const product = morrisonsProducts[lot.productId];
  return Boolean(product)
    && typeof lot.id === "string"
    && lot.id.trim().length > 0
    && lot.productName === product.name
    && lot.unit === product.unit
    && Number.isFinite(lot.quantity)
    && lot.quantity > 0
    && isValidISODate(lot.useByDate)
    && isValidISODate(lot.purchasedOn)
    && lot.useByDate >= lot.purchasedOn;
}

function directUses(week: WeekPlan, recipeId: string) {
  const leftover = (week.mealRelationships ?? []).find((use) => use.targetRecipeId === recipeId && use.type === "cooked-leftover");
  return (recipeUsesByRecipeId[recipeId] ?? []).filter(
    (use) => !leftover || use.productId !== leftover.productId,
  );
}

export function getFreshnessProductsForWeek(week: WeekPlan): FreshnessProductOption[] {
  const purchased = new Map<MorrisonsProductId, number>();
  week.shopping
    .filter((section) => /meat|fish/i.test(section.title))
    .flatMap((section) => section.items)
    .forEach((item) => {
      const key = item.productId ? morrisonsProductKeyFromId(item.productId) : null;
      if (!key || item.carriedForward || (item.packCount ?? 0) <= 0) return;
      const storage = morrisonsProductStorage[key];
      if (storage !== "fresh" && storage !== "chilled") return;
      purchased.set(key, (purchased.get(key) ?? 0) + (item.packCount ?? 0));
    });

  return [...purchased.entries()]
    .map(([productId, packCount]) => {
      const product = morrisonsProducts[productId];
      return {
        productId,
        productName: product.name,
        packSize: product.packSize,
        packQuantity: product.packQuantity,
        unit: product.unit,
        storage: morrisonsProductStorage[productId],
        defaultQuantity: product.packQuantity * packCount,
      } satisfies FreshnessProductOption;
    })
    .sort((left, right) => left.productName.localeCompare(right.productName, "en-GB"));
}

function issueForMissingLot(recipe: Recipe, use: RecipeUse, quantity: number): ScheduleIssue {
  const product = productForRecipeUse(use);
  return {
    code: "missing-lot",
    severity: "info",
    recipeId: recipe.id,
    recipeName: recipe.name,
    productId: use.productId,
    productName: product.name,
    quantity,
    unit: product.unit,
    message: `Enter a use-by date for a ${product.name} pack before reordering around ${recipe.name}.`,
  };
}

function makeInvalidLotIssue(lot: PurchasedLot): ScheduleIssue {
  return {
    code: "invalid-lot",
    severity: "error",
    lotId: lot.id,
    productId: lot.productId,
    productName: lot.productName,
    message: `The ${lot.productName || "fresh pack"} has an invalid quantity or date range. Check its purchase and use-by dates.`,
  };
}

interface LotState {
  lot: PurchasedLot;
  remaining: number;
}

function evaluateSchedule({ week, weekStartISO, order, lots }: ScheduleInput): ScheduleEvaluation {
  const complete = completeOrder(week, order);
  const meals = recipeById(week);
  const issues: ScheduleIssue[] = [];
  const allocations: LotAllocation[] = [];
  const trackedProductIds = new Set(getFreshnessProductsForWeek(week).map((product) => product.productId));
  const validLots = lots.filter((lot) => {
    const valid = isValidPurchasedLot(lot);
    if (!valid) issues.push(makeInvalidLotIssue(lot));
    return valid;
  });
  const lotsByProduct = new Map<MorrisonsProductId, LotState[]>();
  validLots.forEach((lot) => {
    const productLots = lotsByProduct.get(lot.productId) ?? [];
    productLots.push({ lot, remaining: lot.quantity });
    lotsByProduct.set(lot.productId, productLots);
  });
  lotsByProduct.forEach((productLots) => productLots.sort((left, right) => left.lot.useByDate.localeCompare(right.lot.useByDate) || left.lot.id.localeCompare(right.lot.id)));

  const allocate = ({ recipe, use, quantity, deadline, mealDate, kind }: { recipe: Recipe; use: RecipeUse; quantity: number; deadline: string; mealDate: string; kind: LotAllocation["kind"] }) => {
    const product = productForRecipeUse(use);
    const productLots = lotsByProduct.get(use.productId) ?? [];
    if (!productLots.length) {
      issues.push(issueForMissingLot(recipe, use, quantity));
      return;
    }
    let remainingDemand = quantity;
    productLots
      .filter((state) => state.remaining > 0 && state.lot.purchasedOn <= mealDate && state.lot.useByDate >= mealDate)
      .forEach((state) => {
        if (remainingDemand <= 0) return;
        const allocated = Math.min(state.remaining, remainingDemand);
        state.remaining -= allocated;
        remainingDemand -= allocated;
        allocations.push({
          lotId: state.lot.id,
          productId: use.productId,
          recipeId: recipe.id,
          quantity: allocated,
          unit: product.unit,
          mealDate,
          useByDate: state.lot.useByDate,
          kind,
        });
      });
    if (remainingDemand <= 0) return;

    const validRemaining = productLots.reduce(
      (sum, state) => state.lot.purchasedOn <= mealDate && state.lot.useByDate >= mealDate ? sum + state.remaining : sum,
      0,
    );
    const futureLots = productLots.filter((state) => state.remaining > 0 && state.lot.purchasedOn > mealDate);
    const expiredLots = productLots.filter((state) => state.remaining > 0 && state.lot.useByDate < deadline);
    if (futureLots.length) {
      const earliest = futureLots[0];
      issues.push({
        code: "not-yet-purchased",
        severity: "error",
        recipeId: recipe.id,
        recipeName: recipe.name,
        productId: use.productId,
        productName: product.name,
        lotId: earliest.lot.id,
        quantity: remainingDemand,
        unit: product.unit,
        mealDate,
        deadline,
        message: `${recipe.name} is dated ${mealDate}, but the ${product.name} pack is not purchased until ${earliest.lot.purchasedOn}.`,
      });
    } else if (expiredLots.length) {
      const earliest = expiredLots[0];
      issues.push({
        code: "use-by",
        severity: "error",
        recipeId: recipe.id,
        recipeName: recipe.name,
        productId: use.productId,
        productName: product.name,
        lotId: earliest.lot.id,
        quantity: remainingDemand,
        unit: product.unit,
        mealDate,
        deadline,
        message: `${recipe.name} needs ${use.quantityLabel} of ${product.name} by ${deadline}, but the available pack date is too early.`,
      });
    } else {
      issues.push({
        code: "insufficient-quantity",
        severity: "error",
        recipeId: recipe.id,
        recipeName: recipe.name,
        productId: use.productId,
        productName: product.name,
        quantity: remainingDemand,
        unit: product.unit,
        mealDate,
        deadline,
        message: `${recipe.name} needs ${use.quantityLabel} of ${product.name}, but the dated packs leave ${validRemaining} ${product.unit} available.`,
      });
    }
  };

  complete.forEach((recipeId, index) => {
    const recipe = meals.get(recipeId);
    if (!recipe) return;
    const mealDate = dateFromOffset(weekStartISO, mealDateOffsetForRecipe(recipe, index));
    directUses(week, recipe.id).forEach((use) => {
      const storage = morrisonsProductStorage[use.productId];
      if (trackedProductIds.has(use.productId) && (storage === "fresh" || storage === "chilled")) {
        allocate({ recipe, use, quantity: use.quantity, deadline: mealDate, mealDate, kind: "raw" });
      }
    });
  });

  (week.mealRelationships ?? []).filter((relationship) => relationship.type === "cooked-leftover").forEach((leftover) => {
    const sourceIndex = complete.indexOf(leftover.sourceRecipeId);
    const targetIndex = complete.indexOf(leftover.targetRecipeId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const sourceRecipe = meals.get(leftover.sourceRecipeId);
    const targetRecipe = meals.get(leftover.targetRecipeId);
    if (!sourceRecipe || !targetRecipe) return;
    const sourceDate = dateFromOffset(weekStartISO, mealDateOffsetForRecipe(sourceRecipe, sourceIndex));
    const targetDate = dateFromOffset(weekStartISO, mealDateOffsetForRecipe(targetRecipe, targetIndex));
    const elapsedDays = dateDistanceInDays(sourceDate, targetDate);
    const productId = leftover.productId as MorrisonsProductId;
    const use = (recipeUsesByRecipeId[targetRecipe.id] ?? []).find((candidate) => candidate.productId === productId);
    if (!use) return;
    if (elapsedDays > leftover.maxDaysAfter) {
      issues.push({
        code: "leftover-window",
        severity: "error",
        recipeId: targetRecipe.id,
        recipeName: targetRecipe.name,
        productId,
        productName: productForRecipeUse(use).name,
        quantity: leftover.quantity,
        unit: productForRecipeUse(use).unit,
        mealDate: targetDate,
        deadline: dateFromOffset(weekStartISO, sourceIndex + leftover.maxDaysAfter),
        message: `${targetRecipe.name} is more than ${leftover.maxDaysAfter} day after ${sourceRecipe.name}; move it closer to the roast or choose another dinner.`,
      });
      return;
    }
    allocate({ recipe: targetRecipe, use, quantity: leftover.quantity, deadline: targetDate, mealDate: targetDate, kind: "cooked-leftover" });
  });

  // Missing dates are incomplete information, not proof that a recorded pack
  // cannot be scheduled. Allow the optimiser to move known dated packs while
  // keeping real allocation, use-by and leftover errors blocking feasibility.
  return { feasible: issues.every((issue) => issue.severity !== "error"), issues, allocations, order: complete };
}

export function validateSchedule(input: ScheduleInput): ScheduleEvaluation {
  return evaluateSchedule(input);
}

function movementScore(order: string[], original: string[]) {
  return order.reduce((score, recipeId, index) => score + Math.abs(index - original.indexOf(recipeId)), 0);
}

export function optimiseSchedule(input: OptimiseScheduleInput): OptimiseScheduleResult {
  const original = completeOrder(input.week, input.order);
  const lockedIds = new Set(input.lockedRecipeIds ?? []);
  const lockedPositions = new Map<string, number>();
  original.forEach((recipeId, index) => {
    if (lockedIds.has(recipeId)) lockedPositions.set(recipeId, index);
  });
  const movable = original.filter((recipeId) => !lockedIds.has(recipeId));
  const candidates: string[][] = [];
  const working = Array<string | null>(original.length).fill(null);
  lockedPositions.forEach((position, recipeId) => { working[position] = recipeId; });

  const visit = (cursor: number, remaining: string[]) => {
    if (cursor === working.length) {
      candidates.push([...working] as string[]);
      return;
    }
    if (working[cursor]) {
      visit(cursor + 1, remaining);
      return;
    }
    remaining.forEach((recipeId, index) => {
      working[cursor] = recipeId;
      visit(cursor + 1, [...remaining.slice(0, index), ...remaining.slice(index + 1)]);
      working[cursor] = null;
    });
  };

  visit(0, movable);
  let best: { order: string[]; validation: ScheduleEvaluation; score: number } | null = null;
  for (const candidate of candidates) {
    const validation = evaluateSchedule({ ...input, order: candidate });
    if (!validation.feasible) continue;
    const score = movementScore(candidate, original);
    if (!best || score < best.score || (score === best.score && candidate.join("|") < best.order.join("|"))) {
      best = { order: candidate, validation, score };
    }
  }
  const validation = best?.validation ?? evaluateSchedule({ ...input, order: original });
  return {
    order: best?.order ?? original,
    validation,
    changed: Boolean(best && best.order.join("|") !== original.join("|")),
  };
}

export function hasExpiryConflict(evaluation: ScheduleEvaluation) {
  return evaluation.issues.some((issue) => issue.severity === "error");
}
