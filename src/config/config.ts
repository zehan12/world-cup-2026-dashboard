import { env } from "@/env";

export const config = {
	appUrl: env.VITE_APP_URL,
	authProvider: env.VITE_AUTH_PROVIDER,
	enableRateLimit: env.VITE_ENABLE_RATE_LIMIT,
};

export default config;
