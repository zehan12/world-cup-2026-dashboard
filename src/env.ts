import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	server: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	client: {
		VITE_APP_URL: z.string().url().optional(),
		VITE_AUTH_PROVIDER: z.string().optional(),
		VITE_ENABLE_RATE_LIMIT: z
			.string()
			.transform((val) => val === "true")
			.optional(),
	},
	runtimeEnv: import.meta.env,
	emptyStringAsUndefined: true,
});
export default env;
