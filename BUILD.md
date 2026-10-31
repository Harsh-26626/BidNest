# BUILD.md: BidNest

Build guide for `PROJECT.md`. Total budget: **20 minutes**, split into 8 chunks. Each chunk has a goal, steps and a "Done when" check. Do them in order, or split between two people (see section "Parallel plan").

UI note: the exact visuals come from the UI designer agent (`PROMPT.md`). This document defines structure and behavior. After the designs are shared, the frontend chunks (4 to 6) get a pass to match classes and layout.

## 20-MINUTE EDITION (this overrides the plan below)

The budget is now 20 minutes. Same architecture, smaller scope. The code in the chunks below is paste-ready, so this is a copy-paste sprint: no polish, no deploy.

| Chunk | What | Min | Cumulative |
|-------|------|-----|-----------|
| 0 | Repo scaffold | 2 | 2 |
| 1 | Database and Prisma (no seed) | 2 | 4 |
| 2 | Auth API | 3 | 7 |
| 3 | Auctions and bidding API | 4 | 11 |
| 4 | Web foundation and auth screens | 3 | 14 |
| 5 | Auctions list, details, create | 3 | 17 |
| 6 | Auction room | 3 | 20 |

**Splitting in two is strongly recommended:** Person A does chunks 0 to 3 (API, 11 min), Person B does chunks 4 to 6 (web, 9 min) against the contract in `PROJECT.md` section 10. Integrate at minute 14 to 20.

### What is cut (and how to cut it)

| Cut | How |
|-----|-----|
| Deploy, README | Skip chunk 7. Run locally and demo from `localhost`. |
| Seed script | Skip. Register two users in two browsers and create demo auctions through the UI. |
| Rate limiting | Don't create `rateLimit.js`. Remove the limiter imports and the `authLimiter` and `bidLimiter` arguments from the routes. |
| Scheduled start and the Upcoming tab | In `createSchema` delete `startsAt` and the form's "Schedule" option. Auctions always start now. Leave the `UPCOMING` code in place; it simply never triggers. |
| Search and "Mine" tab | The list has two tabs only: **Live** and **Ended**. Leave the unused `q` and `mine` code in the service. |
| Multiple images | The create form has one image URL field. Send `images: [url]`. The gallery shows that one image. |
| Duration | Preset chips only: 5 min, 15 min, 1 hour. No custom end picker. |
| Per-field form errors | Show one message with `errorMessage(error)` above the submit button. |
| Designer tokens and polish | Use default Tailwind (dark slate background, emerald accent). Apply the designer's visuals only if time is left over. |
| Details page variants | Two states only: **Participate** (live) and **View results** (ended). The creator can open the room, where bidding is disabled with "You created this auction". |

### Never cut
Auth (register, login, protected routes), the atomic bid check in `bids.service.js`, rejection of low bids, the end-of-auction check, bid history, and the winner banner.

### Mini smoke test (1 minute at the end)
1. Two users in two browsers. 2. User A creates a 5-minute auction. 3. User B reads the instructions, clicks Participate, and bids with a chip. 4. A lower or equal custom bid is rejected with a message. 5. User A cannot bid. 6. After the end time the controls lock and the winner shows.

---

## Time plan (original 40-minute plan, for reference)

| Chunk | What | Min | Cumulative |
|-------|------|-----|-----------|
| 0 | Repo scaffold | 3 | 3 |
| 1 | Database and Prisma | 5 | 8 |
| 2 | Auth API | 6 | 14 |
| 3 | Auctions and bidding API | 8 | 22 |
| 4 | Web foundation and auth screens | 5 | 27 |
| 5 | Auctions list, details, create | 6 | 33 |
| 6 | Auction room | 5 | 38 |
| 7 | Wrap-up and deploy prep | 2 | 40 |

## Parallel plan (2 or more people)
- **Person A (API):** chunks 1, 2, 3. **Person B (Web):** chunks 4, 5, 6. Person B builds against the API contract in `PROJECT.md` section 10. If the API isn't ready, return mock data from `api.js` temporarily.
- Merge at chunk 7: set `VITE_API_URL`, run the smoke test.

