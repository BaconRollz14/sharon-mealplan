"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  ChevronRight,
  GripVertical,
  Heart,
  MoreHorizontal,
  Printer,
  RotateCcw,
  Search,
  Share2,
  ShieldAlert,
  ShoppingBasket,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cookbook, type Recipe } from "./cookbook-data";
import { PwaRegister } from "./components/pwa-register";
import { RecipeDetail } from "./components/recipe-detail";
import { MealRating } from "./components/meal-rating";
import { ShoppingList, type ExtraShoppingItem } from "./components/shopping-list";
import { ThemeToggle } from "./components/theme-toggle";
import { WeekSelector } from "./components/week-selector";
import { getMealImage, handleMealImageError } from "./meal-images";
import {
  hasExpiryConflict,
  isValidPurchasedLot,
  isValidISODate as isValidFreshnessDate,
  optimiseSchedule,
  validateSchedule,
  type PurchasedLot,
  type ScheduleEvaluation,
} from "./freshness-planner";
import {
  formatMinutes,
  assignedMeals,
  legacyShoppingItemKey,
  mealDateOffsetForRecipe,
  money,
  shortWeekTitles,
  shoppingItemKey,
  totalMinutes,
  validateCookbook,
} from "./planner-utils";

type PlannerView = "recipes" | "shopping";

interface LocalPlannerState {
  activeWeekIndex?: number;
  activeView?: PlannerView;
  selectedRecipeId?: string | null;
  theme?: "light" | "dark";
  checkedItems?: string[];
  cookedRecipeIds?: string[];
  favouriteRecipeIds?: string[];
  showRemaining?: boolean;
  mealOrders?: Record<string, string[]>;
  shoppingCategories?: Record<string, string>;
  mealRatings?: Record<string, number>;
  extraShoppingItems?: Record<string, ExtraShoppingItem[]>;
  methodProgress?: Record<string, number[]>;
  freshnessLots?: Record<string, PurchasedLot[]>;
}

interface RecipeEntry {
  recipe: Recipe;
  weekIndex: number;
  displayDay: string;
  mealDate: string;
}

const STORAGE_KEY = "mealplan-local-state-v1";
const weeklyPlans = cookbook.weeks;
const dataErrors = validateCookbook(cookbook);

if (dataErrors.length) {
  throw new Error(`Invalid cookbook data: ${dataErrors.join(" ")}`);
}

const allRecipeIds = new Set(weeklyPlans.flatMap((week) => week.meals.map((meal) => meal.id)));
const shoppingItemOrigins = new Map(
  weeklyPlans.flatMap((week) =>
    week.shopping.flatMap((section) =>
      section.items.map((item) => [shoppingItemKey(week.number, section.title, item), section.title] as const),
    ),
  ),
);
const shoppingItemAliases = new Map(
  weeklyPlans.flatMap((week) =>
    week.shopping.flatMap((section) =>
      section.items
        .filter((item) => item.legacyId)
        .map((item) => [legacyShoppingItemKey(week.number, section.title, item), shoppingItemKey(week.number, section.title, item)] as const),
    ),
  ),
);
const shoppingCategoriesByWeek = new Map(
  weeklyPlans.map((week) => [week.number, new Set(week.shopping.map((section) => section.title))] as const),
);

function setFromSaved(value: unknown) {
  if (!Array.isArray(value)) return new Set<string>();
  return new Set(value.filter((item): item is string => typeof item === "string"));
}

function checkedItemsFromSaved(value: unknown) {
  if (!Array.isArray(value)) return new Set<string>();
  return new Set(
    value
      .filter((item): item is string => typeof item === "string")
      .map((item) => shoppingItemAliases.get(item) ?? item),
  );
}

function isPlannerView(value: unknown): value is PlannerView {
  return value === "recipes" || value === "shopping";
}

function shoppingCategoriesFromSaved(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, category]) => {
      if (typeof category !== "string") return [];
      const canonicalKey = shoppingItemAliases.get(key) ?? key;
      const weekNumber = Number(canonicalKey.match(/^w(\d+)-/)?.[1]);
      return shoppingItemOrigins.has(canonicalKey) && shoppingCategoriesByWeek.get(weekNumber)?.has(category)
        ? [[canonicalKey, category] as const]
        : [];
    }),
  );
}

function mealRatingsFromSaved(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(([recipeId, rating]) =>
      allRecipeIds.has(recipeId) && Number.isInteger(rating) && Number(rating) >= 1 && Number(rating) <= 5,
    ),
  ) as Record<string, number>;
}

function extraShoppingItemsFromSaved(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([weekNumber, items]) => [
      String(Number(weekNumber)),
      Array.isArray(items)
        ? items.filter((item): item is ExtraShoppingItem => Boolean(item) && typeof item === "object" && typeof (item as ExtraShoppingItem).id === "string" && typeof (item as ExtraShoppingItem).name === "string" && typeof (item as ExtraShoppingItem).amount === "string" && typeof (item as ExtraShoppingItem).category === "string" && typeof (item as ExtraShoppingItem).price === "number")
        : [],
    ]),
  ) as Record<string, ExtraShoppingItem[]>;
}

function methodProgressFromSaved(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([recipeId, steps]) => allRecipeIds.has(recipeId) && Array.isArray(steps) && steps.every((step) => Number.isInteger(step) && Number(step) >= 0)),
  ) as Record<string, number[]>;
}

function freshnessLotsFromSaved(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([weekStart, lots]) => isValidFreshnessDate(weekStart) && Array.isArray(lots))
      .map(([weekStart, lots]) => [
        weekStart,
        (lots as unknown[]).filter((lot): lot is PurchasedLot => Boolean(lot) && typeof lot === "object" && isValidPurchasedLot(lot as PurchasedLot)),
      ]),
  ) as Record<string, PurchasedLot[]>;
}

function mealOrdersFromSaved(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, ids]) => Array.isArray(ids))
      .filter(([key]) => isISODate(key))
      .map(([key, ids]) => [key, (ids as unknown[]).filter((id): id is string => typeof id === "string" && allRecipeIds.has(id))]),
  ) as Record<string, string[]>;
}

