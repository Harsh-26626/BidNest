import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { bidLimiter } from "../../middleware/rateLimit.js";
import { listSchema, createSchema, bidSchema } from "./auctions.schemas.js";
import { listAuctions, createAuction, getAuction } from "./auctions.service.js";
import { placeBid } from "./bids.service.js";

const router = Router();
router.use(requireAuth);

router.get("/", validate(listSchema), async (req, res) =>
  res.json(await listAuctions(req.valid.query, req.userId)));

router.post("/", validate(createSchema), async (req, res) =>
  res.status(201).json(await createAuction(req.userId, req.valid.body)));

router.get("/:id", async (req, res) =>
  res.json(await getAuction(req.params.id)));

router.post("/:id/bids", bidLimiter, validate(bidSchema), async (req, res) =>
  res.status(201).json(
    await placeBid({
      auctionId: req.params.id,
      userId: req.userId,
      amount: req.valid.body.amount,
    })
  ));

export default router;
