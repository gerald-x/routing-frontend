import { useSyncExternalStore } from "react";

// Tracks the `dark` class on <html>, so canvas-drawn map colors can follow the theme
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

export function useIsDark() {
  return useSyncExternalStore(subscribe, () =>
    document.documentElement.classList.contains("dark"),
  );
}
