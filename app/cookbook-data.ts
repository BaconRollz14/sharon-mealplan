import { applyMorrisonsPricing } from "./morrisons-pricing";
import { thoroughRecipeMethods } from "./recipe-methods";

export interface PortionGuide {
  label: string;
  detail: string;
}

export type PortionMode = "count" | "finished" | "components";

export interface Recipe {
  id: string;
  recipeNumber: number;
  day: string;
  /** Explicit calendar offset for a meal whose source relationship crosses the week boundary. */
  mealDateOffset?: number;
  name: string;
  description: string;
  prep: string;
  cook: string;
  plates: string;
  cost: number;
  ingredients: string[];
  method: string[];
  portions: PortionGuide[];
  portionMode?: PortionMode;
  portionNote?: string;
  cookNote: string;
  costBreakdown?: RecipeCostLine[];
  costStatus?: "verified" | "estimated";
  costNote?: string;
}

export interface RecipeCostLine {
  productId: string;
  packName: string;
  packSize: string;
  fullPackPrice: number;
  quantityUsed: string;
  proportion: string;
  attributedCost: number;
  note?: string;
}

export interface ShoppingItem {
  id?: string;
  productId?: string;
  packCount?: number;
  legacyId?: string;
  name: string;
  amount: string;
  price: number;
  carriedForward?: boolean;
}

export interface ShoppingSection {
  title: string;
  items: ShoppingItem[];
}

export interface MealRelationship {
  type: "cooked-leftover";
  sourceRecipeId: string;
  targetRecipeId: string;
  productId: string;
  quantity: number;
  maxDaysAfter: number;
}

export interface WeekPlan {
  number: number;
  title: string;
  caption: string;
  checkoutTotal: number;
  priceChecked: string;
  carryForward: string;
  shopping: ShoppingSection[];
  mealRelationships?: MealRelationship[];
  meals: Recipe[];
}

export interface Cookbook {
  title: string;
  subtitle: string;
  edition: string;
  fourWeekTotal: number;
  priceBasis: string;
  costMeaning: string;
  weeks: WeekPlan[];
}

