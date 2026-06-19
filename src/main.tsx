import { NuqsAdapter } from "nuqs/adapters/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

if (typeof window !== "undefined" && import.meta.env.DEV) {
	import("react-scan").then(({ scan }) => {
		scan({
			enabled: true,
			log: true,
		});
	});
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<NuqsAdapter>
			<App />
		</NuqsAdapter>
	</StrictMode>,
);
