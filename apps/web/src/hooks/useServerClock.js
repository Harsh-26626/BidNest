import { useEffect, useMemo, useState } from "react";

// Returns "now" in server time, synchronized with serverTime offset and ticking twice a second.
export function useServerClock(serverTime) {
  const offset = useMemo(
    () => (serverTime ? new Date(serverTime).getTime() - Date.now() : 0),
    [serverTime]
  );
  const [now, setNow] = useState(() => Date.now() + offset);

  useEffect(() => {
    setNow(Date.now() + offset);
    const interval = setInterval(() => {
      setNow(Date.now() + offset);
    }, 500);
    return () => clearInterval(interval);
  }, [offset]);

  return now;
}
