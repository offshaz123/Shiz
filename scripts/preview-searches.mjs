// What the automatic finder will actually search for over the next fortnight.
import { dayIndex, industryForDay, searchesForDay } from "../src/lib/auto-search.ts";
const today = dayIndex();
for (let d = 0; d < 10; d++) {
  const day = today + d;
  const date = new Date((day) * 86400000).toISOString().slice(0, 10);
  console.log(`${date}  ${industryForDay(day)}`);
  for (const s of searchesForDay(day)) console.log(`    ${s.query}`);
}
