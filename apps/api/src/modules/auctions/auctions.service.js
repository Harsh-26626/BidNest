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
    ...(q && { title: { contains: q, mode: "insensitive" } }),
  };
  const orderBy = {
    live: { endsAt: "asc" },
    upcoming: { startsAt: "asc" },
    ended: { endsAt: "desc" },
    all: { createdAt: "desc" },
  }[status];

  const [total, rows] = await Promise.all([
    prisma.auction.count({ where }),
    prisma.auction.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { createdBy: creator },
    }),
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
      title: body.title,
      description: body.description,
      images: body.images,
      startingPrice: body.startingPrice,
      bidStep: body.bidStep,
      startsAt,
      endsAt: body.endsAt,
      createdById: userId,
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