const originalCookbook = {
  "title": "Four-week family dinner plan",
  "subtitle": "Sharon Meal Plan",
  "edition": "Morrisons price edition | September 2026",
  "fourWeekTotal": 0,
  "priceBasis": "",
  "costMeaning": "",
  "weeks": [
    {
      "number": 1,
      "title": "Friday favourites and dependable family dinners",
      "caption": "Sets up cupboard basics used later in the month.",
      "checkoutTotal": 45.3,
      "priceChecked": "24/08/2026 to 26/08/2026",
      "carryForward": "Keep unopened frozen, canned, dry and cupboard ingredients for later weeks; buy fresh and chilled ingredients again when needed.",
      "shopping": [
        {
          "title": "Meat & fish",
          "items": [
            {
              "name": "Pork sausages",
              "amount": "400g",
              "price": 2.29
            },
            {
              "name": "Chicken thigh fillets",
              "amount": "900g",
              "price": 5.39
            },
            {
              "name": "Chicken breast fillets",
              "amount": "650g",
              "price": 4.69
            },
            {
              "name": "Pork chops",
              "amount": "4 pack",
              "price": 3.99
            },
            {
              "name": "Cooked ham",
              "amount": "300g",
              "price": 1.59
            }
          ]
        },
        {
          "title": "Fresh & bakery",
          "items": [
            {
              "name": "Onions",
              "amount": "1kg",
              "price": 0.8
            },
            {
              "name": "Potatoes",
              "amount": "2 x 2.5kg",
              "price": 3.3
            },
            {
              "name": "Mixed peppers",
              "amount": "3",
              "price": 1.79
            },
            {
              "name": "Mushrooms",
              "amount": "400g",
              "price": 1.29
            },
            {
              "name": "Tortilla wraps",
              "amount": "8 pack",
              "price": 0.99
            },
            {
              "name": "Garlic",
              "amount": "4 bulbs",
              "price": 0.87
            }
          ]
        },
        {
          "title": "Dairy & eggs",
          "items": [
            {
              "name": "Eggs",
              "amount": "2 x 6",
              "price": 1.98
            },
            {
              "name": "Buttery spread",
              "amount": "500g",
              "price": 0.89
            },
            {
              "name": "Full-fat soft cheese",
              "amount": "200g",
              "price": 0.89
            },
            {
              "name": "Cheddar",
              "amount": "400g",
              "price": 2.49
            },
            {
              "name": "Milk",
              "amount": "2.27 litres",
              "price": 1.65
            }
          ]
        },
        {
          "title": "Cupboard & frozen",
          "items": [
            {
              "name": "Frozen peas",
              "amount": "900g",
              "price": 1.15
            },
            {
              "name": "Long-grain rice",
              "amount": "1kg",
              "price": 0.52
            },
            {
              "name": "Gnocchi",
              "amount": "2 x 500g",
              "price": 1.98
            },
            {
              "name": "Gravy granules",
              "amount": "",
              "price": 0.99
            },
            {
              "name": "Friday burger ingredients",
              "amount": "2",
              "price": 2.78
            },
            {
              "name": "Clear honey",
              "amount": "",
              "price": 0.99
            },
            {
              "name": "Light soy sauce",
              "amount": "",
              "price": 0.55
            },
            {
              "name": "Vegetable oil",
              "amount": "1 litre",
              "price": 1.45
            }
          ]
        }
      ],
      "meals": [
        {
          "id": "w1-r1",
          "recipeNumber": 1,
          "day": "Monday",
          "name": "Sausage, mash, peas and onion gravy",
          "description": "A proper plate of comfort food with crisp sausages, buttery mash and savoury onion gravy.",
          "prep": "15 min",
          "cook": "30 min",
          "plates": "3",
          "cost": 3.51,
          "ingredients": [
            "400g pork sausages",
            "900g potatoes, peeled and chopped",
            "250g frozen peas",
            "1 large onion, thinly sliced",
            "100ml milk",
            "25g buttery spread",
            "20g gravy granules",
            "1 tbsp vegetable oil",
            "Salt and black pepper"
          ],
          "method": [
            "Heat the oven to 200C/180C fan. Put the sausages on a tray and cook for 25-30 minutes, turning once.",
            "Boil the potatoes in salted water for 15-18 minutes until tender. Drain, then mash with the milk and spread.",
            "Meanwhile, soften the onion in the oil over a medium heat for 8-10 minutes.",
            "Make the gravy according to the packet instructions, pour it over the onions and simmer for 2 minutes.",
            "Cook the peas, then serve everything together."
          ],
          "portions": [],
          "cookNote": "For richer gravy, add a spoonful of the sausage cooking juices to the onions before adding the gravy."
        },
        {
          "id": "w1-r2",
          "recipeNumber": 2,
          "day": "Tuesday",
          "name": "Chicken, pepper and cheese wraps with wedges",
          "description": "Soft wraps filled with golden chicken, sweet peppers and melted cheese, served with crisp wedges.",
          "prep": "20 min",
          "cook": "35 min",
          "plates": "3",
          "cost": 5.29,
          "ingredients": [
            "325g chicken thigh fillets, sliced",
            "3 tortilla wraps",
            "2 peppers, sliced",
            "1 onion, sliced",
            "120g mature Cheddar, grated",
            "700g potatoes, cut into wedges",
            "2 tbsp vegetable oil",
            "Salt and black pepper"
          ],
          "method": [
            "Heat the oven to 220C/200C fan. Toss the wedges with half the oil and seasoning, then roast for 30-35 minutes.",
            "Heat the remaining oil in a frying pan. Cook the chicken for 8-10 minutes until browned and cooked through.",
            "Add the peppers and onion and cook for another 6-7 minutes until softened.",
            "Warm the wraps, then fill with the chicken mixture and cheese. Fold or roll tightly.",
            "Serve the wraps with the wedges."
          ],
          "portions": [],
          "cookNote": "Briefly toast the filled wraps in a dry pan, seam-side down, for a crisp finish."
        },
        {
          "id": "w1-r3",
          "recipeNumber": 3,
          "day": "Wednesday",
          "name": "Pork chops with mash and gravy",
          "description": "Golden pork chops with smooth mash and rich onion gravy.",
          "prep": "15 min",
          "cook": "35 min",
          "plates": "3",
          "cost": 4.74,
          "ingredients": [
            "4 pork chops (about 700g raw total)",
            "900g potatoes, peeled and chopped",
            "75ml milk",
            "20g buttery spread",
            "20g gravy granules",
            "Salt and black pepper"
          ],
          "method": [
            "Season the pork chops. Cook under a medium-hot grill or in a frying pan for 6-8 minutes on each side, until cooked through.",
            "Boil the potatoes for 15-18 minutes until tender.",
            "Drain the potatoes and mash with the milk and spread.",
            "Make the gravy according to the packet instructions.",
            "Rest the chops for 3 minutes before serving with the mash and gravy."
          ],
          "portions": [],
          "cookNote": "Exact cooking time depends on chop thickness; the centre should be piping hot with no raw pink meat."
        },
        {
          "id": "w1-r4",
          "recipeNumber": 4,
          "day": "Thursday",
          "name": "Honey-garlic chicken fried rice",
          "description": "Sticky chicken, egg, peas and rice in a gentle honey-soy glaze.",
          "prep": "15 min",
          "cook": "25 min",
          "plates": "3",
          "cost": 4.57,
          "ingredients": [
            "575g chicken thigh fillets, diced",
            "300g long-grain rice",
            "2 eggs, beaten",
            "150g frozen peas",
            "2 garlic cloves, crushed",
            "3 tbsp light soy sauce",
            "3 tbsp clear honey",
            "2 tbsp vegetable oil",
            "Black pepper"
          ],
          "method": [
            "Cook the rice according to the packet instructions. Drain well and spread it out for a few minutes so excess steam can escape.",
            "Mix the soy sauce, honey and garlic in a small bowl.",
            "Heat half the oil in a large frying pan. Cook the chicken for 8-10 minutes until browned and cooked through. Transfer to a plate.",
            "Add the remaining oil. Pour in the eggs and stir until softly scrambled, then add the rice and peas.",
            "Return the chicken, pour in the sauce and stir-fry for 3-4 minutes until hot and glossy."
          ],
          "portions": [],
          "cookNote": "Use a large pan and keep everything moving so the rice fries rather than steams."
        },
        {
          "id": "w1-r5",
          "recipeNumber": 5,
          "day": "Friday",
          "name": "Homemade cheeseburgers with potato wedges",
          "description": "Juicy homemade beef burgers topped with melted Cheddar and served with crisp wedges.",
          "prep": "20 min",
          "cook": "45 min",
          "plates": "2",
          "cost": 0,
          "ingredients": [
            "400g 15% beef mince",
            "2 brioche burger buns",
            "80g mature Cheddar, sliced or grated",
            "1 small onion, finely diced",
            "600g potatoes, cut into wedges",
            "1½ tbsp vegetable oil",
            "Salt and black pepper",
            "Ketchup or pickles, optional"
          ],
          "method": [
            "Heat the oven to 220C/200C fan and put a large baking tray inside. Scrub the potatoes, halve them lengthways, then cut each half into even wedges.",
            "Cover the wedges with cold water, bring to the boil and simmer for 5-6 minutes. Drain, steam-dry for 3-5 minutes, then shake gently to roughen the edges.",
            "Toss with 1 tbsp oil, salt and pepper. Spread in one layer on the hot tray and roast for 30-35 minutes, turning after 20 minutes, until crisp and golden.",
            "Finely dice the onion. Mix the mince lightly with half the onion, ½ tsp salt and pepper. Divide into two patties, flattening them slightly wider than the buns.",
            "Heat the remaining oil over a medium-high heat. Cook the burgers for 5-6 minutes per side without pressing them down, until browned, steaming hot and cooked through with no pink meat.",
            "Add the cheese for the final minute and cover the pan to melt it. Toast the buns if wanted, then assemble with the remaining onion and optional toppings and serve with the wedges."
          ],
          "portions": [],
          "cookNote": "Press a shallow dip into the centre of each raw burger to help it cook flat."
        },
        {
          "id": "w1-r6",
          "recipeNumber": 6,
          "day": "Saturday",
          "name": "Creamy chicken and mushroom gnocchi",
          "description": "Soft potato gnocchi, chicken and mushrooms in a creamy garlic sauce.",
          "prep": "10 min",
          "cook": "25 min",
          "plates": "3",
          "cost": 9.04,
          "ingredients": [
            "650g chicken breast fillets, diced",
            "2 x 500g packs gnocchi",
            "400g mushrooms, sliced",
            "200g full-fat soft cheese",
            "150ml milk",
            "2 garlic cloves, crushed",
            "1 tbsp vegetable oil",
            "Salt and black pepper"
          ],
          "method": [
            "Cook the gnocchi according to the packet instructions, then drain.",
            "Heat the oil in a large frying pan. Cook the chicken for 8-10 minutes until browned and cooked through.",
            "Add the mushrooms and cook for 6-7 minutes. Add the garlic for the final minute.",
            "Stir in the soft cheese and milk and simmer gently until smooth.",
            "Fold through the gnocchi, season and heat for 2 minutes before serving."
          ],
          "portions": [],
          "cookNote": "For a lightly golden finish, fry the drained gnocchi for a few minutes before adding it to the sauce."
        },
        {
          "id": "w1-r7",
          "recipeNumber": 7,
          "day": "Sunday",
          "name": "Ham and cheese omelette with chips and peas",
          "description": "A generous cheesy omelette served with crisp homemade chips and peas.",
          "prep": "15 min",
          "cook": "30 min",
          "plates": "3",
          "cost": 4.62,
          "ingredients": [
            "8 eggs",
            "300g cooked ham, chopped",
            "150g mature Cheddar, grated",
            "700g potatoes, cut into chips",
            "200g frozen peas",
            "3 tbsp vegetable oil",
            "Salt and black pepper"
          ],
          "method": [
            "Heat the oven to 220C/200C fan. Toss the chips with 2 tbsp oil and seasoning, spread on a tray and cook for 25-30 minutes, turning once.",
            "Beat the eggs with black pepper, then stir in the ham and 100g cheese.",
            "Heat the remaining oil in a large ovenproof frying pan. Pour in the egg mixture and cook gently for 6-8 minutes.",
            "Scatter over the remaining cheese and place under a medium grill for 3-5 minutes until set and golden.",
            "Cook the peas and serve with wedges of omelette and the chips."
          ],
          "portions": [],
          "cookNote": "No ovenproof pan? Cook two smaller omelettes and finish each under the grill."
        }
      ]
    },
    {
      "number": 2,
      "title": "Quick pasta, traybakes and familiar takeaway-style favourites",
      "caption": "Fresh and chilled ingredients are bought again for this week; unopened frozen and cupboard items can carry forward.",
      "checkoutTotal": 34.61,
      "priceChecked": "24/08/2026 to 26/08/2026",
      "carryForward": "Fresh and chilled ingredients are bought again for this week; unopened frozen, canned, dry and cupboard items can carry forward.",
      "shopping": [
        {
          "title": "Meat & fish",
          "items": [
            {
              "name": "Chicken breast fillets",
              "amount": "650g",
              "price": 4.69
            },
            {
              "name": "Pork sausages",
              "amount": "400g",
              "price": 2.29
            },
            {
              "name": "Beef mince",
              "amount": "500g",
              "price": 3.25
            },
            {
              "name": "Fish fingers",
              "amount": "15 pack",
              "price": 1.65
            },
            {
              "name": "Back bacon",
              "amount": "300g",
              "price": 1.49
            },
            {
              "name": "Chicken Kievs",
              "amount": "4 pack",
              "price": 2.75
            }
          ]
        },
        {
          "title": "Fresh & bakery",
          "items": [
            {
              "name": "Mushrooms",
              "amount": "400g",
              "price": 1.29
            },
            {
              "name": "Carrots",
              "amount": "1kg",
              "price": 0.69
            },
            {
              "name": "Potatoes",
              "amount": "2 x 2.5kg",
              "price": 3.3
            },
            {
              "name": "Onions",
              "amount": "1kg",
              "price": 0.8
            },
            {
              "name": "Brioche burger buns",
              "amount": "4",
              "price": 0.99
            }
          ]
        },
        {
          "title": "Dairy & eggs",
          "items": [
            {
              "name": "Full-fat soft cheese",
              "amount": "200g",
              "price": 0.89
            },
            {
              "name": "Cheddar",
              "amount": "400g",
              "price": 2.49
            }
          ]
        },
        {
          "title": "Cupboard & frozen",
          "items": [
            {
              "name": "Frozen peas",
              "amount": "900g",
              "price": 1.15
            },
            {
              "name": "Chopped tomatoes",
              "amount": "2 tins",
              "price": 0.94
            },
            {
              "name": "Fusilli",
              "amount": "1kg",
              "price": 1.19
            },
            {
              "name": "Mixed herbs",
              "amount": "",
              "price": 0.59
            },
            {
              "name": "Friday stroganoff ingredients",
              "amount": "2",
              "price": 2.78
            },
            {
              "name": "Plain flour",
              "amount": "1.5kg",
              "price": 0.7
            },
            {
              "name": "Stock cubes",
              "amount": "",
              "price": 0.69
            }
          ]
        }
      ],
      "meals": [
        {
          "id": "w2-r8",
          "recipeNumber": 8,
          "day": "Monday",
          "name": "Creamy chicken and mushroom pasta",
          "description": "Tender chicken and mushrooms folded through a quick cream-cheese sauce.",
          "prep": "10 min",
          "cook": "25 min",
          "plates": "3",
          "cost": 7.47,
          "ingredients": [
            "650g chicken breast fillets, diced",
            "350g fusilli",
            "400g mushrooms, sliced",
            "200g full-fat soft cheese",
            "150ml milk",
            "2 garlic cloves, crushed",
            "1 tbsp vegetable oil",
            "Salt and black pepper"
          ],
          "method": [
            "Cook the pasta according to the packet instructions, reserving a mugful of cooking water before draining.",
            "Heat the oil in a large frying pan. Cook the chicken for 6-8 minutes until lightly browned and cooked through.",
            "Add the mushrooms and cook for 5 minutes, then add the garlic for the final minute.",
            "Stir in the soft cheese and milk. Simmer gently until smooth, loosening with pasta water if needed.",
            "Fold through the drained pasta, season and serve."
          ],
          "portions": [],
          "cookNote": "Let the mushrooms brown before stirring; this gives the sauce a fuller flavour."
        },
        {
          "id": "w2-r9",
          "recipeNumber": 9,
          "day": "Tuesday",
          "name": "Sausage and vegetable traybake",
          "description": "Sausages, potatoes and colourful vegetables roasted together on one tray.",
          "prep": "15 min",
          "cook": "45 min",
          "plates": "3",
          "cost": 3.84,
          "ingredients": [
            "400g pork sausages",
            "800g potatoes, cut into chunks",
            "200g carrots, sliced",
            "1 pepper, cut into strips",
            "1 onion, cut into wedges",
            "2 tsp mixed herbs",
            "2 tbsp vegetable oil",
            "Salt and black pepper"
          ],
          "method": [
            "Heat the oven to 210C/190C fan.",
            "Put the potatoes and carrots in a large roasting tin. Toss with half the oil and roast for 15 minutes.",
            "Add the sausages, pepper and onion. Drizzle over the remaining oil and scatter with the herbs.",
            "Roast for another 30 minutes, turning everything halfway through, until the sausages are cooked and the vegetables are golden.",
            "Serve straight from the tray."
          ],
          "portions": [],
          "cookNote": "Give the potatoes a head start so they crisp at the same time as the sausages finish cooking."
        },
        {
          "id": "w2-r10",
          "recipeNumber": 10,
          "day": "Wednesday",
          "name": "Fish fingers, homemade chips and peas",
          "description": "A familiar favourite made more substantial with oven chips cut from fresh potatoes.",
          "prep": "10 min",
          "cook": "35 min",
          "plates": "3",
          "cost": 2.7,
          "ingredients": [
            "15 fish fingers",
            "1kg potatoes, cut into chips",
            "250g frozen peas",
            "3 tbsp vegetable oil",
            "Salt and black pepper"
          ],
          "method": [
            "Heat the oven to 220C/200C fan. Rinse the chips, dry thoroughly and toss with the oil and seasoning.",
            "Spread the chips over a large baking tray and cook for 20 minutes.",
            "Turn the chips and add the fish fingers on a separate tray.",
            "Cook for another 12-15 minutes until the chips are golden and the fish fingers are piping hot.",
            "Cook the peas and serve."
          ],
          "portions": [],
          "cookNote": "Drying the cut potatoes well is the easiest way to improve oven-chip crispness."
        },
        {
          "id": "w2-r11",
          "recipeNumber": 11,
          "day": "Thursday",
          "name": "Homemade cheeseburgers with potato wedges",
          "description": "Juicy homemade beef burgers topped with melted Cheddar and served with crisp wedges.",
          "prep": "20 min",
          "cook": "30 min",
          "plates": "3",
          "cost": 5.45,
          "ingredients": [
            "500g 20% beef mince",
            "4 brioche burger buns",
            "100g mature Cheddar, sliced or grated",
            "1 small onion, finely diced",
            "700g potatoes, cut into wedges",
            "2 tbsp vegetable oil",
            "Salt and black pepper",
            "Ketchup or pickles, optional"
          ],
          "method": [
            "Heat the oven to 220C/200C fan. Toss the wedges with half the oil and seasoning and roast for 30 minutes, turning once.",
            "Mix the mince with half the onion, salt and pepper. Shape into four equal burgers without overworking the meat.",
            "Heat the remaining oil in a frying pan. Cook the burgers for 5-6 minutes on each side, or until cooked through.",
            "Top each burger with cheese for the final minute and cover the pan briefly to help it melt.",
            "Serve in the buns with the remaining onion and any optional toppings."
          ],
          "portions": [],
          "cookNote": "Press a shallow dip into the centre of each raw burger to help it cook flat."
        },
        {
          "id": "w2-r12",
          "recipeNumber": 12,
          "day": "Friday",
          "name": "Beef and mushroom stroganoff with rice",
          "description": "Tender diced beef and mushrooms in a smooth, savoury cream-cheese sauce.",
          "prep": "15 min",
          "cook": "30 min",
          "plates": "2",
          "cost": 0,
          "ingredients": [
            "400g diced beef",
            "250g long-grain rice",
            "300g mushrooms, sliced",
            "1 onion, sliced",
            "150g full-fat soft cheese",
            "100ml milk",
            "2 garlic cloves, crushed",
            "1 tbsp vegetable oil",
            "Salt and black pepper"
          ],
          "method": [
            "Rinse the rice until the water runs clearer and cook according to the packet. Drain if necessary, cover and rest off the heat for 5 minutes before fluffing with a fork.",
            "Pat the beef dry. If the pieces are chunky, slice them across the grain into strips about 1cm thick. Slice the onion and mushrooms and crush the garlic.",
            "Heat a large frying pan until very hot and add half the oil. Brown half the beef for 60-90 seconds per side, transfer to a clean plate, then repeat with the rest. Do not crowd the pan.",
            "Reduce to medium heat. Cook the onion for 3 minutes, then add the mushrooms and cook for 5-6 minutes until their liquid evaporates and they brown. Add the garlic for 30 seconds.",
            "Lower the heat, stir in the soft cheese and milk and bring to a very gentle simmer. Return the beef and juices and cook for 2-4 minutes, until steaming hot and cooked through.",
            "Taste and season. Fluff the rice, divide it between the two plates using the larger and smaller serving guide, and spoon over the stroganoff."
          ],
          "portions": [],
          "cookNote": "Browning the beef in batches prevents the pan cooling and the meat steaming."
        },
        {
          "id": "w2-r13",
          "recipeNumber": 13,
          "day": "Saturday",
          "name": "Bacon and tomato pasta bake",
          "description": "Smoky bacon, tomato and pasta under a bubbling Cheddar topping.",
          "prep": "15 min",
          "cook": "35 min",
          "plates": "3",
          "cost": 4.36,
          "ingredients": [
            "300g back bacon, chopped",
            "350g fusilli",
            "2 x 400g tins chopped tomatoes",
            "1 onion, diced",
            "150g mature Cheddar, grated",
            "500ml milk",
            "40g plain flour",
            "40g buttery spread",
            "Black pepper"
          ],
          "method": [
            "Heat the oven to 200C/180C fan. Cook the pasta for 2 minutes less than the packet instructions, then drain.",
            "Cook the bacon in a large frying pan for 5 minutes. Add the onion and cook for another 5 minutes, then add the tomatoes and simmer for 8 minutes.",
            "In a saucepan, melt the spread. Stir in the flour, then gradually whisk in the milk. Simmer until thickened and stir in 100g cheese.",
            "Combine the pasta, bacon-tomato mixture and cheese sauce. Transfer to a baking dish.",
            "Top with the remaining cheese and bake for 18-20 minutes."
          ],
          "portions": [],
          "cookNote": "The bacon supplies plenty of seasoning, so taste before adding any extra salt."
        },
        {
          "id": "w2-r14",
          "recipeNumber": 14,
          "day": "Sunday",
          "name": "Chicken Kievs with mash and peas",
          "description": "Crisp garlic-and-herb Kievs with creamy mash and peas.",
          "prep": "10 min",
          "cook": "35 min",
          "plates": "3",
          "cost": 3.73,
          "ingredients": [
            "4 chicken Kievs",
            "700g potatoes, peeled and chopped",
            "300g frozen peas",
            "100ml milk",
            "25g buttery spread",
            "Salt and black pepper"
          ],
          "method": [
            "Heat the oven and cook the Kievs according to the packet instructions until piping hot throughout.",
            "Boil the potatoes for 15-18 minutes until tender. Drain well.",
            "Mash the potatoes with the milk, spread and seasoning.",
            "Cook the peas until tender.",
            "Serve one Kiev per person with mash and peas."
          ],
          "portions": [],
          "cookNote": "Rest the Kievs for 2 minutes after cooking so the garlic butter is less likely to escape when cut."
        }
      ]
    },
    {
      "number": 3,
      "title": "A Sunday roast, a smart leftover dinner and hearty midweek plates",
      "caption": "Comforting family dinners, including a roast and a smart leftovers option.",
      "checkoutTotal": 38.56,
      "priceChecked": "24/08/2026 to 26/08/2026",
      "carryForward": "Keep unopened frozen, canned, dry and cupboard ingredients for Week 4; the roast and risotto chicken allocation are costed within this Week 3 plan.",
      "shopping": [
        {
          "title": "Meat & fish",
          "items": [
            {
              "name": "Beef mince",
              "amount": "500g",
              "price": 3.25
            },
            {
              "name": "Pork sausages",
              "amount": "400g",
              "price": 2.29
            },
            {
              "name": "Diced beef",
              "amount": "400g",
              "price": 4.49
            },
            {
              "name": "Gammon steaks",
              "amount": "2 x 2 pack",
              "price": 3.98
            },
            {
              "name": "Large whole chicken",
              "amount": "about 1.85kg",
              "price": 4.69
            }
          ]
        },
        {
          "title": "Fresh & bakery",
          "items": [
            {
              "name": "Mushrooms",
              "amount": "400g",
              "price": 1.29
            },
            {
              "name": "Potatoes",
              "amount": "2.5kg",
              "price": 1.65
            },
            {
              "name": "Broccoli",
              "amount": "about 360g",
              "price": 0.86
            },
            {
              "name": "Carrots",
              "amount": "1kg",
              "price": 0.69
            }
          ]
        },
        {
          "title": "Dairy & eggs",
          "items": [
            {
              "name": "Full-fat soft cheese",
              "amount": "200g",
              "price": 0.89
            },
            {
              "name": "Milk",
              "amount": "2.27 litres",
              "price": 1.65
            },
            {
              "name": "Eggs",
              "amount": "6",
              "price": 0.99
            },
            {
              "name": "Cheddar",
              "amount": "400g",
              "price": 2.49
            }
          ]
        },
        {
          "title": "Cupboard & frozen",
          "items": [
            {
              "name": "Chopped tomatoes",
              "amount": "2 tins",
              "price": 0.94
            },
            {
              "name": "Baked beans",
              "amount": "2 tins",
              "price": 0.54
            },
            {
              "name": "Lasagne sheets",
              "amount": "500g",
              "price": 0.75
            },
            {
              "name": "Friday chicken pasta ingredients",
              "amount": "2",
              "price": 2.78
            },
            {
              "name": "Arborio rice",
              "amount": "1kg",
              "price": 2.49
            },
            {
              "name": "Frozen mixed vegetables",
              "amount": "1kg",
              "price": 1.39
            },
            {
              "name": "Yorkshire puddings",
              "amount": "15 pack",
              "price": 0.46
            }
          ]
        }
      ],
      "mealRelationships": [
        {
          "type": "cooked-leftover",
          "sourceRecipeId": "w3-r15",
          "targetRecipeId": "w3-r16",
          "productId": "wholeChicken",
          "quantity": 300,
          "maxDaysAfter": 1
        }
      ],
      "meals": [
        {
          "id": "w3-r15",
          "recipeNumber": 15,
          "day": "Sunday",
          "name": "Sunday roast chicken dinner",
          "description": "A complete roast dinner that also supplies the cooked chicken for tomorrow's risotto.",
          "prep": "20 min",
          "cook": "1 hr 40",
          "plates": "3",
          "cost": 5.41,
          "ingredients": [
            "1 large whole chicken, about 1.7–2.1kg raw (reserve 300g cooked meat for Monday)",
            "1kg potatoes, peeled and cut for roasting",
            "400g carrots, cut into batons",
            "375g broccoli",
            "6 Yorkshire puddings",
            "25g gravy granules",
            "3 tbsp vegetable oil",
            "Salt and black pepper"
          ],
          "method": [
            "Heat the oven to 200C/180C fan. Season the chicken, place in a roasting tin and cook for about 1 hour 35 minutes, or until the juices run clear and the thickest part reaches 75C.",
            "Parboil the potatoes for 8 minutes. Drain, rough up the edges, toss with 2 tbsp oil and roast for 55-65 minutes.",
            "Add the carrots to a separate tray with the remaining oil for the final 35 minutes.",
            "Cook the broccoli and Yorkshire puddings, then make the gravy according to the packet instructions.",
            "Before serving, set aside approximately 300g cooked chicken for the risotto. Cool and refrigerate promptly."
          ],
          "portions": [],
          "cookNote": "Rest the chicken for 15 minutes before carving; it stays juicier and is easier to portion."
        },
        {
          "id": "w3-r16",
          "recipeNumber": 16,
          "day": "Monday",
          "mealDateOffset": 7,
          "name": "Leftover chicken and vegetable risotto",
          "description": "Creamy arborio rice with roast chicken, vegetables and a little mature Cheddar.",
          "prep": "15 min",
          "cook": "35 min",
          "plates": "3",
          "cost": 3.24,
          "ingredients": [
            "300g cooked roast chicken, shredded",
            "350g arborio rice",
            "300g frozen mixed vegetables",
            "1 onion, finely diced",
            "50g mature Cheddar, grated",
            "1 stock cube",
            "1 tbsp vegetable oil",
            "Black pepper"
          ],
          "method": [
            "Dissolve the stock cube in",
            "2 litres hot water and keep it warm.",
            "Heat the oil in a wide saucepan. Cook the onion gently for 6-8 minutes.",
            "Add the arborio rice and stir for 1 minute. Add the stock a ladleful at a time, stirring regularly and allowing each addition to absorb.",
            "After 15 minutes, add the frozen vegetables. Continue adding stock until the rice is tender and creamy.",
            "Stir in the chicken and heat thoroughly. Remove from the heat, stir in the cheese and season with pepper."
          ],
          "portions": [],
          "cookNote": "Reheated cooked chicken should be piping hot throughout and only reheated once."
        },
        {
          "id": "w3-r17",
          "recipeNumber": 17,
          "day": "Tuesday",
          "name": "Beef lasagne",
          "description": "Classic beef lasagne with a homemade white sauce and bubbling cheese topping.",
          "prep": "25 min",
          "cook": "1 hr",
          "plates": "3",
          "cost": 6.01,
          "ingredients": [
            "500g 20% beef mince",
            "250g lasagne sheets",
            "2 x 400g tins chopped tomatoes",
            "1 onion, diced",
            "200g carrots, finely diced",
            "500ml milk",
            "40g plain flour",
            "40g buttery spread",
            "100g mature Cheddar, grated",
            "2 tsp mixed herbs",
            "Salt and black pepper"
          ],
          "method": [
            "Brown the mince in a large pan. Add the onion and carrots and cook for 6 minutes. Stir in the tomatoes and herbs and simmer for 15 minutes.",
            "Melt the spread in a saucepan, stir in the flour and cook for 1 minute. Gradually whisk in the milk and simmer until thickened.",
            "Heat the oven to 190C/170C fan. Spoon a little beef sauce into a baking dish, cover with lasagne sheets and add white sauce.",
            "Repeat the layers, finishing with white sauce. Scatter over the cheese.",
            "Bake for 35-40 minutes until bubbling and tender. Rest for 10 minutes before cutting."
          ],
          "portions": [],
          "cookNote": "Resting the lasagne helps the layers hold together when served."
        },
        {
          "id": "w3-r18",
          "recipeNumber": 18,
          "day": "Wednesday",
          "name": "Sausage and baked-bean casserole with mash",
          "description": "Sausages and beans in a thick tomato sauce, served over creamy mash.",
          "prep": "15 min",
          "cook": "45 min",
          "plates": "3",
          "cost": 3.64,
          "ingredients": [
            "400g pork sausages",
            "2 x 410g tins baked beans",
            "700g potatoes, peeled and chopped",
            "1 onion, diced",
            "200g carrots, diced",
            "75ml milk",
            "20g buttery spread",
            "Black pepper"
          ],
          "method": [
            "Brown the sausages in a large casserole or deep frying pan for 8 minutes, then set aside.",
            "Add the onion and carrots to the pan and cook for 6 minutes.",
            "Return the sausages, add the baked beans and 150ml water, then cover and simmer for 25 minutes.",
            "Meanwhile, boil the potatoes for 15-18 minutes, drain and mash with the milk and spread.",
            "Season the casserole with black pepper and serve over the mash."
          ],
          "portions": [],
          "cookNote": "Cut the sausages into thick pieces after browning if you want them distributed more evenly."
        },
        {
          "id": "w3-r19",
          "recipeNumber": 19,
          "day": "Thursday",
          "name": "Beef and mushroom stroganoff with rice",
          "description": "Tender diced beef and mushrooms in a smooth, savoury cream-cheese sauce.",
          "prep": "15 min",
          "cook": "30 min",
          "plates": "3",
          "cost": 7.15,
          "ingredients": [
            "400g diced beef",
            "350g long-grain rice",
            "400g mushrooms, sliced",
            "1 onion, sliced",
            "200g full-fat soft cheese",
            "150ml milk",
            "2 garlic cloves, crushed",
            "1 tbsp vegetable oil",
            "Salt and black pepper"
          ],
          "method": [
            "Cook the rice according to the packet instructions and keep warm.",
            "Heat the oil in a large frying pan over a high heat. Brown the beef in batches, then transfer to a plate.",
            "Lower the heat, add the onion and mushrooms and cook for 7-8 minutes. Add the garlic for the final minute.",
            "Return the beef. Stir in the soft cheese and milk and simmer gently for 8-10 minutes, until the beef is cooked and the sauce has thickened.",
            "Season and serve over the rice."
          ],
          "portions": [],
          "cookNote": "Browning the beef in batches prevents the pan cooling and the meat steaming."
        },
        {
          "id": "w3-r20",
          "recipeNumber": 20,
          "day": "Friday",
          "name": "Creamy chicken and mushroom pasta",
          "description": "Tender chicken and mushrooms folded through pasta in a smooth, garlicky cream-cheese sauce.",
          "prep": "15 min",
          "cook": "30 min",
          "plates": "2",
          "cost": 0,
          "ingredients": [
            "500g chicken breast fillets, diced",
            "300g fusilli",
            "300g mushrooms, sliced",
            "150g full-fat soft cheese",
            "100ml milk",
            "2 garlic cloves, crushed",
            "1 tbsp vegetable oil",
            "Salt and black pepper"
          ],
          "method": [
            "Bring a large saucepan of salted water to the boil. Cut the chicken into even 2-3cm pieces, wipe and slice the mushrooms, and crush the garlic.",
            "Cook the pasta until just tender according to the packet. Before draining, reserve a mugful of the starchy cooking water.",
            "Meanwhile, heat the oil over a medium-high heat. Cook the chicken in one layer for 6-8 minutes until golden, steaming hot and with no pink meat, then transfer to a clean plate.",
            "Add the mushrooms, spread them out and leave untouched for 2 minutes. Cook for another 3-4 minutes until browned, then add the garlic for 30 seconds.",
            "Lower the heat. Stir in the soft cheese and milk until smooth, return the chicken and its juices, and simmer gently for 2 minutes without boiling hard.",
            "Add the drained pasta and toss thoroughly, adding cooking water a splash at a time until the sauce is glossy and coats every piece. Season and serve immediately."
          ],
          "portions": [],
          "cookNote": "Reserve some pasta water before draining; it helps the sauce coat the pasta without becoming heavy."
        },
        {
          "id": "w3-r21",
          "recipeNumber": 21,
          "day": "Saturday",
          "name": "Gammon, egg, homemade chips and peas",
          "description": "A straightforward pub-style dinner with gammon steaks, fried eggs, chips and peas.",
          "prep": "10 min",
          "cook": "35 min",
          "plates": "3",
          "cost": 5.63,
          "ingredients": [
            "4 gammon steaks, about 600g",
            "4 eggs",
            "900g potatoes, cut into chips",
            "250g frozen peas",
            "3 tbsp vegetable oil",
            "Black pepper"
          ],
          "method": [
            "Heat the oven to 220C/200C fan. Rinse and thoroughly dry the chips, then toss with 2 tbsp oil and pepper.",
            "Bake the chips for 30-35 minutes, turning once.",
            "Grill or pan-fry the gammon steaks according to the packet instructions until cooked through.",
            "Heat the remaining oil in a frying pan and fry the eggs to your liking.",
            "Cook the peas and serve everything together."
          ],
          "portions": [],
          "cookNote": "Gammon is already salty, so season the rest of the meal lightly."
        }
      ]
    },
    {
      "number": 4,
      "title": "Cheesy bakes, Friday favourites and a golden pastry centrepiece",
      "caption": "Fresh and chilled ingredients are bought again for the final week; unopened frozen and cupboard items may remain afterwards.",
      "checkoutTotal": 28.5,
      "priceChecked": "24/08/2026 to 26/08/2026",
      "carryForward": "Fresh and chilled ingredients are covered by the Week 4 shop; unopened frozen, canned, dry and cupboard items may remain after the plan.",
      "shopping": [
        {
          "title": "Meat & fish",
          "items": [
            {
              "name": "Cooked ham",
              "amount": "300g",
              "price": 1.59
            },
            {
              "name": "Chicken breast fillets",
              "amount": "650g",
              "price": 4.69
            },
            {
              "name": "Beef mince",
              "amount": "500g",
              "price": 3.25
            },
            {
              "name": "Back bacon",
              "amount": "300g",
              "price": 1.49
            },
            {
              "name": "Pork sausages",
              "amount": "400g",
              "price": 2.29
            }
          ]
        },
        {
          "title": "Fresh & bakery",
          "items": [
            {
              "name": "Garlic baguettes",
              "amount": "2 pack",
              "price": 0.7
            },
            {
              "name": "Potatoes",
              "amount": "2.5kg",
              "price": 1.65
            },
            {
              "name": "Brioche burger buns",
              "amount": "4",
              "price": 0.99
            },
            {
              "name": "Broccoli",
              "amount": "about 360g",
              "price": 0.86
            }
          ]
        },
        {
          "title": "Dairy & eggs",
          "items": [
            {
              "name": "Mozzarella",
              "amount": "125g",
              "price": 0.59
            },
            {
              "name": "Cheddar",
              "amount": "400g",
              "price": 2.49
            }
          ]
        },
        {
          "title": "Cupboard & frozen",
          "items": [
            {
              "name": "Ready-rolled puff pastry",
              "amount": "320g",
              "price": 0.99
            },
            {
              "name": "Chopped tomatoes",
              "amount": "3 tins",
              "price": 1.41
            },
            {
              "name": "Friday sausage casserole ingredients",
              "amount": "2",
              "price": 2.78
            },
            {
              "name": "Spaghetti",
              "amount": "500g",
              "price": 0.75
            },
            {
              "name": "Baked beans",
              "amount": "1 tin",
              "price": 0.27
            },
            {
              "name": "Macaroni",
              "amount": "500g",
              "price": 0.72
            },
            {
              "name": "Breadcrumbs",
              "amount": "175g",
              "price": 0.99
            }
          ]
        }
      ],
      "meals": [
        {
          "id": "w4-r22",
          "recipeNumber": 22,
          "day": "Monday",
          "name": "Ham and cheese pasta bake",
          "description": "A creamy pasta bake packed with ham and mature Cheddar.",
          "prep": "15 min",
          "cook": "35 min",
          "plates": "3",
          "cost": 3.36,
          "ingredients": [
            "300g cooked ham, chopped",
            "300g fusilli",
            "500ml milk",
            "40g plain flour",
            "40g buttery spread",
            "150g mature Cheddar, grated",
            "Black pepper"
          ],
          "method": [
            "Heat the oven to 200C/180C fan. Cook the pasta for 2 minutes less than the packet instructions, then drain.",
            "Melt the spread in a saucepan, stir in the flour and cook for 1 minute.",
            "Gradually whisk in the milk and simmer until thickened. Remove from the heat and stir in 100g cheese.",
            "Fold in the pasta and ham. Season with black pepper and transfer to a baking dish.",
            "Top with the remaining cheese and bake for 18-20 minutes."
          ],
          "portions": [],
          "cookNote": "The ham and cheese provide seasoning, so taste before adding salt."
        },
        {
          "id": "w4-r23",
          "recipeNumber": 23,
          "day": "Tuesday",
          "name": "Chicken Parmesan-style burgers with wedges",
          "description": "Crisp crumbed chicken, tomato and mozzarella in a brioche bun with golden wedges.",
          "prep": "20 min",
          "cook": "35 min",
          "plates": "3",
          "cost": 7.96,
          "ingredients": [
            "650g chicken breast fillets",
            "4 brioche burger buns",
            "100g breadcrumbs",
            "30ml milk",
            "1 x 400g tin chopped tomatoes",
            "125g mozzarella, drained and sliced",
            "700g potatoes, cut into wedges",
            "2 tbsp vegetable oil",
            "1 tsp mixed herbs",
            "Salt and black pepper"
          ],
          "method": [
            "Heat the oven to 220C/200C fan. Toss the wedges with half the oil and roast for 30-35 minutes.",
            "Slice or flatten the chicken into four thin pieces. Brush with the milk, season and press into the breadcrumbs.",
            "Heat the remaining oil in a frying pan and cook the chicken for 4-5 minutes on each side until golden and cooked through.",
            "Simmer the tomatoes with the herbs for 8-10 minutes until thick. Spoon over the chicken and top with mozzarella.",
            "Grill briefly until the cheese melts, then serve in the buns with the wedges."
          ],
          "portions": [],
          "cookNote": "Flattening the chicken gives four even portions and helps it cook quickly."
        },
        {
          "id": "w4-r24",
          "recipeNumber": 24,
          "day": "Wednesday",
          "name": "Loaded bacon, egg and cheese baked potatoes",
          "description": "Crisp-skinned baked potatoes piled with bacon, egg, beans and melted cheese.",
          "prep": "10 min",
          "cook": "1 hr 10",
          "plates": "3",
          "cost": 3.9,
          "ingredients": [
            "4 large baking potatoes, about 1kg",
            "300g back bacon, chopped",
            "4 eggs",
            "120g mature Cheddar, grated",
            "1 x 410g tin baked beans",
            "Black pepper"
          ],
          "method": [
            "Heat the oven to 210C/190C fan. Prick the potatoes and bake directly on the oven shelf for 60-70 minutes until crisp outside and soft inside.",
            "Cook the bacon in a frying pan until golden. Warm the baked beans.",
            "Fry or scramble the eggs to your liking.",
            "Split the potatoes and fluff the centres with a fork. Top with beans, bacon and cheese.",
            "Return to the oven for 3-4 minutes to melt the cheese, then finish with the eggs and black pepper."
          ],
          "portions": [],
          "cookNote": "Microwave the potatoes for 8-10 minutes first to reduce the oven time by roughly 25 minutes."
        },
        {
          "id": "w4-r25",
          "recipeNumber": 25,
          "day": "Thursday",
          "name": "Beef Bolognese",
          "description": "A generous beef-and-tomato sauce with spaghetti and grated Cheddar.",
          "prep": "15 min",
          "cook": "35 min",
          "plates": "3",
          "cost": 5.65,
          "ingredients": [
            "500g 20% beef mince",
            "350g spaghetti",
            "2 x 400g tins chopped tomatoes",
            "1 onion, diced",
            "200g carrots, finely diced",
            "80g mature Cheddar, grated",
            "2 garlic cloves, crushed",
            "2 tsp mixed herbs",
            "1 tbsp vegetable oil",
            "Salt and black pepper"
          ],
          "method": [
            "Heat the oil in a large saucepan. Brown the mince for 6-8 minutes, breaking it up with a spoon.",
            "Add the onion and carrots and cook for 6 minutes. Add the garlic and herbs for the final minute.",
            "Stir in the tomatoes and 150ml water. Simmer uncovered for 20 minutes until rich and thick.",
            "Cook the spaghetti according to the packet instructions and drain.",
            "Season the sauce and serve over the spaghetti with the grated cheese."
          ],
          "portions": [],
          "cookNote": "Finely diced carrot softens into the sauce and adds sweetness without needing sugar."
        },
        {
          "id": "w4-r26",
          "recipeNumber": 26,
          "day": "Friday",
          "name": "Sausage and baked-bean casserole with mash",
          "description": "Sausages and beans in a thick tomato sauce, served over creamy mash.",
          "prep": "15 min",
          "cook": "45 min",
          "plates": "2",
          "cost": 0,
          "ingredients": [
            "350g pork sausages",
            "1 x 415g tin baked beans",
            "600g potatoes, peeled and chopped",
            "1 onion, diced",
            "150g carrots, diced",
            "75ml milk",
            "20g buttery spread",
            "Black pepper"
          ],
          "method": [
            "Peel the potatoes and cut into even 3-4cm chunks. Cover with cold water, add a pinch of salt and set aside while starting the casserole.",
            "Brown the sausages in a large casserole or deep frying pan over a medium heat for about 8 minutes, turning regularly, then transfer to a plate.",
            "Peel and dice the onion and carrots. Cook them in the sausage pan for 6-8 minutes, stirring and scraping up the browned bits, until softened.",
            "Return the sausages, add the beans and 150ml water, cover and simmer gently for 20 minutes. Remove the lid and cook for another 5-10 minutes until thick and the sausages are steaming hot with no pink meat.",
            "Meanwhile, bring the potatoes to the boil and simmer for 15-18 minutes until completely tender. Drain and steam-dry for 1 minute.",
            "Warm the milk and spread, pour over the potatoes and mash until smooth. Season the casserole with pepper and taste before adding salt. Serve over the mash."
          ],
          "portions": [],
          "cookNote": "Cut the sausages into thick pieces after browning if you want them distributed more evenly."
        },
        {
          "id": "w4-r27",
          "recipeNumber": 27,
          "day": "Saturday",
          "name": "Macaroni cheese with broccoli and garlic bread",
          "description": "Classic baked macaroni cheese served with broccoli and crisp garlic bread.",
          "prep": "15 min",
          "cook": "35 min",
          "plates": "3",
          "cost": 3.76,
          "ingredients": [
            "350g macaroni",
            "200g mature Cheddar, grated",
            "500ml milk",
            "40g plain flour",
            "40g buttery spread",
            "375g broccoli, cut into florets",
            "2 garlic baguettes",
            "Salt and black pepper"
          ],
          "method": [
            "Heat the oven to 200C/180C fan. Cook the macaroni for 2 minutes less than the packet instructions, then drain.",
            "Melt the spread in a saucepan. Stir in the flour and cook for 1 minute, then gradually whisk in the milk.",
            "Simmer until thickened. Remove from the heat and stir in 150g cheese, then fold through the macaroni.",
            "Transfer to a baking dish, top with the remaining cheese and bake for 18-20 minutes. Cook the garlic bread alongside it.",
            "Steam or boil the broccoli until tender and serve on the side."
          ],
          "portions": [],
          "cookNote": "A small splash of pasta water loosens the sauce if it becomes too thick before baking."
        },
        {
          "id": "w4-r28",
          "recipeNumber": 28,
          "day": "Sunday",
          "name": "Sausage plait with mash, carrots and peas",
          "description": "Golden puff pastry wrapped around seasoned sausage meat, served with mash and vegetables.",
          "prep": "20 min",
          "cook": "45 min",
          "plates": "3",
          "cost": 4.26,
          "ingredients": [
            "400g pork sausages",
            "1 x 320g sheet ready-rolled puff pastry",
            "700g potatoes, peeled and chopped",
            "300g carrots, sliced",
            "150g frozen peas",
            "100ml milk",
            "25g buttery spread",
            "Black pepper"
          ],
          "method": [
            "Heat the oven to 200C/180C fan. Remove the sausage meat from the skins and shape it into a long log down the centre of the pastry.",
            "Cut diagonal strips in the pastry on each side of the filling. Fold the strips alternately over the sausage meat to form a plait.",
            "Place on a lined tray and bake for 35-40 minutes until deep golden and cooked through.",
            "Meanwhile, boil the potatoes until tender and mash with the milk and spread.",
            "Cook the carrots and peas, then slice the plait and serve with the mash and vegetables."
          ],
          "portions": [],
          "cookNote": "Chill the assembled plait for 10 minutes before baking if the pastry has become soft."
        }
      ]
    }
  ]
} satisfies Cookbook;

