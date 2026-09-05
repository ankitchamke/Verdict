import express, { type Express } from "express";
import type { IncomingMessage, ServerResponse } from "node:http";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { pinoHttp } from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { clerkMiddleware } from "@clerk/express";

const app: Express = express();

// Direct health checks for Render and monitoring probes
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: IncomingMessage) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

// API routes - support both with and without /api prefix (for Vercel serverless functions)
app.use("/api", router);
app.use(router);

// Serve built frontend static assets if available (Production single-service mode)
const candidateDistPaths = [
  path.resolve(process.cwd(), "artifacts/verdict/dist/public"),
  path.resolve(__dirname, "../../verdict/dist/public"),
  path.resolve(__dirname, "../verdict/dist/public"),
];

const frontendDistPath = candidateDistPaths.find((p) => fs.existsSync(p));

if (frontendDistPath) {
  logger.info({ frontendDistPath }, "Serving production frontend static files");
  app.use(express.static(frontendDistPath));

  // Express 5 compatible SPA fallback: Send index.html for non-API GET requests
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

export default app;
