"use client";

import {
  CheckCircle2,
  ChefHat,
  Heart,
  Info,
  UsersRound,
} from "lucide-react";
import type { PortionMode, Recipe } from "../cookbook-data";
import { MealRating } from "./meal-rating";
import { getMealImage, handleMealImageError } from "../meal-images";
import { formatMinutes, money, totalMinutes } from "../planner-utils";

interface RecipeDetailProps {
  recipe: Recipe;
  titleId: string;
  displayDay?: string;
  isFavourite: boolean;
  isCooked: boolean;
  rating: number;
  onToggleFavourite: () => void;
  onToggleCooked: () => void;
  onRate: (rating: number) => void;
  cookingMode?: boolean;
  completedSteps?: Set<number>;
  onToggleCookingMode?: () => void;
  onToggleStep?: (stepIndex: number) => void;
}

const portionLabels: Record<string, string> = {
  "Larger adult serving": "Larger adult",
  "Smaller adult serving": "Smaller adult",
};

const portionModeLabels: Record<PortionMode, string> = {
  count: "Count items",
  finished: "Finished dish",
  components: "Separate components",
};

const portionModeNotes: Record<PortionMode, string> = {
  count: "Cook the planned batch and use the item count shown for the larger and smaller adult servings. Any extra stays as spare or leftovers.",
  finished: "Cook the planned batch, weigh the finished dish once, then serve the cooked weights shown for the larger and smaller adult servings.",
  components: "Cook the planned batch, then use the cooked or served weights shown for each component. Any extra stays as spare or leftovers.",
};

