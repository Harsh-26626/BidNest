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
