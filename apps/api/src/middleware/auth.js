import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../lib/httpError.js";

export function requireAuth(req, _res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return next(new HttpError(401, "UNAUTHORIZED", "Login required"));
  try {
    req.userId = jwt.verify(token, env.JWT_SECRET).sub;
    next();
  } catch {
    next(new HttpError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
}
