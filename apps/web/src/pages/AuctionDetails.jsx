import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetAuctionQuery } from "../app/api";
import StatusBadge from "../components/StatusBadge";
import Countdown from "../components/Countdown";
import { formatINR, formatDateTime, formatRemaining } from "../utils/format";
import { useServerClock } from "../hooks/useServerClock";

export default function AuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  const { data: auction, isLoading, isError, error, refetch } = useGetAuctionQuery(id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const now = useServerClock(auction?.serverTime);
  const remaining = auction ? new Date(auction.endsAt).getTime() - now : 0;
  const isLive = auction?.status === "LIVE" && remaining > 0;
  const isEnded = auction?.status === "ENDED" || remaining <= 0;
  const isUpcoming = auction?.status === "UPCOMING" && new Date(auction.startsAt).getTime() > now;
  const isCreator = currentUser?.id && auction?.createdBy?.id === currentUser.id;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 w-full animate-pulse">
        <div className="h-6 w-48 bg-surface-container-high rounded mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-96 bg-surface-container-high rounded-2xl"></div>
          <div className="lg:col-span-5 h-96 bg-surface-container-high rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !auction) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-surface-container-low rounded-2xl border border-error/30 text-center">
        <span className="material-symbols-outlined text-error text-[48px] mb-2">error</span>
        <h2 className="text-headline-md font-bold text-on-surface mb-2">Auction Not Found</h2>
        <p className="text-body-md text-on-surface-variant mb-6">
          This auction may have been removed or does not exist.
        </p>
        <Link
          to="/auctions"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-medium"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Return to Auctions
        </Link>
      </div>
    );
  }

  const images = Array.isArray(auction.images) && auction.images.length > 0
    ? auction.images
    : ["https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80"];

  const activeImage = images[selectedImageIndex] || images[0];

  return (
    <div className="flex flex-col w-full pb-20 bg-surface">
      {/* Top Breadcrumb & Status Bar */}
      <div className="max-w-7xl w-full mx-auto px-6 lg:px-12 pt-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-outline-variant/15">
        <div className="flex items-center gap-space-sm text-body-sm text-on-surface-variant">
          <Link
            to="/auctions"
            className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Marketplace
          </Link>
          <span>/</span>
          <span className="text-on-surface truncate max-w-[200px]">{auction.title}</span>
          <span>/</span>
          <span className="text-primary font-mono font-medium">Lot #{auction.id.slice(-6).toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-space-md">
          <StatusBadge status={isEnded ? "ENDED" : isUpcoming ? "UPCOMING" : "LIVE"} />
          <div className="text-body-sm text-on-surface-variant">
            Hosted by: <strong className="text-on-surface">{auction.createdBy?.name || "Seller"}</strong>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="max-w-7xl w-full mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-space-xl mt-6">
        {/* Left Column: Media Gallery & Provenance & Rules */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Main Gallery */}
          <div className="flex flex-col gap-3">
            <div className="w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden bg-surface-container relative shadow-xl border border-outline-variant/15">
              <img
                src={activeImage}
                alt={auction.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-surface/85 backdrop-blur-md text-on-surface text-xs flex items-center gap-1.5 border border-outline-variant/20 shadow-md">
                <span className="material-symbols-outlined text-[16px] text-tertiary">zoom_in</span>
                <span>Inspected Lot Item</span>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden bg-surface-container shrink-0 border-2 transition-all ${
                      selectedImageIndex === idx
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Description & Provenance */}
          <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-sm border border-outline-variant/15">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-tertiary font-semibold uppercase tracking-wider">
                Official Listing Specification
              </span>
              <h1 className="text-headline-lg text-on-surface font-bold font-headline-lg">
                {auction.title}
              </h1>
            </div>

            <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
              {auction.description || "No additional description provided by the seller."}
            </p>

            {/* Provenance Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-outline-variant/15">
              <div className="bg-surface-container p-3 rounded-xl">
                <div className="text-xs text-on-surface-variant">Seller Verification</div>
                <div className="text-body-md text-on-surface font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-tertiary text-[16px]">verified</span>
                  <span>{auction.createdBy?.name || "Verified User"}</span>
                </div>
              </div>
              <div className="bg-surface-container p-3 rounded-xl">
                <div className="text-xs text-on-surface-variant">Scheduled Duration</div>
                <div className="text-body-md text-on-surface font-medium">
                  {formatDateTime(auction.startsAt)}
                </div>
              </div>
              <div className="bg-surface-container p-3 rounded-xl">
                <div className="text-xs text-on-surface-variant">Auction Close</div>
                <div className="text-body-md text-on-surface font-medium">
                  {formatDateTime(auction.endsAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions Card (Section 5.4 from PROJECT.md) */}
          <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-sm border border-outline-variant/15">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">gavel</span>
              <h3 className="text-headline-sm text-on-surface font-bold">
                How this auction works
              </h3>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Please review the official BidNest rules before participating in this live auction lot:
            </p>
            <ol className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2 text-body-sm">
              <li className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-container border border-outline-variant/10">
                <span className="text-tertiary font-bold font-mono text-base">01</span>
                <span className="text-on-surface-variant text-xs leading-normal">
                  Bids must be higher than current highest bid (first bid can match starting price).
                </span>
              </li>
              <li className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-container border border-outline-variant/10">
                <span className="text-tertiary font-bold font-mono text-base">02</span>
                <span className="text-on-surface-variant text-xs leading-normal">
                  All bids are public, immutable, and cannot be withdrawn.
                </span>
              </li>
              <li className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-container border border-outline-variant/10">
                <span className="text-tertiary font-bold font-mono text-base">03</span>
                <span className="text-on-surface-variant text-xs leading-normal">
                  Creators cannot bid on their own auctions.
                </span>
              </li>
              <li className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-container border border-outline-variant/10">
                <span className="text-tertiary font-bold font-mono text-base">04</span>
                <span className="text-on-surface-variant text-xs leading-normal">
                  Bidding closes automatically at the server end time.
                </span>
              </li>
              <li className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-container border border-outline-variant/10">
                <span className="text-tertiary font-bold font-mono text-base">05</span>
                <span className="text-on-surface-variant text-xs leading-normal">
                  The highest bidder at zero wins the item.
                </span>
              </li>
            </ol>
          </div>
        </div>

        {/* Right Column: Pricing, Countdown, CTA Card */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl border border-outline-variant/15 sticky top-24">
            {/* Price block */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div>
                <span className="text-xs text-on-surface-variant block uppercase tracking-wider font-semibold">
                  {auction.bidCount > 0 ? "Current Highest Bid" : "Starting Price"}
                </span>
                <div className="text-3xl sm:text-4xl font-bold text-tertiary font-tabular-price mt-1">
                  {formatINR(auction.currentPrice ?? auction.startingPrice)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-on-surface-variant block uppercase tracking-wider font-semibold">
                  Bid Step
                </span>
                <div className="text-lg font-bold text-on-surface font-tabular-price mt-1">
                  +₹{auction.bidStep?.toLocaleString("en-IN") || 100}
                </div>
              </div>
            </div>

            {/* Countdown / Status timer */}
            <div className="bg-surface-container p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-on-surface-variant block font-medium">
                  {isEnded ? "Auction Status" : isUpcoming ? "Starting in" : "Time Remaining"}
                </span>
                <div className="text-xl font-bold font-mono text-on-surface font-tabular-price mt-0.5">
                  {isEnded ? (
                    <span className="text-on-surface-variant">Auction Ended</span>
                  ) : isUpcoming ? (
                    <span className="text-amber-400">
                      {formatRemaining(new Date(auction.startsAt).getTime() - now)}
                    </span>
                  ) : (
                    <span className={remaining < 300000 ? "text-error" : "text-emerald-400"}>
                      {formatRemaining(remaining)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-on-surface-variant block font-medium">Total Bids Placed</span>
                <span className="text-lg font-bold text-on-surface">{auction.bidCount} bids</span>
              </div>
            </div>

            {/* Minimum next bid info */}
            {isLive && (
              <div className="flex items-center justify-between text-body-sm px-1 text-on-surface-variant">
                <span>Minimum next eligible bid:</span>
                <strong className="text-on-surface font-tabular-price">
                  {formatINR(auction.minNextBid)}
                </strong>
              </div>
            )}

            {/* CTA action based on rules */}
            <div className="flex flex-col gap-3">
              {isLive ? (
                isCreator ? (
                  <div className="flex flex-col gap-2">
                    <button
                      disabled
                      className="w-full py-4 rounded-xl bg-surface-container-high text-on-surface-variant font-semibold cursor-not-allowed text-center"
                    >
                      You created this auction
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/auctions/${auction.id}/room`)}
                      className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition-all text-center flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">meeting_room</span>
                      Watch Auction Room Live
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(`/auctions/${auction.id}/room`)}
                    className="w-full py-4 rounded-xl bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container font-semibold text-lg transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 group"
                  >
                    <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">
                      gavel
                    </span>
                    <span>Participate in Live Auction</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                )
              ) : isUpcoming ? (
                <button
                  disabled
                  className="w-full py-4 rounded-xl bg-surface-container-high text-on-surface-variant font-semibold cursor-not-allowed text-center flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                  <span>Starts at {formatDateTime(auction.startsAt)}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(`/auctions/${auction.id}/room`)}
                  className="w-full py-4 rounded-xl bg-primary text-on-primary hover:opacity-90 font-semibold text-lg transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[22px]">military_tech</span>
                  <span>View Auction Results &amp; Winner</span>
                </button>
              )}
            </div>

            {/* Quick summary stats */}
            <div className="text-xs text-on-surface-variant leading-relaxed text-center pt-2 border-t border-outline-variant/15">
              Secure event auction powered by atomic database validation and instant settlement.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
