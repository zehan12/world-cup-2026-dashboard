import path from "node:path";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { partytownVite } from "@builder.io/partytown/utils";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const isAnalyze = mode === "analyze";

	return {
		plugins: [
			react(),
			babel({
				presets: [reactCompilerPreset()],
			}),
			tailwindcss(),
			partytownVite({
				dest: path.resolve(__dirname, "public", "~partytown"),
			}),
			isAnalyze &&
				visualizer({
					open: true,
					filename: "dist/stats.html",
					template: "treemap",
					gzipSize: true,
					brotliSize: true,
				}),
		].filter(Boolean),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules")) {
						if (id.includes("react") || id.includes("scheduler")) {
							return "vendor-react";
						}
						if (id.includes("lucide-react")) {
							return "vendor-lucide";
						}
						return "vendor-others";
					}
				},
			},
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
	};
});
