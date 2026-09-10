import { useEffect, useState } from "react";

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(pointer: coarse), (max-width: 640px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse), (max-width: 640px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return { isMobile };
};
