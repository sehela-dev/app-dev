"use client";
import { useEffect, useState } from "react";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

interface UseCountdownFromProps {
  startTime?: number; // unix timestamp (seconds) from props/server
  duration: number; // seconds (90, 60, etc)
  autoStart?: boolean;
}

export function useCountdown({ startTime, duration, autoStart = true }: UseCountdownFromProps) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (!autoStart) return;

    // base time (props or system)
    let baseTime = startTime ?? Math.floor(Date.now() / 1000);

    const endTime = baseTime + duration;

    const update = () => {
      const diff = endTime - baseTime;

      setRemaining(diff > 0 ? diff : 0);
      baseTime += 1;
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration, autoStart]);

  return {
    remainingSeconds: remaining,
    formattedTime: formatTime(remaining),
    isExpired: remaining === 0,
  };
}
