import type {
  Cookbook,
  RecipeCostLine,
  ShoppingItem,
  ShoppingSection,
} from "./cookbook-data";

export type ProductUnit = "g" | "ml" | "each";

export interface MorrisonsProduct {
  id: string;
  name: string;
  packSize: string;
  packQuantity: number;
  unit: ProductUnit;
  packPricePence: number;
}

export interface RecipeUse {
  productId: keyof typeof morrisonsProducts;
  quantity: number;
  quantityLabel: string;
  note?: string;
}

export interface RecipePricing {
  uses: RecipeUse[];
  note?: string;
  status?: "verified" | "estimated";
}

export const morrisonsProducts = {
  sausages: { id: "sausages", name: "Morrisons Butcher's Style 8 Pork Sausages", packSize: "454g", packQuantity: 454, unit: "g", packPricePence: 179 },
  chickenThighs: { id: "chicken-thighs", name: "Shazans Chicken Thigh Fillets", packSize: "1kg", packQuantity: 1000, unit: "g", packPricePence: 725 },
  chickenBreast: { id: "chicken-breast", name: "Shazans Chicken Breast Fillets", packSize: "650g", packQuantity: 650, unit: "g", packPricePence: 585 },
  porkChops: { id: "pork-chops", name: "Morrisons British Pork Chops", packSize: "about 700g / 4 pack", packQuantity: 700, unit: "g", packPricePence: 599 },
  cookedHam: { id: "cooked-ham", name: "Morrisons The Best Wiltshire Cured Ham", packSize: "400g", packQuantity: 400, unit: "g", packPricePence: 399 },
  beefMince: { id: "beef-mince", name: "Morrisons British Beef Mince 15% Fat", packSize: "500g", packQuantity: 500, unit: "g", packPricePence: 500 },
  fishFingers: { id: "fish-fingers", name: "Birds Eye 20 Omega 3 Fish Fingers", packSize: "20 pack / 560g", packQuantity: 20, unit: "each", packPricePence: 450 },
  backBacon: { id: "back-bacon", name: "Morrisons The Best Unsmoked Back Bacon", packSize: "300g", packQuantity: 300, unit: "g", packPricePence: 325 },
  chickenKievs: { id: "chicken-kievs", name: "Birds Eye Garlic & Herb Chicken Kievs", packSize: "2 pack / 204g", packQuantity: 2, unit: "each", packPricePence: 350 },
  wholeChicken: { id: "whole-chicken", name: "Morrisons British Large Whole Chicken", packSize: "1.7–2.1kg / typical pack", packQuantity: 1900, unit: "g", packPricePence: 800 },
  dicedBeef: { id: "diced-beef", name: "Morrisons British Diced Beef", packSize: "400g", packQuantity: 400, unit: "g", packPricePence: 600 },
  gammonSteaks: { id: "gammon-steaks", name: "Morrisons The Best Gammon Steaks", packSize: "4 steaks / about 600g", packQuantity: 4, unit: "each", packPricePence: 550 },
  onions: { id: "onions", name: "Morrisons British Brown Onions", packSize: "1kg", packQuantity: 1000, unit: "g", packPricePence: 129 },
  potatoes: { id: "potatoes", name: "Morrisons British White Potatoes", packSize: "2kg", packQuantity: 2000, unit: "g", packPricePence: 230 },
  peppers: { id: "peppers", name: "Morrisons Sweet Peppers", packSize: "3 pack / about 500g", packQuantity: 3, unit: "each", packPricePence: 250 },
  mushrooms: { id: "mushrooms", name: "Morrisons Closed Cup Mushrooms", packSize: "400g", packQuantity: 400, unit: "g", packPricePence: 175 },
  wraps: { id: "wraps", name: "Old El Paso Original Wraps", packSize: "8 pack", packQuantity: 8, unit: "each", packPricePence: 275 },
  garlic: { id: "garlic", name: "Morrisons Garlic", packSize: "4 bulbs", packQuantity: 40, unit: "each", packPricePence: 99 },
  carrots: { id: "carrots", name: "Morrisons British Carrots", packSize: "1kg", packQuantity: 1000, unit: "g", packPricePence: 85 },
  burgerBuns: { id: "burger-buns", name: "Warburtons Brioche Burger Buns", packSize: "4 pack", packQuantity: 4, unit: "each", packPricePence: 220 },
  broccoli: { id: "broccoli", name: "Morrisons Broccoli", packSize: "375g", packQuantity: 375, unit: "g", packPricePence: 125 },
  mozzarella: { id: "mozzarella", name: "Galbani Mozzarella", packSize: "125g drained", packQuantity: 125, unit: "g", packPricePence: 180 },
  puffPastry: { id: "puff-pastry", name: "Jus-Rol Ready Rolled Puff Pastry", packSize: "320g", packQuantity: 320, unit: "g", packPricePence: 225 },
  eggs: { id: "eggs", name: "Clarence Court Free Range Eggs", packSize: "6 pack", packQuantity: 6, unit: "each", packPricePence: 280 },
  spread: { id: "spread", name: "Lurpak Slightly Salted Spreadable", packSize: "400g", packQuantity: 400, unit: "g", packPricePence: 425 },
  softCheese: { id: "soft-cheese", name: "Philadelphia Original Soft Cheese", packSize: "280g", packQuantity: 280, unit: "g", packPricePence: 325 },
  cheddar: { id: "cheddar", name: "Cathedral City Grated Mature Cheddar", packSize: "180g", packQuantity: 180, unit: "g", packPricePence: 255 },
  milk: { id: "milk", name: "Cravendale Semi Skimmed Milk", packSize: "2 litres", packQuantity: 2000, unit: "ml", packPricePence: 225 },
  peas: { id: "peas", name: "Birds Eye Garden Peas", packSize: "900g", packQuantity: 900, unit: "g", packPricePence: 250 },
  longGrainRice: { id: "long-grain-rice", name: "Ben's Original Long Grain Rice", packSize: "450g", packQuantity: 450, unit: "g", packPricePence: 175 },
  gnocchi: { id: "gnocchi", name: "Giovanni Rana Potato Gnocchi", packSize: "2 × 500g", packQuantity: 1000, unit: "g", packPricePence: 550 },
  gravy: { id: "gravy", name: "Bisto Best Beef Gravy Granules", packSize: "230g", packQuantity: 230, unit: "g", packPricePence: 300 },
  honey: { id: "honey", name: "Rowse Clear Honey", packSize: "340g", packQuantity: 340, unit: "g", packPricePence: 350 },
  soySauce: { id: "soy-sauce", name: "Kikkoman Soy Sauce", packSize: "150ml", packQuantity: 150, unit: "ml", packPricePence: 250 },
  oil: { id: "oil", name: "Napolina Light in Colour Olive Oil", packSize: "1 litre", packQuantity: 1000, unit: "ml", packPricePence: 650 },
  fusilli: { id: "fusilli", name: "Napolina Fusilli Pasta", packSize: "500g", packQuantity: 500, unit: "g", packPricePence: 160 },
  choppedTomatoes: { id: "chopped-tomatoes", name: "Napolina Chopped Tomatoes", packSize: "4 × 400g", packQuantity: 1600, unit: "g", packPricePence: 350 },
  flour: { id: "flour", name: "Homepride Plain Flour", packSize: "1.1kg", packQuantity: 1100, unit: "g", packPricePence: 220 },
  mixedHerbs: { id: "mixed-herbs", name: "Schwartz Mixed Herbs", packSize: "13g", packQuantity: 13, unit: "g", packPricePence: 225 },
  stockCubes: { id: "stock-cubes", name: "Knorr Vegetable Stock Cubes", packSize: "10 pack", packQuantity: 10, unit: "each", packPricePence: 225 },
  bakedBeans: { id: "baked-beans", name: "Heinz Baked Beans in Tomato Sauce", packSize: "415g tin", packQuantity: 415, unit: "g", packPricePence: 155 },
  lasagne: { id: "lasagne", name: "Garofalo Lasagne Sheets", packSize: "500g", packQuantity: 500, unit: "g", packPricePence: 250 },
  risottoRice: { id: "risotto-rice", name: "Riso Gallo Arborio Risotto Rice", packSize: "1kg", packQuantity: 1000, unit: "g", packPricePence: 400 },
  mixedVegetables: { id: "mixed-vegetables", name: "Birds Eye Mixed Vegetables", packSize: "1kg", packQuantity: 1000, unit: "g", packPricePence: 275 },
  yorkshires: { id: "yorkshires", name: "Aunt Bessie's Yorkshire Puddings", packSize: "15 pack / 230g", packQuantity: 15, unit: "each", packPricePence: 250 },
  spaghetti: { id: "spaghetti", name: "Barilla Spaghetti", packSize: "500g", packQuantity: 500, unit: "g", packPricePence: 160 },
  macaroni: { id: "macaroni", name: "Napolina Macaroni Pasta", packSize: "500g", packQuantity: 500, unit: "g", packPricePence: 160 },
  breadcrumbs: { id: "breadcrumbs", name: "Paxo Golden Breadcrumbs", packSize: "227g", packQuantity: 227, unit: "g", packPricePence: 180 },
  garlicBaguettes: { id: "garlic-baguettes", name: "Chicago Town Garlic Baguettes", packSize: "2 pack / 338g", packQuantity: 2, unit: "each", packPricePence: 250 },
} as const satisfies Record<string, MorrisonsProduct>;

