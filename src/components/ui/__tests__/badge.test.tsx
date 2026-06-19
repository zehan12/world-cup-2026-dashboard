import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "../badge";

describe("Badge component", () => {
	it("renders children correctly", () => {
		render(<Badge>Test Badge</Badge>);
		expect(screen.getByText("Test Badge")).toBeInTheDocument();
	});

	it("applies variant classes", () => {
		render(<Badge variant="destructive">Destructive</Badge>);
		const badge = screen.getByText("Destructive");
		expect(badge).toHaveAttribute("data-variant", "destructive");
	});
});
