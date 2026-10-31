import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "../app/api";
import { setCredentials } from "../app/authSlice";
import { errorMessage } from "../utils/format";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [regError, setRegError] = useState(null);

  const [registerMutation, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegError(null);

    if (password !== confirmPassword) {
      setRegError("Passwords do not match. Please verify.");
      return;
    }

    if (password.length < 8) {
      setRegError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const result = await registerMutation({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      }).unwrap();

      dispatch(setCredentials(result));
      navigate("/auctions");
    } catch (err) {
      setRegError(errorMessage(err));
    }
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
          to="/login"
          className="text-body-md text-secondary hover:text-on-surface transition-colors font-medium"
        >
          Already registered? Sign in →
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 w-full flex-1">
        {/* Left Brand Panel */}
        <div className="lg:col-span-5 bg-surface-container-low p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden border-r border-outline-variant/15">
          {/* Decorative background glow */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-space-md">
            <div className="inline-flex items-center gap-space-sm px-space-md py-space-xs rounded-full bg-surface-container-high text-on-surface-variant text-label-md border border-outline-variant/20">
              <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
              <span>Verified Bidding Entity</span>
            </div>
            <h1 className="font-headline-lg text-on-surface text-headline-lg lg:text-[42px] lg:leading-[50px] tracking-tight font-bold">
              Join India's premier timed auction network
            </h1>
            <p className="text-on-surface-variant text-body-lg leading-relaxed">
              Gain exclusive access to high-value asset liquidations, rare collectibles, and institutional procurement events with real-time telemetry.
            </p>
          </div>

          <div className="relative z-10 my-12">
            <div className="grid grid-cols-2 gap-space-lg p-space-lg rounded-2xl bg-surface-container/60 backdrop-blur-md border border-outline-variant/20 shadow-lg">
              <div>
                <div className="font-tabular-price text-tertiary text-2xl font-bold">₹450Cr+</div>
                <div className="text-body-sm text-on-surface-variant mt-1">Total Volume Traded</div>
              </div>
              <div>
                <div className="font-tabular-price text-on-surface text-2xl font-bold">99.8%</div>
                <div className="text-body-sm text-on-surface-variant mt-1">Settlement Success</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-space-md pt-6 border-t border-outline-variant/20">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Trusted by industry leaders
            </div>
            <div className="flex items-center gap-space-lg opacity-70 tracking-tighter font-headline-sm font-bold text-on-surface-variant">
              <span>BOMBAYEX</span>
              <span>APEXCAPITAL</span>
              <span>NEXUSLTD</span>
            </div>
          </div>
        </div>

        {/* Right Registration Form Panel */}
        <div className="lg:col-span-7 bg-surface p-8 lg:p-16 flex items-center justify-center">
          <div className="w-full max-w-xl space-y-space-xl">
            <div className="space-y-2">
              <h2 className="font-headline-md text-on-surface text-headline-md font-bold">
                Create your account
              </h2>
              <p className="text-body-md text-on-surface-variant">
                Enter your details to register for active bidding credentials.
              </p>
            </div>

            {/* Error Banner */}
            {regError && (
              <div className="p-space-md bg-error-container text-on-error-container rounded-xl flex items-start gap-space-md border border-error/30 animate-fadeIn">
                <span className="material-symbols-outlined text-error text-[20px] shrink-0">error</span>
                <div className="flex-1 text-body-sm">
                  <div className="font-semibold mb-0.5">Registration Failed</div>
                  <div>{regError}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setRegError(null)}
                  className="text-on-error-container hover:opacity-75"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-label-md text-on-surface font-medium" htmlFor="fullname">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </span>
                  <input
                    id="fullname"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav Sharma"
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low text-on-surface text-body-md rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-outline-variant"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-label-md text-on-surface font-medium" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aarav.sharma@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low text-on-surface text-body-md rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-outline-variant"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="space-y-1.5">
                  <label className="block text-label-md text-on-surface font-medium" htmlFor="password">
                    Password (min 8)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">lock</span>
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-10 py-3 bg-surface-container-low text-on-surface text-body-md rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-outline-variant"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-label-md text-on-surface font-medium" htmlFor="confirm-password">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                    </span>
                    <input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-surface-container-low text-on-surface text-body-md rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-outline-variant"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-space-sm pt-2">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  defaultChecked
                  className="mt-1 w-4 h-4 rounded bg-surface-container-low text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <label htmlFor="terms" className="text-body-sm text-on-surface-variant leading-relaxed select-none cursor-pointer">
                  I agree to BidNest's <span className="text-tertiary">Terms of Service</span>, <span className="text-tertiary">Auction Rules</span>, and Privacy Policy, acknowledging that all bids are public and binding.
                </label>
              </div>

              <button
                id="submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-primary text-on-primary font-label-lg font-semibold rounded-xl hover:bg-primary-fixed-dim transition-all flex items-center justify-center gap-space-sm group shadow-lg shadow-primary/10 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-body-md text-on-surface-variant">
                  Already have an account?{" "}
                  <Link to="/login" className="text-tertiary font-semibold hover:underline">
                    Log in here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