## If you run out of time, cut in this order
1. Search box and "Mine" tab. 2. Scheduled start (always start now). 3. Seed script. 4. Rate limiting. Never cut: auth, bid validation, end-of-auction check, winner display.

---

## Chunk 0: Repo scaffold (3 min)

```bash
mkdir bidnest && cd bidnest && git init
mkdir -p apps/api apps/web
printf "node_modules\n.env\ndist\n" > .gitignore
```

**API**
```bash
cd apps/api
npm init -y
npm pkg set type=module
npm pkg set scripts.dev="node --watch src/server.js"
npm pkg set scripts.start="prisma migrate deploy && node src/server.js"
npm pkg set scripts.postinstall="prisma generate"
npm pkg set scripts.db:migrate="prisma migrate dev"
npm pkg set scripts.db:seed="node prisma/seed.js"
npm install express@5 cors helmet express-rate-limit zod jsonwebtoken bcryptjs dotenv @prisma/client@6
npm install -D prisma@6
mkdir -p src/{config,lib,middleware,modules/auth,modules/auctions} prisma
```

`apps/api/.env.example` (copy to `.env`)
```
DATABASE_URL="mysql://root:password@localhost:3306/bidnest"
JWT_SECRET="change-me-to-a-long-random-string"
JWT_EXPIRES_IN="1d"
PORT=4000
WEB_ORIGIN="http://localhost:5173"
```

**Web**
```bash
cd ../
npm create vite@latest web -- --template react   # choose React + JavaScript
cd web
npm install
npm install @reduxjs/toolkit react-redux react-router-dom lucide-react
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

`apps/web/.env.example` (copy to `.env`)
```
VITE_API_URL="http://localhost:4000/api/v1"
```

**Done when:** both folders install without errors; create the local database: `CREATE DATABASE bidnest;`

---

## Chunk 1: Database and Prisma (5 min)

`apps/api/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(cuid())
  name         String    @db.VarChar(80)
  email        String    @unique @db.VarChar(191)
  passwordHash String
  createdAt    DateTime  @default(now())
  auctions     Auction[]
  bids         Bid[]
}

model Auction {
  id            String   @id @default(cuid())
  title         String   @db.VarChar(120)
  description   String   @db.Text
  images        Json
  startingPrice Int
  bidStep       Int      @default(100)
  highestBid    Int?
  bidCount      Int      @default(0)
  startsAt      DateTime
  endsAt        DateTime
  createdAt     DateTime @default(now())
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
  bids          Bid[]

  @@index([endsAt])
  @@index([startsAt])
  @@index([createdById])
}

model Bid {
  id        String   @id @default(cuid())
  amount    Int
  createdAt DateTime @default(now())
  auctionId String
  bidderId  String
  auction   Auction  @relation(fields: [auctionId], references: [id], onDelete: Cascade)
  bidder    User     @relation(fields: [bidderId], references: [id])

  @@unique([auctionId, amount])
  @@index([auctionId, createdAt])
}
```

`src/lib/prisma.js`
```js
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
```

Run:
```bash
npx prisma migrate dev --name init
```

`prisma/seed.js` (optional, great for demos)
```js
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

const min = (n) => new Date(Date.now() + n * 60_000);

const passwordHash = await bcrypt.hash("Passw0rd!", 10);
const [meera, rohan] = await Promise.all(
  [["Meera Iyer", "meera@bidnest.dev"], ["Rohan Das", "rohan@bidnest.dev"]].map(([name, email]) =>
    prisma.user.upsert({ where: { email }, update: {}, create: { name, email, passwordHash } })
  )
);

