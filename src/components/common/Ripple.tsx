import React, { useState, useLayoutEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";

interface RippleInstance {
  x: number;
  y: number;
  size: number;
  id: number;
}

const rippleAnimation = keyframes`
  to {
    transform: scale(4);
    opacity: 0;
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

  span {
    transform: scale(0);
    border-radius: 100%;
    position: absolute;
    opacity: 0.6;
    background-color: var(--ripple-color, rgba(255, 255, 255, 0.3));
    animation-name: ${rippleAnimation};
    animation-duration: var(--ripple-duration, 550ms);
    animation-fill-mode: forwards;
    animation-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
    pointer-events: none;
  }
`;

interface RippleProps {
  color?: string;
  duration?: number;
}

export default function Ripple({ color = "rgba(255, 255, 255, 0.25)", duration = 550 }: RippleProps) {
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

    const clickHandler = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      // Calculate ripple size based on diagonal of the parent to cover it fully
      const size = Math.max(rect.width, rect.height) * 1.5;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const newRipple: RippleInstance = {
        x,
        y,
        size,
        id: Date.now() + Math.random(),
      };

      setRipples((prev) => [...prev, newRipple]);
    };

    parent.addEventListener("click", clickHandler);
    return () => {
      parent.removeEventListener("click", clickHandler);
    };
  }, []);

  const cleanUp = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <RippleContainer
      ref={containerRef}
      style={
        {
          "--ripple-color": color,
          "--ripple-duration": `${duration}ms`,
        } as React.CSSProperties
      }
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
          }}
          onAnimationEnd={() => cleanUp(ripple.id)}
        />
      ))}
    </RippleContainer>
  );
}
