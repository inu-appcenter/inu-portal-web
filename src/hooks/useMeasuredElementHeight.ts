import { RefObject, useLayoutEffect, useState } from "react";

export default function useMeasuredElementHeight<T extends HTMLElement>(
  ref: RefObject<T | null>,
  enabled = true,
) {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (!enabled) {
      setHeight(0);
      return;
    }

    const element = ref.current;
    if (!element) {
      setHeight(0);
      return;
    }

    const updateHeight = () => {
      const nextHeight = Math.ceil(element.getBoundingClientRect().height);
      setHeight((prevHeight) =>
        prevHeight === nextHeight ? prevHeight : nextHeight,
      );
    };

    updateHeight();
    const frameId = window.requestAnimationFrame(updateHeight);
    window.addEventListener("resize", updateHeight);

    if (typeof ResizeObserver === "undefined") {
      return () => {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener("resize", updateHeight);
      };
    }

    const observer = new ResizeObserver(() => {
      updateHeight();
    });
    observer.observe(element);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateHeight);
      observer.disconnect();
    };
  }, [enabled, ref]);

  return height;
}