const cookbookWithThoroughMethods = {
  ...originalCookbook,
  weeks: originalCookbook.weeks.map((week) => ({
    ...week,
    meals: week.meals.map((recipe) => ({
      ...recipe,
      ...thoroughRecipeMethods[recipe.id],
    })),
  })),
} satisfies Cookbook;

const portionGuidance: Record<string, Pick<Recipe, "portionMode" | "portionNote">> = {
  "w1-r1": { portionMode: "components" },
  "w1-r2": {
    portionMode: "count",
    portionNote: "Warm 3 wraps: serve 2 to the larger adult and 1 to the smaller adult. Keep the unopened wraps for another meal.",
  },
  "w1-r3": {
    portionMode: "count",
    portionNote: "Cook 3 chops and plate by count: 2 for the larger adult and 1 for the smaller adult. The remaining chop in the pack can be frozen or used another day.",
  },
  "w1-r4": { portionMode: "finished" },
  "w1-r5": {
    portionMode: "count",
    portionNote: "Shape 2 burgers and serve 1 to each adult. Use the larger and smaller serving guides for the wedges; any spare buns can be frozen.",
  },
  "w1-r6": { portionMode: "finished" },
  "w1-r7": {
    portionMode: "components",
    portionNote: "Slice the omelette into equal wedges before serving; the fractions refer to the finished omelette, not raw eggs. Keep any unserved wedges as spare.",
  },
  "w2-r8": { portionMode: "finished" },
  "w2-r9": { portionMode: "finished" },
  "w2-r10": {
    portionMode: "count",
    portionNote: "Cook 12 fish fingers: serve 8 to the larger adult and 4 to the smaller adult. Keep the rest frozen for another meal.",
  },
  "w2-r11": {
    portionMode: "count",
    portionNote: "Shape 2 burgers and serve 1 to each adult. Use the larger and smaller wedge weights shown, and freeze any spare buns.",
  },
  "w2-r12": { portionMode: "finished" },
  "w2-r13": { portionMode: "finished" },
  "w2-r14": {
    portionMode: "count",
    portionNote: "Cook both Kievs and serve 1 to each adult with the mash and peas.",
  },
  "w3-r15": {
    portionMode: "components",
    portionNote: "The chicken amounts are cooked meat. Carve, set aside 300g for Monday’s risotto, then plate the remainder using the guide.",
  },
  "w3-r16": { portionMode: "finished" },
  "w3-r17": { portionMode: "finished" },
  "w3-r18": { portionMode: "finished" },
  "w3-r19": { portionMode: "finished" },
  "w3-r20": { portionMode: "finished" },
  "w3-r21": { portionMode: "count" },
  "w4-r22": { portionMode: "finished" },
  "w4-r23": {
    portionMode: "count",
    portionNote: "Flatten and cook 2 chicken pieces. Serve 1 chicken burger to each adult, using the larger and smaller wedge weights shown.",
  },
  "w4-r24": {
    portionMode: "count",
    portionNote: "Bake 2 potatoes and top 1 for each adult. Add the larger or smaller amount of filling shown in the guide.",
  },
  "w4-r25": { portionMode: "finished" },
  "w4-r26": { portionMode: "finished" },
  "w4-r27": {
    portionMode: "components",
    portionNote: "Weigh the macaroni cheese and broccoli after cooking; serve the listed cooked weight, then portion the garlic bread by the fraction shown. Keep any extra bread for another meal.",
  },
  "w4-r28": {
    portionMode: "components",
    portionNote: "Weigh the baked sausage plait once it has rested; the gram figures refer to cooked plait. Slice the remainder as spare.",
  },
};

