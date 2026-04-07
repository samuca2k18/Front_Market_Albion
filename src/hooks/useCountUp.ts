// src/hooks/useCountUp.ts
import { useState, useEffect, useRef } from 'react';

export function useCountUp(end: number, duration: number = 800) {
  const [value, setValue] = useState(0);
  const prevEnd = useRef(0);

  useEffect(() => {
    const start = prevEnd.current;
    prevEnd.current = end;

    if (start === end) {
      setValue(end);
      return;
    }

    const startTime = performance.now();
    let rafId: number;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (end - start) * eased);
      setValue(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [end, duration]);

  return value;
}
