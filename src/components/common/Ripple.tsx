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
  background-color: var(--ripple-color, rgba(243, 244, 247, 0.7));
  transform-origin: center;
  pointer-events: none;

  animation: ${rippleScale} var(--ripple-duration, 350ms)
    cubic-bezier(0.1, 0.8, 0.3, 1) forwards;

  opacity: ${(props) => (props.$isReleased ? 0 : 1)};
  transition: opacity 250ms ease-out;
`;

interface RippleProps {
  color?: string;
  duration?: number;
}

export default function Ripple({
  color = "rgba(243, 244, 247, 0.7)",
  duration = 350,
}: RippleProps) {
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

    let startX = 0;
    let startY = 0;
    let isScrolling = false;
    let activeTimer: number | null = null;
    let spawnedLatestRippleId: number | null = null;

    const spawnRipple = (clientX: number, clientY: number) => {
      const rect = parent.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Calculate distance to all 4 corners and find the maximum distance
      const d1 = x * x + y * y;
      const d2 = (rect.width - x) * (rect.width - x) + y * y;
      const d3 = x * x + (rect.height - y) * (rect.height - y);
      const d4 =
        (rect.width - x) * (rect.width - x) +
        (rect.height - y) * (rect.height - y);
      const maxDist = Math.sqrt(Math.max(d1, d2, d3, d4));

      const size = maxDist * 2;
      const rippleX = x - size / 2;
      const rippleY = y - size / 2;

      const rippleId = Date.now() + Math.random();
      const newRipple: RippleInstance = {
        x: rippleX,
        y: rippleY,
        size,
        id: rippleId,
        isReleased: false,
      };

      setRipples((prev) => [...prev, newRipple]);
      spawnedLatestRippleId = rippleId;
      parent.classList.add("active-touch");
    };

    const pointerDownHandler = (e: PointerEvent) => {
      if (e.button !== 0) return; // Only trigger for main touch/click

      // If the target or any parent of the target up to this parent has data-no-ripple="true", do not trigger ripple.
      let target = e.target as HTMLElement | null;
      while (target && target !== parent) {
        if (target.getAttribute?.("data-no-ripple") === "true") {
          return;
        }
        target = target.parentElement;
      }

      startX = e.clientX;
      startY = e.clientY;
      isScrolling = false;
      spawnedLatestRippleId = null;

      // 스크롤 판별을 위한 지연
      activeTimer = window.setTimeout(() => {
        if (!isScrolling) {
          spawnRipple(e.clientX, e.clientY);
        }
      }, 20);
    };

    const pointerMoveHandler = (e: PointerEvent) => {
      if (isScrolling) return;

      const diffX = Math.abs(e.clientX - startX);
      const diffY = Math.abs(e.clientY - startY);

      // 8px 이상 이동 시 스크롤 판단 및 터치 취소
      if (diffX > 8 || diffY > 8) {
        isScrolling = true;
        if (activeTimer) {
          clearTimeout(activeTimer);
          activeTimer = null;
        }
        parent.classList.remove("active-touch");

        if (spawnedLatestRippleId !== null) {
          const targetId = spawnedLatestRippleId;
          setRipples((prev) =>
            prev.map((r) =>
              r.id === targetId ? { ...r, isReleased: true } : r,
            ),
          );
          spawnedLatestRippleId = null;
        }
      }
    };

    const pointerUpHandler = (e: PointerEvent) => {
      if (activeTimer) {
        clearTimeout(activeTimer);
        activeTimer = null;
      }

      if (!isScrolling && spawnedLatestRippleId === null) {
        spawnRipple(e.clientX, e.clientY);
      }

      setRipples((prev) =>
        prev.map((r) => (r.isReleased ? r : { ...r, isReleased: true })),
      );
      spawnedLatestRippleId = null;

      parent.classList.remove("active-touch");
    };

    const pointerCancelHandler = () => {
      if (activeTimer) {
        clearTimeout(activeTimer);
        activeTimer = null;
      }
      parent.classList.remove("active-touch");
      setRipples((prev) =>
        prev.map((r) => (r.isReleased ? r : { ...r, isReleased: true })),
      );
      spawnedLatestRippleId = null;
    };

    parent.addEventListener("pointerdown", pointerDownHandler);
    parent.addEventListener("pointermove", pointerMoveHandler, {
      passive: true,
    });
    parent.addEventListener("pointerup", pointerUpHandler);
    parent.addEventListener("pointerleave", pointerCancelHandler);
    parent.addEventListener("pointercancel", pointerCancelHandler);

    return () => {
      if (activeTimer) clearTimeout(activeTimer);
      parent.removeEventListener("pointerdown", pointerDownHandler);
      parent.removeEventListener("pointermove", pointerMoveHandler);
      parent.removeEventListener("pointerup", pointerUpHandler);
      parent.removeEventListener("pointerleave", pointerCancelHandler);
      parent.removeEventListener("pointercancel", pointerCancelHandler);
      parent.classList.remove("active-touch");
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