function localTodayISO() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const PLAN_CYCLE_START = "2026-08-31";

function isISODate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function addDaysISO(value: string, days: number) {
  if (!isISODate(value)) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function readableMealDate(value: string) {
  if (!isISODate(value)) return "date loading";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function cyclePosition(startDate: string, todayISO: string) {
  const startParts = isISODate(startDate) ? startDate.split("-").map(Number) : null;
  const todayParts = isISODate(todayISO) ? todayISO.split("-").map(Number) : null;
  if (!startParts || !todayParts) return { weekIndex: 0, cycleIndex: 0 };
  const start = Date.UTC(startParts[0], startParts[1] - 1, startParts[2]);
  const today = Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2]);
  const daysSinceStart = Math.max(0, Math.floor((today - start) / 86_400_000));
  return {
    weekIndex: Math.floor((daysSinceStart % 28) / 7),
    cycleIndex: Math.floor(daysSinceStart / 28),
  };
}

export function initialWeekIndexForDate(todayISO = localTodayISO()) {
  return cyclePosition(PLAN_CYCLE_START, todayISO).weekIndex;
}

export function cycleDateRange(startDate: string, weekIndex: number, cycleIndex = 0) {
  const first = addDaysISO(startDate, cycleIndex * 28 + weekIndex * 7);
  const last = addDaysISO(first, 6);
  if (!first || !last) return "Calendar dates are loading";
  const format = (value: string) => Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
      .formatToParts(new Date(`${value}T00:00:00Z`))
      .filter(({ type }) => type !== "literal")
      .map(({ type, value: partValue }) => [type, partValue]),
  ) as { day: string; month: string; year: string };
  const firstParts = format(first);
  const lastParts = format(last);
  if (firstParts.month === lastParts.month && firstParts.year === lastParts.year) {
    return `${firstParts.day}–${lastParts.day} ${lastParts.month}`;
  }
  if (firstParts.year === lastParts.year) {
    return `${firstParts.day} ${firstParts.month}–${lastParts.day} ${lastParts.month}`;
  }
  return `${firstParts.day} ${firstParts.month} ${firstParts.year}–${lastParts.day} ${lastParts.month} ${lastParts.year}`;
}

export function weekInstanceKeyForIndex(weekIndex: number, cycleIndex = 0) {
  return addDaysISO(PLAN_CYCLE_START, cycleIndex * 28 + weekIndex * 7);
}

function weekInstanceKeyForCurrentCycle(weekIndex: number, cycleIndex: number) {
  return weekInstanceKeyForIndex(weekIndex, cycleIndex);
}

function estimatedCheckoutTotal(week: (typeof weeklyPlans)[number], extras: ExtraShoppingItem[] = []) {
  const extrasTotal = extras.reduce((total, item) => {
    const known = !item.carriedForward && (item.priceKnown ?? item.price > 0) && Number.isFinite(item.price) && item.price >= 0;
    return known ? total + item.price : total;
  }, 0);
  return Math.round((week.checkoutTotal + extrasTotal) * 100) / 100;
}

