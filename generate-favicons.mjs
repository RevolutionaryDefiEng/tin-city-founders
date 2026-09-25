/**
 * generate-favicons.mjs
 * Run once: node generate-favicons.mjs
 * Requires: npm install sharp (or pnpm add -D sharp)
 *
 * Generates from the existing favicon.svg:
 *   client/public/favicon.ico        (32x32 wrapped in .ico)
 *   client/public/favicon-32x32.png
 *   client/public/favicon-16x16.png
 *   client/public/apple-touch-icon.png  (180x180)
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const publicDir = path.resolve("client/public");
const svgPath = path.join(publicDir, "favicon.svg");

// Check if sharp is available; install it if not
try {
  await import("sharp");
} catch {
  console.log("Installing sharp temporarily...");
  execSync("pnpm add -D sharp", { stdio: "inherit" });
}

const sharp = (await import("sharp")).default;
const svgBuffer = fs.readFileSync(svgPath);

const sizes = [
  { name: "favicon-32x32.png", size: 32 },
  { name: "favicon-16x16.png", size: 16 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, name));
  console.log(`✓ ${name}`);
}

// favicon.ico — just copy the 32x32 png and rename (browsers accept PNG-in-ICO)
fs.copyFileSync(
  path.join(publicDir, "favicon-32x32.png"),
  path.join(publicDir, "favicon.ico")
);
console.log("✓ favicon.ico");
console.log("\nAll favicon assets generated.");
