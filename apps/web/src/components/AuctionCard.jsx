import React, { useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatINR, formatRemainingShort } from "../utils/format";

export default function AuctionCard({ auction, currentUserId }) {
  const [imgError, setImgError] = useState(false);
  const now = Date.now();
  const startsAtMs = new Date(auction.startsAt).getTime();
  const endsAtMs = new Date(auction.endsAt).getTime();

  let timeLabel = "";
  if (auction.status === "LIVE") {
    timeLabel = formatRemainingShort(endsAtMs - now);
  } else if (auction.status === "UPCOMING") {
    const diff = startsAtMs - now;
    timeLabel = `Starts in ${formatRemainingShort(diff)}`;
  } else {
    timeLabel = "Auction Ended";
  }

  const isOwner = currentUserId && auction.createdBy?.id === currentUserId;
  const imageUrl =
    !imgError && (auction.image || (Array.isArray(auction.images) && auction.images[0]))
      ? auction.image || auction.images[0]
      : "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80";

  return (
    <Link
      to={`/auctions/${auction.id}`}
      className="bg-surface-container-low border border-outline-variant/15 rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-2xl hover:border-outline-variant/40 hover:-translate-y-1 block text-left"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-lowest">
        <img
          src={imageUrl}
          alt={auction.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <StatusBadge status={auction.status} />
          {isOwner && (
            <span className="bg-primary/20 backdrop-blur-md text-primary text-xs px-2 py-0.5 rounded-full font-medium border border-primary/30">
              Mine
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 bg-surface/85 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-on-surface font-tabular-price font-medium border border-outline-variant/20 shadow-sm">
          {timeLabel}
        </div>
      </div>

      {/* Details */}
      <div className="p-space-md flex flex-col flex-grow justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-on-surface-variant uppercase tracking-wider">
            <span>By {auction.createdBy?.name || "Verified Seller"}</span>
            <span>Step ₹{auction.bidStep?.toLocaleString("en-IN") || 100}</span>
          </div>
          <h3 className="text-headline-sm text-on-surface font-headline-sm font-semibold group-hover:text-secondary transition-colors line-clamp-1">
            {auction.title}
          </h3>
        </div>

        {/* Price & Action */}
        <div className="flex flex-col gap-space-sm pt-space-sm border-t border-surface-container-highest/60">
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-on-surface-variant">
              {auction.bidCount > 0
                ? `Current Bid (${auction.bidCount} bid${auction.bidCount > 1 ? "s" : ""})`
                : "Starting Price"}
            </span>
            <span className="text-tabular-price text-tertiary font-bold font-tabular-price text-lg">
              {formatINR(auction.currentPrice ?? auction.highestBid ?? auction.startingPrice)}
            </span>
          </div>

          <div
            className={`w-full py-2.5 rounded-xl text-label-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
              auction.status === "LIVE"
                ? "bg-surface-container-high group-hover:bg-primary group-hover:text-on-primary text-on-surface shadow-sm"
                : auction.status === "UPCOMING"
                ? "bg-surface-container-high text-on-surface-variant"
                : "bg-surface-container-high/50 text-on-surface-variant cursor-default"
            }`}
          >
            {auction.status === "LIVE" ? (
              <>
                <span className="material-symbols-outlined text-[18px]">gavel</span>
                <span>{isOwner ? "Manage / View Room" : "Participate & Bid"}</span>
              </>
            ) : auction.status === "UPCOMING" ? (
              <>
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span>View Auction Details</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">military_tech</span>
                <span>View Results</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