export type MorrisonsProductId = keyof typeof morrisonsProducts;
export type MorrisonsProductCatalog = Record<MorrisonsProductId, MorrisonsProduct>;

export type MorrisonsStorageClass = "fresh" | "chilled" | "frozen" | "ambient";

// Fresh and chilled products are bought again in every week where a recipe uses them.
// Frozen, canned, dry and cupboard products may be carried forward when the plan says so.
export const morrisonsProductStorage = {
  sausages: "chilled",
  chickenThighs: "fresh",
  chickenBreast: "fresh",
  porkChops: "fresh",
  cookedHam: "chilled",
  beefMince: "fresh",
  fishFingers: "frozen",
  backBacon: "chilled",
  chickenKievs: "frozen",
  wholeChicken: "fresh",
  dicedBeef: "fresh",
  gammonSteaks: "chilled",
  onions: "fresh",
  potatoes: "fresh",
  peppers: "fresh",
  mushrooms: "fresh",
  wraps: "fresh",
  garlic: "fresh",
  carrots: "fresh",
  burgerBuns: "fresh",
  broccoli: "fresh",
  mozzarella: "chilled",
  puffPastry: "chilled",
  eggs: "chilled",
  spread: "chilled",
  softCheese: "chilled",
  cheddar: "chilled",
  milk: "chilled",
  peas: "frozen",
  longGrainRice: "ambient",
  gnocchi: "chilled",
  gravy: "ambient",
  honey: "ambient",
  soySauce: "ambient",
  oil: "ambient",
  fusilli: "ambient",
  choppedTomatoes: "ambient",
  flour: "ambient",
  mixedHerbs: "ambient",
  stockCubes: "ambient",
  bakedBeans: "ambient",
  lasagne: "ambient",
  risottoRice: "ambient",
  mixedVegetables: "frozen",
  yorkshires: "frozen",
  spaghetti: "ambient",
  macaroni: "ambient",
  breadcrumbs: "ambient",
  garlicBaguettes: "frozen",
} as const satisfies Record<MorrisonsProductId, MorrisonsStorageClass>;

