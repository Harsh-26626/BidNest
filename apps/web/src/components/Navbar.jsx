import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../app/authSlice";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/15 shadow-[0_1px_8px_rgba(0,0,0,0.15)]">
      <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Brand */}
        <Link to="/auctions" className="flex items-center gap-space-md group">
          <div className="w-9 h-9 rounded-xl bg-tertiary/15 flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-tertiary text-[26px]">gavel</span>
          </div>
          <span className="text-headline-sm text-on-surface tracking-tight font-headline-sm font-semibold">
            BidNest
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-space-md">
          <NavLink
            to="/auctions"
            className={({ isActive }) =>
              `transition-all font-medium rounded-xl px-space-md py-space-sm text-body-md flex items-center gap-1.5 ${
                isActive
                  ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60"
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>Auctions</span>
          </NavLink>
          <NavLink
            to="/create"
            className={({ isActive }) =>
              `transition-all font-medium rounded-xl px-space-md py-space-sm text-body-md flex items-center gap-1.5 ${
                isActive
                  ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60"
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Create Auction</span>
          </NavLink>
        </nav>

        {/* User & Actions */}
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-sm pl-space-sm">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold tracking-tight shadow-sm">
              {user?.name ? getInitials(user.name) : <span className="material-symbols-outlined text-[16px]">person</span>}
            </div>
            <span className="hidden lg:inline text-label-lg text-on-surface font-medium max-w-[140px] truncate">
              {user?.name || "Participant"}
            </span>
            <button
              onClick={handleLogout}
              className="p-space-xs text-on-surface-variant hover:text-tertiary transition-colors rounded-lg hover:bg-surface-container"
              title="Logout"
              aria-label="Logout"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-space-xs text-on-surface hover:text-tertiary transition-colors"
            aria-label="Toggle mobile menu"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-low border-b border-outline-variant/20 px-6 py-4 flex flex-col gap-2">
          <Link
            to="/auctions"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container flex items-center gap-2 font-medium"
          >
            <span className="material-symbols-outlined text-tertiary">dashboard</span>
            <span>Auctions Marketplace</span>
          </Link>
          <Link
            to="/create"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container flex items-center gap-2 font-medium"
          >
            <span className="material-symbols-outlined text-tertiary">add_circle</span>
            <span>Create Auction</span>
          </Link>
          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-body-sm text-on-surface-variant">
            <span>Signed in as: <strong className="text-on-surface">{user?.name}</strong></span>
            <button
              onClick={handleLogout}
              className="text-error flex items-center gap-1 font-medium hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
