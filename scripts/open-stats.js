import { exec } from "node:child_process";
import path from "node:path";

const filePath = path.resolve("dist/stats.html");
const fileUrl = `file://${filePath}`;

console.log(`Opening bundle stats: ${fileUrl}`);

const cmd =
	process.platform === "win32"
		? `start "" "${fileUrl}"`
		: process.platform === "darwin"
			? `open "${fileUrl}"`
			: `xdg-open "${fileUrl}"`;

exec(cmd, (err) => {
	if (err) {
		console.error("Failed to open stats file automatically.");
		console.log(`Please open the file manually in your browser:\n${fileUrl}`);
	}
});
