"use client";

export default function PlannerError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="app-fallback">
      <h1>The planner hit a snag</h1>
      <p>Your ticks, ratings and dinner order are saved on this device. Try again, and if it keeps happening, reload the page.</p>
      <button type="button" onClick={reset}>Try again</button>
    </main>
  );
}
