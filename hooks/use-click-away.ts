"use client";

import { useEffect, useRef } from "react";

export function useClickAway<T extends HTMLElement = HTMLElement>(
  onClickAway: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickAway();
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClickAway]);

  return ref;
}
