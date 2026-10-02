import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

import React from "react";
import postcss from "postcss";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

function finalRuleDeclarations(css, selector, media = null) {
  const parsed = postcss.parse(css);
  let declarations = null;
  const visit = (container, activeMedia = null) => {
    container.each((node) => {
      if (node.type === "atrule" && node.nodes) visit(node, node.name === "media" ? node.params : activeMedia);
      if (node.type === "rule" && (node.selector === selector || node.selectors?.includes(selector)) && activeMedia === media) {
        declarations = Object.fromEntries((node.nodes ?? [])
          .filter((child) => child.type === "decl")
          .map((child) => [child.prop, child.value]));
      }
    });
  };
  visit(parsed);
  return declarations;
}

function countRuleContexts(css) {
  const parsed = postcss.parse(css);
  const counts = new Map();
  const visit = (container, activeMedia = "base") => {
    container.each((node) => {
      if (node.type === "atrule" && node.nodes) visit(node, node.name === "media" ? node.params : activeMedia);
      if (node.type === "rule") {
        const key = `${activeMedia}|${node.selector}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    });
  };
  visit(parsed);
  return counts;
}

after(async () => {
  await vite.close();
});

test("contains four complete weeks and 28 uniquely identified recipes", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const { validateMorrisonsPricing } = await vite.ssrLoadModule("/app/morrisons-pricing.ts");
  const { validateCookbook } = await vite.ssrLoadModule("/app/planner-utils.ts");
  const recipes = cookbook.weeks.flatMap((week) => week.meals);

  assert.equal(cookbook.weeks.length, 4);
  assert.deepEqual(cookbook.weeks.map((week) => week.meals.length), [7, 7, 7, 7]);
  assert.equal(recipes.length, 28);
  assert.equal(new Set(recipes.map((recipe) => recipe.id)).size, 28);
  assert.deepEqual(validateCookbook(cookbook), []);
  assert.deepEqual(validateMorrisonsPricing(cookbook), []);
  assert.equal(cookbook.priceBasis.includes("Morrisons"), true);
  assert.equal(cookbook.fourWeekTotal, 305.7);
  assert.deepEqual(cookbook.weeks.map((week) => week.checkoutTotal), [91.65, 76.57, 72.87, 64.61]);
});

test("audits every batch cost and distinguishes fish-finger pack spend", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const recipes = cookbook.weeks.flatMap((week) => week.meals);
  const fishDinner = recipes.find((recipe) => recipe.id === "w2-r10");
  const fishLine = fishDinner.costBreakdown.find((line) => /Fish Fingers/i.test(line.packName));

  assert.equal(recipes.every((recipe) => recipe.costBreakdown.length > 0), true);
  assert.equal(recipes.every((recipe) => Math.abs(recipe.costBreakdown.reduce((sum, line) => sum + line.attributedCost, 0) - recipe.cost) < 0.011), true);
  assert.equal(fishDinner.cost, 4.32);
  assert.equal(fishLine.fullPackPrice, 4.5);
  assert.equal(fishLine.quantityUsed, "12 of 20 fish fingers");
  assert.equal(fishLine.proportion, "60%");
  assert.equal(fishLine.attributedCost, 2.7);
});

test("keeps audited normal-price packs and calculated weekly baskets aligned", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const { applyMorrisonsPricing, morrisonsProducts, validateMorrisonsPricing } = await vite.ssrLoadModule("/app/morrisons-pricing.ts");
  const item = (book, weekNumber, productId) => book.weeks[weekNumber - 1].shopping
    .flatMap((section) => section.items)
    .find((shoppingItem) => shoppingItem.productId === productId);

  for (const week of cookbook.weeks) {
    const calculated = Math.round(week.shopping.flatMap((section) => section.items)
      .reduce((sum, shoppingItem) => sum + shoppingItem.price, 0) * 100) / 100;
    assert.equal(calculated, week.checkoutTotal);
  }

  const fishFingers = item(cookbook, 2, "fish-fingers");
  assert.equal(fishFingers.id, "fish-fingers");
  assert.equal(fishFingers.productId, "fish-fingers");
  assert.equal(fishFingers.packCount, 1);
  assert.equal(fishFingers.legacyId, "fish-fingers-15-pack");
  assert.deepEqual({
    name: fishFingers.name,
    amount: fishFingers.amount,
    price: fishFingers.price,
    carriedForward: fishFingers.carriedForward,
  }, {
    name: "Birds Eye 20 Omega 3 Fish Fingers",
    amount: "20 pack / 560g",
    price: 4.5,
    carriedForward: false,
  });
  assert.equal(item(cookbook, 1, "potatoes").price, 4.6);
  assert.equal(item(cookbook, 2, "peppers").price, 2.5);
  assert.equal(item(cookbook, 2, "milk").price, 2.25);
  assert.equal(item(cookbook, 2, "garlic").price, 0.99);
  assert.equal(item(cookbook, 3, "whole-chicken").price, 8);
  assert.equal(item(cookbook, 4, "spaghetti").price, 1.6);

  const updatedCatalog = Object.fromEntries(Object.entries(morrisonsProducts).map(([key, product]) => [key, { ...product }]));
  updatedCatalog.beefMince.packPricePence = 575;
  const repriced = applyMorrisonsPricing(cookbook, updatedCatalog);
  assert.equal(item(repriced, 1, "beef-mince").price, 5.75);
  assert.equal(repriced.weeks[0].meals.find((meal) => meal.id === "w1-r5").cost, cookbook.weeks[0].meals.find((meal) => meal.id === "w1-r5").cost + 0.6);
  assert.equal(repriced.weeks[0].checkoutTotal, 92.4);
  assert.equal(repriced.fourWeekTotal, 308.7);
  assert.deepEqual(validateMorrisonsPricing(repriced, updatedCatalog), []);
});

test("buys fresh and chilled recipe products in their own week", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const { nonCarryableProductIds, validateMorrisonsPricing } = await vite.ssrLoadModule("/app/morrisons-pricing.ts");
  const item = (weekNumber, productId) => cookbook.weeks[weekNumber - 1].shopping
    .flatMap((section) => section.items)
    .find((shoppingItem) => shoppingItem.productId === productId);

  for (const week of cookbook.weeks) {
    const purchased = new Set(week.shopping.flatMap((section) => section.items)
      .filter((shoppingItem) => !shoppingItem.carriedForward && shoppingItem.packCount > 0)
      .map((shoppingItem) => shoppingItem.productId));
    for (const meal of week.meals) {
      for (const line of meal.costBreakdown) {
        if (nonCarryableProductIds.has(line.productId)) assert.equal(purchased.has(line.productId), true, `${line.productId} missing from Week ${week.number}`);
      }
    }
    assert.equal(week.shopping.flatMap((section) => section.items)
      .filter((shoppingItem) => shoppingItem.carriedForward)
      .every((shoppingItem) => !nonCarryableProductIds.has(shoppingItem.productId)), true);
  }

  assert.equal(item(2, "peppers").amount, "3 pack / about 500g");
  assert.equal(item(2, "peppers").carriedForward, false);
  const broken = structuredClone(cookbook);
  broken.weeks[1].shopping = broken.weeks[1].shopping.map((section) => ({
    ...section,
    items: section.items.filter((shoppingItem) => shoppingItem.productId !== "peppers"),
  }));
  assert.match(validateMorrisonsPricing(broken).join("\n"), /same week: Week 2 peppers/);
});

test("keeps the Week 3 roast and leftover risotto recipes", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const weekThree = cookbook.weeks[2];
  const roast = weekThree.meals.find((meal) => /roast chicken/i.test(meal.name));
  const risotto = weekThree.meals.find((meal) => /leftover chicken/i.test(meal.name));

  assert.equal(roast?.id, "w3-r15");
  assert.equal(risotto?.id, "w3-r16");
  assert.deepEqual(weekThree.mealRelationships, [{
    type: "cooked-leftover",
    sourceRecipeId: "w3-r15",
    targetRecipeId: "w3-r16",
    productId: "wholeChicken",
    quantity: 300,
    maxDaysAfter: 1,
  }]);
  assert.equal(risotto?.mealDateOffset, 7);
});

test("uses the same explicit Week 3 leftover date in the card model and optimiser", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const { assignedMeals } = await vite.ssrLoadModule("/app/planner-utils.ts");
  const { validateSchedule } = await vite.ssrLoadModule("/app/freshness-planner.ts");
  const week = cookbook.weeks[2];
  const lots = [{
    id: "lot-week-three-chicken",
    productId: "wholeChicken",
    productName: "Morrisons British Large Whole Chicken",
    quantity: 1900,
    unit: "g",
    purchasedOn: "2026-09-14",
    useByDate: "2026-09-21",
  }];
  const assignedRisotto = assignedMeals(week).find(({ recipe }) => recipe.id === "w3-r16");
  const evaluation = validateSchedule({ week, weekStartISO: "2026-09-14", lots });
  const leftoverAllocation = evaluation.allocations.find((allocation) => allocation.recipeId === "w3-r16");

  assert.equal(assignedRisotto.dateOffset, 7);
  assert.equal(leftoverAllocation?.mealDate, "2026-09-21");
  assert.equal(evaluation.issues.some((issue) => issue.code === "leftover-window"), false);
});

test("does not allocate a fresh lot before purchase, but allows the purchase date and rejects after use-by", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const { getFreshnessProductsForWeek, validateSchedule } = await vite.ssrLoadModule("/app/freshness-planner.ts");
  const week = cookbook.weeks[0];
  const product = getFreshnessProductsForWeek(week).find((option) => option.productId === "sausages");
  const makeLot = (purchasedOn, useByDate) => ({
    id: `lot-${purchasedOn}-${useByDate}`,
    productId: product.productId,
    productName: product.productName,
    quantity: product.defaultQuantity,
    unit: product.unit,
    purchasedOn,
    useByDate,
  });
  const beforePurchase = validateSchedule({ week, weekStartISO: "2026-08-31", lots: [makeLot("2026-09-01", "2026-09-05")] });
  const onPurchaseDate = validateSchedule({ week, weekStartISO: "2026-08-31", lots: [makeLot("2026-08-31", "2026-09-05")] });
  const afterUseBy = validateSchedule({ week, weekStartISO: "2026-08-31", lots: [makeLot("2026-08-25", "2026-08-30")] });

  assert.equal(beforePurchase.issues.some((issue) => issue.code === "not-yet-purchased"), true);
  assert.equal(beforePurchase.allocations.some((allocation) => allocation.productId === "sausages"), false);
  assert.equal(onPurchaseDate.allocations.some((allocation) => allocation.productId === "sausages"), true);
  assert.equal(afterUseBy.issues.some((issue) => issue.code === "use-by"), true);
});

test("allocates individual dated packs and moves dinners into a safe order", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const { getFreshnessProductsForWeek, hasExpiryConflict, optimiseSchedule, validateSchedule } = await vite.ssrLoadModule("/app/freshness-planner.ts");
  const week = cookbook.weeks[0];
  const products = getFreshnessProductsForWeek(week);
  const lots = products.map((product) => ({
    id: `lot-${product.productId}`,
    productId: product.productId,
    productName: product.productName,
    quantity: product.defaultQuantity,
    unit: product.unit,
    purchasedOn: "2026-08-31",
    useByDate: "2026-09-30",
  }));
  const chicken = lots.find((lot) => lot.productId === "chickenThighs");
  chicken.useByDate = "2026-09-02";

  const current = validateSchedule({ week, weekStartISO: "2026-08-31", lots });
  assert.equal(hasExpiryConflict(current), true);
  assert.match(current.issues.find((issue) => issue.productId === "chickenThighs" && issue.code === "use-by")?.message ?? "", /chicken/i);

  const optimised = optimiseSchedule({ week, weekStartISO: "2026-08-31", lots });
  assert.equal(optimised.validation.feasible, true);
  assert.equal(optimised.changed, true);
  const chickenAllocations = optimised.validation.allocations.filter((allocation) => allocation.productId === "chickenThighs");
  assert.equal(Math.round(chickenAllocations.reduce((sum, allocation) => sum + allocation.quantity, 0)), 775);
  assert.equal(chickenAllocations.every((allocation) => allocation.mealDate <= "2026-09-02"), true);
});

test("moves a recorded pack even when other fresh pack dates are missing", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const { getFreshnessProductsForWeek, optimiseSchedule } = await vite.ssrLoadModule("/app/freshness-planner.ts");
  const week = cookbook.weeks[0];
  const chicken = getFreshnessProductsForWeek(week).find((product) => product.productId === "chickenThighs");
  const lots = [{
    id: "lot-chicken-only",
    productId: chicken.productId,
    productName: chicken.productName,
    quantity: chicken.defaultQuantity,
    unit: chicken.unit,
    purchasedOn: "2026-08-31",
    useByDate: "2026-09-02",
  }];

  const optimised = optimiseSchedule({ week, weekStartISO: "2026-08-31", lots });
  assert.equal(optimised.validation.feasible, true);
  assert.equal(optimised.changed, true);
  assert.equal(optimised.validation.issues.some((issue) => issue.code === "missing-lot"), true);
  assert.equal(optimised.validation.allocations.every((allocation) => allocation.mealDate <= "2026-09-02"), true);
});

test("keeps separate packs separate when their use-by dates differ", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const { getFreshnessProductsForWeek, validateSchedule } = await vite.ssrLoadModule("/app/freshness-planner.ts");
  const week = cookbook.weeks[0];
  const products = getFreshnessProductsForWeek(week);
  const lots = products.map((product) => ({
    id: `lot-${product.productId}`,
    productId: product.productId,
    productName: product.productName,
    quantity: product.defaultQuantity,
    unit: product.unit,
    purchasedOn: "2026-08-31",
    useByDate: "2026-09-30",
  }));
  const firstChicken = lots.find((lot) => lot.productId === "chickenThighs");
  firstChicken.quantity = 325;
  firstChicken.useByDate = "2026-09-02";
  lots.push({ ...firstChicken, id: "lot-chicken-thighs-second", quantity: 575, useByDate: "2026-09-05" });

  const evaluation = validateSchedule({ week, weekStartISO: "2026-08-31", lots });
  const chickenAllocations = evaluation.allocations.filter((allocation) => allocation.productId === "chickenThighs");
  assert.equal(chickenAllocations.some((allocation) => allocation.lotId === "lot-chicken-thighs-second"), true);
  assert.equal(Math.round(chickenAllocations.reduce((sum, allocation) => sum + allocation.quantity, 0)), 775);
});

test("warns before manual moves leave a recorded pack window", async () => {
  const plannerSource = await readFile(path.join(root, "app/planner-client.tsx"), "utf8");
  const handoffSource = await readFile(path.join(root, "README.md"), "utf8");

  assert.match(plannerSource, /const evaluation = validateSchedule\(\{ week: activeWeek, weekStartISO: activeWeekInstanceKey, order: currentOrder, lots: activeFreshnessLots \}\)/);
  assert.match(plannerSource, /if \(hasExpiryConflict\(evaluation\)\) \{\s*setPendingMealMove\(\{ order: currentOrder, evaluation \}\)/);
  assert.match(plannerSource, />Move anyway</);
  assert.match(handoffSource, /deterministic application code/);
});

test("presents every week Monday to Sunday, including Week 3", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const { assignedMeals } = await vite.ssrLoadModule("/app/planner-utils.ts");
  const weekThree = assignedMeals(cookbook.weeks[2]);

  assert.deepEqual(weekThree.map(({ displayDay }) => displayDay), [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  ]);
  assert.equal(weekThree[0].recipe.id, "w3-r16");
  assert.equal(weekThree.at(-1).recipe.id, "w3-r15");
});

test("calculates recipe duration and stable, safe shopping identifiers", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const { legacyShoppingItemKey, shoppingItemKey, totalMinutes } = await vite.ssrLoadModule("/app/planner-utils.ts");
  const weekThree = cookbook.weeks[2];
  const roast = weekThree.meals[0];
  const section = weekThree.shopping[0];
  const key = shoppingItemKey(weekThree.number, section.title, section.items[0]);
  const legacyChickenKey = legacyShoppingItemKey(1, "Meat & fish", cookbook.weeks[0].shopping[0].items[1]);
  const legacyEmptyAmountKey = legacyShoppingItemKey(1, "Cupboard & frozen", cookbook.weeks[0].shopping[3].items[3]);

  assert.equal(totalMinutes(roast), 120);
  assert.match(key, /^w3-[a-z0-9-]+$/);
  assert.doesNotMatch(key, /[ &]/);
  assert.equal(key, "w3-meat-fish-beef-mince");
  assert.equal(legacyChickenKey, "w1-meat-fish-chicken-thigh-fillets-900g");
  assert.equal(legacyEmptyAmountKey, "w1-cupboard-frozen-gravy-granules-");
  assert.equal(cookbook.weeks.flatMap((week) => week.shopping.flatMap((section) => section.items)).every((item) => item.id === item.productId && !/[0-9]/.test(item.id)), true);
});

test("renders focused shopping controls and keeps secondary actions available", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const { ShoppingList } = await vite.ssrLoadModule("/app/components/shopping-list.tsx");
  const html = renderToStaticMarkup(
    React.createElement(ShoppingList, {
      week: cookbook.weeks[0],
      checkedItems: new Set(),
      shoppingCategories: {},
      showRemaining: false,
      priceBasis: cookbook.priceBasis,
      onToggleItem() {},
      onMoveItem() {},
      onClearChecked() {},
      onShowRemainingChange() {},
    }),
  );

  assert.match(html, /role="checkbox"/);
  assert.doesNotMatch(html, /role="progressbar"/);
  assert.match(html, /aria-labelledby="shopping-section-w1-meat-fish"/);
  assert.match(html, /Show remaining only/);
  assert.match(html, /Move .+ to another category/);
  assert.match(html, /Estimated shop/);
  assert.match(html, /More shopping actions/);
});

test("persists manual shopping categories alongside the existing planner state", async () => {
  const plannerSource = await readFile(path.join(root, "app/planner-client.tsx"), "utf8");
  const css = await readFile(path.join(root, "app/planner.css"), "utf8");

  assert.match(plannerSource, /shoppingCategories\?: Record<string, string>/);
  assert.match(plannerSource, /setShoppingCategories\(shoppingCategoriesFromSaved\(saved\.shoppingCategories\)\)/);
  assert.match(plannerSource, /shoppingCategories,/);
  assert.match(plannerSource, /category === originalCategory\) delete next\[key\]/);
  const parsed = postcss.parse(css);
  parsed.walkRules((rule) => assert.ok(rule.nodes?.some((node) => node.type === "decl"), `empty CSS rule: ${rule.selector}`));
  assert.equal([...countRuleContexts(css).values()].some((count) => count > 1), false, "duplicate selector/media rule remains");
  assert.doesNotMatch(css, /!important/);
  const shoppingMenu = finalRuleDeclarations(css, ".shopping-category-menu");
  assert.equal(shoppingMenu?.background, "var(--surface-strong)");
  assert.equal(shoppingMenu?.opacity, "1");
  assert.doesNotMatch(css, /\.meal-rating-summary/, "unrated meals no longer show an empty star strip");
  assert.equal(finalRuleDeclarations(css, '.shopping-category-menu [data-slot="dropdown-menu-radio-item"]')?.["min-height"], "44px");
  assert.equal(finalRuleDeclarations(css, ".extra-owned-check")?.["min-height"], "44px");
  assert.equal(finalRuleDeclarations(css, ".share-fallback-url")?.["min-height"], "44px");
});

test("offers a full-width in-page recipe reader and a wider desktop shell", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const { RecipeDetail } = await vite.ssrLoadModule("/app/components/recipe-detail.tsx");
  const plannerSource = await readFile(path.join(root, "app/planner-client.tsx"), "utf8");
  const recipeSource = await readFile(path.join(root, "app/components/recipe-detail.tsx"), "utf8");
  const css = await readFile(path.join(root, "app/planner.css"), "utf8");
  const recipe = cookbook.weeks[0].meals[0];
  const html = renderToStaticMarkup(
    React.createElement(RecipeDetail, {
      recipe,
      titleId: "test-recipe-title",
      isFavourite: false,
      isCooked: false,
      rating: 0,
      onToggleFavourite() {},
      onToggleCooked() {},
      onRate() {},
    }),
  );

  assert.match(html, /Total/);
  assert.match(html, /Portions/);
  assert.doesNotMatch(html, /Back to meals|>Print</);
  assert.match(html, /role="radiogroup"/);
  assert.match(plannerSource, /id="recipe-reader" className="recipe-reader"/);
  assert.match(plannerSource, /className=\{`recipe-reader-toolbar\$\{cookingMode \? " is-cooking" : ""\}`\}/);
  assert.match(plannerSource, /planner\$\{selectedEntry && activeView === "recipes" \? " has-recipe-reader" : ""\}/);
  assert.match(plannerSource, /rating=\{mealRatings\[selectedEntry\.recipe\.id\] \?\? 0\}/);
  assert.match(recipeSource, /recipe-rating-control/);
  assert.match(recipeSource, /loading="eager"[\s\S]*fetchPriority="high"/);
  assert.doesNotMatch(plannerSource, /DialogContent|recipe-fullscreen-dialog|Full screen/);
  assert.equal(finalRuleDeclarations(css, ".planner-shell")?.width, "min(1380px, calc(100% - 48px))");
  assert.equal(finalRuleDeclarations(css, ".recipe-grid", "(min-width: 1400px)")?.["grid-template-columns"], "repeat(3, minmax(0, 1fr))");
  assert.equal(finalRuleDeclarations(css, ".recipe-reader .recipe-detail-body")?.["grid-template-columns"], "minmax(280px, 0.75fr) minmax(420px, 1.25fr)");
  assert.equal(finalRuleDeclarations(css, ".planner.has-recipe-reader .planner-sticky")?.position, "static");
});

test("persists a validated one-to-five star rating for each meal", async () => {
  const plannerSource = await readFile(path.join(root, "app/planner-client.tsx"), "utf8");
  const ratingSource = await readFile(path.join(root, "app/components/meal-rating.tsx"), "utf8");

  assert.match(plannerSource, /mealRatings\?: Record<string, number>/);
  assert.match(plannerSource, /setMealRatings\(mealRatingsFromSaved\(saved\.mealRatings\)\)/);
  assert.match(plannerSource, /mealRatings: \{ \.\.\.mealRatings \}/);
  assert.match(ratingSource, /\[1, 2, 3, 4, 5\]/);
  assert.match(ratingSource, /role="radio"/);
  assert.match(plannerSource, /rating \? <span className="meal-rating-inline">/);
  assert.match(plannerSource, /Rated \{rating\} out of 5/);
});

test("keeps portion basis and cooking instructions aligned", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const recipes = cookbook.weeks.flatMap((week) => week.meals);
  const pork = recipes.find((recipe) => recipe.id === "w1-r3");
  const kievs = recipes.find((recipe) => recipe.id === "w2-r14");
  const roast = recipes.find((recipe) => recipe.id === "w3-r15");

  assert.equal(recipes.every((recipe) => recipe.plates === "2"), true);
  assert.equal(recipes.every((recipe) => recipe.portions.length === 2), true);
  assert.equal(recipes.every((recipe) => recipe.portions.every((portion) => /adult serving/i.test(portion.label))), true);
  assert.doesNotMatch(JSON.stringify(cookbook), /Dad|Mum|Millie|5ft|overweight|inactive|Child portion|kcal/i);
  assert.deepEqual(recipes.filter((recipe) => recipe.day === "Friday").map((recipe) => recipe.name), [
    "Homemade cheeseburgers with potato wedges",
    "Beef and mushroom stroganoff with rice",
    "Creamy chicken and mushroom pasta",
    "Sausage and baked-bean casserole with mash",
  ]);
  assert.doesNotMatch(JSON.stringify(cookbook), /pizza/i);
  assert.equal(recipes.every((recipe) => ["count", "finished", "components"].includes(recipe.portionMode)), true);
  assert.match(pork.ingredients[0], /3 pork chops.*525g raw total/i);
  assert.match(pork.portions[0].detail, /2 chops.*mash/i);
  assert.match(pork.portionNote, /plate by count.*2 for the larger adult.*1 for the smaller adult/i);
  assert.match(kievs.method.at(-1), /one Kiev to each adult/i);
  assert.match(roast.ingredients[0], /1\.7–2\.1kg raw.*300g cooked meat/i);
  assert.match(roast.portions[0].detail, /cooked chicken/i);
});

test("keeps the recipe reader responsive alongside dark mode and print rules", async () => {
  const css = await readFile(path.join(root, "app/planner.css"), "utf8");
  const globalCss = await readFile(path.join(root, "app/globals.css"), "utf8");
  const printCss = await readFile(path.join(root, "app/print.css"), "utf8");
  const layoutSource = await readFile(path.join(root, "app/layout.tsx"), "utf8");
  const manifest = await readFile(path.join(root, "public/manifest.webmanifest"), "utf8");

  assert.equal(finalRuleDeclarations(css, ".recipe-grid", "(max-width: 1180px)")?.["grid-template-columns"], "repeat(2, minmax(0, 1fr))");
  assert.equal(finalRuleDeclarations(css, ".recipe-grid", "(max-width: 780px)")?.["grid-template-columns"], "1fr");
  assert.equal(finalRuleDeclarations(css, ".recipe-reader .recipe-detail-media")?.height, "clamp(200px, 28vw, 320px)");
  assert.equal(finalRuleDeclarations(css, ".recipe-reader .recipe-detail-media")?.["aspect-ratio"], "auto");
  assert.doesNotMatch(css, /\.mobile-recipe-detail|\.desktop-recipe-detail|\.recipe-fullscreen-dialog/);
  const darkTheme = finalRuleDeclarations(globalCss, ':root[data-theme="dark"]');
  assert.deepEqual({
    paper: darkTheme?.["--paper"],
    surface: darkTheme?.["--surface"],
    surfaceStrong: darkTheme?.["--surface-strong"],
    surfaceSoft: darkTheme?.["--surface-soft"],
    ink: darkTheme?.["--ink"],
    inkMuted: darkTheme?.["--ink-muted"],
    action: darkTheme?.["--action"],
    actionStrong: darkTheme?.["--action-strong"],
    actionSoft: darkTheme?.["--action-soft"],
    positive: darkTheme?.["--positive"],
    highlight: darkTheme?.["--highlight"],
    line: darkTheme?.["--line"],
    lineStrong: darkTheme?.["--line-strong"],
    inverseSurface: darkTheme?.["--inverse-surface"],
    activeFill: darkTheme?.["--active-fill"],
    activeBorder: darkTheme?.["--active-border"],
    brandMarkBg: darkTheme?.["--brand-mark-bg"],
    brandMarkInk: darkTheme?.["--brand-mark-ink"],
    primaryForeground: darkTheme?.["--primary-foreground"],
    focusRing: darkTheme?.["--focus-ring"],
  }, {
    paper: "#171311",
    surface: "#241d1a",
    surfaceStrong: "#302621",
    surfaceSoft: "#3a2f28",
    ink: "#f4ece1",
    inkMuted: "#bcae9f",
    action: "#d2a568",
    actionStrong: "#f0ce98",
    actionSoft: "#493724",
    positive: "#b9c79f",
    highlight: "#e9b853",
    line: "#57483f",
    lineStrong: "#7a6759",
    inverseSurface: "#34222a",
    activeFill: "#4a3a2a",
    activeBorder: "#d2a568",
    brandMarkBg: "#d2a568",
    brandMarkInk: "#1f1714",
    primaryForeground: "#1f1714",
    focusRing: "#f0ce98",
  });
  assert.doesNotMatch(globalCss + css, /--(?:tomato|sage|yellow|deep-navy|hero-base)\b/, "tokens are named by role, not by an old colour");
  assert.equal(finalRuleDeclarations(globalCss, ":root")?.["--action"], "#6b3352", "light-mode primary is aubergine");
  assert.equal(finalRuleDeclarations(css, "::selection")?.color, "var(--selection-ink)");
  assert.match(layoutSource, /media="\(prefers-color-scheme: dark\)" content="#171311"/);
  assert.match(manifest, /"theme_color": "#f1eadf"/);
  const printRoot = postcss.parse(printCss);
  assert.equal(printRoot.nodes.some((node) => node.type === "atrule" && node.name === "media" && node.params === "print"), true);
  assert.doesNotMatch(css + globalCss, /\.guide-(intro|layout|card)/);
  assert.doesNotMatch(css + globalCss, /\.loading-card/);
});

test("uses a fully contained 44px-high theme control with one visual positioning system", async () => {
  const css = await readFile(path.join(root, "app/planner.css"), "utf8");
  const globalCss = await readFile(path.join(root, "app/globals.css"), "utf8");

  const themeSwitch = finalRuleDeclarations(css, ".theme-switch");
  assert.equal(themeSwitch?.width, "84px");
  assert.equal(themeSwitch?.height, "44px");
  assert.equal(themeSwitch?.opacity, "0");
  assert.doesNotMatch(css, /\.theme-switch::before|\.compact-switch \[data-slot="switch"\]::before/);
  assert.equal(finalRuleDeclarations(css, '.theme-switch [data-slot="switch-thumb"]')?.display, "none");
  const themeVisual = finalRuleDeclarations(css, ".theme-switch-visual");
  assert.equal(themeVisual?.width, "84px");
  assert.equal(themeVisual?.height, "44px");
  assert.equal(themeVisual?.overflow, "hidden");
  const themeDisk = finalRuleDeclarations(css, ".theme-switch-disk");
  assert.equal(themeDisk?.left, "6px");
  assert.equal(themeDisk?.width, "32px");
  assert.equal(themeDisk?.height, "32px");
  assert.equal(finalRuleDeclarations(css, ".theme-switch-visual.is-dark .theme-switch-disk")?.left, "42px");
  assert.equal(finalRuleDeclarations(css, '.week-tab[data-state="active"]')?.background, "var(--active-fill)");
  assert.equal(finalRuleDeclarations(globalCss, ":root")?.["--active-fill"], "#2d2025");
  assert.equal(finalRuleDeclarations(css, ".theme-control")?.["grid-template-columns"], "auto 84px");
});

test("uses restrained keylines for planner structure and active controls", async () => {
  const css = await readFile(path.join(root, "app/planner.css"), "utf8");

  assert.equal(finalRuleDeclarations(css, ".week-tabs-list")?.border, "1px solid var(--line-strong)");
  assert.match(finalRuleDeclarations(css, ".week-tabs-list")?.["box-shadow"] ?? "", /inset 0 1px 0/);
  assert.equal(finalRuleDeclarations(css, '.week-tab[data-state="active"]')?.["border-color"], "var(--active-border)");
  assert.match(finalRuleDeclarations(css, '.week-tab[data-state="active"]')?.["box-shadow"] ?? "", /inset 0 0 0 1px/);
  assert.equal(finalRuleDeclarations(css, ".view-tabs-list")?.border, "1px solid var(--line-strong)");
  assert.equal(finalRuleDeclarations(css, ".view-tab")?.border, "1px solid transparent");
  assert.equal(finalRuleDeclarations(css, '.view-tab[data-state="active"]')?.["border-color"], "var(--active-border)");
  assert.equal(finalRuleDeclarations(css, ".planner-sticky")?.border, "1px solid var(--line-strong)");
  assert.equal(finalRuleDeclarations(css, ".plan-content")?.border, "1px solid var(--line-strong)");
  assert.equal(finalRuleDeclarations(css, ".shopping-tools")?.border, "1px solid var(--line-strong)");
  assert.equal(finalRuleDeclarations(css, ".shopping-section")?.border, "1px solid var(--line-strong)");
});

test("anchors the four-week cycle and removes the redundant weekday rail", async () => {
  const { PLAN_CYCLE_START, cyclePosition, cycleDateRange } = await vite.ssrLoadModule("/app/planner-client.tsx");
  const plannerSource = await readFile(path.join(root, "app/planner-client.tsx"), "utf8");
  const css = await readFile(path.join(root, "app/planner.css"), "utf8");

  assert.equal(PLAN_CYCLE_START, "2026-08-31");
  assert.deepEqual(cyclePosition(PLAN_CYCLE_START, "2026-09-07"), { weekIndex: 1, cycleIndex: 0 });
  assert.deepEqual(cyclePosition(PLAN_CYCLE_START, "2026-09-14"), { weekIndex: 2, cycleIndex: 0 });
  assert.deepEqual(cyclePosition(PLAN_CYCLE_START, "2026-09-21"), { weekIndex: 3, cycleIndex: 0 });
  assert.deepEqual(cyclePosition(PLAN_CYCLE_START, "2026-09-28"), { weekIndex: 0, cycleIndex: 1 });
  assert.equal(cycleDateRange(PLAN_CYCLE_START, 0, 1), "28 September–4 October");
  assert.match(plannerSource, /setInterval\(refreshToday, 60_000\)/);
  assert.doesNotMatch(plannerSource, /cycleStartDate|calendar-rail|calendar-days|calendar-day|openCalendarMeal|activeCalendarEntries/);
  assert.doesNotMatch(css, /\.calendar-(?:rail|days|day)/);
  assert.equal(finalRuleDeclarations(css, ".recipe-grid", "(max-width: 780px)")?.["grid-template-columns"], "1fr");
});

test("starts on the current cycle week before client hydration", async () => {
  const { initialWeekIndexForDate } = await vite.ssrLoadModule("/app/planner-client.tsx");
  const plannerSource = await readFile(path.join(root, "app/planner-client.tsx"), "utf8");

  assert.equal(initialWeekIndexForDate("2026-09-07"), 1);
  assert.equal(initialWeekIndexForDate("2026-09-28"), 0);
  assert.match(plannerSource, /useState\(\(\) => initialWeekIndexForDate\(\)\)/);
});

test("keeps all meal imagery local, responsive and on-demand cacheable", async () => {
  const { mealImages } = await vite.ssrLoadModule("/app/meal-images.ts");
  const serviceWorker = await readFile(path.join(root, "public/sw.js"), "utf8");

  assert.equal(Object.keys(mealImages).length, 28);
  const dishImageNumbers = { 5: 11, 12: 19, 20: 8, 26: 18 };
  for (const recipeNumber of Object.keys(mealImages).map(Number)) {
    const image = mealImages[recipeNumber];
    const imageNumber = dishImageNumbers[recipeNumber] ?? recipeNumber;
    assert.match(image.src, new RegExp(`/meals/meal-${String(imageNumber).padStart(2, "0")}-1200\\.jpg$`));
    assert.match(image.srcSet, /\/meals\/meal-\d{2}-320\.webp 320w, \/meals\/meal-\d{2}-480\.webp 480w/);
    assert.match(image.fallbackSrcSet, /\/meals\/meal-\d{2}-320\.jpg 320w, \/meals\/meal-\d{2}-480\.jpg 480w/);
    assert.match(image.sizes, /max-width: 780px.*100vw.*min-width: 1400px.*33vw/);
    assert.doesNotMatch(image.src + image.srcSet + image.fallbackSrcSet, /https?:/);
    for (const file of [image.src, ...image.srcSet.split(", ").map((entry) => entry.split(" ")[0]), ...image.fallbackSrcSet.split(", ").map((entry) => entry.split(" ")[0])]) {
      await readFile(path.join(root, "public", file.slice(1)));
    }
  }
  assert.match(serviceWorker, /sharon-meal-plan-v2/);
  assert.match(serviceWorker, /const isImageRequest/);
  assert.match(serviceWorker, /if \(cached\) return cached;/);
  assert.match(serviceWorker, /cacheResponse\(cache, event\.request, await fetch\(event\.request\), event\)/);
  assert.match(serviceWorker, /event\.waitUntil\(cache\.put\(request, response\.clone\(\)\)/);
  assert.doesNotMatch(serviceWorker, /MEAL_ASSETS|\/meals\/meal-/);
});

test("serves a cached meal image without a second network request", async () => {
  const serviceWorker = await readFile(path.join(root, "public/sw.js"), "utf8");
  const handlers = {};
  const cachedResponses = new Map();
  let installedAssets = [];
  let networkRequests = 0;
  const cache = {
    addAll(assets) {
      installedAssets = assets;
      return Promise.resolve();
    },
    match(request) {
      return Promise.resolve(cachedResponses.get(request.url) ?? null);
    },
    put(request, response) {
      cachedResponses.set(request.url, response);
      return Promise.resolve();
    },
  };

  runInNewContext(serviceWorker, {
    Response,
    URL,
    caches: {
      open: async () => cache,
      keys: async () => [],
      delete: async () => true,
    },
    fetch: async () => {
      networkRequests += 1;
      return new Response("meal image", { status: 200 });
    },
    self: {
      addEventListener(name, handler) {
        handlers[name] = handler;
      },
      clients: { claim() {} },
      location: { origin: "https://mealplan.example" },
      skipWaiting() {},
    },
  });

  const installWaits = [];
  handlers.install({ waitUntil(promise) { installWaits.push(promise); } });
  await Promise.all(installWaits);
  assert.deepEqual(Array.from(installedAssets), [
    "/",
    "/manifest.webmanifest",
    "/favicon.svg",
    "/family-dinner-hero-720.webp",
    "/family-dinner-hero-720.avif",
  ]);

  const request = {
    method: "GET",
    mode: "no-cors",
    destination: "image",
    url: "https://mealplan.example/meals/meal-01-320.webp",
  };
  const firstWaits = [];
  let firstResponse;
  handlers.fetch({
    request,
    respondWith(promise) { firstResponse = promise; },
    waitUntil(promise) { firstWaits.push(promise); },
  });
  assert.equal((await firstResponse).status, 200);
  await Promise.all(firstWaits);
  assert.equal(networkRequests, 1);
  assert.equal(cachedResponses.has(request.url), true);

  let secondResponse;
  handlers.fetch({
    request,
    respondWith(promise) { secondResponse = promise; },
    waitUntil() {},
  });
  assert.equal((await secondResponse).status, 200);
  assert.equal(networkRequests, 1);
});

test("keeps the service worker free of obsolete API handling", async () => {
  const serviceWorker = await readFile(path.join(root, "public/sw.js"), "utf8");
  assert.doesNotMatch(serviceWorker, /\/api\//);
  assert.doesNotMatch(serviceWorker, /isApiRequest/);
  assert.match(serviceWorker, /const isImageRequest/);
  assert.match(serviceWorker, /offlineResponse/);
  assert.match(serviceWorker, /request\.mode === "navigate"/);
});

test("keeps recipe search and ordinary sharing messaging accessible", async () => {
  const plannerSource = await readFile(path.join(root, "app/planner-client.tsx"), "utf8");
  const css = await readFile(path.join(root, "app/planner.css"), "utf8");
  const shareStart = plannerSource.indexOf("const shareCurrent");
  const shareBlock = plannerSource.slice(shareStart, plannerSource.indexOf("const toggleMethodStep", shareStart));

  assert.doesNotMatch(plannerSource, /<label className="search-field"/);
  assert.match(plannerSource, /placeholder="Search all four weeks by dish or ingredient"/);
  assert.doesNotMatch(plannerSource, /recipe-search-help/, "the placeholder already explains search");
  assert.match(plannerSource, /query \? "Search results" : "This week's dinners"/);
  assert.match(shareBlock, /setShareError\(""\);\s*setShareFallbackUrl\(""\);/);
  assert.match(shareBlock, /await navigator\.clipboard\.writeText[\s\S]*?setShareError\(""\);/);
  assert.match(shareBlock, /shareUrl\.searchParams\.delete\("family"\)/);
  assert.match(css, /\.results-note\s*\{[\s\S]*overflow-wrap:\s*anywhere/);
});

test("persists planner and UI state in one local browser record", async () => {
  const plannerSource = await readFile(path.join(root, "app/planner-client.tsx"), "utf8");

  assert.match(plannerSource, /const STORAGE_KEY = "mealplan-local-state-v1"/);
  assert.match(plannerSource, /window\.localStorage\.getItem\(STORAGE_KEY\)/);
  assert.match(plannerSource, /window\.localStorage\.setItem\(STORAGE_KEY/);
  assert.match(plannerSource, /persistLocalState\(currentLocalState\)/);
  for (const field of [
    "activeWeekIndex",
    "activeView",
    "selectedRecipeId",
    "theme",
    "showRemaining",
    "checkedItems",
    "cookedRecipeIds",
    "favouriteRecipeIds",
    "mealOrders",
    "shoppingCategories",
    "mealRatings",
    "extraShoppingItems",
    "methodProgress",
    "freshnessLots",
  ]) {
    assert.match(plannerSource, new RegExp(`\\b${field}\\b`), `missing persisted field: ${field}`);
  }
});

test("resets cooking mode whenever the selected recipe changes", async () => {
  const plannerSource = await readFile(path.join(root, "app/planner-client.tsx"), "utf8");
  const selectionBlock = plannerSource.slice(plannerSource.indexOf("const changeWeek"), plannerSource.indexOf("const toggleSetValue"));

  assert.match(selectionBlock, /const selectRecipe[\s\S]*?setCookingMode\(false\);[\s\S]*?setSelectedRecipeId/);
  assert.match(selectionBlock, /const closeRecipe[\s\S]*?setSelectedRecipeId\(null\);\s*setCookingMode\(false\);/);
  assert.match(plannerSource, /setCookingMode\(false\);\s*setQuery\(""\);/);
});

test("makes cooking mode usable at the hob", async () => {
  const { cookbook } = await vite.ssrLoadModule("/app/cookbook-data.ts");
  const { RecipeDetail } = await vite.ssrLoadModule("/app/components/recipe-detail.tsx");
  const plannerSource = await readFile(path.join(root, "app/planner-client.tsx"), "utf8");
  const recipe = cookbook.weeks[0].meals[3];
  const render = (completedSteps, isCooked = false) => renderToStaticMarkup(React.createElement(RecipeDetail, {
    recipe, titleId: "t", isFavourite: false, isCooked, rating: 0, cookingMode: true, completedSteps,
    onToggleFavourite() {}, onToggleCooked() {}, onRate() {},
  }));

  const midway = render(new Set([0, 1]));
  assert.match(midway, /class="is-next" aria-current="step"/);
  assert.equal((midway.match(/class="ingredient-check"/g) ?? []).length, recipe.ingredients.length);
  assert.doesNotMatch(midway, /cooking-finish/);
  const finished = render(new Set(recipe.method.map((_, index) => index)));
  assert.match(finished, /Dinner&#x27;s up\.[\s\S]*Mark cooked/);
  assert.match(finished, /role="radiogroup"/);
  assert.match(render(new Set(recipe.method.map((_, index) => index)), true), /Marked as cooked/);
  assert.match(plannerSource, /navigator\.wakeLock\.request\("screen"\)/);
  assert.match(plannerSource, /visibilitychange/);
});
