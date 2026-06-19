import { z } from "zod";

export const clientSchema = {
	VITE_APP_URL: z.string().url().optional(),
	VITE_AUTH_PROVIDER: z.string().optional(),
	VITE_ENABLE_RATE_LIMIT: z
		.string()
		.transform((val) => val === "true")
		.optional(),
};
