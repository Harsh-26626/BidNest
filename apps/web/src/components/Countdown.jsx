import React from "react";
import { useServerClock } from "../hooks/useServerClock";
import { formatRemaining } from "../utils/format";

export default function Countdown({
  targetTime,
  serverTime,
  onExpire,
  className = "",
  label = "Time remaining",
}) {
  const now = useServerClock(serverTime);
  const remaining = targetTime ? new Date(targetTime).getTime() - now : 0;

  React.useEffect(() => {
    if (remaining <= 0 && onExpire) {
      onExpire();
    }
  }, [remaining <= 0]);

  const isUrgent = remaining > 0 && remaining < 5 * 60 * 1000; // < 5 minutes

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <span className="text-body-sm text-on-surface-variant flex items-center gap-1">
          <span className={`material-symbols-outlined text-[16px] ${isUrgent ? "text-error animate-pulse" : "text-tertiary"}`}>
            schedule
          </span>
          {label}
        </span>
      )}
      <span
        className={`font-mono font-bold tracking-wider font-tabular-price ${
          isUrgent ? "text-error" : "text-on-surface"
        }`}
      >
        {formatRemaining(remaining)}
      </span>
    </div>
  );
}
