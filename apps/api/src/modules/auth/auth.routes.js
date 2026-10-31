import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { authLimiter } from "../../middleware/rateLimit.js";
import { registerSchema, loginSchema } from "./auth.schemas.js";
import * as auth from "./auth.service.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), async (req, res) =>
  res.status(201).json(await auth.register(req.valid.body)));

router.post("/login", authLimiter, validate(loginSchema), async (req, res) =>
  res.json(await auth.login(req.valid.body)));

router.get("/me", requireAuth, async (req, res) =>
  res.json(await auth.me(req.userId)));

export default router;