const img = (seed) => [`https://picsum.photos/seed/${seed}/900/700`];
await prisma.auction.createMany({
  data: [
    { title: "Signed Cricket Bat", description: "Signed by the squad.", images: img("bat"), startingPrice: 5000, bidStep: 500, startsAt: min(-10), endsAt: min(30), createdById: meera.id },
    { title: "Handmade Banarasi Saree", description: "Pure silk, handwoven.", images: img("saree"), startingPrice: 8000, bidStep: 1000, startsAt: min(-5), endsAt: min(3), createdById: rohan.id },
    { title: "Acoustic Guitar", description: "Barely used.", images: img("guitar"), startingPrice: 12000, bidStep: 1000, startsAt: min(60), endsAt: min(120), createdById: meera.id },
    { title: "Concert Ticket Bundle", description: "Two front-row tickets.", images: img("tickets"), startingPrice: 3000, bidStep: 250, startsAt: min(-120), endsAt: min(-60), createdById: rohan.id },
  ],
});
console.log("Seeded. Login: meera@bidnest.dev / Passw0rd!");
await prisma.$disconnect();
```
Run `npm run db:seed`.

**Done when:** `npx prisma studio` shows the three empty/seeded tables.

---

## Chunk 2: Auth API (6 min)

`src/config/env.js`
```js
import "dotenv/config";
const need = (k) => { if (!process.env[k]) throw new Error(`Missing env ${k}`); return process.env[k]; };
export const env = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: need("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  WEB_ORIGIN: process.env.WEB_ORIGIN || "http://localhost:5173",
};
```

`src/lib/httpError.js`
```js
export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status; this.code = code; this.details = details;
  }
}
```

`src/middleware/errorHandler.js`
```js
export function errorHandler(err, _req, res, _next) {
  if (err.status) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
  }
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL", message: "Something went wrong" } });
}
```

`src/middleware/validate.js`
```js
import { HttpError } from "../lib/httpError.js";

// schema = z.object({ body?, query?, params? }). Parsed values land on req.valid.
export const validate = (schema) => (req, _res, next) => {
  const r = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!r.success) {
    const details = r.error.issues.map((i) => ({ path: i.path.slice(1).join("."), message: i.message }));
    return next(new HttpError(422, "VALIDATION_ERROR", "Invalid input", details));
  }
  req.valid = r.data;
  next();
};
```

`src/middleware/auth.js`
```js
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
```

`src/middleware/rateLimit.js`
```js
import rateLimit from "express-rate-limit";
const limited = { error: { code: "RATE_LIMITED", message: "Too many requests, slow down" } };
export const authLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 20, message: limited });
export const bidLimiter = rateLimit({ windowMs: 60_000, limit: 60, message: limited });
```

`src/modules/auth/auth.schemas.js`
```js
import { z } from "zod";
export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email().max(191),
    password: z.string().min(8).max(100),
  }),
});
export const loginSchema = z.object({
  body: z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) }),
});
```

`src/modules/auth/auth.service.js`
```js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/httpError.js";
import { env } from "../../config/env.js";

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });
const sign = (u) => jwt.sign({ sub: u.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export async function register({ name, email, password }) {
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new HttpError(409, "EMAIL_TAKEN", "An account with this email already exists");
  }
  const user = await prisma.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 10) } });
  return { token: sign(user), user: publicUser(user) };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) throw new HttpError(401, "UNAUTHORIZED", "Invalid email or password");
  return { token: sign(user), user: publicUser(user) };
}

export async function me(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(401, "UNAUTHORIZED", "Account no longer exists");
  return { user: publicUser(user) };
}
```

`src/modules/auth/auth.routes.js`
```js
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
router.get("/me", requireAuth, async (req, res) => res.json(await auth.me(req.userId)));
export default router;
```

`src/app.js`
```js
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
app.use((_req, res) => res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } }));
app.use(errorHandler);
export default app;
```

`src/server.js`
```js
import app from "./app.js";
import { env } from "./config/env.js";
app.listen(env.PORT, () => console.log(`API on :${env.PORT}`));
```

(Until Chunk 3 exists, create `auctions.routes.js` with an empty `Router` export so the app boots.)

**Done when** (API running with `npm run dev`):
```bash
curl -s -X POST localhost:4000/api/v1/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@x.com","password":"Passw0rd!"}'
# → { token, user }
curl -s localhost:4000/api/v1/auth/me -H "Authorization: Bearer <token>"   # → { user }
curl -s localhost:4000/api/v1/auth/me                                      # → 401
```

---

## Chunk 3: Auctions and bidding API (8 min)

`src/modules/auctions/auctions.dto.js`
```js
export const getStatus = (a, now = new Date()) =>
  now < a.startsAt ? "UPCOMING" : now < a.endsAt ? "LIVE" : "ENDED";

