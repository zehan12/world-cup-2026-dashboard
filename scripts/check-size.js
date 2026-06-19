import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import zlib from "node:zlib";

console.log("Building project...");
execSync("bun run build", { stdio: "inherit" });

const assetsDir = path.resolve("dist/assets");
if (!fs.existsSync(assetsDir)) {
	console.error("Assets directory not found!");
	process.exit(1);
}

const files = fs.readdirSync(assetsDir);
console.log("\n=================== Bundle Sizing Analysis ===================");
const tableData = [];

for (const file of files) {
	if (file.endsWith(".js") || file.endsWith(".css")) {
		const filePath = path.join(assetsDir, file);
		const stats = fs.statSync(filePath);
		const sizeKB = (stats.size / 1024).toFixed(2);

		// Gzip size
		const fileContent = fs.readFileSync(filePath);
		const gzipSize = zlib.gzipSync(fileContent).length;
		const gzipKB = (gzipSize / 1024).toFixed(2);

		tableData.push({
			File: file,
			"Size (KB)": `${sizeKB} KB`,
			"Gzip (KB)": `${gzipKB} KB`,
		});
	}
}

console.table(tableData);
