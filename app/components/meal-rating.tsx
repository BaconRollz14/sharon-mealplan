"use client";

import { Star } from "lucide-react";

interface MealRatingProps {
  mealName: string;
  rating: number;
  onRate?: (rating: number) => void;
  className?: string;
}

export function MealRating({ mealName, rating, onRate = () => {}, className = "" }: MealRatingProps) {
  const moveRating = (event: React.KeyboardEvent<HTMLButtonElement>, value: number) => {
    const direction = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 0;
    const next = event.key === "Home" ? 1 : event.key === "End" ? 5 : direction ? ((value - 1 + direction + 5) % 5) + 1 : null;
    if (!next) return;
    event.preventDefault();
    onRate(next);
    event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`button[data-rating="${next}"]`)?.focus();
  };

  return (
    <div className={`meal-rating meal-rating-interactive ${className}`.trim()}>
      <span className="meal-rating-label">{rating ? `Your rating: ${rating}/5` : "Rate this meal"}</span>
      <div className="meal-rating-actions">
        <div className="meal-rating-stars" role="radiogroup" aria-label={`Rate ${mealName}`}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              data-rating={value}
              aria-checked={rating === value}
              aria-label={`${value} ${value === 1 ? "star" : "stars"} for ${mealName}`}
              className={value <= rating ? "is-filled" : ""}
              onClick={() => onRate(value)}
              onKeyDown={(event) => moveRating(event, value)}
              tabIndex={rating === value || (!rating && value === 1) ? 0 : -1}
            >
              <Star aria-hidden="true" fill={value <= rating ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
        {rating ? <button type="button" className="clear-rating" onClick={() => onRate(0)} aria-label={`Clear rating for ${mealName}`}>Clear</button> : null}
      </div>
    </div>
  );
}
