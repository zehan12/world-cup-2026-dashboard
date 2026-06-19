import { describe, expect, it } from "vitest";
import type { Match } from "@/data/matches";
import { calculateStandings } from "../standings-helpers";

describe("calculateStandings", () => {
	it("returns empty array for empty matches list", () => {
		expect(calculateStandings([])).toEqual([]);
	});

	it("initializes all teams in group to zero stats if not played", () => {
		const matches: Match[] = [
			{
				d: "2026-06-11",
				t: "3:00 PM",
				sk: 15,
				h: "USA",
				a: "Mexico",
				grp: "Group A",
				v: "Azteca",
				tv: "FOX",
			},
		];
		const result = calculateStandings(matches);
		expect(result).toHaveLength(1);
		expect(result[0].group).toBe("Group A");
		expect(result[0].standings).toHaveLength(2);

		const usa = result[0].standings.find((t) => t.name === "USA");
		expect(usa).toEqual({
			name: "USA",
			p: 0,
			w: 0,
			d: 0,
			l: 0,
			gf: 0,
			ga: 0,
			gd: 0,
			pts: 0,
		});
	});

	it("calculates correct statistics for played matches", () => {
		const matches: Match[] = [
			{
				d: "2026-06-11",
				t: "3:00 PM",
				sk: 15,
				h: "USA",
				a: "Mexico",
				grp: "Group A",
				v: "Azteca",
				tv: "FOX",
				res: "2-1",
			},
			{
				d: "2026-06-12",
				t: "3:00 PM",
				sk: 15,
				h: "Canada",
				a: "Costa Rica",
				grp: "Group A",
				v: "BC Place",
				tv: "FS1",
				res: "1-1",
			},
		];

		const result = calculateStandings(matches);
		const standings = result[0].standings;

		// USA (Win: 3pts, GF: 2, GA: 1, GD: 1)
		const usa = standings.find((t) => t.name === "USA");
		expect(usa?.pts).toBe(3);
		expect(usa?.p).toBe(1);
		expect(usa?.w).toBe(1);

		// Canada (Draw: 1pt, GF: 1, GA: 1, GD: 0)
		const canada = standings.find((t) => t.name === "Canada");
		expect(canada?.pts).toBe(1);
		expect(canada?.d).toBe(1);

		// Costa Rica (Draw: 1pt, GF: 1, GA: 1, GD: 0)
		const costaRica = standings.find((t) => t.name === "Costa Rica");
		expect(costaRica?.pts).toBe(1);

		// Mexico (Loss: 0pts, GF: 1, GA: 2, GD: -1)
		const mexico = standings.find((t) => t.name === "Mexico");
		expect(mexico?.pts).toBe(0);
		expect(mexico?.l).toBe(1);
	});

	it("handles live score parameters from ESPN status correctly", () => {
		const matches: Match[] = [
			{
				d: "2026-06-11",
				t: "3:00 PM",
				sk: 15,
				h: "USA",
				a: "Mexico",
				grp: "Group A",
				v: "Azteca",
				tv: "FOX",
				_scoreH: "3",
				_scoreA: "1",
				_st: "live",
			},
		];

		const result = calculateStandings(matches);
		const standings = result[0].standings;
		const usa = standings.find((t) => t.name === "USA");
		expect(usa?.pts).toBe(3);
		expect(usa?.gf).toBe(3);
	});

	it("sorts teams by Points -> GD -> GF -> Alphabetical tiebreakers", () => {
		const matches: Match[] = [
			// Group B
			{
				d: "2026-06-11",
				t: "3:00 PM",
				sk: 15,
				h: "England",
				a: "Wales",
				grp: "Group B",
				v: "Wembley",
				tv: "FOX",
				res: "1-0",
			},
			{
				d: "2026-06-12",
				t: "3:00 PM",
				sk: 15,
				h: "Scotland",
				a: "Wales",
				grp: "Group B",
				v: "Hampden",
				tv: "FS1",
				res: "3-1",
			},
		];

		const result = calculateStandings(matches);
		const standings = result[0].standings;

		// Scotland (3 pts, GD +2, GF 3)
		// England (3 pts, GD +1, GF 1)
		// Wales (0 pts, GD -3)
		expect(standings[0].name).toBe("Scotland");
		expect(standings[1].name).toBe("England");
		expect(standings[2].name).toBe("Wales");
	});
});
