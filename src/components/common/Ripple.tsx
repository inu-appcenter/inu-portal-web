import React, { useState, useLayoutEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";

interface RippleInstance {
  x: number;
  y: number;
  size: number;
  id: number;
  isReleased: boolean;
}

const rippleScale = keyframes`
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
`;

const RippleContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
`;

const RippleSpan = styled.span<{ $isReleased: boolean }>`
  border-radius: 100%;
  position: absolute;
  background-color: var(--ripple-color, rgba(255, 255, 255, 0.45));
  transform-origin: center;
  pointer-events: none;

  /* Scale up animation */
  animation: ${rippleScale} var(--ripple-duration, 350ms) cubic-bezier(0.1, 0.8, 0.3, 1) forwards;

  /* Fade out transition when released */
  opacity: ${props => props.$isReleased ? 0 : 1};
  transition: opacity 250ms ease-out;
`;

interface RippleProps {
  color?: string;
  duration?: number;
}

export default function Ripple({ color = "rgba(255, 255, 255, 0.45)", duration = 350 }: RippleProps) {
  const [ripples, setRipples] = useState<RippleInstance[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    // Ensure parent can contain the absolute ripple container
    const parentStyle = window.getComputedStyle(parent);
    if (parentStyle.position === "static") {
      parent.style.position = "relative";
    }
    if (parentStyle.overflow !== "hidden") {
      parent.style.overflow = "hidden";
    }

    const pointerDownHandler = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate distance to all 4 corners and find the maximum distance
      const d1 = x * x + y * y;
      const d2 = (rect.width - x) * (rect.width - x) + y * y;
      const d3 = x * x + (rect.height - y) * (rect.height - y);
      const d4 = (rect.width - x) * (rect.width - x) + (rect.height - y) * (rect.height - y);
      const maxDist = Math.sqrt(Math.max(d1, d2, d3, d4));

      const size = maxDist * 2;
      const rippleX = x - size / 2;
      const rippleY = y - size / 2;

      const newRipple: RippleInstance = {
        x: rippleX,
        y: rippleY,
        size,
        id: Date.now() + Math.random(),
        isReleased: false,
      };

      setRipples((prev) => [...prev, newRipple]);
    };

    const pointerUpHandler = () => {
      setRipples((prev) =>
        prev.map((r) => (r.isReleased ? r : { ...r, isReleased: true }))
      );
    };

    parent.addEventListener("pointerdown", pointerDownHandler);
    parent.addEventListener("pointerup", pointerUpHandler);
    parent.addEventListener("pointerleave", pointerUpHandler);
    parent.addEventListener("pointercancel", pointerUpHandler);

    return () => {
      parent.removeEventListener("pointerdown", pointerDownHandler);
      parent.removeEventListener("pointerup", pointerUpHandler);
      parent.removeEventListener("pointerleave", pointerUpHandler);
      parent.removeEventListener("pointercancel", pointerUpHandler);
    };
  }, []);

  const cleanUp = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <RippleContainer
      className="ripple-container"
      ref={containerRef}
      style={
        {
          "--ripple-color": color,
          "--ripple-duration": `${duration}ms`,
        } as React.CSSProperties
      }
    >
      {ripples.map((ripple) => (
        <RippleSpan
          key={ripple.id}
          $isReleased={ripple.isReleased}
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
          }}
          onTransitionEnd={() => {
            if (ripple.isReleased) {
              cleanUp(ripple.id);
            }
          }}
        />
      ))}
    </RippleContainer>
  );
}
