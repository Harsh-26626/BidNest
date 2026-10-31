import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useListAuctionsQuery } from "../app/api";
import AuctionCard from "../components/AuctionCard";

export default function Auctions() {
  const [tab, setTab] = useState("live"); // 'live' | 'upcoming' | 'ended' | 'mine'
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("endingSoon"); // 'endingSoon' | 'highestPrice' | 'newest'

  const currentUser = useSelector((state) => state.auth.user);

  // Query parameter calculation
  const queryParams = useMemo(() => {
    const isMine = tab === "mine";
    return {
      status: isMine ? "all" : tab,
      mine: isMine ? "true" : undefined,
      q: search.trim() || undefined,
      limit: 30,
    };
  }, [tab, search]);

  const { data, isLoading, isError, error, refetch } = useListAuctionsQuery(queryParams, {
    pollingInterval: 10000, // Background refresh
  });

  const rawItems = data?.items || [];

  // Client-side sort if needed
  const sortedItems = useMemo(() => {
    const items = [...rawItems];
    if (sortBy === "highestPrice") {
      items.sort((a, b) => (b.currentPrice ?? b.startingPrice) - (a.currentPrice ?? a.startingPrice));
    } else if (sortBy === "newest") {
      items.sort((a, b) => new Date(b.createdAt || b.startsAt).getTime() - new Date(a.createdAt || a.startsAt).getTime());
    } else {
      // Default: ending soonest for live, or status-based
      items.sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime());
    }
    return items;
  }, [rawItems, sortBy]);

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-4rem)] bg-surface pb-16">
      {/* Header Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-6 w-full flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-sm text-tertiary text-label-md tracking-wider uppercase font-semibold">
            <span className="material-symbols-outlined text-[18px]">gavel</span>
            <span>Live Marketplace</span>
          </div>
          <h1 className="text-headline-lg lg:text-4xl text-on-surface font-headline-lg tracking-tight font-bold">
            Active &amp; Timed Auctions
          </h1>
          <p className="text-body-lg text-on-surface-variant">
            Browse verified asset liquidations and rare collectibles with real-time bidding
          </p>
        </div>
        <div className="flex items-center gap-space-md">
          <Link
            to="/create"
            className="bg-primary hover:bg-primary-fixed-dim text-on-primary font-label-lg font-semibold px-space-lg py-3 rounded-xl flex items-center gap-space-sm transition-all shadow-lg hover:shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Create Auction</span>
          </Link>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-6 w-full">
        <div className="bg-surface-container-low p-space-md rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-space-md shadow-sm border border-outline-variant/15">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setTab("live")}
              className={`px-space-md py-2.5 rounded-xl text-label-lg font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                tab === "live"
                  ? "bg-primary-container text-on-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <span>Live</span>
              {tab === "live" && data?.total !== undefined && (
                <span className="w-5 h-5 rounded-full bg-tertiary/20 text-tertiary text-xs flex items-center justify-center font-bold">
                  {data.total}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab("upcoming")}
              className={`px-space-md py-2.5 rounded-xl text-label-lg font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                tab === "upcoming"
                  ? "bg-primary-container text-on-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <span>Upcoming</span>
              {tab === "upcoming" && data?.total !== undefined && (
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant text-xs flex items-center justify-center font-semibold">
                  {data.total}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab("ended")}
              className={`px-space-md py-2.5 rounded-xl text-label-lg font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                tab === "ended"
                  ? "bg-primary-container text-on-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <span>Ended</span>
              {tab === "ended" && data?.total !== undefined && (
                <span className="w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant text-xs flex items-center justify-center font-semibold">
                  {data.total}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab("mine")}
              className={`px-space-md py-2.5 rounded-xl text-label-lg font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                tab === "mine"
                  ? "bg-primary-container text-on-primary font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              <span>My Auctions</span>
            </button>
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row items-center gap-space-md w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items, titles, categories..."
                className="w-full bg-surface-container-lowest text-on-surface pl-10 pr-space-md py-2.5 rounded-xl text-body-md border border-outline-variant/20 focus:outline-none focus:ring-1 focus:ring-secondary transition-all placeholder:text-on-surface-variant/60"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-surface-container-lowest text-on-surface px-space-md py-2.5 rounded-xl text-body-md border border-outline-variant/20 focus:outline-none focus:ring-1 focus:ring-secondary transition-all cursor-pointer appearance-none pr-10"
              >
                <option value="endingSoon">Ending soonest</option>
                <option value="highestPrice">Highest price</option>
                <option value="newest">Newest first</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Auction Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 w-full flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-surface-container-low rounded-2xl overflow-hidden animate-pulse border border-outline-variant/15 flex flex-col h-80"
              >
                <div className="aspect-[4/3] bg-surface-container-high/60 w-full"></div>
                <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                  <div className="h-4 bg-surface-container-high/60 rounded w-3/4"></div>
                  <div className="h-4 bg-surface-container-high/40 rounded w-1/2"></div>
                  <div className="h-8 bg-surface-container-high/50 rounded w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-surface-container-low p-8 rounded-2xl text-center flex flex-col items-center justify-center border border-error/30 max-w-lg mx-auto my-12">
            <span className="material-symbols-outlined text-error text-[48px] mb-2">warning</span>
            <h3 className="text-headline-sm font-bold text-on-surface mb-2">Unable to load auctions</h3>
            <p className="text-body-md text-on-surface-variant mb-6">
              Could not communicate with the auction server. Please ensure the API is running on port 4000.
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Retry Connection
            </button>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="bg-surface-container-low p-12 rounded-2xl text-center flex flex-col items-center justify-center border border-outline-variant/15 max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-tertiary mb-4">
              <span className="material-symbols-outlined text-[32px]">inventory_2</span>
            </div>
            <h3 className="text-headline-sm font-bold text-on-surface mb-2">
              No auctions found
            </h3>
            <p className="text-body-md text-on-surface-variant mb-6">
              {search
                ? `No auctions match your search "${search}".`
                : tab === "mine"
                ? "You haven't created any auctions yet. Start listing one now!"
                : `There are currently no auctions in the ${tab} tab.`}
            </p>
            {tab === "mine" ? (
              <Link
                to="/create"
                className="px-6 py-3 bg-primary text-on-primary font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 shadow-md"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Create Your First Auction
              </Link>
            ) : search ? (
              <button
                onClick={() => setSearch("")}
                className="px-6 py-2.5 bg-surface-container-high text-on-surface font-medium rounded-xl hover:bg-surface-container-highest"
              >
                Clear Search Filter
              </button>
            ) : (
              <Link
                to="/create"
                className="px-6 py-2.5 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90"
              >
                Create New Auction
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
            {sortedItems.map((item) => (
              <AuctionCard
                key={item.id}
                auction={item}
                currentUserId={currentUser?.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
