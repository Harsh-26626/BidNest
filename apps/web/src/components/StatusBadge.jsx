import React from "react";

export default function StatusBadge({ status, className = "" }) {
  if (status === "LIVE") {
    return (
      <div
        className={`bg-surface/85 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-emerald-500/20 ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-xs text-emerald-300 font-medium">Live</span>
      </div>
    );
  }

  if (status === "UPCOMING") {
    return (
      <div
        className={`bg-surface/85 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-amber-500/20 ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
        <span className="text-xs text-amber-300 font-medium">Upcoming</span>
      </div>
    );
  }

  return (
    <div
      className={`bg-surface/85 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-outline-variant/30 ${className}`}
    >
      <span className="w-2 h-2 rounded-full bg-on-surface-variant/80"></span>
      <span className="text-xs text-on-surface-variant font-medium">Ended</span>
    </div>
  );
}
