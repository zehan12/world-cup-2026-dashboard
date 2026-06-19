import path from "node:path";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { partytownVite } from "@builder.io/partytown/utils";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		babel({
			presets: [reactCompilerPreset()],
		}),
		tailwindcss(),
		partytownVite({
			dest: path.resolve(__dirname, "public", "~partytown"),
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		proxy: {
			"/espn-api": {
				target:
					"https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world",
				changeOrigin: true,
				rewrite: (p) => p.replace(/^\/espn-api/, ""),
			},
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/setup.ts",
	},
});