const prices = (a) => ({
  startingPrice: a.startingPrice,
  bidStep: a.bidStep,
  highestBid: a.highestBid,
  currentPrice: a.highestBid ?? a.startingPrice,
  minNextBid: a.highestBid ? a.highestBid + 1 : a.startingPrice,
  bidCount: a.bidCount,
});

export const toListDto = (a) => ({
  id: a.id, title: a.title, image: a.images?.[0] ?? null,
  ...prices(a),
  startsAt: a.startsAt, endsAt: a.endsAt, status: getStatus(a),
  createdBy: a.createdBy,
});

export const toDetailDto = (a) => {
  const status = getStatus(a);
  const top = a.bids?.[0];
  return {
    id: a.id, title: a.title, description: a.description, images: a.images,
    ...prices(a),
    startsAt: a.startsAt, endsAt: a.endsAt, status,
    createdBy: a.createdBy,
    winner: status === "ENDED" && top ? { userId: top.bidder.id, name: top.bidder.name, amount: top.amount } : null,
    bids: a.bids?.map((b) => ({ id: b.id, amount: b.amount, createdAt: b.createdAt, bidder: b.bidder })) ?? [],
    serverTime: new Date().toISOString(),
  };
};
```

`src/modules/auctions/auctions.schemas.js`
```js
import { z } from "zod";

export const listSchema = z.object({
  query: z.object({
    status: z.enum(["live", "upcoming", "ended", "all"]).default("live"),
    mine: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
    q: z.string().trim().max(80).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  }),
});

export const createSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().max(2000).default(""),
    images: z.array(z.string().url().startsWith("https://")).min(1).max(5),
    startingPrice: z.number().int().min(1).max(10_000_000),
    bidStep: z.number().int().min(1).max(10_000_000).default(100),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date(),
  }),
});

export const bidSchema = z.object({
  body: z.object({ amount: z.number().int().min(1).max(100_000_000) }),
});
```

`src/modules/auctions/auctions.service.js`
```js
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/httpError.js";
import { toListDto, toDetailDto } from "./auctions.dto.js";

const creator = { select: { id: true, name: true } };

export async function listAuctions({ status, mine, q, page, limit }, userId) {
  const now = new Date();
  const where = {
    ...(status === "live" && { startsAt: { lte: now }, endsAt: { gt: now } }),
    ...(status === "upcoming" && { startsAt: { gt: now } }),
    ...(status === "ended" && { endsAt: { lte: now } }),
    ...(mine && { createdById: userId }),
    ...(q && { title: { contains: q } }),
  };
  const orderBy = {
    live: { endsAt: "asc" }, upcoming: { startsAt: "asc" },
    ended: { endsAt: "desc" }, all: { createdAt: "desc" },
  }[status];

  const [total, rows] = await Promise.all([
    prisma.auction.count({ where }),
    prisma.auction.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: { createdBy: creator } }),
  ]);
  return { items: rows.map(toListDto), page, limit, total };
}

export async function createAuction(userId, body) {
  const now = new Date();
  const startsAt = body.startsAt && body.startsAt > now ? body.startsAt : now;
  const ms = body.endsAt.getTime() - startsAt.getTime();
  if (ms < 60_000 || ms > 30 * 24 * 3600_000) {
    throw new HttpError(422, "VALIDATION_ERROR", "Invalid input", [
      { path: "endsAt", message: "Duration must be between 1 minute and 30 days" },
    ]);
  }
  const created = await prisma.auction.create({
    data: {
      title: body.title, description: body.description, images: body.images,
      startingPrice: body.startingPrice, bidStep: body.bidStep,
      startsAt, endsAt: body.endsAt, createdById: userId,
    },
    include: { createdBy: creator },
  });
  return toDetailDto({ ...created, bids: [] });
}