export const nonCarryableProductIds = new Set<MorrisonsProductId>(
  Object.entries(morrisonsProductStorage)
    .filter(([, storage]) => storage === "fresh" || storage === "chilled")
    .map(([productId]) => productId as MorrisonsProductId),
);

const costedUse = (productId: MorrisonsProductId, quantity: number, quantityLabel: string, note?: string): RecipeUse => ({
  productId,
  quantity,
  quantityLabel,
  note,
});

export const recipePricing: Record<string, RecipePricing> = {
  "w1-r1": { uses: [costedUse("sausages", 400, "400g"), costedUse("potatoes", 800, "800g"), costedUse("peas", 200, "200g"), costedUse("onions", 100, "1 medium onion / 100g", "Costed at 100g per medium onion."), costedUse("milk", 100, "100ml"), costedUse("spread", 25, "25g"), costedUse("gravy", 20, "20g"), costedUse("oil", 15, "1 tbsp / 15ml")] },
  "w1-r2": { uses: [costedUse("chickenThighs", 325, "325g"), costedUse("wraps", 3, "3 wraps"), costedUse("peppers", 2, "2 of 3 peppers"), costedUse("onions", 100, "1 medium onion / 100g", "Costed at 100g per medium onion."), costedUse("cheddar", 120, "120g"), costedUse("potatoes", 600, "600g"), costedUse("oil", 30, "2 tbsp / 30ml")] },
  "w1-r3": { uses: [costedUse("porkChops", 525, "3 chops / about 525g"), costedUse("potatoes", 750, "750g"), costedUse("milk", 75, "75ml"), costedUse("spread", 20, "20g"), costedUse("gravy", 20, "20g")] },
  "w1-r4": { uses: [costedUse("chickenThighs", 450, "450g"), costedUse("longGrainRice", 220, "220g"), costedUse("eggs", 2, "2 eggs"), costedUse("peas", 120, "120g"), costedUse("garlic", 2, "2 cloves", "Four bulbs are costed as an estimated 40 cloves."), costedUse("soySauce", 30, "2 tbsp / 30ml"), costedUse("honey", 42, "2 tbsp / about 42g"), costedUse("oil", 23, "1½ tbsp / 23ml")] },
  "w1-r5": { uses: [costedUse("beefMince", 400, "400g"), costedUse("burgerBuns", 2, "2 buns"), costedUse("cheddar", 80, "80g"), costedUse("onions", 75, "1 small onion / about 75g"), costedUse("potatoes", 600, "600g"), costedUse("oil", 23, "1½ tbsp / 23ml")] },
  "w1-r6": { uses: [costedUse("chickenBreast", 500, "500g"), costedUse("gnocchi", 700, "700g"), costedUse("mushrooms", 300, "300g"), costedUse("softCheese", 150, "150g"), costedUse("milk", 100, "100ml"), costedUse("garlic", 2, "2 cloves", "Four bulbs are costed as an estimated 40 cloves."), costedUse("oil", 15, "1 tbsp / 15ml")] },
  "w1-r7": { uses: [costedUse("eggs", 6, "6 eggs"), costedUse("cookedHam", 250, "250g"), costedUse("cheddar", 120, "120g"), costedUse("potatoes", 600, "600g"), costedUse("peas", 150, "150g"), costedUse("oil", 30, "2 tbsp / 30ml")] },
  "w2-r8": { uses: [costedUse("chickenBreast", 500, "500g"), costedUse("fusilli", 300, "300g"), costedUse("mushrooms", 300, "300g"), costedUse("softCheese", 150, "150g"), costedUse("milk", 100, "100ml", "Bought in the Week 2 shop; only the amount used is attributed to this recipe."), costedUse("garlic", 2, "2 cloves", "Bought in the Week 2 shop; four bulbs are costed as an estimated 40 cloves."), costedUse("oil", 15, "1 tbsp / 15ml")] },
  "w2-r9": { uses: [costedUse("sausages", 350, "350g"), costedUse("potatoes", 650, "650g"), costedUse("carrots", 150, "150g"), costedUse("peppers", 1, "1 of 3 peppers", "Bought in the Week 2 shop; one pepper is used here."), costedUse("onions", 100, "1 medium onion / 100g"), costedUse("mixedHerbs", 2, "2 tsp / about 2g"), costedUse("oil", 30, "2 tbsp / 30ml")] },
  "w2-r10": { uses: [costedUse("fishFingers", 12, "12 of 20 fish fingers", "The other 8 remain in the freezer; the full pack price is paid at checkout."), costedUse("potatoes", 750, "750g"), costedUse("peas", 200, "200g"), costedUse("oil", 30, "2 tbsp / 30ml")] },
  "w2-r11": { uses: [costedUse("beefMince", 400, "400g"), costedUse("burgerBuns", 2, "2 buns"), costedUse("cheddar", 80, "80g"), costedUse("onions", 75, "1 small onion / about 75g"), costedUse("potatoes", 600, "600g"), costedUse("oil", 23, "1½ tbsp / 23ml")] },
  "w2-r12": { uses: [costedUse("dicedBeef", 400, "400g"), costedUse("longGrainRice", 250, "250g"), costedUse("mushrooms", 300, "300g"), costedUse("onions", 100, "1 medium onion / 100g"), costedUse("softCheese", 150, "150g"), costedUse("milk", 100, "100ml"), costedUse("garlic", 2, "2 cloves"), costedUse("oil", 15, "1 tbsp / 15ml")] },
  "w2-r13": { uses: [costedUse("backBacon", 250, "250g"), costedUse("fusilli", 300, "300g"), costedUse("choppedTomatoes", 400, "1 × 400g tin"), costedUse("onions", 100, "1 medium onion / 100g"), costedUse("cheddar", 120, "120g"), costedUse("milk", 350, "350ml", "Bought in the Week 2 shop; only the amount used is attributed to this recipe."), costedUse("flour", 30, "30g"), costedUse("spread", 30, "30g")] },
  "w2-r14": { uses: [costedUse("chickenKievs", 2, "whole 2-Kiev pack"), costedUse("potatoes", 600, "600g"), costedUse("peas", 200, "200g"), costedUse("milk", 75, "75ml", "Bought in the Week 2 shop; only the amount used is attributed to this recipe."), costedUse("spread", 20, "20g")] },
  "w3-r15": { status: "estimated", note: "The chicken is sold in a 1.7–2.1kg variable-weight pack. This estimate uses a typical 1.9kg pack allocation, with 300g of cooked meat reserved for the planned risotto. Actual edible yield and shelf price will vary.", uses: [costedUse("wholeChicken", 1600, "estimated 1.6kg allocation", "The remaining 300g allocation is included in the planned Week 3 risotto cost."), costedUse("potatoes", 800, "800g"), costedUse("carrots", 300, "300g"), costedUse("broccoli", 300, "300g"), costedUse("yorkshires", 4, "4 of 15 puddings"), costedUse("gravy", 25, "25g"), costedUse("oil", 30, "2 tbsp / 30ml")] },
  "w3-r16": { status: "estimated", note: "This 300g cooked chicken allocation is part of the Week 3 whole-bird purchase and is costed here. Because cooked meat, bones and moisture loss do not map exactly to the labelled raw weight, this line remains an estimate.", uses: [costedUse("wholeChicken", 300, "300g allocation from the Week 3 whole-bird purchase", "Allocated from the Week 3 roast purchase and included in this recipe cost."), costedUse("risottoRice", 250, "250g"), costedUse("mixedVegetables", 250, "250g"), costedUse("onions", 100, "1 medium onion / 100g"), costedUse("cheddar", 50, "50g"), costedUse("stockCubes", 1, "1 of 10 stock cubes"), costedUse("oil", 15, "1 tbsp / 15ml")] },
  "w3-r17": { uses: [costedUse("beefMince", 400, "400g"), costedUse("lasagne", 200, "200g"), costedUse("choppedTomatoes", 400, "1 × 400g tin", "The remaining tins are carried forward from Week 2 but are not counted again at checkout."), costedUse("onions", 100, "1 medium onion / 100g"), costedUse("carrots", 150, "150g"), costedUse("milk", 350, "350ml"), costedUse("flour", 30, "30g"), costedUse("spread", 30, "30g"), costedUse("cheddar", 80, "80g"), costedUse("mixedHerbs", 2, "2 tsp / about 2g")] },
  "w3-r18": { uses: [costedUse("sausages", 350, "350g"), costedUse("bakedBeans", 415, "1 × 415g tin"), costedUse("potatoes", 600, "600g"), costedUse("onions", 100, "1 medium onion / 100g"), costedUse("carrots", 150, "150g"), costedUse("milk", 75, "75ml"), costedUse("spread", 20, "20g")] },
  "w3-r19": { uses: [costedUse("dicedBeef", 400, "whole 400g pack"), costedUse("longGrainRice", 250, "250g", "Rice is shelf-stable and may be carried forward, but its value is still included in this batch cost."), costedUse("mushrooms", 300, "300g"), costedUse("onions", 100, "1 medium onion / 100g"), costedUse("softCheese", 150, "150g"), costedUse("milk", 100, "100ml"), costedUse("garlic", 2, "2 cloves"), costedUse("oil", 15, "1 tbsp / 15ml")] },
  "w3-r20": { uses: [costedUse("chickenBreast", 500, "500g"), costedUse("fusilli", 300, "300g"), costedUse("mushrooms", 300, "300g"), costedUse("softCheese", 150, "150g"), costedUse("milk", 100, "100ml"), costedUse("garlic", 2, "2 cloves"), costedUse("oil", 15, "1 tbsp / 15ml")] },
  "w3-r21": { uses: [costedUse("gammonSteaks", 2, "2 gammon steaks"), costedUse("eggs", 3, "3 eggs"), costedUse("potatoes", 750, "750g"), costedUse("peas", 200, "200g"), costedUse("oil", 30, "2 tbsp / 30ml")] },
  "w4-r22": { uses: [costedUse("cookedHam", 250, "250g"), costedUse("fusilli", 250, "250g", "Pasta is shelf-stable and may be carried forward, but its value is still included in this batch cost."), costedUse("milk", 350, "350ml", "Bought in the Week 4 shop; only the amount used is attributed to this recipe."), costedUse("flour", 30, "30g"), costedUse("spread", 30, "30g"), costedUse("cheddar", 120, "120g")] },
  "w4-r23": { uses: [costedUse("chickenBreast", 500, "500g"), costedUse("burgerBuns", 2, "2 buns"), costedUse("breadcrumbs", 75, "75g"), costedUse("milk", 30, "30ml"), costedUse("choppedTomatoes", 400, "1 × 400g tin"), costedUse("mozzarella", 125, "whole 125g drained pack"), costedUse("potatoes", 600, "600g"), costedUse("oil", 30, "2 tbsp / 30ml"), costedUse("mixedHerbs", 1, "1 tsp / about 1g")] },
  "w4-r24": { uses: [costedUse("potatoes", 800, "800g"), costedUse("backBacon", 250, "250g"), costedUse("eggs", 2, "2 eggs"), costedUse("cheddar", 80, "80g"), costedUse("bakedBeans", 415, "whole 415g tin")] },
  "w4-r25": { uses: [costedUse("beefMince", 400, "400g"), costedUse("spaghetti", 300, "300g"), costedUse("choppedTomatoes", 400, "1 × 400g tin"), costedUse("onions", 100, "1 medium onion / 100g"), costedUse("carrots", 150, "150g"), costedUse("cheddar", 80, "80g"), costedUse("garlic", 2, "2 cloves"), costedUse("mixedHerbs", 2, "2 tsp / about 2g"), costedUse("oil", 15, "1 tbsp / 15ml")] },
  "w4-r26": { uses: [costedUse("sausages", 350, "350g"), costedUse("bakedBeans", 415, "1 × 415g tin"), costedUse("potatoes", 600, "600g"), costedUse("onions", 100, "1 medium onion / 100g"), costedUse("carrots", 150, "150g"), costedUse("milk", 75, "75ml"), costedUse("spread", 20, "20g")] },
  "w4-r27": { uses: [costedUse("macaroni", 300, "300g"), costedUse("cheddar", 160, "160g"), costedUse("milk", 350, "350ml"), costedUse("flour", 30, "30g"), costedUse("spread", 30, "30g"), costedUse("broccoli", 300, "300g"), costedUse("garlicBaguettes", 2, "whole 2-baguette pack")] },
  "w4-r28": { uses: [costedUse("sausages", 350, "350g"), costedUse("puffPastry", 320, "whole 320g sheet"), costedUse("potatoes", 600, "600g"), costedUse("carrots", 250, "250g"), costedUse("peas", 120, "120g"), costedUse("milk", 75, "75ml"), costedUse("spread", 20, "20g")] },
};