export function PlannerClient() {
  const [activeWeekIndex, setActiveWeekIndex] = useState(() => initialWeekIndexForDate());
  const [activeView, setActiveView] = useState<PlannerView>("recipes");
  const [isDark, setIsDark] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [cookedRecipeIds, setCookedRecipeIds] = useState<Set<string>>(new Set());
  const [favouriteRecipeIds, setFavouriteRecipeIds] = useState<Set<string>>(new Set());
  const [showRemaining, setShowRemaining] = useState(false);
  const [mealOrders, setMealOrders] = useState<Record<string, string[]>>({});
  const [shoppingCategories, setShoppingCategories] = useState<Record<string, string>>({});
  const [mealRatings, setMealRatings] = useState<Record<string, number>>({});
  const [extraShoppingItems, setExtraShoppingItems] = useState<Record<string, ExtraShoppingItem[]>>({});
  const [methodProgress, setMethodProgress] = useState<Record<string, number[]>>({});
  const [freshnessLots, setFreshnessLots] = useState<Record<string, PurchasedLot[]>>({});
  const [todayISO, setTodayISO] = useState(() => localTodayISO());
  const [cookingMode, setCookingMode] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [saveRetry, setSaveRetry] = useState(0);
  const [shareError, setShareError] = useState("");
  const [shareFallbackUrl, setShareFallbackUrl] = useState("");
  const [pendingMealMove, setPendingMealMove] = useState<{ order: string[]; evaluation: ScheduleEvaluation } | null>(null);
  const [undoCheckedItems, setUndoCheckedItems] = useState<{ cleared: Set<string> } | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const readerBackRef = useRef<HTMLButtonElement | null>(null);
  const suppressHistoryRef = useRef(false);
  const initialUrlAppliedRef = useRef(false);
  const autoWeekRef = useRef<number | null>(null);
  const pendingMoveFirstActionRef = useRef<HTMLButtonElement | null>(null);

  const currentLocalState = useMemo<LocalPlannerState>(() => ({
    activeWeekIndex,
    activeView,
    selectedRecipeId,
    theme: isDark ? "dark" : "light",
    showRemaining,
    checkedItems: [...checkedItems],
    cookedRecipeIds: [...cookedRecipeIds],
    favouriteRecipeIds: [...favouriteRecipeIds],
    mealOrders: Object.fromEntries(Object.entries(mealOrders).map(([key, value]) => [String(key), [...value]])),
    shoppingCategories: { ...shoppingCategories },
    mealRatings: { ...mealRatings },
    extraShoppingItems: Object.fromEntries(Object.entries(extraShoppingItems).map(([key, value]) => [String(key), [...value]])),
    methodProgress: Object.fromEntries(Object.entries(methodProgress).map(([key, value]) => [key, [...value]])),
    freshnessLots: Object.fromEntries(Object.entries(freshnessLots).map(([key, value]) => [key, [...value]])),
  }), [activeView, activeWeekIndex, checkedItems, cookedRecipeIds, extraShoppingItems, favouriteRecipeIds, freshnessLots, isDark, mealOrders, mealRatings, methodProgress, selectedRecipeId, shoppingCategories, showRemaining]);

  useEffect(() => {
    const refreshToday = () => setTodayISO(localTodayISO());
    const timer = window.setInterval(refreshToday, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const persistLocalState = useCallback((payload: LocalPlannerState) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let saved: LocalPlannerState = {};
    try {
      saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as LocalPlannerState;
    } catch {
      saved = {};
    }

    const params = new URLSearchParams(window.location.search);
    const today = localTodayISO();
    const calendarPosition = cyclePosition(PLAN_CYCLE_START, today);
    const urlWeekNumber = Number(params.get("week"));
    const calendarWeekIndex = calendarPosition.weekIndex;
    const urlWeekIndex = weeklyPlans.findIndex((week) => week.number === urlWeekNumber);
    const savedWeekIndex = typeof saved.activeWeekIndex === "number" && Number.isInteger(saved.activeWeekIndex) && saved.activeWeekIndex >= 0 && saved.activeWeekIndex < weeklyPlans.length
      ? saved.activeWeekIndex
      : calendarWeekIndex;
    let nextWeekIndex = urlWeekIndex >= 0 ? urlWeekIndex : savedWeekIndex;

    const urlRecipeId = params.get("recipe");
    const savedRecipeId = typeof saved.selectedRecipeId === "string" && allRecipeIds.has(saved.selectedRecipeId)
      ? saved.selectedRecipeId
      : null;
    const nextRecipeId = urlRecipeId && allRecipeIds.has(urlRecipeId)
      ? urlRecipeId
      : urlWeekIndex >= 0
        ? null
        : savedRecipeId;

    if (nextRecipeId) {
      const recipeWeekIndex = weeklyPlans.findIndex((week) => week.meals.some((meal) => meal.id === nextRecipeId));
      if (recipeWeekIndex >= 0) nextWeekIndex = recipeWeekIndex;
    }

    const urlView = params.get("view");
    const nextView = isPlannerView(urlView)
      ? urlView
      : isPlannerView(saved.activeView) ? saved.activeView : "recipes";

    const frame = window.requestAnimationFrame(() => {
      setActiveWeekIndex(nextWeekIndex);
      setActiveView(nextView);
      setIsDark(saved.theme === "dark" || (saved.theme !== "light" && document.documentElement.dataset.theme === "dark"));
      setSelectedRecipeId(nextRecipeId);
      setCheckedItems(checkedItemsFromSaved(saved.checkedItems));
      setCookedRecipeIds(setFromSaved(saved.cookedRecipeIds));
      setFavouriteRecipeIds(setFromSaved(saved.favouriteRecipeIds));
      setShowRemaining(Boolean(saved.showRemaining));
      setMealOrders(mealOrdersFromSaved(saved.mealOrders));
      setShoppingCategories(shoppingCategoriesFromSaved(saved.shoppingCategories));
      setMealRatings(mealRatingsFromSaved(saved.mealRatings));
      setExtraShoppingItems(extraShoppingItemsFromSaved(saved.extraShoppingItems));
      setMethodProgress(methodProgressFromSaved(saved.methodProgress));
      setFreshnessLots(freshnessLotsFromSaved(saved.freshnessLots));
      setCookingMode(false);
      setTodayISO(today);
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!persistLocalState(currentLocalState)) {
      window.setTimeout(() => {
        setStatusMessage("Your changes could not be saved on this device.");
        setStorageWarning(true);
      }, 0);
    }
  }, [currentLocalState, hydrated, persistLocalState, saveRetry]);

  useEffect(() => {
    if (!hydrated) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("family");
    url.searchParams.set("week", String(weeklyPlans[activeWeekIndex].number));
    url.searchParams.set("view", activeView);
    if (selectedRecipeId) url.searchParams.set("recipe", selectedRecipeId);
    else url.searchParams.delete("recipe");
    const nextLocation = `${url.pathname}${url.search}${url.hash}`;
    if (!initialUrlAppliedRef.current) {
      initialUrlAppliedRef.current = true;
      window.history.replaceState({}, "", nextLocation);
      return;
    }
    if (suppressHistoryRef.current) {
      suppressHistoryRef.current = false;
      window.history.replaceState({}, "", nextLocation);
      return;
    }
    const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentLocation !== nextLocation) window.history.pushState({}, "", nextLocation);
  }, [activeView, activeWeekIndex, hydrated, selectedRecipeId]);

  useEffect(() => {
    if (!hydrated) return;
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlWeekIndex = weeklyPlans.findIndex((week) => week.number === Number(params.get("week")));
      const nextWeekIndex = urlWeekIndex >= 0 ? urlWeekIndex : activeWeekIndex;
      const urlRecipeId = params.get("recipe");
      const nextRecipeId = urlRecipeId && allRecipeIds.has(urlRecipeId) ? urlRecipeId : null;
      suppressHistoryRef.current = true;
      setActiveWeekIndex(nextWeekIndex);
      setActiveView(isPlannerView(params.get("view")) ? params.get("view") as PlannerView : "recipes");
      setSelectedRecipeId(nextRecipeId);
      setCookingMode(false);
      setQuery("");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [activeWeekIndex, hydrated]);

  const activeWeek = weeklyPlans[activeWeekIndex];
  const activeCheckoutTotal = estimatedCheckoutTotal(activeWeek, extraShoppingItems[activeWeek.number] ?? []);
  const currentCyclePosition = useMemo(() => cyclePosition(PLAN_CYCLE_START, todayISO), [todayISO]);
  const activeWeekInstanceKey = weekInstanceKeyForCurrentCycle(activeWeekIndex, currentCyclePosition.cycleIndex);

  useEffect(() => {
    if (!pendingMealMove) return;
    const frame = window.requestAnimationFrame(() => pendingMoveFirstActionRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [pendingMealMove]);

  useEffect(() => {
    if (!hydrated) return;
    const calendarWeekIndex = currentCyclePosition.weekIndex;
    if (autoWeekRef.current === null) {
      autoWeekRef.current = calendarWeekIndex;
      return;
    }
    const previousCalendarWeek = autoWeekRef.current;
    autoWeekRef.current = calendarWeekIndex;
    if (calendarWeekIndex === previousCalendarWeek || activeWeekIndex !== previousCalendarWeek) return;
    setActiveWeekIndex(calendarWeekIndex);
    setSelectedRecipeId(null);
    setCookingMode(false);
    setQuery("");
    setUndoCheckedItems(null);
    setStatusMessage(`The calendar moved to Week ${calendarWeekIndex + 1}.`);
  }, [activeWeekIndex, currentCyclePosition.weekIndex, hydrated]);

  const activeMeals = useMemo(
    () => assignedMeals(activeWeek, mealOrders[activeWeekInstanceKey]),
    [activeWeek, activeWeekInstanceKey, mealOrders],
  );

  const recipeEntries = useMemo<RecipeEntry[]>(() => {
    const search = query.trim().toLocaleLowerCase("en-GB");
    if (search) {
      return weeklyPlans.flatMap((week, weekIndex) =>
        assignedMeals(week, mealOrders[weekInstanceKeyForCurrentCycle(weekIndex, currentCyclePosition.cycleIndex)])
          .filter(({ recipe, displayDay }) =>
            [recipe.name, recipe.description, displayDay, ...recipe.ingredients]
              .join(" ")
              .toLocaleLowerCase("en-GB")
              .includes(search),
          )
          .map(({ recipe, displayDay, dateOffset }) => ({
            recipe,
            weekIndex,
            displayDay,
            mealDate: addDaysISO(weekInstanceKeyForCurrentCycle(weekIndex, currentCyclePosition.cycleIndex), dateOffset),
          })),
      );
    }

    return activeMeals
      .map(({ recipe, displayDay, dateOffset }) => ({
        recipe,
        weekIndex: activeWeekIndex,
        displayDay,
        mealDate: addDaysISO(activeWeekInstanceKey, dateOffset),
      }));
  }, [activeMeals, activeWeekIndex, activeWeekInstanceKey, currentCyclePosition.cycleIndex, mealOrders, query]);

  const selectedEntry = useMemo<RecipeEntry | null>(() => {
    if (!selectedRecipeId) return null;
    const weekIndex = weeklyPlans.findIndex((week) => week.meals.some((meal) => meal.id === selectedRecipeId));
    if (weekIndex < 0) return null;
    const recipe = weeklyPlans[weekIndex].meals.find((meal) => meal.id === selectedRecipeId)!;
    const assigned = assignedMeals(weeklyPlans[weekIndex], mealOrders[weekInstanceKeyForCurrentCycle(weekIndex, currentCyclePosition.cycleIndex)]);
    const assignedRecipe = assigned.find((entry) => entry.recipe.id === recipe.id);
    return {
      recipe,
      weekIndex,
      displayDay: assignedRecipe?.displayDay ?? recipe.day,
      mealDate: addDaysISO(weekInstanceKeyForCurrentCycle(weekIndex, currentCyclePosition.cycleIndex), assignedRecipe?.dateOffset ?? mealDateOffsetForRecipe(recipe, 0)),
    };
  }, [currentCyclePosition.cycleIndex, mealOrders, selectedRecipeId]);

  const activeOrder = useMemo(() => activeMeals.map(({ recipe }) => recipe.id), [activeMeals]);
  const activeFreshnessLots = useMemo(() => freshnessLots[activeWeekInstanceKey] ?? [], [activeWeekInstanceKey, freshnessLots]);
  const activeFreshnessEvaluation = useMemo(
    () => validateSchedule({ week: activeWeek, weekStartISO: activeWeekInstanceKey, order: activeOrder, lots: activeFreshnessLots }),
    [activeFreshnessLots, activeOrder, activeWeek, activeWeekInstanceKey],
  );
  const activeExpiryConflict = hasExpiryConflict(activeFreshnessEvaluation);

  const openShoppingFreshness = () => {
    setActiveView("shopping");
    setSelectedRecipeId(null);
    setCookingMode(false);
    setStatusMessage("Use-by dates are ready in the Week shopping view.");
  };

  const changeWeek = (index: number) => {
    const nextWeek = weeklyPlans[index];
    setActiveWeekIndex(index);
    setSelectedRecipeId(null);
    setCookingMode(false);
    setQuery("");
    setIsReordering(false);
    setUndoCheckedItems(null);
    setStatusMessage(`Now showing Week ${nextWeek.number}: ${shortWeekTitles[nextWeek.number]}.`);
  };

  const selectRecipe = (entry: RecipeEntry) => {
    if (entry.weekIndex !== activeWeekIndex) setActiveWeekIndex(entry.weekIndex);
    setCookingMode(false);
    setSelectedRecipeId(entry.recipe.id);
    setStatusMessage(`${entry.recipe.name} recipe opened.`);
    window.requestAnimationFrame(() => {
      document.getElementById("recipe-reader")?.scrollIntoView({ block: "start" });
      readerBackRef.current?.focus();
    });
  };

  const toggleReordering = () => {
    const next = !isReordering;
    setSelectedRecipeId(null);
    setCookingMode(false);
    setQuery("");
    setIsReordering(next);
    setStatusMessage(next ? "Reorder mode on. Use Earlier or Later on a dinner." : "Reorder mode off.");
  };

  const closeRecipe = (recipe: Recipe) => {
    setSelectedRecipeId(null);
    setCookingMode(false);
    setStatusMessage(`${recipe.name} closed.`);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        cardRefs.current[recipe.id]?.scrollIntoView({ block: "center" });
        document.getElementById(`meal-card-${recipe.id}`)?.focus();
      });
    });
  };

  const toggleSetValue = (
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    id: string,
    addedMessage: string,
    removedMessage: string,
  ) => {
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
        setStatusMessage(removedMessage);
      } else {
        next.add(id);
        setStatusMessage(addedMessage);
      }
      return next;
    });
  };

  const toggleShoppingItem = (key: string) => {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearCheckedForWeek = () => {
    const weekKeys = new Set(
      activeWeek.shopping.flatMap((section) =>
        section.items.map((item) => shoppingItemKey(activeWeek.number, section.title, item)),
      ),
    );
    extraShoppingItems[activeWeek.number]?.forEach((item) => weekKeys.add(`extra-w${activeWeek.number}-${item.id}`));
    setCheckedItems((current) => {
      const cleared = new Set([...current].filter((key) => weekKeys.has(key)));
      setUndoCheckedItems({ cleared });
      return new Set([...current].filter((key) => !weekKeys.has(key)));
    });
    setStatusMessage(`Checked items cleared for Week ${activeWeek.number}.`);
  };

  const undoClearChecked = () => {
    if (!undoCheckedItems) return;
    setCheckedItems((current) => new Set([...current, ...undoCheckedItems.cleared]));
    setUndoCheckedItems(null);
    setStatusMessage("The checked items are back.");
  };

  const moveShoppingItem = (key: string, itemName: string, category: string) => {
    const originalCategory = shoppingItemOrigins.get(key);
    if (!originalCategory || !shoppingCategoriesByWeek.get(activeWeek.number)?.has(category)) return;

    setShoppingCategories((current) => {
      const next = { ...current };
      if (category === originalCategory) delete next[key];
      else next[key] = category;
      return next;
    });
    setStatusMessage(`${itemName} moved to ${category} and saved to the planner.`);
  };

  const moveExtraShoppingItem = (id: string, category: string) => {
    setExtraShoppingItems((current) => ({
      ...current,
      [activeWeek.number]: (current[activeWeek.number] ?? []).map((item) => item.id === id ? { ...item, category } : item),
    }));
    setStatusMessage("Extra shopping item moved and saved to the planner.");
  };

  const addExtraShoppingItem = (item: Omit<ExtraShoppingItem, "id"> & { id?: string }) => {
    const id = item.id ?? (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `extra-${Date.now()}`);
    setExtraShoppingItems((current) => {
      const existing = current[activeWeek.number] ?? [];
      const nextItem = { ...item, id } as ExtraShoppingItem;
      return { ...current, [activeWeek.number]: item.id ? existing.map((entry) => entry.id === id ? nextItem : entry) : [...existing, nextItem] };
    });
    setStatusMessage(`${item.name} added to the Week ${activeWeek.number} shop.`);
  };

  const removeExtraShoppingItem = (id: string) => {
    setExtraShoppingItems((current) => ({
      ...current,
      [activeWeek.number]: (current[activeWeek.number] ?? []).filter((item) => item.id !== id),
    }));
    setStatusMessage("Extra shopping item removed.");
  };

  const rateMeal = (recipe: Recipe, rating: number) => {
    if (!Number.isInteger(rating) || rating < 0 || rating > 5) return;
    setMealRatings((current) => {
      const next = { ...current };
      if (rating === 0) delete next[recipe.id];
      else next[recipe.id] = rating;
      return next;
    });
    setStatusMessage(rating ? `${recipe.name} rated ${rating} out of 5 and saved to the planner.` : `${recipe.name} rating cleared.`);
  };

  const storeMealOrder = (nextOrder: string[]) => {
    const originalOrder = assignedMeals(activeWeek).map(({ recipe }) => recipe.id);
    setMealOrders((current) => {
      const next = { ...current };
      if (nextOrder.join("|") === originalOrder.join("|")) delete next[activeWeekInstanceKey];
      else next[activeWeekInstanceKey] = nextOrder;
      return next;
    });
  };

  const addFreshnessLot = (lot: PurchasedLot) => {
    setFreshnessLots((current) => ({
      ...current,
      [activeWeekInstanceKey]: [...(current[activeWeekInstanceKey] ?? []), lot],
    }));
    setStatusMessage(`${lot.productName} pack added with a ${lot.useByDate} use-by date.`);
  };

  const updateFreshnessLot = (lot: PurchasedLot) => {
    setFreshnessLots((current) => ({
      ...current,
      [activeWeekInstanceKey]: (current[activeWeekInstanceKey] ?? []).map((entry) => entry.id === lot.id ? lot : entry),
    }));
  };

  const removeFreshnessLot = (lotId: string) => {
    setFreshnessLots((current) => ({
      ...current,
      [activeWeekInstanceKey]: (current[activeWeekInstanceKey] ?? []).filter((lot) => lot.id !== lotId),
    }));
    setStatusMessage("Pack removed from the freshness planner.");
  };

  const optimiseActiveWeek = () => {
    const result = optimiseSchedule({
      week: activeWeek,
      weekStartISO: activeWeekInstanceKey,
      order: activeOrder,
      lots: activeFreshnessLots,
      lockedRecipeIds: cookedRecipeIds,
    });
    if (!result.validation.feasible) {
      setStatusMessage(result.validation.issues[0]?.message ?? "There is not yet a complete safe dinner order.");
      return;
    }
    if (result.changed) {
      storeMealOrder(result.order);
      setStatusMessage("This week was reordered around the recorded pack dates. Cooked dinners stayed in place.");
    } else {
      setStatusMessage("This week already fits the recorded pack dates.");
    }
  };

  const confirmPendingMealMove = () => {
    if (!pendingMealMove) return;
    storeMealOrder(pendingMealMove.order);
    setPendingMealMove(null);
    setStatusMessage("Dinner moved. The use-by conflict remains visible for review.");
  };

  const cancelPendingMealMove = () => {
    setPendingMealMove(null);
    setStatusMessage("Dinner move cancelled.");
  };

  const moveMeal = (recipeId: string, direction: -1 | 1) => {
    const currentOrder = [...activeOrder];
    const from = currentOrder.indexOf(recipeId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= currentOrder.length) return;
    [currentOrder[from], currentOrder[to]] = [currentOrder[to], currentOrder[from]];
    const evaluation = validateSchedule({ week: activeWeek, weekStartISO: activeWeekInstanceKey, order: currentOrder, lots: activeFreshnessLots });
    if (hasExpiryConflict(evaluation)) {
      setPendingMealMove({ order: currentOrder, evaluation });
      setStatusMessage("That move would put a dinner outside a recorded pack window. Review the warning before continuing.");
      return;
    }
    storeMealOrder(currentOrder);
    setStatusMessage("Dinner order updated and saved to the planner.");
  };

  const resetMealOrder = () => {
    const originalOrder = assignedMeals(activeWeek).map(({ recipe }) => recipe.id);
    const evaluation = validateSchedule({ week: activeWeek, weekStartISO: activeWeekInstanceKey, order: originalOrder, lots: activeFreshnessLots });
    if (hasExpiryConflict(evaluation)) {
      setPendingMealMove({ order: originalOrder, evaluation });
      setStatusMessage("Resetting this week would create a use-by conflict. Review the warning before continuing.");
      return;
    }
    storeMealOrder(originalOrder);
    setStatusMessage(`Week ${activeWeek.number} restored to its original order.`);
  };

  const shareCurrent = async () => {
    setShareError("");
    setShareFallbackUrl("");
    const sharingRecipe = activeView === "recipes" && selectedEntry;
    const title = sharingRecipe ? sharingRecipe.recipe.name : `Week ${activeWeek.number} dinner plan`;
    const shareUrl = new URL(window.location.href);
    if (!sharingRecipe) shareUrl.searchParams.delete("recipe");
    shareUrl.searchParams.delete("family");
    const shareData = { title, text: `${title} · Sharon Meal Plan`, url: shareUrl.toString() };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setStatusMessage("Link shared.");
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") return;
        try {
          await navigator.clipboard.writeText(shareUrl.toString());
          setShareError("");
          setShareFallbackUrl("");
          setStatusMessage("Link copied to the clipboard.");
        } catch {
          setShareFallbackUrl(shareUrl.toString());
          setShareError("The link could not be copied. Copy the link below instead.");
          setStatusMessage("The link could not be copied.");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl.toString());
        setShareError("");
        setShareFallbackUrl("");
        setStatusMessage("Planner link copied to the clipboard.");
      } catch {
        setShareFallbackUrl(shareUrl.toString());
        setShareError("The link could not be copied. Copy the link below instead.");
        setStatusMessage("The planner link could not be copied.");
      }
    }
  };

  const toggleMethodStep = (recipeId: string, stepIndex: number) => {
    setMethodProgress((current) => {
      const steps = new Set(current[recipeId] ?? []);
      if (steps.has(stepIndex)) steps.delete(stepIndex);
      else steps.add(stepIndex);
      return { ...current, [recipeId]: [...steps].sort((a, b) => a - b) };
    });
  };

  const printPlanner = () => window.print();

  const updateTheme = (dark: boolean) => {
    setIsDark(dark);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  };

  return (
    <div className="planner-shell" data-active-view={activeView}>
      <PwaRegister />
      <div className="print-brand" aria-hidden="true"><strong>Sharon Meal Plan</strong><span>Our four-week family meal planner</span></div>
      <a href="#planner" className="skip-link">Skip to this week&apos;s plan</a>
      <p className="sr-only" aria-live="polite" aria-atomic="true">{statusMessage}</p>
      {storageWarning ? (
        <div className="storage-warning" role="alert">
          <span><strong>Changes are not saving.</strong> They may be lost when this page closes.</span>
          <button type="button" onClick={() => { setStorageWarning(false); setSaveRetry((value) => value + 1); }}>Try again</button>
        </div>
      ) : null}
      {shareError ? (
        <div className="storage-warning" role="alert">
          <span><strong>Link not copied.</strong> {shareError}{shareFallbackUrl ? <input className="share-fallback-url" value={shareFallbackUrl} readOnly aria-label="Link to copy manually" onFocus={(event) => event.currentTarget.select()} /> : null}</span>
          <button type="button" onClick={() => { setShareError(""); setShareFallbackUrl(""); }}>Dismiss</button>
        </div>
      ) : null}
      {activeFreshnessLots.length && activeExpiryConflict && !pendingMealMove ? (
        <aside className="freshness-warning" role="alert" aria-labelledby="freshness-conflict-title">
          <ShieldAlert aria-hidden="true" />
          <div><strong id="freshness-conflict-title">Freshness needs attention.</strong><p>{activeFreshnessEvaluation.issues.find((issue) => issue.severity === "error")?.message ?? "One or more dinners do not fit the recorded pack dates or quantities."}</p></div>
          <div className="freshness-warning-actions"><button type="button" className="button button-primary" onClick={optimiseActiveWeek}>Optimise week</button><button type="button" className="button button-secondary" onClick={openShoppingFreshness}>Review dates</button></div>
        </aside>
      ) : null}
      {pendingMealMove ? (
        <aside className="freshness-warning freshness-move-warning" role="alert" aria-labelledby="move-warning-title" aria-describedby="move-warning-description">
          <ShieldAlert aria-hidden="true" />
          <div><strong id="move-warning-title">That dinner move needs a freshness check.</strong><p id="move-warning-description">{pendingMealMove.evaluation.issues.find((issue) => issue.severity === "error")?.message ?? "The proposed order needs review."}</p></div>
          <div className="freshness-warning-actions"><button ref={pendingMoveFirstActionRef} type="button" className="button button-primary" onClick={optimiseActiveWeek}>Optimise week</button><button type="button" className="button button-secondary" onClick={confirmPendingMealMove}>Move anyway</button><button type="button" className="button button-quiet" onClick={cancelPendingMealMove}>Cancel</button></div>
        </aside>
      ) : null}

      <header className="site-header">
        <a className="brand" href="#planner" aria-label="Sharon Meal Plan meal planner">
          <span className="brand-mark" aria-hidden="true">SM</span>
          <span><strong>Sharon Meal Plan</strong><small>Our four-week meal planner</small></span>
        </a>
        <div className="header-actions">
          <ThemeToggle isDark={isDark} onChange={updateTheme} />
        </div>
      </header>

      <main id="main-content">
      <section className="planner-intro" aria-labelledby="page-title">
        <picture>
          <source type="image/avif" srcSet="/family-dinner-hero-720.avif 720w, /family-dinner-hero-1280.avif 1280w, /family-dinner-hero-1672.avif 1672w" sizes="(max-width: 780px) calc(100vw - 28px), 75vw" />
          <source type="image/webp" srcSet="/family-dinner-hero-720.webp 720w, /family-dinner-hero-1280.webp 1280w, /family-dinner-hero-1672.webp 1672w" sizes="(max-width: 780px) calc(100vw - 28px), 75vw" />
          <img src="/family-dinner-hero.png" width="1672" height="941" alt="A family dinner laid out on a kitchen table" className="hero-image" fetchPriority="high" decoding="async" />
        </picture>
        <div className="intro-content">
          <h1 id="page-title">Dinner, decided.</h1>
          <p>Four practical weeks of family meals, recipes and organised shops.</p>
        </div>
      </section>

      <WeekSelector weeks={weeklyPlans} activeIndex={activeWeekIndex} onChange={changeWeek} />

      <section id="planner" className={`planner${selectedEntry && activeView === "recipes" ? " has-recipe-reader" : ""}`} aria-labelledby="week-title">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as PlannerView)} className="plan-tabs">
          <div className="planner-sticky">
            <div className="planner-heading">
              <div>
                <h2 id="week-title">Week {activeWeek.number} — {shortWeekTitles[activeWeek.number]}</h2>
                <p className="week-caption">{activeWeek.caption}</p>
                <p className="cycle-date-range">{cycleDateRange(PLAN_CYCLE_START, activeWeekIndex, currentCyclePosition.cycleIndex)}</p>
              </div>
            </div>

            <div className="plan-toolbar">
              <TabsList aria-label="Plan views" className="view-tabs-list">
                <TabsTrigger value="recipes" className="view-tab"><UtensilsCrossed aria-hidden="true" />Dinners</TabsTrigger>
                <TabsTrigger value="shopping" className="view-tab"><ShoppingBasket aria-hidden="true" />Shopping</TabsTrigger>
              </TabsList>
              <div className="toolbar-actions">
                <button type="button" className="icon-text-button" onClick={printPlanner} aria-label={activeView === "shopping" ? "Print shopping list" : "Print recipe"} disabled={activeView === "recipes" && !selectedEntry}><Printer aria-hidden="true" /><span>Print</span></button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="icon-text-button toolbar-more" aria-label="More planner actions"><MoreHorizontal aria-hidden="true" /><span>More</span></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="planner-action-menu">
                    <DropdownMenuItem onSelect={shareCurrent}><Share2 aria-hidden="true" />Share link</DropdownMenuItem>
                    {activeView === "recipes" ? (
                      <>
                        <DropdownMenuItem onSelect={toggleReordering}>
                          <GripVertical aria-hidden="true" />{isReordering ? "Stop reordering" : "Reorder dinners"}
                        </DropdownMenuItem>
                        {mealOrders[activeWeekInstanceKey] && !query ? <DropdownMenuItem onSelect={resetMealOrder}><RotateCcw aria-hidden="true" />Reset order</DropdownMenuItem> : null}
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="weekly-cost" aria-label={`Week ${activeWeek.number} estimated shop total ${money.format(activeCheckoutTotal)}`}>
                  <span>Estimated shop</span><strong>{money.format(activeCheckoutTotal)}</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="print-week-heading">Week {activeWeek.number} — {shortWeekTitles[activeWeek.number]}</div>

          <TabsContent value="recipes" className="plan-content recipe-view">
            {selectedEntry ? (
              <section id="recipe-reader" className="recipe-reader" aria-label={`${selectedEntry.recipe.name} recipe`}>
                <div className="recipe-reader-toolbar">
                  <button ref={readerBackRef} type="button" className="button button-secondary recipe-reader-back" onClick={() => closeRecipe(selectedEntry.recipe)}>
                    <ArrowLeft aria-hidden="true" />Back to meals
                  </button>
                  <span>Week {selectedEntry.weekIndex + 1} · {selectedEntry.displayDay} · {readableMealDate(selectedEntry.mealDate)} · Recipe {selectedEntry.recipe.recipeNumber}</span>
                </div>
                <RecipeDetail
                  recipe={selectedEntry.recipe}
                  displayDay={selectedEntry.displayDay}
                  titleId="recipe-reader-title"
                  isFavourite={favouriteRecipeIds.has(selectedEntry.recipe.id)}
                  isCooked={cookedRecipeIds.has(selectedEntry.recipe.id)}
                  rating={mealRatings[selectedEntry.recipe.id] ?? 0}
                  onToggleFavourite={() => toggleSetValue(setFavouriteRecipeIds, selectedEntry.recipe.id, `${selectedEntry.recipe.name} saved as a favourite.`, `${selectedEntry.recipe.name} removed from favourites.`)}
                  onToggleCooked={() => toggleSetValue(setCookedRecipeIds, selectedEntry.recipe.id, `${selectedEntry.recipe.name} marked as cooked.`, `${selectedEntry.recipe.name} marked as not cooked.`)}
                  onRate={(rating) => rateMeal(selectedEntry.recipe, rating)}
                  cookingMode={cookingMode}
                  completedSteps={new Set(methodProgress[selectedEntry.recipe.id] ?? [])}
                  onToggleCookingMode={() => setCookingMode((mode) => !mode)}
                  onToggleStep={(stepIndex) => toggleMethodStep(selectedEntry.recipe.id, stepIndex)}
                />
              </section>
            ) : (
              <>
                <div className="recipe-controls">
                  <h3>This week&apos;s dinners</h3>
                  <div className="recipe-search">
                    <div className="search-field">
                      <Search aria-hidden="true" />
                      <label className="sr-only" htmlFor="recipe-search">Search recipes or ingredients across all four weeks</label>
                      <Input id="recipe-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setIsReordering(false); }} placeholder="Search all four weeks by dish or ingredient" aria-describedby="recipe-search-help" />
                      {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X aria-hidden="true" /></button>}
                    </div>
                    <p id="recipe-search-help" className="search-help">Searches all four weeks by meal, ingredient or day.</p>
                  </div>
                </div>

                <div className="recipe-filter-bar">
                  {query ? <p className="results-note" aria-live="polite">{recipeEntries.length} {recipeEntries.length === 1 ? "recipe matches" : "recipes match"} “{query}” across all four weeks.</p> : null}
                </div>

                {recipeEntries.length === 0 ? (
                  <Empty className="empty-search">
                    <EmptyHeader>
                      <EmptyMedia variant="icon"><Search aria-hidden="true" /></EmptyMedia>
                      <EmptyTitle>No dinners match</EmptyTitle>
                      <EmptyDescription>Try a dish name such as chicken or an ingredient such as mushrooms.</EmptyDescription>
                    </EmptyHeader>
                    <button type="button" className="button button-secondary" onClick={() => setQuery("")}>Clear search</button>
                  </Empty>
                ) : (
                  <div className="recipe-grid" aria-label={query ? "Matching cookbook dinners" : "Dinners this week"}>
                    {recipeEntries.map((entry, index) => {
                      const meal = entry.recipe;
                      const mealImage = getMealImage(meal.recipeNumber, meal.name);
                      const isFavourite = favouriteRecipeIds.has(meal.id);
                      const isCooked = cookedRecipeIds.has(meal.id);
                      const cardId = `meal-card-${meal.id}`;
                      const stateText = [entry.mealDate === todayISO ? "Today" : "", isFavourite ? "Favourite" : "", isCooked ? "Cooked" : ""].filter(Boolean).join(", ");
                      return (
                        <div className="meal-card-group" key={meal.id} ref={(node) => { cardRefs.current[meal.id] = node; }}>
                          <button type="button" id={cardId} onClick={() => selectRecipe(entry)} className="meal-card" aria-labelledby={`${cardId}-day ${cardId}-title ${cardId}-state`} aria-describedby={`${cardId}-description ${cardId}-meta`}>
                            <span className="meal-card-image" aria-hidden="true">
                              <picture>
                                {mealImage.srcSet ? <source type="image/webp" srcSet={mealImage.srcSet} sizes={mealImage.sizes} /> : null}
                                <img
                                  src={mealImage.src}
                                  srcSet={mealImage.fallbackSrcSet || undefined}
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  sizes={mealImage.sizes}
                                  onError={handleMealImageError}
                                />
                              </picture>
                            </span>
                            <span className="meal-card-topline">
                            <span className="meal-day" id={`${cardId}-day`}>{entry.displayDay} · <span className="meal-day-date">{readableMealDate(entry.mealDate)}</span>{query ? ` · Week ${entry.weekIndex + 1}` : ""}</span>
                            <span className="meal-state-icons">
                                <span className="sr-only" id={`${cardId}-state`}>{stateText}</span>
                                {entry.mealDate === todayISO ? <span className="meal-today" aria-hidden="true">Today</span> : null}
                                {isFavourite && <Heart aria-hidden="true" fill="currentColor" />}
                                {isCooked && <span className="cooked-dot" aria-hidden="true">✓</span>}
                                <ChevronRight className="meal-chevron" aria-hidden="true" />
                              </span>
                            </span>
                            <span className="meal-card-title" id={`${cardId}-title`}>{meal.name}</span>
                            <span className="meal-card-description" id={`${cardId}-description`}>{meal.description}</span>
                            <span className="meal-meta" id={`${cardId}-meta`}><span>{formatMinutes(totalMinutes(meal))} total</span></span>
                          </button>
                          <MealRating
                            mealName={meal.name}
                            rating={mealRatings[meal.id] ?? 0}
                            readOnly
                          />

                          {isReordering && !query && (
                            <div className="reorder-controls" aria-label={`Move ${meal.name}`}>
                              <button type="button" onClick={() => moveMeal(meal.id, -1)} disabled={index === 0} aria-label={`Move ${meal.name} earlier`}><ArrowUp aria-hidden="true" />Earlier</button>
                              <button type="button" onClick={() => moveMeal(meal.id, 1)} disabled={index === recipeEntries.length - 1} aria-label={`Move ${meal.name} later`}><ArrowDown aria-hidden="true" />Later</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="shopping" className="plan-content shopping-tab-content">
            <ShoppingList key={activeWeekInstanceKey} week={activeWeek} checkedItems={checkedItems} shoppingCategories={shoppingCategories} extraItems={extraShoppingItems[activeWeek.number] ?? []} showRemaining={showRemaining} priceBasis={cookbook.priceBasis} canUndo={Boolean(undoCheckedItems)} onToggleItem={toggleShoppingItem} onMoveItem={moveShoppingItem} onMoveExtraItem={moveExtraShoppingItem} onAddExtraItem={addExtraShoppingItem} onRemoveExtraItem={removeExtraShoppingItem} onClearChecked={clearCheckedForWeek} onUndo={undoClearChecked} onShowRemainingChange={setShowRemaining} weekStartISO={activeWeekInstanceKey} freshnessLots={activeFreshnessLots} freshnessEvaluation={activeFreshnessEvaluation} onAddFreshnessLot={addFreshnessLot} onUpdateFreshnessLot={updateFreshnessLot} onRemoveFreshnessLot={removeFreshnessLot} onOptimiseFreshness={optimiseActiveWeek} />
          </TabsContent>
        </Tabs>
      </section>
      </main>

      <footer className="site-footer">
        <p><strong>Sharon Meal Plan</strong> · {cookbook.title} · {cookbook.edition}</p>
        <p>{cookbook.costMeaning}</p>
      </footer>
    </div>
  );
}
