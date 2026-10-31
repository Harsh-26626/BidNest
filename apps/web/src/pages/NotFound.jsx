import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 text-center bg-surface">
      <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center text-tertiary mb-6 border border-outline-variant/20 shadow-xl">
        <span className="material-symbols-outlined text-[42px]">travel_explore</span>
      </div>
      <h1 className="text-4xl font-bold text-on-surface mb-2 font-headline-lg">
        404 — Page Not Found
      </h1>
      <p className="text-body-lg text-on-surface-variant max-w-md mb-8">
        The auction lot or page you are looking for does not exist or may have been concluded.
      </p>
      <Link
        to="/auctions"
        className="px-6 py-3 bg-primary hover:bg-primary-fixed-dim text-on-primary font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Return to Auctions
      </Link>
    </div>
  );
}