/**
 * Numeric ingredient usage for the deterministic freshness planner.
 * Keep this derived from the same canonical data that powers recipe costing;
 * never parse quantities back out of display strings.
 */
export const recipeUsesByRecipeId = Object.fromEntries(
  Object.entries(recipePricing).map(([recipeId, pricing]) => [recipeId, pricing.uses]),
) as Record<string, RecipeUse[]>;

export function morrisonsProductKeyFromId(productId: string): MorrisonsProductId | null {
  const match = Object.entries(morrisonsProducts).find(([, product]) => product.id === productId);
  return match ? match[0] as MorrisonsProductId : null;
}

interface ShoppingDefinition {
  productId: MorrisonsProductId;
  legacyId: string;
  packCount: number;
  amount?: string;
  carriedForward?: boolean;
}

interface ShoppingSectionDefinition {
  title: string;
  items: ShoppingDefinition[];
}

const shoppingItem = (
  productId: MorrisonsProductId,
  legacyId: string,
  packCount = 1,
  options: Pick<ShoppingDefinition, "amount" | "carriedForward"> = {},
): ShoppingDefinition => ({ productId, legacyId, packCount, ...options });

const weeklyShoppingDefinitions: Record<number, ShoppingSectionDefinition[]> = {
  1: [
    { title: "Meat & fish", items: [
      shoppingItem("sausages", "pork-sausages-400g"),
      shoppingItem("chickenThighs", "chicken-thigh-fillets-900g"),
      shoppingItem("chickenBreast", "chicken-breast-fillets-650g"),
      shoppingItem("porkChops", "pork-chops-4-pack"),
      shoppingItem("cookedHam", "cooked-ham-300g"),
      shoppingItem("beefMince", "beef-mince-500g"),
    ] },
    { title: "Fresh & bakery", items: [
      shoppingItem("onions", "onions-1kg"),
      shoppingItem("potatoes", "potatoes-2-x-2-5kg", 2),
      shoppingItem("peppers", "mixed-peppers-3"),
      shoppingItem("mushrooms", "mushrooms-400g"),
      shoppingItem("wraps", "tortilla-wraps-8-pack"),
      shoppingItem("garlic", "garlic-4-bulbs"),
      shoppingItem("burgerBuns", "brioche-burger-buns-4"),
    ] },
    { title: "Dairy & eggs", items: [
      shoppingItem("eggs", "eggs-2-x-6", 2),
      shoppingItem("spread", "buttery-spread-500g"),
      shoppingItem("softCheese", "full-fat-soft-cheese-200g"),
      shoppingItem("cheddar", "cheddar-180g", 2),
      shoppingItem("milk", "milk-2-27-litres"),
    ] },
    { title: "Cupboard & frozen", items: [
      shoppingItem("peas", "frozen-peas-900g"),
      shoppingItem("longGrainRice", "long-grain-rice-1kg"),
      shoppingItem("gnocchi", "gnocchi-2-x-500g"),
      shoppingItem("gravy", "gravy-granules-"),
      shoppingItem("honey", "clear-honey-"),
      shoppingItem("soySauce", "light-soy-sauce-"),
      shoppingItem("oil", "vegetable-oil-1-litre"),
    ] },
  ],
  2: [
    { title: "Meat & fish", items: [
      shoppingItem("chickenBreast", "chicken-breast-fillets-650g"),
      shoppingItem("sausages", "pork-sausages-400g"),
      shoppingItem("beefMince", "beef-mince-500g"),
      shoppingItem("fishFingers", "fish-fingers-15-pack"),
      shoppingItem("backBacon", "back-bacon-300g"),
      shoppingItem("chickenKievs", "chicken-kievs-4-pack"),
      shoppingItem("dicedBeef", "diced-beef-400g"),
    ] },
    { title: "Fresh & bakery", items: [
      shoppingItem("mushrooms", "mushrooms-400g"),
      shoppingItem("carrots", "carrots-1kg"),
      shoppingItem("potatoes", "potatoes-2-x-2-5kg", 2),
      shoppingItem("onions", "onions-1kg"),
      shoppingItem("peppers", "mixed-peppers-3"),
      shoppingItem("garlic", "garlic-4-bulbs"),
      shoppingItem("burgerBuns", "brioche-burger-buns-4"),
    ] },
    { title: "Dairy & eggs", items: [
      shoppingItem("softCheese", "full-fat-soft-cheese-200g"),
      shoppingItem("cheddar", "cheddar-180g", 2),
      shoppingItem("milk", "milk-2-27-litres"),
      shoppingItem("spread", "buttery-spread-500g"),
    ] },
    { title: "Cupboard & frozen", items: [
      shoppingItem("peas", "frozen-peas-900g"),
      shoppingItem("choppedTomatoes", "chopped-tomatoes-2-tins"),
      shoppingItem("fusilli", "fusilli-1kg", 2),
      shoppingItem("longGrainRice", "long-grain-rice-450g"),
      shoppingItem("mixedHerbs", "mixed-herbs-"),
      shoppingItem("flour", "plain-flour-1-5kg"),
      shoppingItem("stockCubes", "stock-cubes-"),
    ] },
  ],
  3: [
    { title: "Meat & fish", items: [
      shoppingItem("beefMince", "beef-mince-500g"),
      shoppingItem("sausages", "pork-sausages-400g"),
      shoppingItem("dicedBeef", "diced-beef-400g"),
      shoppingItem("gammonSteaks", "gammon-steaks-2-x-2-pack"),
      shoppingItem("wholeChicken", "large-whole-chicken-about-1-85kg"),
      shoppingItem("chickenBreast", "chicken-breast-fillets-650g"),
    ] },
    { title: "Fresh & bakery", items: [
      shoppingItem("mushrooms", "mushrooms-400g"),
      shoppingItem("potatoes", "potatoes-2-5kg", 2),
      shoppingItem("broccoli", "broccoli-about-360g"),
      shoppingItem("carrots", "carrots-1kg"),
      shoppingItem("onions", "onions-1kg"),
      shoppingItem("garlic", "garlic-4-bulbs"),
    ] },
    { title: "Dairy & eggs", items: [
      shoppingItem("softCheese", "full-fat-soft-cheese-200g"),
      shoppingItem("milk", "milk-2-27-litres"),
      shoppingItem("eggs", "eggs-6"),
      shoppingItem("cheddar", "cheddar-180g"),
      shoppingItem("spread", "buttery-spread-500g"),
    ] },
    { title: "Cupboard & frozen", items: [
      shoppingItem("choppedTomatoes", "chopped-tomatoes-2-tins", 0, { amount: "2 tins carried forward from Week 2", carriedForward: true }),
      shoppingItem("bakedBeans", "baked-beans-1-tin"),
      shoppingItem("lasagne", "lasagne-sheets-500g"),
      shoppingItem("fusilli", "fusilli-500g"),
      shoppingItem("risottoRice", "arborio-rice-1kg"),
      shoppingItem("mixedVegetables", "frozen-mixed-vegetables-1kg"),
      shoppingItem("yorkshires", "yorkshire-puddings-15-pack"),
    ] },
  ],
  4: [
    { title: "Meat & fish", items: [
      shoppingItem("cookedHam", "cooked-ham-300g"),
      shoppingItem("chickenBreast", "chicken-breast-fillets-650g"),
      shoppingItem("beefMince", "beef-mince-500g"),
      shoppingItem("backBacon", "back-bacon-300g"),
      shoppingItem("sausages", "pork-sausages-400g"),
    ] },
    { title: "Fresh & bakery", items: [
      shoppingItem("garlicBaguettes", "garlic-baguettes-2-pack"),
      shoppingItem("potatoes", "potatoes-2-5kg", 2),
      shoppingItem("burgerBuns", "brioche-burger-buns-4"),
      shoppingItem("broccoli", "broccoli-about-360g"),
      shoppingItem("onions", "onions-1kg"),
      shoppingItem("carrots", "carrots-1kg"),
      shoppingItem("garlic", "garlic-4-bulbs"),
    ] },
    { title: "Dairy & eggs", items: [
      shoppingItem("mozzarella", "mozzarella-125g"),
      shoppingItem("cheddar", "cheddar-180g", 3),
      shoppingItem("milk", "milk-2-27-litres"),
      shoppingItem("eggs", "eggs-6"),
      shoppingItem("spread", "buttery-spread-500g"),
    ] },
    { title: "Cupboard & frozen", items: [
      shoppingItem("puffPastry", "ready-rolled-puff-pastry-320g"),
      shoppingItem("choppedTomatoes", "chopped-tomatoes-3-tins"),
      shoppingItem("spaghetti", "spaghetti-500g"),
      shoppingItem("bakedBeans", "baked-beans-1-tin"),
      shoppingItem("macaroni", "macaroni-500g"),
      shoppingItem("breadcrumbs", "breadcrumbs-175g"),
    ] },
  ],
};

