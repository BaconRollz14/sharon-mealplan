import type { SyntheticEvent } from "react";

export interface MealImage {
  src: string;
  srcSet: string;
  fallbackSrcSet: string;
  sizes: string;
  alt: string;
}

/**
 * A stable local image for every recipe number keeps the visual identity of a
 * meal consistent wherever it appears (the week grid and the recipe reader).
 * The image source is deliberately tied to the dish rather than just its
 * broad category, so a traybake cannot silently become a plate of ribs.
 */
export const fallbackMealImage = "/family-dinner-hero-720.webp";

const localMealImage = (recipeNumber: number, alt: string): MealImage => {
  const number = String(recipeNumber).padStart(2, "0");
  return {
    src: `/meals/meal-${number}-1200.jpg`,
    srcSet: `/meals/meal-${number}-320.webp 320w, /meals/meal-${number}-480.webp 480w, /meals/meal-${number}-640.webp 640w, /meals/meal-${number}-1200.webp 1200w`,
    fallbackSrcSet: `/meals/meal-${number}-320.jpg 320w, /meals/meal-${number}-480.jpg 480w, /meals/meal-${number}-640.jpg 640w, /meals/meal-${number}-1200.jpg 1200w`,
    sizes: "(max-width: 780px) 100vw, (min-width: 1400px) 33vw, 50vw",
    alt,
  };
};

export const mealImages: Record<number, MealImage> = {
  1: localMealImage(1, "Sausages with mashed potato, peas and onion gravy"),
  2: localMealImage(2, "Chicken wraps with peppers and potato wedges"),
  3: localMealImage(3, "Pork chops with mashed potato and onion gravy"),
  4: localMealImage(4, "Honey-garlic chicken fried rice with vegetables"),
  5: localMealImage(11, "Homemade cheeseburger with potato wedges"),
  6: localMealImage(6, "Creamy chicken and mushroom gnocchi"),
  7: localMealImage(7, "Ham and cheese omelette with chips and peas"),
  8: localMealImage(8, "Creamy chicken and mushroom pasta"),
  9: localMealImage(9, "Sausage and vegetable traybake with potatoes and peppers"),
  10: localMealImage(10, "Fish fingers with homemade chips and peas"),
  11: localMealImage(11, "Homemade cheeseburger with potato wedges"),
  12: localMealImage(19, "Beef and mushroom stroganoff with rice"),
  13: localMealImage(13, "Bacon and tomato pasta bake with melted cheese"),
  14: localMealImage(14, "Chicken Kiev with mashed potato and peas"),
  15: localMealImage(15, "Sunday roast chicken dinner with vegetables and gravy"),
  16: localMealImage(16, "Leftover chicken and vegetable risotto"),
  17: localMealImage(17, "Layered beef lasagne with a golden cheese crust"),
  18: localMealImage(18, "Sausage and baked-bean casserole under mashed potato"),
  19: localMealImage(19, "Beef and mushroom stroganoff with rice"),
  20: localMealImage(8, "Creamy chicken and mushroom pasta"),
  21: localMealImage(21, "Gammon with fried egg, homemade chips and peas"),
  22: localMealImage(22, "Ham and cheese pasta bake"),
  23: localMealImage(23, "Chicken Parmesan-style burger with potato wedges"),
  24: localMealImage(24, "Loaded baked potato with bacon, egg and cheese"),
  25: localMealImage(25, "Beef Bolognese with pasta"),
  26: localMealImage(18, "Sausage and baked-bean casserole with mash"),
  27: localMealImage(27, "Macaroni cheese with broccoli and garlic bread"),
  28: localMealImage(28, "Sausage plait with mashed potato, carrots and peas"),
};

export function handleMealImageError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  image.onerror = null;
  image.removeAttribute("srcset");
  image.parentElement?.querySelectorAll("source").forEach((source) => source.removeAttribute("srcset"));
  image.src = fallbackMealImage;
}

export function getMealImage(recipeNumber: number, mealName?: string): MealImage {
  return mealImages[recipeNumber] ?? {
    src: fallbackMealImage,
    srcSet: "",
    fallbackSrcSet: "",
    sizes: "100vw",
    alt: mealName ? `${mealName} dinner` : "Family dinner",
  };
}