const cookbookWithGuidance = {
  ...cookbookWithThoroughMethods,
  weeks: cookbookWithThoroughMethods.weeks.map((week) => ({
    ...week,
    meals: week.meals.map((recipe) => ({
      ...recipe,
      ...portionGuidance[recipe.id],
    })),
  })),
} satisfies Cookbook;

const twoAdultIngredientLists: Record<string, string[]> = {
  "w1-r1": ["400g pork sausages", "800g potatoes, peeled and chopped", "200g frozen peas", "1 large onion, thinly sliced", "100ml milk", "25g buttery spread", "20g gravy granules", "1 tbsp vegetable oil", "Salt and black pepper"],
  "w1-r2": ["325g chicken thigh fillets, sliced", "3 tortilla wraps", "2 peppers, sliced", "1 onion, sliced", "120g mature Cheddar, grated", "600g potatoes, cut into wedges", "2 tbsp vegetable oil", "Salt and black pepper"],
  "w1-r3": ["3 pork chops (about 525g raw total)", "750g potatoes, peeled and chopped", "75ml milk", "20g buttery spread", "20g gravy granules", "Salt and black pepper"],
  "w1-r4": ["450g chicken thigh fillets, diced", "220g long-grain rice", "2 eggs, beaten", "120g frozen peas", "2 garlic cloves, crushed", "2 tbsp light soy sauce", "2 tbsp clear honey", "1½ tbsp vegetable oil", "Black pepper"],
  "w1-r5": ["400g 15% beef mince", "2 brioche burger buns", "80g mature Cheddar, sliced or grated", "1 small onion, finely diced", "600g potatoes, cut into wedges", "1½ tbsp vegetable oil", "Salt and black pepper", "Ketchup or pickles, optional"],
  "w1-r6": ["500g chicken breast fillets, diced", "700g gnocchi", "300g mushrooms, sliced", "150g full-fat soft cheese", "100ml milk", "2 garlic cloves, crushed", "1 tbsp vegetable oil", "Salt and black pepper"],
  "w1-r7": ["6 eggs", "250g cooked ham, chopped", "120g mature Cheddar, grated", "600g potatoes, cut into chips", "150g frozen peas", "2 tbsp vegetable oil", "Salt and black pepper"],
  "w2-r8": ["500g chicken breast fillets, diced", "300g fusilli", "300g mushrooms, sliced", "150g full-fat soft cheese", "100ml milk", "2 garlic cloves, crushed", "1 tbsp vegetable oil", "Salt and black pepper"],
  "w2-r9": ["350g pork sausages", "650g potatoes, cut into chunks", "150g carrots, sliced", "1 pepper, cut into strips", "1 onion, cut into wedges", "2 tsp mixed herbs", "2 tbsp vegetable oil", "Salt and black pepper"],
  "w2-r10": ["12 fish fingers", "750g potatoes, cut into chips", "200g frozen peas", "2 tbsp vegetable oil", "Salt and black pepper"],
  "w2-r11": ["400g 15% beef mince", "2 brioche burger buns", "80g mature Cheddar, sliced or grated", "1 small onion, finely diced", "600g potatoes, cut into wedges", "1½ tbsp vegetable oil", "Salt and black pepper", "Ketchup or pickles, optional"],
  "w2-r12": ["400g diced beef", "250g long-grain rice", "300g mushrooms, sliced", "1 onion, sliced", "150g full-fat soft cheese", "100ml milk", "2 garlic cloves, crushed", "1 tbsp vegetable oil", "Salt and black pepper"],
  "w2-r13": ["250g back bacon, chopped", "300g fusilli", "1 x 400g tin chopped tomatoes", "1 onion, diced", "120g mature Cheddar, grated", "350ml milk", "30g plain flour", "30g buttery spread", "Black pepper"],
  "w2-r14": ["2 chicken Kievs", "600g potatoes, peeled and chopped", "200g frozen peas", "75ml milk", "20g buttery spread", "Salt and black pepper"],
  "w3-r15": ["1 large whole chicken, about 1.7–2.1kg raw (reserve 300g cooked meat for Monday)", "800g potatoes, peeled and cut for roasting", "300g carrots, cut into batons", "300g broccoli", "4 Yorkshire puddings", "25g gravy granules", "2 tbsp vegetable oil", "Salt and black pepper"],
  "w3-r16": ["300g cooked roast chicken, shredded", "250g arborio rice", "250g frozen mixed vegetables", "1 onion, finely diced", "50g mature Cheddar, grated", "1 stock cube", "1 tbsp vegetable oil", "Black pepper"],
  "w3-r17": ["400g 15% beef mince", "200g lasagne sheets", "1 x 400g tin chopped tomatoes", "1 onion, diced", "150g carrots, finely diced", "350ml milk", "30g plain flour", "30g buttery spread", "80g mature Cheddar, grated", "2 tsp mixed herbs", "Salt and black pepper"],
  "w3-r18": ["350g pork sausages", "1 x 415g tin baked beans", "600g potatoes, peeled and chopped", "1 onion, diced", "150g carrots, diced", "75ml milk", "20g buttery spread", "Black pepper"],
  "w3-r19": ["400g diced beef", "250g long-grain rice", "300g mushrooms, sliced", "1 onion, sliced", "150g full-fat soft cheese", "100ml milk", "2 garlic cloves, crushed", "1 tbsp vegetable oil", "Salt and black pepper"],
  "w3-r20": ["500g chicken breast fillets, diced", "300g fusilli", "300g mushrooms, sliced", "150g full-fat soft cheese", "100ml milk", "2 garlic cloves, crushed", "1 tbsp vegetable oil", "Salt and black pepper"],
  "w3-r21": ["2 gammon steaks, about 300g", "3 eggs", "750g potatoes, cut into chips", "200g frozen peas", "2 tbsp vegetable oil", "Black pepper"],
  "w4-r22": ["250g cooked ham, chopped", "250g fusilli", "350ml milk", "30g plain flour", "30g buttery spread", "120g mature Cheddar, grated", "Black pepper"],
  "w4-r23": ["500g chicken breast fillets", "2 brioche burger buns", "75g breadcrumbs", "30ml milk", "1 x 400g tin chopped tomatoes", "125g mozzarella, drained and sliced", "600g potatoes, cut into wedges", "2 tbsp vegetable oil", "1 tsp mixed herbs", "Salt and black pepper"],
  "w4-r24": ["2 large baking potatoes, about 800g", "250g back bacon, chopped", "2 eggs", "80g mature Cheddar, grated", "1 x 415g tin baked beans", "Black pepper"],
  "w4-r25": ["400g 15% beef mince", "300g spaghetti", "1 x 400g tin chopped tomatoes", "1 onion, diced", "150g carrots, finely diced", "80g mature Cheddar, grated", "2 garlic cloves, crushed", "2 tsp mixed herbs", "1 tbsp vegetable oil", "Salt and black pepper"],
  "w4-r26": ["350g pork sausages", "1 x 415g tin baked beans", "600g potatoes, peeled and chopped", "1 onion, diced", "150g carrots, diced", "75ml milk", "20g buttery spread", "Black pepper"],
  "w4-r27": ["300g macaroni", "160g mature Cheddar, grated", "350ml milk", "30g plain flour", "30g buttery spread", "300g broccoli, cut into florets", "2 garlic baguettes", "Salt and black pepper"],
  "w4-r28": ["350g pork sausages", "1 x 320g sheet ready-rolled puff pastry", "600g potatoes, peeled and chopped", "250g carrots, sliced", "120g frozen peas", "75ml milk", "20g buttery spread", "Black pepper"],
};