function buildShopping(catalog: MorrisonsProductCatalog) {
  return Object.fromEntries(
    Object.entries(weeklyShoppingDefinitions).map(([weekNumber, sections]) => [
      Number(weekNumber),
      sections.map((section) => ({
        ...section,
        items: section.items.map((definition) => {
          const product = catalog[definition.productId];
          const packCount = definition.packCount;
          return {
            id: product.id,
            productId: product.id,
            packCount,
            legacyId: definition.legacyId,
            name: product.name,
            amount: definition.amount ?? (packCount === 1 ? product.packSize : `${packCount} × ${product.packSize}`),
            price: definition.carriedForward ? 0 : packCount * product.packPricePence / 100,
            carriedForward: definition.carriedForward ?? false,
          } satisfies ShoppingItem;
        }),
      })),
    ]),
  ) as Record<number, ShoppingSection[]>;
}

function costLine(recipeUse: RecipeUse, catalog: MorrisonsProductCatalog): RecipeCostLine {
  const product = catalog[recipeUse.productId];
  const attributedPence = Math.round(product.packPricePence * recipeUse.quantity / product.packQuantity);
  const percentage = Math.round(recipeUse.quantity / product.packQuantity * 1000) / 10;
  return {
    productId: product.id,
    packName: product.name,
    packSize: product.packSize,
    fullPackPrice: product.packPricePence / 100,
    quantityUsed: recipeUse.quantityLabel,
    proportion: `${percentage.toLocaleString("en-GB", { maximumFractionDigits: 1 })}%`,
    attributedCost: attributedPence / 100,
    note: recipeUse.note,
  };
}

