"use client";

import { Star } from "lucide-react";

interface MealRatingProps {
  mealName: string;
  rating: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  className?: string;
}

export function MealRating({ mealName, rating, onRate = () => {}, readOnly = false, className = "" }: MealRatingProps) {
  if (readOnly) {
    return (
      <div
        role="img"
        className={`meal-rating meal-rating-summary ${className}`.trim()}
        aria-label={rating ? `${mealName} rated ${rating} out of 5` : `${mealName} has not been rated`}
      >
        <span className="meal-rating-label">{rating ? `Rated ${rating}/5` : "Not rated"}</span>
        <span className="meal-rating-stars" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((value) => (
            <Star key={value} aria-hidden="true" className={value <= rating ? "is-filled" : undefined} fill={value <= rating ? "currentColor" : "none"} />
          ))}
        </span>
      </div>
    );
  }

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
