import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetAuctionQuery, usePlaceBidMutation } from "../app/api";
import { useServerClock } from "../hooks/useServerClock";
import { formatINR, formatRemaining, formatTimeAgo, errorMessage } from "../utils/format";
import StatusBadge from "../components/StatusBadge";

export default function AuctionRoom() {
  const { id } = useParams();
  const currentUser = useSelector((state) => state.auth.user);

  // Polling: every 3000ms when open, stops when ended
  const {
    data: auction,
    isLoading,
    isError,
    refetch,
  } = useGetAuctionQuery(id, {
    pollingInterval: 3000,
    skipPollingIfUnfocused: true,
  });

  const [placeBidMutation, { isLoading: isBidding }] = usePlaceBidMutation();

  const [customBid, setCustomBid] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState(null); // { type: 'success' | 'error', text: '' }
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Synchronized server clock
  const now = useServerClock(auction?.serverTime);
  const remaining = auction ? new Date(auction.endsAt).getTime() - now : 0;
  const isLive = auction?.status === "LIVE" && remaining > 0;
  const isEnded = auction?.status === "ENDED" || (auction && remaining <= 0);

  // Refetch once when time expires
  const hasRefetchedOnExpire = useRef(false);
  useEffect(() => {
    if (auction?.status === "LIVE" && remaining <= 0 && !hasRefetchedOnExpire.current) {
      hasRefetchedOnExpire.current = true;
      refetch();
    }
  }, [remaining, auction?.status, refetch]);

  // Is current user the creator?
  const isCreator = currentUser?.id && auction?.createdBy?.id === currentUser.id;
  const canBid = isLive && !isCreator;

  // Bid logic
  const basePrice = auction?.currentPrice ?? auction?.startingPrice ?? 0;
  const bidStep = auction?.bidStep || 100;

  // Quick bid chips
  const quickBidOptions = useMemo(() => {
    if (!auction) return [];
    if (auction.highestBid) {
      return [
        { amount: basePrice + 1 * bidStep, incrementLabel: `+${formatINR(1 * bidStep)}` },
        { amount: basePrice + 2 * bidStep, incrementLabel: `+${formatINR(2 * bidStep)}` },
        { amount: basePrice + 5 * bidStep, incrementLabel: `+${formatINR(5 * bidStep)}` },
      ];
    } else {
      // No bids yet: opening bid is starting price
      return [
        { amount: auction.startingPrice, incrementLabel: "Opening Bid" },
        { amount: auction.startingPrice + 1 * bidStep, incrementLabel: `+${formatINR(1 * bidStep)}` },
        { amount: auction.startingPrice + 2 * bidStep, incrementLabel: `+${formatINR(2 * bidStep)}` },
      ];
    }
  }, [auction, basePrice, bidStep]);

  // Custom bid validation
  const customNum = Number(customBid);
  const customError = useMemo(() => {
    if (customBid === "") return null;
    if (!Number.isInteger(customNum) || customNum <= 0) return "Please enter a valid whole number";
    if (auction && customNum < auction.minNextBid) {
      return `Must be at least ${formatINR(auction.minNextBid)}`;
    }
    return null;
  }, [customBid, customNum, auction]);

  const handlePlaceBid = async (amount) => {
    if (!canBid) return;
    setFeedbackMsg(null);

    try {
      const res = await placeBidMutation({ id, amount }).unwrap();
      setFeedbackMsg({
        type: "success",
        text: `Success! You placed a bid of ${formatINR(amount)}.`,
      });
      setCustomBid("");
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: errorMessage(err),
      });
    }
  };

  // Determine user's leading or outbid status
  const topBid = auction?.bids?.[0];
  const isLeading = currentUser && topBid?.bidder?.id === currentUser.id;
  const hasUserBids = currentUser && auction?.bids?.some((b) => b.bidder?.id === currentUser.id);
  const isOutbid = hasUserBids && !isLeading && !isEnded;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 w-full animate-pulse">
        <div className="h-6 w-56 bg-surface-container-high rounded mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-[500px] bg-surface-container-high rounded-2xl"></div>
          <div className="lg:col-span-5 h-[500px] bg-surface-container-high rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !auction) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-surface-container-low rounded-2xl border border-error/30 text-center">
        <span className="material-symbols-outlined text-error text-[48px] mb-2">error</span>
        <h2 className="text-headline-md font-bold text-on-surface mb-2">Auction Not Found</h2>
        <p className="text-body-md text-on-surface-variant mb-6">
          Unable to enter this auction room.
        </p>
        <Link
          to="/auctions"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-medium"
        >
          Back to Auctions
        </Link>
      </div>
    );
  }

  const images = Array.isArray(auction.images) && auction.images.length > 0
    ? auction.images
    : ["https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80"];
  const activeImage = images[selectedImageIndex] || images[0];

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-4rem)] pb-24 bg-surface">
      {/* Top Breadcrumb & Status Bar */}
      <div className="max-w-7xl w-full mx-auto px-6 lg:px-12 pt-4 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-outline-variant/15">
        <div className="flex items-center gap-space-sm text-body-sm text-on-surface-variant">
          <Link
            to="/auctions"
            className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Auctions
          </Link>
          <span>/</span>
          <Link to={`/auctions/${auction.id}`} className="hover:text-on-surface truncate max-w-[180px]">
            {auction.title}
          </Link>
          <span>/</span>
          <span className="text-primary font-mono font-medium">Lot #{auction.id.slice(-6).toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-space-md">
          {isLive ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-tertiary text-xs font-bold uppercase tracking-wider border border-tertiary/20">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span>LIVE AUCTION ROOM</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold uppercase tracking-wider border border-outline-variant/20">
              <span className="w-2 h-2 rounded-full bg-on-surface-variant"></span>
              <span>AUCTION CLOSED</span>
            </div>
          )}
          <div className="text-body-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">group</span>
            <span>{auction.bidCount} Bids</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl w-full mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-space-xl mt-6">
        {/* Left Stage: Item Details & Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Image Gallery */}
          <div className="flex flex-col gap-3">
            <div className="w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden bg-surface-container relative shadow-lg border border-outline-variant/15">
              <img
                src={activeImage}
                alt={auction.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 px-3 py-1 rounded-lg bg-surface/85 backdrop-blur-md text-on-surface text-xs flex items-center gap-1 border border-outline-variant/20 shadow-md">
                <span className="material-symbols-outlined text-[16px] text-tertiary">zoom_in</span>
                <span>Real-time Lot Viewer</span>
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden bg-surface-container shrink-0 border-2 transition-all ${
                      selectedImageIndex === idx
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Info Card */}
          <div className="bg-surface-container-low rounded-2xl p-6 flex flex-col gap-3 shadow-sm border border-outline-variant/15">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-tertiary font-semibold uppercase tracking-wider">
                Event Auction Asset
              </span>
              <h1 className="text-headline-lg text-on-surface font-bold font-headline-lg">
                {auction.title}
              </h1>
            </div>
            <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
              {auction.description || "Official lot listing for live bidding."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 mt-1 border-t border-outline-variant/15">
              <div className="bg-surface-container p-3 rounded-xl">
                <div className="text-xs text-on-surface-variant">Listing Creator</div>
                <div className="text-body-md text-primary font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>{auction.createdBy?.name || "Verified Creator"}</span>
                </div>
              </div>
              <div className="bg-surface-container p-3 rounded-xl">
                <div className="text-xs text-on-surface-variant">Bid Increment Step</div>
                <div className="text-body-md text-on-surface font-semibold font-tabular-price">
                  +{formatINR(auction.bidStep || 100)}
                </div>
              </div>
              <div className="bg-surface-container p-3 rounded-xl">
                <div className="text-xs text-on-surface-variant">Starting Lot Price</div>
                <div className="text-body-md text-on-surface font-semibold font-tabular-price">
                  {formatINR(auction.startingPrice)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Stage: Bidding Area, Timers, History */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Winner Banner (if ended) */}
          {isEnded && (
            <div className="bg-surface-container-high rounded-2xl p-6 border-2 border-tertiary/40 shadow-xl flex flex-col gap-3 text-center animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">military_tech</span>
              </div>
              <div>
                <h3 className="text-headline-sm font-bold text-on-surface">Auction Ended</h3>
                {auction.winner ? (
                  <div className="mt-2">
                    <p className="text-body-lg text-on-surface">
                      Winner:{" "}
                      <strong className="text-tertiary font-semibold">{auction.winner.name}</strong>
                    </p>
                    <div className="text-2xl font-bold font-tabular-price text-on-surface mt-1">
                      Final Hammer Price: {formatINR(auction.winner.amount)}
                    </div>
                    {currentUser?.id === auction.winner.userId && (
                      <div className="mt-3 py-2 px-4 bg-tertiary text-on-tertiary rounded-xl font-bold text-sm inline-block shadow-md">
                        🎉 Congratulations! You won this auction!
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-body-md text-on-surface-variant mt-1">
                    No bids were placed on this item.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Outbid or Leading Status Banner */}
          {isLive && isLeading && (
            <div className="bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 px-space-lg py-3 rounded-xl flex items-center gap-3 shadow-md">
              <span className="material-symbols-outlined text-emerald-400 text-[24px]">verified</span>
              <div className="text-body-sm">
                <strong className="font-semibold block text-emerald-300">You're currently leading!</strong>
                <span>Your bid of {formatINR(topBid?.amount)} is the highest.</span>
              </div>
            </div>
          )}

          {isLive && isOutbid && (
            <div className="bg-tertiary-container/80 border border-tertiary/40 text-on-tertiary-container px-space-lg py-3 rounded-xl flex items-center gap-3 shadow-md animate-pulse">
              <span className="material-symbols-outlined text-tertiary text-[24px]">warning</span>
              <div className="text-body-sm">
                <strong className="font-semibold block text-tertiary">You've been outbid!</strong>
                <span>
                  {topBid?.bidder?.name || "Another bidder"} placed a higher bid of {formatINR(topBid?.amount)}.
                </span>
              </div>
            </div>
          )}

          {/* Current Bid Card & Interactive Bid Controls */}
          <div className="bg-surface-container-low rounded-2xl p-6 sm:p-7 flex flex-col gap-5 shadow-xl border border-outline-variant/15 relative overflow-hidden">
            {/* Top: Current Price & Timer */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div>
                <div className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                  Current Highest Bid
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-tertiary font-tabular-price mt-1">
                  {formatINR(auction.currentPrice ?? auction.startingPrice)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-on-surface-variant flex items-center justify-end gap-1 font-medium uppercase tracking-wider">
                  <span className="material-symbols-outlined text-error text-[16px]">schedule</span>
                  Time Remaining
                </div>
                <div className="text-2xl font-bold font-mono tracking-wider font-tabular-price mt-1">
                  {isEnded ? (
                    <span className="text-on-surface-variant">00:00:00</span>
                  ) : (
                    <span className={remaining < 300000 ? "text-error" : "text-emerald-400"}>
                      {formatRemaining(remaining)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Current leader info */}
            <div className="flex items-center justify-between text-body-sm bg-surface-container p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-surface-bright flex items-center justify-center text-on-surface text-xs font-bold">
                  {topBid?.bidder?.name ? topBid.bidder.name.slice(0, 2).toUpperCase() : "–"}
                </div>
                <span className="text-on-surface-variant">
                  Leading:{" "}
                  <strong className="text-on-surface">
                    {topBid?.bidder?.name ? topBid.bidder.name : "No bids yet"}
                  </strong>
                </span>
              </div>
              <span className="text-xs text-on-surface-variant font-medium">
                {auction.bidCount} bids total
              </span>
            </div>

            {/* Feedback Message */}
            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-body-sm flex items-center gap-2 border ${
                  feedbackMsg.type === "error"
                    ? "bg-error-container text-on-error-container border-error/30"
                    : "bg-emerald-950/70 text-emerald-200 border-emerald-500/30"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {feedbackMsg.type === "error" ? "error" : "check_circle"}
                </span>
                <span className="flex-1">{feedbackMsg.text}</span>
                <button
                  type="button"
                  onClick={() => setFeedbackMsg(null)}
                  className="hover:opacity-75"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )}

            {/* Quick-Bid Chips */}
            {canBid && (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                  Quick Bid Increments
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {quickBidOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={isBidding}
                      onClick={() => handlePlaceBid(opt.amount)}
                      className="py-3 px-2 rounded-xl bg-surface-container hover:bg-surface-bright active:scale-95 transition-all text-center border border-outline-variant/15 hover:border-outline-variant/30 group"
                    >
                      <div className="text-label-lg font-bold text-on-surface font-tabular-price group-hover:text-tertiary">
                        {formatINR(opt.amount)}
                      </div>
                      <div className="text-[11px] text-on-surface-variant font-medium">
                        {opt.incrementLabel}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Amount Input */}
            {canBid && (
              <div className="flex flex-col gap-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="custom-bid" className="text-on-surface-variant font-medium uppercase tracking-wider">
                    Custom Bid Amount
                  </label>
                  <span className="text-on-surface-variant font-tabular-price">
                    Min next: <strong className="text-on-surface">{formatINR(auction.minNextBid)}</strong>
                  </span>
                </div>

                <div className="relative flex items-center">
                  <span className="absolute left-4 text-on-surface-variant font-bold text-lg pointer-events-none">
                    ₹
                  </span>
                  <input
                    id="custom-bid"
                    type="number"
                    min={auction.minNextBid}
                    value={customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                    placeholder={`e.g. ${auction.minNextBid}`}
                    className="w-full bg-surface-container text-on-surface pl-9 pr-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary text-body-lg font-bold font-tabular-price transition-all"
                  />
                </div>

                {customError && (
                  <span className="text-xs text-error font-medium">{customError}</span>
                )}
              </div>
            )}

            {/* Main Action Button */}
            {canBid ? (
              <button
                type="button"
                disabled={isBidding || Boolean(customError) || !customBid}
                onClick={() => handlePlaceBid(customNum)}
                className="w-full py-3.5 rounded-xl bg-secondary text-on-secondary font-semibold text-label-lg hover:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isBidding ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">
                      progress_activity
                    </span>
                    <span>Placing Bid...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">gavel</span>
                    <span>
                      {customBid
                        ? `Place Bid of ${formatINR(customNum)}`
                        : "Enter Custom Amount or Use Quick Chips"}
                    </span>
                  </>
                )}
              </button>
            ) : isCreator ? (
              <div className="p-3 bg-surface-container rounded-xl text-center text-body-sm text-on-surface-variant border border-outline-variant/15">
                <span className="material-symbols-outlined text-tertiary text-[20px] block mb-1">
                  shield_person
                </span>
                You created this auction. Bidding on your own lots is prohibited by auction integrity rules.
              </div>
            ) : isEnded ? (
              <div className="p-3 bg-surface-container rounded-xl text-center text-body-sm text-on-surface-variant border border-outline-variant/15">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] block mb-1">
                  lock
                </span>
                This auction has concluded. No further bids can be accepted.
              </div>
            ) : (
              <div className="p-3 bg-surface-container rounded-xl text-center text-body-sm text-on-surface-variant border border-outline-variant/15">
                Auction is not open for bidding at this time.
              </div>
            )}

            <div className="text-center text-[11px] text-on-surface-variant/80">
              Bids are binding financial commitments recorded immutably on the server ledger.
            </div>
          </div>

          {/* Live Bid Feed (Bid History) */}
          <div className="bg-surface-container-low rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-outline-variant/15">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px]">history</span>
                <h3 className="text-headline-sm text-on-surface font-bold">Live Bid Feed</h3>
              </div>
              <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
                Polling Active (3s)
              </span>
            </div>

            {auction.bids && auction.bids.length > 0 ? (
              <div className="flex flex-col divide-y divide-outline-variant/10 max-h-96 overflow-y-auto pr-1">
                {auction.bids.map((b, idx) => {
                  const isTop = idx === 0;
                  const isMyBid = currentUser && b.bidder?.id === currentUser.id;

                  return (
                    <div
                      key={b.id || idx}
                      className={`py-3 flex items-center justify-between transition-colors ${
                        isMyBid ? "bg-primary/5 px-3 rounded-xl my-1" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                            isTop
                              ? "bg-tertiary text-on-tertiary"
                              : isMyBid
                              ? "bg-primary text-on-primary"
                              : "bg-surface-bright text-on-surface"
                          }`}
                        >
                          {b.bidder?.name ? b.bidder.name.slice(0, 2).toUpperCase() : "BD"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-on-surface text-body-md font-medium">
                              {b.bidder?.name || "Participant"}
                            </span>
                            {isTop && (
                              <span className="px-2 py-0.5 rounded text-[11px] bg-tertiary/20 text-tertiary font-bold border border-tertiary/30">
                                Leading
                              </span>
                            )}
                            {isMyBid && (
                              <span className="px-2 py-0.5 rounded text-[11px] bg-primary/20 text-primary font-bold border border-primary/30">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-on-surface-variant">
                            {formatTimeAgo(b.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="text-tabular-price text-on-surface font-bold text-base">
                        {formatINR(b.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-on-surface-variant text-body-sm">
                No bids placed yet. Be the first to place the opening bid!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