function sumShopping(sections: ShoppingSection[]) {
  return Math.round(sections.flatMap((section) => section.items).reduce((sum, item) => sum + item.price, 0) * 100) / 100;
}

export function validateMorrisonsPricing(cookbook: Cookbook, catalog: MorrisonsProductCatalog = morrisonsProducts): string[] {
  const errors: string[] = [];
  const productsById = new Map(Object.values(catalog).map((product) => [product.id, product]));
  const stableId = /^[a-z]+(?:-[a-z]+)*$/;

  Object.entries(catalog).forEach(([key, product]) => {
    if (!stableId.test(product.id)) errors.push(`Unstable Morrisons product ID: ${key}.`);
    if (!Number.isInteger(product.packQuantity) || product.packQuantity <= 0) errors.push(`Invalid Morrisons pack quantity: ${product.id}.`);
    if (!Number.isInteger(product.packPricePence) || product.packPricePence < 0) errors.push(`Invalid Morrisons pack price: ${product.id}.`);
  });

  cookbook.weeks.forEach((week) => {
    const purchasedProductIds = new Set<string>();
    week.shopping.forEach((section) => section.items.forEach((item) => {
      const product = item.productId ? productsById.get(item.productId) : undefined;
      if (!product) {
        errors.push(`Shopping item has no canonical Morrisons product: Week ${week.number} ${item.name}.`);
        return;
      }
      if (item.id !== product.id) errors.push(`Shopping item ID does not match product: ${item.id ?? "missing"}.`);
      if (!Number.isInteger(item.packCount) || (item.packCount ?? -1) < 0) errors.push(`Invalid shopping pack count: ${product.id}.`);
      const expectedPrice = item.carriedForward ? 0 : (item.packCount ?? 0) * product.packPricePence / 100;
      if (Math.abs(item.price - expectedPrice) > 0.001) errors.push(`Shopping price does not match canonical pack price: ${product.id}.`);
      if (!item.carriedForward && (item.packCount ?? 0) > 0) purchasedProductIds.add(product.id);
      if (item.carriedForward && nonCarryableProductIds.has(product.id as MorrisonsProductId)) {
        errors.push(`Fresh or chilled product cannot carry between weeks: Week ${week.number} ${product.id}.`);
      }
      if (!item.carriedForward) {
        const expectedAmount = (item.packCount ?? 0) === 1 ? product.packSize : `${item.packCount} × ${product.packSize}`;
        if (item.amount !== expectedAmount) errors.push(`Shopping pack definition does not match canonical pack: ${product.id}.`);
      }
    }));

    const freshOrChilledRecipeProducts = new Set<string>();
    week.meals.forEach((meal) => meal.costBreakdown?.forEach((line) => {
      const product = productsById.get(line.productId);
      if (!product) {
        errors.push(`Recipe cost line has no canonical Morrisons product: ${meal.id}.`);
        return;
      }
      if (line.fullPackPrice !== product.packPricePence / 100) errors.push(`Recipe full-pack price is stale: ${meal.id} ${product.id}.`);
      if (line.packSize !== product.packSize) errors.push(`Recipe pack definition is stale: ${meal.id} ${product.id}.`);
      if (nonCarryableProductIds.has(product.id as MorrisonsProductId)) freshOrChilledRecipeProducts.add(product.id);
    }));
    freshOrChilledRecipeProducts.forEach((productId) => {
      if (!purchasedProductIds.has(productId)) {
        errors.push(`Fresh or chilled recipe product is not purchased in the same week: Week ${week.number} ${productId}.`);
      }
    });
  });

  return errors;
}

