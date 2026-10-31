import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low py-space-xl border-t border-outline-variant/20 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant text-body-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary text-[20px]">gavel</span>
          <span>© 2026 BidNest Inc. All rights reserved. Transparent Event Auctions.</span>
        </div>
        <div className="flex items-center gap-space-lg text-body-sm">
          <span className="hover:text-on-surface cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-on-surface cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-on-surface cursor-pointer transition-colors">Bidding Rules</span>
          <span className="hover:text-on-surface cursor-pointer transition-colors">Support</span>
        </div>
      </div>
    </footer>
  );
}
