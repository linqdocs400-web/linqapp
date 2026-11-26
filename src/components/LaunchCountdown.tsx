import { useState, useEffect } from 'react';

// Calculate target time: 3 days, 20 hours, 25 minutes, 42 seconds from now
const now = new Date();
const target = new Date(
  now.getTime() +
    3 * 24 * 60 * 60 * 1000 +
    20 * 60 * 60 * 1000 +
    25 * 60 * 1000 +
    42 * 1000
);

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function LaunchCountdown() {
  const [remaining, setRemaining] = useState(() => {
    const diff = target.getTime() - now.getTime();
    return formatDuration(diff > 0 ? diff : 0);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = target.getTime() - new Date().getTime();
      if (diff <= 0) {
        clearInterval(interval);
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setRemaining(formatDuration(diff));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { days, hours, minutes, seconds } = remaining;
  return (
    <div className="mt-4 text-center">
      <p className="text-xs font-semibold tracking-[0.2em] text-primary mb-2">App Lauching in</p>
      <div className="inline-flex gap-2">
        <span className="font-bold text-2xl">
          {days.toString().padStart(2, '0')}days:
        </span>
        <span className="font-bold text-2xl">
          {hours.toString().padStart(2, '0')}hours:
        </span>
        <span className="font-bold text-2xl">
          {minutes.toString().padStart(2, '0')}mins:
        </span>
        <span className="font-bold text-2xl">
          {seconds.toString().padStart(2, '0')}secs
        </span>
      </div>
    </div>
  );
}