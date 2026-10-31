# BidNest: Event Auction System

## 1. Overview
BidNest lets event organizers run transparent, timed auctions. Any logged-in user can **create an auction** for an item and **bid on other people's auctions**. Every bid is public, the highest bid is always visible, bidding stops automatically at the end time, and the winner is displayed.

Build time budget: now **20 minutes** (cut from 40; hackathon round 2). Scope cuts are listed in `BUILD.md` under "20-minute edition". Items marked as cut there (scheduled start, search, "Mine" tab, multiple images, deploy) are deferred, not removed from the design. This document defines **what** we are building. `BUILD.md` defines **how**, in chunks. `PROMPT.md` is the brief for the UI designer agent.

## 2. Goals and Non-Goals

**Goals**
- JWT-based auth (register, login, protected routes)
- Create an auction for one item (title, description, images, starting price, bid step, start and end time)
- Browse all auctions (live, upcoming, ended, mine)
- Auction details page with instructions and a "Participate" button
- Auction room: item in the center, current bid, quick-bid buttons, custom amount, bid history, countdown
- Reject bids that do not beat the current highest bid (server-side, race-safe)
- Stop accepting bids at the end time and display the winner
- Monorepo, two independently deployable apps, Prisma on a SQL database

**Non-goals (later)**
- Payments or escrow, email or SMS notifications
- WebSockets (we use polling; see section 11)
- Image upload (image URLs only for now)
- Auto-bidding or proxy bidding, auction editing or cancelling, admin roles
- Refresh tokens, password reset, social login

## 3. User Flow

```
Register / Login
      │
      ▼
 Auctions list  ──────────►  Create Auction (form)
      │                               │
      ▼                               ▼
 Auction details  ◄──────────  (redirect to its details page)
 (item, rules, instructions)
      │  click "Participate"
      ▼
 Auction room (item centered, current bid,
 quick-bid buttons, custom amount, history, countdown)
      │  auction ends
      ▼
 Winner displayed (same page, read-only)
```

## 4. Features and Acceptance Criteria

| # | Feature | Acceptance criteria |
|---|---------|--------------------|
| 1 | Register | Name, email, password (min 8). Duplicate email is rejected. Returns a JWT and the user. |
| 2 | Login | Email and password. A wrong combination gives one generic error. Returns a JWT and the user. |
| 3 | Session | JWT is stored in the browser and sent as a Bearer token. An expired or invalid token logs the user out. |
| 4 | Create auction | Title, description, 1 to 5 image URLs, starting price, bid step, start (now or scheduled), end (preset or custom). Redirects to the new auction's details page. |
| 5 | Auctions list | Tabs: Live, Upcoming, Ended, Mine. Cards show image, title, current price, bid count and time left. Search by title. Empty and loading states. |
| 6 | Auction details | Shows item images, description, starting price, current price, status, time, creator. Shows the instructions (section 5.4). A "Participate" button goes to the room. |
| 7 | Auction room | Item is displayed in the center. Shows current highest bid, countdown, quick-bid buttons, custom amount input, bid history. |
| 8 | Place bid | Quick buttons and the custom input both call the same endpoint. A rejected bid shows the reason and the latest price. |
| 9 | Bid history | Newest first: bidder name, amount, time. Highlights the leading bid and the viewer's own bids. |
| 10 | Auction end | After the end time no bids are accepted (server enforced), the input is disabled, and the winner banner is shown. |
| 11 | Winner | Highest bidder's name and amount. If there were no bids: "No bids, no winner". The winner sees "You won". |

## 5. Business Rules

1. **Amounts** are whole-number integers in INR (₹). No decimals. Display with Indian grouping (₹1,25,000).
2. **Current price** is the highest bid, or the starting price if there are no bids yet.
3. **First bid** must be **greater than or equal to** the starting price. **Every later bid** must be **strictly greater** than the highest bid.
4. **Minimum next bid** (`minNextBid`) is `startingPrice` when there are no bids, otherwise `highestBid + 1`. The server returns it so the UI never guesses.
5. **Bid step** is only used for quick-bid suggestions, never enforced. Quick-bid amounts are `base + step`, `base + 2×step`, `base + 5×step`, where `base` is the current price. With no bids, the first chip is the opening bid (the starting price itself).
6. **Custom amount** must be an integer of at least `minNextBid`. The UI validates early, the server decides.
7. **Creators cannot bid** on their own auctions.
8. **Time:** the server clock is the only clock that matters. `status` is derived: `UPCOMING` (now < startsAt), `LIVE` (startsAt ≤ now < endsAt), `ENDED` (now ≥ endsAt). A bid is accepted only while `LIVE`.
9. **Duration:** at least 1 minute, at most 30 days. Presets: 5 min, 15 min, 1 hour, 24 hours, custom.
10. **Winner** is derived, not stored: the bidder of the highest bid once the auction is `ENDED`. Since bid amounts are unique per auction, there are no ties.
11. **Race safety:** if two users bid the same amount at the same moment, exactly one succeeds.

