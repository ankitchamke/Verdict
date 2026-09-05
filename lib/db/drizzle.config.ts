import { defineConfig } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load DATABASE_URL from process.env or artifacts/api-server/.env
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  const envPath = path.resolve(__dirname, "../../artifacts/api-server/.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*DATABASE_URL\s*=\s*["']?(.*?)["']?\s*$/);
      if (match && match[1]) {
        databaseUrl = match[1];
        break;
      }
    }
  }
}

if (!databaseUrl) {
  databaseUrl = "postgresql://postgres:postgres@localhost:5432/verdict";
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  out: "./migrations",
  dbCredentials: {
    url: databaseUrl,
  },
});
