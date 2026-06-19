import { describe, expect, it } from "vitest";
import { fmtDay, TZ_ZONES } from "../date-helpers";

describe("date-helpers", () => {
	it("should have correct timezone mappings", () => {
		expect(TZ_ZONES.Pacific).toBe("America/Los_Angeles");
		expect(TZ_ZONES.Central).toBe("America/Chicago");
	});

	it("should format dates correctly", () => {
		const formatted = fmtDay("2026-06-11");
		expect(formatted.dow).toBe("Thu");
		expect(formatted.dt).toBe("Jun 11");
	});
});
