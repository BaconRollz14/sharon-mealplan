"use client";

import type { WeekPlan } from "../cookbook-data";
import { money, shortWeekTitles } from "../planner-utils";

interface WeekSelectorProps {
  weeks: WeekPlan[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export function WeekSelector({ weeks, activeIndex, onChange }: WeekSelectorProps) {
  return (
    <nav className="week-overview" aria-label="Meal-plan weeks">
      <div className="week-tabs" role="group" aria-label="Choose a meal-plan week">
        <div className="week-tabs-list">
          {weeks.map((week, index) => (
            <button key={week.number} type="button" className="week-tab" aria-pressed={index === activeIndex} onClick={() => onChange(index)}>
              <span>Week {week.number}</span>
              <strong>{shortWeekTitles[week.number]}</strong>
              <small>{money.format(week.checkoutTotal)} basket estimate</small>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
