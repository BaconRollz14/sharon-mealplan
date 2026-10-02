import { PlannerClient, type PlannerLocation } from "./planner-client";

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? null;

// Render the view a link asks for on the server, so a shared shopping or recipe link
// doesn't paint the Dinners view first and then jump.
export default async function Home({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const location: PlannerLocation = {
    view: first(params.view),
    week: first(params.week),
    recipe: first(params.recipe),
  };
  return <PlannerClient initialLocation={location} />;
}
