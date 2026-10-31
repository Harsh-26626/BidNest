import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../app/api";
import { setCredentials } from "../app/authSlice";
import { errorMessage } from "../utils/format";

export default function Login() {
  const [email, setEmail] = useState("meera@bidnest.dev");
  const [password, setPassword] = useState("Passw0rd!");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const [loginMutation, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);

    try {
      const result = await loginMutation({ email: email.trim(), password }).unwrap();
      dispatch(setCredentials(result));
      navigate("/auctions");
    } catch (err) {
      setLoginError(errorMessage(err));
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("Passw0rd!");
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      {/* Top minimal header */}
      <header className="w-full z-20 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15 py-4 px-6 lg:px-12 flex items-center justify-between">
        <Link to="/auctions" className="flex items-center gap-space-md">
          <div className="w-9 h-9 rounded-xl bg-tertiary/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary text-[26px]">gavel</span>
          </div>
          <span className="text-headline-sm text-on-surface tracking-tight font-headline-sm font-semibold">
            BidNest
          </span>
        </Link>
        <Link
          to="/register"
          className="text-body-md text-secondary hover:text-on-surface transition-colors font-medium"
        >
          Need an account? Register →
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 w-full flex-1">
        {/* Left Brand Panel */}
        <div className="lg:col-span-7 bg-surface-container-low flex flex-col justify-between p-8 lg:p-16 relative overflow-hidden border-r border-outline-variant/15">
          {/* Decorative background glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Content */}
          <div className="relative z-10 flex items-center gap-space-sm">
            <span className="px-space-md py-space-xs rounded-full bg-surface-container-high text-tertiary text-xs font-semibold tracking-wider uppercase border border-tertiary/20">
              Secure Gateway
            </span>
            <span className="text-on-surface-variant text-body-sm">v2.4 Live Node</span>
          </div>

          {/* Center Hero Message */}
          <div className="relative z-10 my-12 max-w-xl">
            <h1 className="text-headline-lg lg:text-[46px] lg:leading-[54px] text-on-surface font-headline-lg tracking-tight mb-space-md font-bold">
              Transparent, timed auctions for extraordinary items.
            </h1>
            <p className="text-body-lg text-on-surface-variant mb-space-xl leading-relaxed">
              Enter the high-stakes marketplace where verified provenance meets lightning-fast decentralized bidding. Manage your portfolio and track live lots securely.
            </p>

            {/* Live Stats Bento Snippet */}
            <div className="grid grid-cols-3 gap-space-md bg-surface-container/60 backdrop-blur-md p-space-lg rounded-2xl border border-outline-variant/20 shadow-lg">
              <div>
                <div className="text-body-sm text-on-surface-variant">Active Lots</div>
                <div className="text-tabular-price text-tertiary font-bold text-xl">1,429</div>
              </div>
              <div>
                <div className="text-body-sm text-on-surface-variant">Volume (24h)</div>
                <div className="text-tabular-price text-on-surface font-bold text-xl">₹14.2M</div>
              </div>
              <div>
                <div className="text-body-sm text-on-surface-variant">Uptime</div>
                <div className="text-tabular-price text-secondary font-bold text-xl">99.99%</div>
              </div>
            </div>
          </div>

          {/* Bottom Security / Status preview */}
          <div className="relative z-10 flex items-center justify-between text-body-sm text-on-surface-variant pt-space-lg border-t border-outline-variant/20">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <div className="font-label-lg text-on-surface font-medium">Encrypted Session</div>
                <div className="text-xs">TLS 1.3 End-to-End Protection</div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs text-emerald-300 font-medium">Node Connected</span>
            </div>
          </div>
        </div>

        {/* Right Login Form Panel */}
        <div className="lg:col-span-5 bg-surface-container flex flex-col justify-center px-8 lg:px-14 py-12 relative">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="mb-space-xl">
              <h2 className="text-headline-md text-on-surface mb-2 font-bold font-headline-md">
                Sign in to BidNest
              </h2>
              <p className="text-body-md text-on-surface-variant">
                Enter your credentials to access your auction dashboard.
              </p>
            </div>

            {/* Error Banner */}
            {loginError && (
              <div className="mb-space-lg p-space-md bg-error-container text-on-error-container rounded-xl flex items-start gap-space-md transition-all border border-error/30 animate-fadeIn">
                <span className="material-symbols-outlined text-error text-[20px] shrink-0">error</span>
                <div className="flex-1 text-body-sm">
                  <div className="font-semibold mb-0.5">Authentication Failed</div>
                  <div>{loginError}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setLoginError(null)}
                  className="text-on-error-container hover:opacity-75"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-label-md text-on-surface mb-2 font-medium" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low text-on-surface text-body-md rounded-xl border border-outline-variant/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-label-md text-on-surface font-medium" htmlFor="password">
                    Password
                  </label>
                  <span className="text-xs text-on-surface-variant">Min. 8 characters</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-surface-container-low text-on-surface text-body-md rounded-xl border border-outline-variant/30 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Demo accounts quick-fill buttons */}
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20">
                <span className="text-xs text-on-surface-variant block mb-2 font-medium uppercase tracking-wider">
                  Quick Demo Accounts:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("meera@bidnest.dev")}
                    className="flex-1 py-1.5 px-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs text-on-surface text-center transition-colors border border-outline-variant/20"
                  >
                    Meera (Seller)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("rohan@bidnest.dev")}
                    className="flex-1 py-1.5 px-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs text-on-surface text-center transition-colors border border-outline-variant/20"
                  >
                    Rohan (Bidder)
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-space-lg bg-secondary text-on-secondary font-label-lg font-semibold rounded-xl hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-space-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center mt-8">
              <p className="text-body-md text-on-surface-variant">
                Don't have a BidNest account?{" "}
                <Link to="/register" className="text-tertiary font-semibold hover:underline ml-1">
                  Register for access
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