const twoAdultDefaultPortionNote = "This dinner is sized for two adults: use the larger and smaller serving shown. Any pack or batch surplus can be saved for another meal.";

const twoAdultPortionDetails: Record<string, string[]> = {
  "w1-r1": ["About 200g cooked sausages + 450g mash, peas & gravy", "About 140g cooked sausages + 350g mash, peas & gravy"],
  "w1-r2": ["2 wraps + about 330g potato wedges", "1 wrap + about 270g potato wedges"],
  "w1-r3": ["2 chops + about 350g mash & gravy", "1 chop + about 250g mash & gravy"],
  "w1-r4": ["About 650g finished chicken fried rice", "About 500g finished chicken fried rice"],
  "w1-r5": ["1 cheeseburger + about 330g potato wedges", "1 cheeseburger + about 270g potato wedges"],
  "w1-r6": ["About 750g finished chicken & mushroom gnocchi", "About 600g finished chicken & mushroom gnocchi"],
  "w1-r7": ["½ omelette + about 350g chips and peas", "½ omelette + about 300g chips and peas"],
  "w2-r8": ["About 750g finished chicken & mushroom pasta", "About 600g finished chicken & mushroom pasta"],
  "w2-r9": ["About 600g finished sausage and vegetable traybake", "About 500g finished sausage and vegetable traybake"],
  "w2-r10": ["8 fish fingers + about 450g chips + 110g peas", "4 fish fingers + about 300g chips + 90g peas"],
  "w2-r11": ["1 cheeseburger + about 330g potato wedges", "1 cheeseburger + about 270g potato wedges"],
  "w2-r12": ["About 650g finished stroganoff and rice", "About 500g finished stroganoff and rice"],
  "w2-r13": ["About 700g finished bacon and tomato pasta bake", "About 550g finished bacon and tomato pasta bake"],
  "w2-r14": ["1 Kiev + about 350g mash and peas", "1 Kiev + about 300g mash and peas"],
  "w3-r15": ["About 250g cooked chicken + 400g roast potatoes and vegetables + 2 Yorkshires", "About 150g cooked chicken + 300g roast potatoes and vegetables + 2 Yorkshires"],
  "w3-r16": ["About 550g finished chicken and vegetable risotto", "About 450g finished chicken and vegetable risotto"],
  "w3-r17": ["About 750g finished beef lasagne", "About 600g finished beef lasagne"],
  "w3-r18": ["About 700g finished sausage casserole and mash", "About 550g finished sausage casserole and mash"],
  "w3-r19": ["About 650g finished stroganoff and rice", "About 500g finished stroganoff and rice"],
  "w3-r20": ["About 750g finished chicken and mushroom pasta", "About 600g finished chicken and mushroom pasta"],
  "w3-r21": ["1 gammon steak + 2 eggs + about 420g chips + 110g peas", "1 gammon steak + 1 egg + about 330g chips + 90g peas"],
  "w4-r22": ["About 700g finished ham and cheese pasta bake", "About 550g finished ham and cheese pasta bake"],
  "w4-r23": ["1 chicken burger + about 330g potato wedges", "1 chicken burger + about 270g potato wedges"],
  "w4-r24": ["1 loaded baked potato with the larger share of the filling", "1 loaded baked potato with the smaller share of the filling"],
  "w4-r25": ["About 750g finished Bolognese and spaghetti", "About 600g finished Bolognese and spaghetti"],
  "w4-r26": ["About 700g finished sausage casserole and mash", "About 550g finished sausage casserole and mash"],
  "w4-r27": ["About 650g macaroni cheese and broccoli + ½ garlic baguette", "About 550g macaroni cheese and broccoli + ½ garlic baguette"],
  "w4-r28": ["About 250g cooked sausage plait + 400g mash and vegetables", "About 150g cooked sausage plait + 350g mash and vegetables"],
};

const twoAdultCookbook = {
  ...cookbookWithGuidance,
  weeks: cookbookWithGuidance.weeks.map((week) => ({
    ...week,
    meals: week.meals.map((recipe) => ({
      ...recipe,
      plates: "2",
      ingredients: twoAdultIngredientLists[recipe.id] ?? recipe.ingredients,
      portions: (twoAdultPortionDetails[recipe.id] ?? [
        "Use the larger adult serving shown.",
        "Use the smaller adult serving shown.",
      ]).map((detail, index) => ({
        label: index === 0 ? "Larger adult serving" : "Smaller adult serving",
        detail,
      })),
      portionNote: recipe.portionNote ?? twoAdultDefaultPortionNote,
    })),
  })),
} satisfies Cookbook;

export const cookbook = applyMorrisonsPricing(twoAdultCookbook);