### 5.4 Instructions text shown before "Participate"
- Bids must be higher than the current highest bid (the first bid can match the starting price).
- All bids are public and cannot be withdrawn.
- You can't bid on an auction you created.
- Bidding closes automatically at the end time shown by the server clock.
- The highest bidder at the end time wins.

## 6. Tech Stack

| Area | Choice | Why |
|------|--------|-----|
| Monorepo | Plain folders `apps/api`, `apps/web`, each with its own `package.json` and lockfile | Simplest layout for separate deployments (no workspace tooling needed) |
| API | Node.js 20+, Express 5, JavaScript (ESM) | Fast to build; Express 5 forwards async errors automatically |
| DB | MySQL (local now, cloud MySQL later) | Matches your existing stack. Prisma works with other SQL databases by changing `provider` |
| ORM | Prisma (pin `prisma@6` and `@prisma/client@6`) | Required. Migrations plus typed queries |
| Auth | `jsonwebtoken` plus `bcryptjs` | JWT as required. `bcryptjs` avoids native build issues on deploy |
| Validation | Zod | One schema per endpoint |
| Security | `helmet`, `cors`, `express-rate-limit` | Basic hardening for auth and bid endpoints |
| Web | React (Vite), Tailwind CSS v3, lucide-react | Same base as round 1 |
| State and data | Redux Toolkit plus RTK Query | Fetching, caching, polling and invalidation in one tool |
| Routing | react-router-dom | Multiple pages |

## 7. Repository Layout

```
bidnest/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.js
│   │   ├── src/
│   │   │   ├── server.js
│   │   │   ├── app.js
│   │   │   ├── config/env.js
│   │   │   ├── lib/{prisma.js, httpError.js}
│   │   │   ├── middleware/{auth.js, validate.js, errorHandler.js, rateLimit.js}
│   │   │   └── modules/
│   │   │       ├── auth/{auth.routes.js, auth.service.js, auth.schemas.js}
│   │   │       └── auctions/{auctions.routes.js, auctions.service.js, bids.service.js, auctions.schemas.js, auctions.dto.js}
│   │   ├── .env.example
│   │   └── package.json
│   └── web/
│       ├── src/
│       │   ├── app/{store.js, api.js, authSlice.js}
│       │   ├── components/   (Navbar, ProtectedRoute, AuctionCard, StatusBadge, Countdown, ImageGallery, BidPanel, BidHistory, WinnerBanner, ConfirmDialog)
│       │   ├── pages/        (Login, Register, Auctions, AuctionDetails, AuctionRoom, CreateAuction, NotFound)
│       │   ├── hooks/useServerClock.js
│       │   ├── utils/{format.js, constants.js}
│       │   ├── App.jsx, main.jsx, index.css
│       ├── .env.example
│       └── package.json
├── README.md
└── .gitignore
```

## 8. Deployment Plan

| App | Where | Notes |
|-----|-------|-------|
| `apps/api` | Railway service, root directory `apps/api` | Start command runs `prisma migrate deploy` then the server |
| `apps/web` | Railway static service, Cloudflare Pages or Vercel, root directory `apps/web` | `VITE_API_URL` is baked in at build time. Needs SPA fallback to `index.html` |
| Database | Local MySQL now. Later a cloud MySQL | Only `DATABASE_URL` changes |

Environment variables:
- **API:** `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` (default `1d`), `PORT` (default `4000`), `WEB_ORIGIN` (CORS allow-list, e.g. `http://localhost:5173`)
- **Web:** `VITE_API_URL` (e.g. `http://localhost:4000/api/v1`)

## 9. Data Model

```
User      id, name, email (unique), passwordHash, createdAt
Auction   id, title, description, images (JSON array of https URLs),
          startingPrice (Int), bidStep (Int, default 100),
          highestBid (Int?, null until the first bid), bidCount (Int),
          startsAt, endsAt, createdAt, createdById → User
Bid       id, auctionId → Auction, bidderId → User, amount (Int), createdAt
          unique(auctionId, amount)   // backstop for race safety
```

`highestBid` and `bidCount` on `Auction` are kept in step with `Bid` rows inside one transaction. They make the list page and the atomic bid check cheap. The full Prisma schema is in `BUILD.md` (Chunk 1).

## 10. API Contract

Base URL: `/api/v1`. JSON in and out. Successful responses return the payload directly. Errors always look like:

```json
{ "error": { "code": "BID_TOO_LOW", "message": "Bid must be at least ₹5,001", "details": { "currentPrice": 5000, "minNextBid": 5001 } } }
```

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/register` | no | `{ name, email, password }` → `201 { token, user }` |
| POST | `/auth/login` | no | `{ email, password }` → `{ token, user }` |
| GET | `/auth/me` | yes | → `{ user }` |
| GET | `/auctions` | yes | Query: `status=live\|upcoming\|ended\|all` (default `live`), `mine=true`, `q`, `page`, `limit` → `{ items, page, limit, total }` |
| POST | `/auctions` | yes | Create → `201` auction |
| GET | `/auctions/:id` | yes | Auction plus `bids` (latest 50, newest first), `winner`, `serverTime` |
| POST | `/auctions/:id/bids` | yes | `{ amount }` → `201 { bid, currentPrice, minNextBid, bidCount }` |
| GET | `/health` | no | `{ ok: true }` |

**Auction object (detail):**
```json
{
  "id": "clx...", "title": "Signed Cricket Bat", "description": "...",
  "images": ["https://..."], "startingPrice": 5000, "bidStep": 500,
  "highestBid": 7500, "currentPrice": 7500, "minNextBid": 7501, "bidCount": 4,
  "startsAt": "2026-10-31T08:00:00.000Z", "endsAt": "2026-10-31T09:00:00.000Z",
  "status": "LIVE",
  "createdBy": { "id": "...", "name": "Meera Iyer" },
  "winner": null,
  "bids": [ { "id": "...", "amount": 7500, "createdAt": "...", "bidder": { "id": "...", "name": "Rohan Das" } } ],
  "serverTime": "2026-10-31T08:42:10.123Z"
}
```
`winner` is `{ userId, name, amount }` only when `status` is `ENDED` and there was at least one bid, otherwise `null`. List items have the same fields minus `description`, `bids` and `winner`, and carry a single `image` instead of `images`.

**Error codes:**

| HTTP | Code | When |
|------|------|------|
| 401 | `UNAUTHORIZED` | Missing, invalid or expired token |
| 403 | `OWN_AUCTION` | Creator tries to bid |
| 404 | `NOT_FOUND` | Unknown auction |
| 409 | `EMAIL_TAKEN` | Register with an existing email |
| 409 | `NOT_STARTED` | Bid before `startsAt` |
| 409 | `AUCTION_ENDED` | Bid at or after `endsAt` |
| 409 | `BID_TOO_LOW` | Amount below `minNextBid`. Details contain the fresh `currentPrice` and `minNextBid` |
| 422 | `VALIDATION_ERROR` | Bad input. `details` is a list of `{ path, message }` |
| 429 | `RATE_LIMITED` | Too many requests |

## 11. Real-Time Approach
Polling, not WebSockets. The auction room refetches `GET /auctions/:id` every 3 seconds and stops polling once the status is `ENDED`. The API returns `serverTime` on every call; the client computes a clock offset so the countdown follows the server clock, not the user's device. When the countdown reaches zero the client refetches once. Even if it doesn't, the server rejects late bids. WebSockets or Server-Sent Events are a later upgrade and would not change the API contract.

## 12. Auth Design
- Passwords hashed with bcrypt (cost 10). `passwordHash` is never returned.
- JWT payload `{ sub: userId }`, signed with `JWT_SECRET`, expires in `JWT_EXPIRES_IN`.
- Web stores the token in `localStorage` and sends `Authorization: Bearer <token>`. (Simple for two separately hosted origins. Known trade-off: readable by scripts on the page. Cookies plus refresh tokens are the later upgrade.)
- Any `401` response clears the session and redirects to login.
- Emails are lowercased and trimmed. Login failures always return the same message.

## 13. Frontend Routes

| Path | Page | Protected |
|------|------|-----------|
| `/login`, `/register` | Auth forms | no (redirects to `/auctions` if logged in) |
| `/` | Redirect to `/auctions` | yes |
| `/auctions` | Auctions list | yes |
| `/auctions/:id` | Details and instructions | yes |
| `/auctions/:id/room` | Bidding room | yes |
| `/create` | Create auction | yes |
| `*` | Not found | no |

"Participate" is plain navigation to the room. No server-side participation record is needed.

## 14. Security and Reliability Notes
- Bid check and write happen in **one database transaction** using an atomic conditional update (details in `BUILD.md`, Chunk 3). No read-then-write race.
- Server validates everything again; the UI checks are for friendliness only.
- Rate limit: auth endpoints 20 per 15 minutes per IP, bid endpoint 60 per minute per IP.
- Image URLs must be `https://`. React escapes all text output.
- CORS allows only `WEB_ORIGIN`. `helmet` enabled. Request body limit 100 KB.

## 15. Build Chunks (details in BUILD.md)

| # | Chunk | Time |
|---|-------|------|
| 0 | Repo scaffold | 3 min |
| 1 | Database and Prisma | 5 min |
| 2 | Auth API | 6 min |
| 3 | Auctions and bidding API | 8 min |
| 4 | Web foundation and auth screens | 5 min |
| 5 | Auctions list, details, create | 6 min |
| 6 | Auction room | 5 min |
| 7 | Wrap-up and deploy prep | 2 min |

API chunks (1 to 3) and web chunks (4 to 6) can run in parallel because the contract in section 10 is fixed.

## 16. Future Roadmap
WebSockets or SSE for instant updates, image upload to Cloudflare R2, proxy (auto) bidding, anti-sniping (extend the end time on late bids), email notifications, auction edit and cancel, refresh tokens and cookie auth, payments and escrow, admin moderation.

## 17. Assumptions to Confirm
1. Database is **MySQL** (change to Postgres by editing the Prisma `provider`).
2. **JavaScript** (not TypeScript) for speed.
3. The first bid may equal the starting price; later bids must be strictly higher.
4. Currency is INR (₹) and all amounts are whole numbers.
5. All pages except login and register require a logged-in user.