export async function getAuction(id) {
  const a = await prisma.auction.findUnique({
    where: { id },
    include: {
      createdBy: creator,
      bids: { orderBy: { amount: "desc" }, take: 50, include: { bidder: creator } },
    },
  });
  if (!a) throw new HttpError(404, "NOT_FOUND", "Auction not found");
  return toDetailDto(a);
}
```

`src/modules/auctions/bids.service.js` (the heart of the product)
```js
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/httpError.js";

const inr = (n) => `₹${n.toLocaleString("en-IN")}`;

export function placeBid({ auctionId, userId, amount }) {
  return prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({ where: { id: auctionId } });
    if (!auction) throw new HttpError(404, "NOT_FOUND", "Auction not found");
    if (auction.createdById === userId) {
      throw new HttpError(403, "OWN_AUCTION", "You can't bid on your own auction");
    }

    const now = new Date();
    if (now < auction.startsAt) throw new HttpError(409, "NOT_STARTED", "This auction hasn't started yet");
    if (now >= auction.endsAt) throw new HttpError(409, "AUCTION_ENDED", "This auction has ended");

    // Atomic compare-and-set: the row only updates if the bid still beats the
    // CURRENT highest bid and the auction is still open. Two simultaneous bids
    // can never both pass.
    const { count } = await tx.auction.updateMany({
      where: {
        id: auctionId,
        endsAt: { gt: now },
        OR: [
          { highestBid: null, startingPrice: { lte: amount } },
          { highestBid: { lt: amount } },
        ],
      },
      data: { highestBid: amount, bidCount: { increment: 1 } },
    });

    if (count === 0) {
      const fresh = await tx.auction.findUnique({ where: { id: auctionId } });
      if (new Date() >= fresh.endsAt) throw new HttpError(409, "AUCTION_ENDED", "This auction has ended");
      const minNextBid = fresh.highestBid ? fresh.highestBid + 1 : fresh.startingPrice;
      throw new HttpError(409, "BID_TOO_LOW", `Bid must be at least ${inr(minNextBid)}`, {
        currentPrice: fresh.highestBid ?? fresh.startingPrice,
        minNextBid,
      });
    }

    const bid = await tx.bid.create({
      data: { auctionId, bidderId: userId, amount },
      include: { bidder: { select: { id: true, name: true } } },
    });
    return {
      bid: { id: bid.id, amount: bid.amount, createdAt: bid.createdAt, bidder: bid.bidder },
      currentPrice: amount,
      minNextBid: amount + 1,
      bidCount: auction.bidCount + 1,
    };
  });
}
```

`src/modules/auctions/auctions.routes.js`
```js
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

router.get("/:id", async (req, res) => res.json(await getAuction(req.params.id)));

router.post("/:id/bids", bidLimiter, validate(bidSchema), async (req, res) =>
  res.status(201).json(await placeBid({ auctionId: req.params.id, userId: req.userId, amount: req.valid.body.amount })));

export default router;
```

**Done when** (log in as `rohan@bidnest.dev`, grab a LIVE auction id owned by Meera):
```bash
curl -s -X POST localhost:4000/api/v1/auctions/<id>/bids -H "Authorization: Bearer <rohan-token>" \
  -H "Content-Type: application/json" -d '{"amount":5000}'      # 201 (first bid ≥ starting price)
# Same amount again, or lower  → 409 BID_TOO_LOW with minNextBid
# Race test: two identical bids at once → exactly one 201, one 409
for i in 1 2; do curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:4000/api/v1/auctions/<id>/bids \
  -H "Authorization: Bearer <rohan-token>" -H "Content-Type: application/json" -d '{"amount":9000}' & done; wait
