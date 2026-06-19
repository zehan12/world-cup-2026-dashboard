import { fireEvent, render, screen } from "@testing-library/react";
import { NuqsAdapter } from "nuqs/adapters/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { useFilterStore } from "../store";

// Mock ESPN scores fetch to avoid hitting real endpoints
vi.mock("@/services/espnService", () => ({
	espnService: {
		fetchScores: vi.fn().mockResolvedValue({ events: [] }),
		fetchRoster: vi.fn().mockResolvedValue({ athletes: [] }),
	},
}));

describe("App Integration Tests", () => {
	beforeEach(() => {
		// Reset Zustand store state before each test
		useFilterStore.getState().resetFilters();
		useFilterStore.getState().setTz("Auto");
		useFilterStore.getState().setFilterBodyOpen(false);
		useFilterStore.getState().setAskAIOpen(false);
	});

	it("renders main dashboard and details correctly", async () => {
		render(
			<NuqsAdapter>
				<App />
			</NuqsAdapter>,
		);

		// Check headers and status details are visible
		expect(screen.getByText(/Total:/i)).toBeInTheDocument();
		expect(screen.getByText(/FIFA World Cup 26/i)).toBeInTheDocument();
	});

	it("switches to standings view and back to matches view", async () => {
		render(
			<NuqsAdapter>
				<App />
			</NuqsAdapter>,
		);

		// Switch to Standings View
		const standingsBtn = screen.getByRole("button", { name: /Standings/i });
		fireEvent.click(standingsBtn);

		// Check that standings calculate and display
		expect(screen.getAllByText(/Group A/i).length).toBeGreaterThan(0);

		// Click Mexico in the standings table row to trigger filter
		const teamCell = screen
			.getAllByText("Mexico")
			.find((el) => el.closest("tr"));
		expect(teamCell).toBeDefined();
		fireEvent.click(teamCell!);

		// Verify we are back in matches view and filtering by Mexico is active
		expect(useFilterStore.getState().team).toBe("Mexico");
	});

	it("handles query filters and clears them via reset", async () => {
		render(
			<NuqsAdapter>
				<App />
			</NuqsAdapter>,
		);

		const searchInput = screen.getByPlaceholderText(
			"Search team, venue, or city...",
		);

		// Enter query that matches specific venue or team
		fireEvent.change(searchInput, { target: { value: "Miami" } });
		expect(useFilterStore.getState().q).toBe("Miami");

		// Find and click the Reset button
		const resetBtn = screen.getByRole("button", { name: /Reset/i });
		fireEvent.click(resetBtn);

		// Verify state is cleared
		expect(useFilterStore.getState().q).toBe("");
	});
});