export function RecipeDetail({
  recipe,
  titleId,
  displayDay = recipe.day,
  isFavourite,
  isCooked,
  rating,
  onToggleFavourite,
  onToggleCooked,
  onRate,
  cookingMode = false,
  completedSteps = new Set<number>(),
  onToggleCookingMode = () => {},
  onToggleStep = () => {},
}: RecipeDetailProps) {
  const mealImage = getMealImage(recipe.recipeNumber, recipe.name);

  return (
    <article className="recipe-detail" aria-labelledby={titleId}>
      <div className="recipe-detail-media">
        <picture>
          {mealImage.srcSet ? <source type="image/webp" srcSet={mealImage.srcSet} sizes="(max-width: 780px) 100vw, 960px" /> : null}
          <img
            src={mealImage.src}
            srcSet={mealImage.fallbackSrcSet || undefined}
            alt={mealImage.alt}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            referrerPolicy="no-referrer"
            sizes="(max-width: 780px) 100vw, 960px"
            onError={handleMealImageError}
          />
        </picture>
      </div>
      <div className="recipe-detail-header">
        <span className="recipe-day-label">{displayDay}</span>
        <span className="recipe-cost"><small>Batch cost</small>{money.format(recipe.cost)}</span>
        <h3 id={titleId}>{recipe.name}</h3>
        <p>{recipe.description}</p>
        <div className="recipe-actions" aria-label="Recipe actions">
          <button
            type="button"
            className={isFavourite ? "is-active" : ""}
            onClick={onToggleFavourite}
            aria-pressed={isFavourite}
          >
            <Heart aria-hidden="true" fill={isFavourite ? "currentColor" : "none"} />
            {isFavourite ? "Favourite" : "Save favourite"}
          </button>
          <button
            type="button"
            className={isCooked ? "is-active" : ""}
            onClick={onToggleCooked}
            aria-pressed={isCooked}
          >
            <CheckCircle2 aria-hidden="true" />
            {isCooked ? "Cooked" : "Mark cooked"}
          </button>
          <button type="button" className={cookingMode ? "is-active" : ""} onClick={onToggleCookingMode} aria-pressed={cookingMode}>
            <ChefHat aria-hidden="true" />{cookingMode ? "Exit cooking mode" : "Cooking mode"}
          </button>
        </div>
        <MealRating
          mealName={recipe.name}
          rating={rating}
          onRate={onRate}
          className="recipe-rating-control"
        />
      </div>

      <dl className="recipe-stats">
        <div><dt><ChefHat aria-hidden="true" />Total</dt><dd>{formatMinutes(totalMinutes(recipe))}</dd></div>
        <div><dt><UsersRound aria-hidden="true" />Portions</dt><dd>{recipe.plates}</dd></div>
      </dl>

      <div className="recipe-detail-body">
        <section aria-labelledby={`${titleId}-ingredients`}>
          <h4 id={`${titleId}-ingredients`}>Ingredients</h4>
          <ul className="ingredients-list">
            {recipe.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
          </ul>
        </section>
        <section aria-labelledby={`${titleId}-method`}>
          <h4 id={`${titleId}-method`}>Method</h4>
          <ol className={`method-list${cookingMode ? " is-cooking-mode" : ""}`}>
            {recipe.method.map((step, index) => (
              <li key={`${recipe.id}-${titleId}-step-${index}`} className={completedSteps.has(index) ? "is-complete" : ""}>
                {cookingMode ? (
                  <label className="method-step-check">
                    <input type="checkbox" checked={completedSteps.has(index)} onChange={() => onToggleStep(index)} />
                    <span>{step}</span>
                  </label>
                ) : step}
              </li>
            ))}
          </ol>
          {cookingMode ? <p className="cooking-mode-hint"><ChefHat aria-hidden="true" />Tick each step as you go. Your place is saved in this browser.</p> : null}
        </section>
        {recipe.costBreakdown?.length ? (
          <details className="cost-breakdown">
            <summary>
              <span><Info aria-hidden="true" />How this batch cost is calculated</span>
              <strong>{money.format(recipe.cost)}</strong>
            </summary>
            <div className="cost-breakdown-content">
              <div className="cost-table-wrap">
                <table>
                  <caption className="sr-only">Itemised cost calculation for {recipe.name}</caption>
                  <thead>
                    <tr><th scope="col">Pack</th><th scope="col">Full pack</th><th scope="col">Used</th><th scope="col">Share</th><th scope="col">This dinner</th></tr>
                  </thead>
                  <tbody>
                    {recipe.costBreakdown.map((line) => (
                      <tr key={`${recipe.id}-${line.packName}-${line.quantityUsed}`}>
                        <th scope="row"><strong>{line.packName}</strong><small>{line.packSize}</small>{line.note && <em>{line.note}</em>}</th>
                        <td data-label="Full pack">{money.format(line.fullPackPrice)}</td>
                        <td data-label="Used">{line.quantityUsed}</td>
                        <td data-label="Share">{line.proportion}</td>
                        <td data-label="This dinner">{money.format(line.attributedCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr><th scope="row" colSpan={4}>Batch cost</th><td>{money.format(recipe.cost)}</td></tr></tfoot>
                </table>
              </div>
              {recipe.costNote && <p className="cost-estimate-note"><strong>{recipe.costStatus === "estimated" ? "Estimated line:" : "Costing note:"}</strong> {recipe.costNote}</p>}
              <p className="cost-method-note">Each line is the normal full-pack price × quantity used ÷ pack quantity, rounded to the nearest penny. Ingredients already on hand keep their value; only salt and black pepper are treated as unpriced staples.</p>
            </div>
          </details>
        ) : null}
        <section aria-labelledby={`${titleId}-portions`} className="portion-section">
          <div className="portion-heading">
            <h4 id={`${titleId}-portions`}>Portion guide</h4>
            {recipe.portionMode && <span className="portion-mode">{portionModeLabels[recipe.portionMode]}</span>}
          </div>
          {recipe.portionMode && (
            <div className="portion-rule" role="note">
              <Info aria-hidden="true" />
              <p>{recipe.portionNote ?? portionModeNotes[recipe.portionMode]}</p>
            </div>
          )}
          <div className="portion-grid">
            {recipe.portions.map((portion) => (
              <div key={portion.label}>
                <strong>{portionLabels[portion.label] ?? portion.label.replace(" portion", "")}</strong>
                <span>{portion.detail}</span>
              </div>
            ))}
          </div>
          <p className="calorie-note">Weights below are cooked or served estimates unless an item is counted; brands and cooking losses will change the figures.</p>
        </section>
        <aside className="cook-note">
          <ChefHat aria-hidden="true" />
          <div><strong>Cook&apos;s note</strong><p>{recipe.cookNote}</p></div>
        </aside>
      </div>
    </article>
  );
}
