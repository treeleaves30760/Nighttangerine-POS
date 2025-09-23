import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import productsRouter from "./routes/products";
import ordersRouter from "./routes/orders";
import backupRouter from "./routes/backup";
import { initWebSocket } from "./realtime";

dotenv.config();

const app = express();
const PORT = parseInt(process.env["PORT"] || "3000");

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env["NODE_ENV"] === "production"
        ? ["https://your-domain.com"]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
);

// Rate limiting (enabled in production only)
if (process.env["NODE_ENV"] === "production") {
  const limiter = rateLimit({
    windowMs: parseInt(process.env["RATE_LIMIT_WINDOW_MS"] || "900000"), // 15 minutes
    max: parseInt(process.env["RATE_LIMIT_MAX_REQUESTS"] || "100"),
    message: "Too many requests from this IP, please try again later.",
  });
  app.use("/api", limiter);
}

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(process.env["NODE_ENV"] === "production" ? "combined" : "dev"));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env["NODE_ENV"],
    version: process.env["npm_package_version"] || "1.0.0",
  });
});

// API Routes
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/backup", backupRouter);

// Basic API route
app.get("/api/status", (_req, res) => {
  res.json({
    message: "Nighttangerine POS API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({
      message: "Something went wrong!",
      error:
        process.env["NODE_ENV"] === "development" ? err.message : undefined,
    });
  },
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Nighttangerine POS Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env["NODE_ENV"] || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Attach WebSocket server
initWebSocket(server);
