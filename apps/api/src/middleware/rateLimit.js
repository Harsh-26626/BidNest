import rateLimit from "express-rate-limit";

const limited = { error: { code: "RATE_LIMITED", message: "Too many requests, slow down" } };

export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  message: limited,
});

export const bidLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  message: limited,
});