export function applyMorrisonsPricing(base: Cookbook, catalog: MorrisonsProductCatalog = morrisonsProducts): Cookbook {
  const weeklyShopping = buildShopping(catalog);
  const weeks = base.weeks.map((week) => {
    const shopping = weeklyShopping[week.number];
    const checkoutTotal = sumShopping(shopping);
    const weekCopy = {
      1: {
        caption: "Fresh and chilled ingredients for the first week, with unopened frozen and cupboard items available later.",
        carryForward: "Keep unopened frozen, canned, dry and cupboard ingredients for later weeks; buy fresh and chilled ingredients again when needed.",
      },
      2: {
        caption: "Fresh and chilled ingredients are bought again for this week; unopened frozen and cupboard items can carry forward.",
        carryForward: "Keep unopened frozen, canned, dry and cupboard ingredients for later weeks; buy fresh and chilled ingredients again when needed.",
      },
      3: {
        caption: "Fresh and chilled ingredients are bought again for this week, including the roast allocation used by the planned risotto.",
        carryForward: "Keep unopened frozen, canned, dry and cupboard ingredients for Week 4; the roast and risotto chicken allocation are costed within this Week 3 plan.",
      },
      4: {
        caption: "Fresh and chilled ingredients are bought again for the final week; unopened frozen and cupboard items may remain afterwards.",
        carryForward: "Fresh and chilled ingredients are covered by the Week 4 shop; unopened frozen, canned, dry and cupboard items may remain after the plan.",
      },
    }[week.number as 1 | 2 | 3 | 4];
    return {
      ...week,
      caption: weekCopy.caption,
      checkoutTotal,
      priceChecked: "09/09/2026",
      carryForward: weekCopy.carryForward,
      shopping,
      meals: week.meals.map((meal) => {
        const pricing = recipePricing[meal.id];
        if (!pricing) throw new Error(`Missing Morrisons recipe pricing for ${meal.id}.`);
        const costBreakdown = pricing.uses.map((use) => costLine(use, catalog));
        const cost = Math.round(costBreakdown.reduce((sum, line) => sum + line.attributedCost, 0) * 100) / 100;
        return {
          ...meal,
          cost,
          costBreakdown,
          costStatus: pricing.status ?? "verified",
          costNote: pricing.note,
        };
      }),
    };
  });

  const fourWeekTotal = Math.round(weeks.reduce((sum, week) => sum + week.checkoutTotal, 0) * 100) / 100;
  return {
    ...base,
    title: "Four-week family dinner plan",
    subtitle: "Sharon Meal Plan",
    edition: "Morrisons price edition | September 2026",
    fourWeekTotal,
    priceBasis: "Indicative Morrisons online shelf prices checked 9 September 2026, using named brands where practical and normal prices rather than temporary promotions. Pack sizes, prices and availability vary by store.",
    costMeaning: "Prices are planning figures and may vary by store.",
    weeks,
  };
}
