import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import auctionRoutes from "./modules/auctions/auctions.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN }));
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/auctions", auctionRoutes);
app.use((_req, res) =>
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } })
);
app.use(errorHandler);

export default app;