# Bid on your own auction → 403 OWN_AUCTION; bid on the ended auction → 409 AUCTION_ENDED
```

---

## Chunk 4: Web foundation and auth screens (5 min)

**Tailwind:** paste the color, font and radius tokens from the designer's `DESIGN.md` into `tailwind.config.js` (`darkMode: "class"` if the design is dark). `index.css`: the three `@tailwind` directives, Inter font link in `index.html`, `body` background and text from the tokens.

`src/app/authSlice.js`
```js
import { createSlice } from "@reduxjs/toolkit";

const read = () => {
  try { return JSON.parse(localStorage.getItem("bidnest-auth")) ?? { token: null, user: null }; }
  catch { return { token: null, user: null }; }
};

const authSlice = createSlice({
  name: "auth",
  initialState: read(),
  reducers: {
    setCredentials: (_s, { payload }) => {
      localStorage.setItem("bidnest-auth", JSON.stringify(payload));
      return payload; // { token, user }
    },
    logout: () => {
      localStorage.removeItem("bidnest-auth");
      return { token: null, user: null };
    },
  },
});
export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
```

`src/app/api.js`
```js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "./authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

// Any 401 on a protected call logs the user out.
const baseQuery = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);
  const isAuthCall = typeof args === "object" && args.url?.startsWith("/auth/login");
  if (result.error?.status === 401 && !isAuthCall && api.getState().auth.token) api.dispatch(logout());
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Auction", "AuctionList"],
  endpoints: (b) => ({
    register: b.mutation({ query: (body) => ({ url: "/auth/register", method: "POST", body }) }),
    login: b.mutation({ query: (body) => ({ url: "/auth/login", method: "POST", body }) }),
    listAuctions: b.query({
      query: (params) => ({ url: "/auctions", params }),
      providesTags: ["AuctionList"],
    }),
    getAuction: b.query({
      query: (id) => `/auctions/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Auction", id }],
    }),
    createAuction: b.mutation({
      query: (body) => ({ url: "/auctions", method: "POST", body }),
      invalidatesTags: ["AuctionList"],
    }),
    placeBid: b.mutation({
      query: ({ id, amount }) => ({ url: `/auctions/${id}/bids`, method: "POST", body: { amount } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Auction", id }, "AuctionList"],
    }),
  }),
});

export const {
  useRegisterMutation, useLoginMutation, useListAuctionsQuery,
  useGetAuctionQuery, useCreateAuctionMutation, usePlaceBidMutation,
} = api;
```

`src/app/store.js`
```js
import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: { auth: authReducer, [api.reducerPath]: api.reducer },
  middleware: (gdm) => gdm().concat(api.middleware),
});
```

`src/utils/format.js`
```js
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const formatINR = (n) => inr.format(n ?? 0);
export const formatDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export function formatRemaining(ms) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const p = (n) => String(n).padStart(2, "0");
  return d > 0 ? `${d}d ${p(h)}:${p(m)}:${p(sec)}` : `${p(h)}:${p(m)}:${p(sec)}`;
}

// Turn an API error from RTK Query into a readable message.
export const errorMessage = (err) => err?.data?.error?.message ?? "Something went wrong. Try again.";
```

`src/App.jsx` routes (all except auth pages wrapped in `ProtectedRoute`, which renders `<Navigate to="/login" />` when there is no token; `Login` and `Register` redirect to `/auctions` when a token exists):
```jsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route element={<ProtectedRoute />}>      {/* renders Navbar + <Outlet /> */}
    <Route path="/" element={<Navigate to="/auctions" replace />} />
    <Route path="/auctions" element={<Auctions />} />
    <Route path="/auctions/:id" element={<AuctionDetails />} />
    <Route path="/auctions/:id/room" element={<AuctionRoom />} />
    <Route path="/create" element={<CreateAuction />} />
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>
```

`main.jsx`: wrap `<App />` in `<Provider store={store}><BrowserRouter>…`.

**Pages and components in this chunk**
- `Login` and `Register`: controlled forms; call the mutation, `dispatch(setCredentials(result.data))`, navigate to `/auctions`; show `errorMessage(error)` inline; disable the button while loading.
- `Navbar`: logo, links (Auctions, Create Auction), user name with a logout button (`dispatch(logout())`).

**Done when:** you can register, log in, refresh and stay logged in, log out, and visiting `/auctions` while logged out redirects to `/login`.

---

## Chunk 5: Auctions list, details, create (6 min)

**`Auctions` page**
- State: `tab` (`live` | `upcoming` | `ended` | `mine`) and `q` (debounce 300 ms).
- Query: `useListAuctionsQuery({ status: tab === "mine" ? "all" : tab, mine: tab === "mine" || undefined, q: q || undefined })`.
- Render a grid of `AuctionCard`s (click → `/auctions/:id`). Handle loading (skeletons), error and empty states.
- `AuctionCard`: image, `StatusBadge`, title, current price (`formatINR`), bid count, time left or end time.

**`AuctionDetails` page (`/auctions/:id`)**
- `useGetAuctionQuery(id)`.
- Layout: image gallery (main image plus thumbnails), title, description, stat blocks (starting price, current price, bids, ends at), creator name, and an "Instructions" card with the five rules from `PROJECT.md` section 5.4.
- CTA logic (`me = useSelector((s) => s.auth.user)`):
  - `LIVE` and not the creator → **Participate** → `navigate("/auctions/:id/room")`
  - `LIVE` and the creator → disabled button "You created this auction" (plus a link to watch the room)
  - `UPCOMING` → disabled "Starts at <time>"
  - `ENDED` → **View results** → the room (read-only with the winner)

**`CreateAuction` page (`/create`)**
- Fields: title, description, image URLs (add up to 5, with preview thumbnails), starting price, bid step, start (radio: "Start now" / "Schedule" with a `datetime-local` input), duration presets (5m, 15m, 1h, 24h, Custom with a `datetime-local` end).
- Compute `endsAt` as an ISO string: for presets, `new Date(startsAt.getTime() + minutes * 60000)`. Send `startsAt` only when scheduled.
- Send numbers as numbers: `Number(startingPrice)`. On `422`, map `error.data.error.details` (`[{ path, message }]`) to field errors. On success navigate to `/auctions/${data.id}`.

**Done when:** you can create an auction and see it in the Live tab (or Upcoming if scheduled), open it, and see the correct button state for creator vs other users.

---

## Chunk 6: Auction room (5 min)

`src/hooks/useServerClock.js`
```js
import { useEffect, useMemo, useState } from "react";

// Returns "now" in server time, ticking twice a second.
export function useServerClock(serverTime) {
  const offset = useMemo(
    () => (serverTime ? new Date(serverTime).getTime() - Date.now() : 0),
    [serverTime]
  );
  const [now, setNow] = useState(() => Date.now() + offset);
  useEffect(() => {
    setNow(Date.now() + offset);
    const t = setInterval(() => setNow(Date.now() + offset), 500);
    return () => clearInterval(t);
  }, [offset]);
  return now;
}
```

**`AuctionRoom` page (`/auctions/:id/room`)**
```jsx
const { data: auction, isLoading, error } = useGetAuctionQuery(id, {
  pollingInterval: 3000,
  skipPollingIfUnfocused: true,
});
const now = useServerClock(auction?.serverTime);
const remaining = auction ? new Date(auction.endsAt).getTime() - now : 0;
const live = auction?.status === "LIVE" && remaining > 0;
```
- When `status === "ENDED"` polling can stop. Switch the option with `pollingInterval: auction?.status === "ENDED" ? 0 : 3000`.
- When `remaining` hits 0 while status is still `LIVE`, call `refetch()` once (use an effect guarded by a ref).
- If `status === "UPCOMING"`, show the countdown to the start and no bid controls.
- Layout (see designs): **center** = `ImageGallery` with title and description; **bid area** = current price, `Countdown`, `BidPanel`; **side or below** = `BidHistory`; `WinnerBanner` when ended.

`BidPanel` logic
```jsx
function BidPanel({ auction, canBid, disabledReason }) {
  const [placeBid, { isLoading }] = usePlaceBidMutation();
  const [custom, setCustom] = useState("");
  const [msg, setMsg] = useState(null); // { type: "error" | "success", text }
  const base = auction.currentPrice;

  // Quick bids. With no bids yet, the first chip is the opening bid.
  const chips = auction.highestBid
    ? [1, 2, 5].map((k) => base + k * auction.bidStep)
    : [auction.startingPrice, base + auction.bidStep, base + 2 * auction.bidStep];

  const submit = async (amount) => {
    setMsg(null);
    const res = await placeBid({ id: auction.id, amount });
    if (res.error) {
      const e = res.error.data?.error;
      setMsg({ type: "error", text: e?.message ?? "Bid failed" }); // BID_TOO_LOW already includes the new minimum
    } else {
      setMsg({ type: "success", text: `Bid of ${formatINR(amount)} placed` });
      setCustom("");
    }
  };

  const customNum = Number(custom);
  const customError =
    custom === "" ? null
    : !Number.isInteger(customNum) ? "Enter a whole number"
    : customNum < auction.minNextBid ? `Must be at least ${formatINR(auction.minNextBid)}`
    : null;

  // render: chips as buttons showing formatINR(amount) → submit(amount)
  //         custom input + "Place bid" button (disabled if customError, empty, isLoading or !canBid)
}
```
- `canBid = live && me.id !== auction.createdBy.id`. When false, show `disabledReason`: "You created this auction", "Auction ended", or "Starts soon".
- After a successful bid the mutation invalidates the auction tag, so the price and history refresh immediately. The next poll keeps them current.
- `BidHistory`: map `auction.bids` (already newest first). Mark index 0 as "Leading" and rows where `bidder.id === me.id` as "You".
- Leading and outbid status: `me` is leading when `auction.bids[0]?.bidder.id === me.id`. Show a small banner "You're leading" or "You've been outbid". Only show "outbid" if the user has at least one bid in the list.
- `WinnerBanner` (ENDED): `auction.winner` → "Winner: {name} · {formatINR(amount)}" (with "You won!" if `winner.userId === me.id`), otherwise "No bids, no winner".

**Done when:** with two browsers (or one normal plus one incognito, logged in as different users): a bid in one appears in the other within about 3 seconds; low and equal bids show the error; the countdown ends, controls lock, and the winner banner appears.

---

## Chunk 7: Wrap-up and deploy prep (2 min)

- `README.md` at the root: how to run (`apps/api`: copy `.env`, `npx prisma migrate dev`, `npm run db:seed`, `npm run dev`; `apps/web`: copy `.env`, `npm run dev`) and the demo login `meera@bidnest.dev` / `Passw0rd!` (and `rohan@bidnest.dev`).
- Commit and push to GitHub.
- **Deploy (when the cloud DB is ready):**
  1. API service: root directory `apps/api`, variables `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `WEB_ORIGIN` (the deployed web URL). Start command is the `npm start` script (runs `prisma migrate deploy` first).
  2. Web service: root directory `apps/web`, build `npm run build`, output `dist`, variable `VITE_API_URL=https://<api-domain>/api/v1`. Enable the SPA fallback (all paths → `index.html`).
  3. Redeploy the API after the web URL is known (CORS).
- Final smoke test (all must pass):

| # | Check |
|---|-------|
| 1 | Register, logout, login |
| 2 | Create an auction that ends in 2 minutes |
| 3 | Second user: opens it, reads instructions, participates |
| 4 | Quick bid works; custom lower or equal bid is rejected with a clear message |
| 5 | The creator can't bid on their own auction |
| 6 | History shows names, amounts and times, newest first |
| 7 | At zero the controls lock and the winner banner is shown; a manual `curl` bid returns `AUCTION_ENDED` |
| 8 | Refresh in the room: still logged in, state intact |
| 9 | Mobile width looks right |

**Done when:** the smoke test passes locally (and on the deployed URLs if time allows).