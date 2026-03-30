import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { createPortal } from "react-dom";

const slideDown = keyframes`
  from {
    transform: translateX(-50%) translateY(-120%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
`;

const NotificationWrapper = styled.div`
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
  left: 50%;
  z-index: 999999;
  width: calc(100% - 10px);
  max-width: 450px;
  padding: 12px 40px;
  box-sizing: border-box;
  border-radius: 60px;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;

  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.7) 0%,
    rgba(255, 255, 255, 0.55) 100%
  );

  backdrop-filter: blur(35px) saturate(200%);
  -webkit-backdrop-filter: blur(35px) saturate(200%);

  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
    0 20px 40px -10px rgba(0, 0, 0, 0.2);

  color: #222;
  animation: ${slideDown} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  transform: translateX(-50%) translateY(0);
  opacity: 1;
  will-change: transform, opacity;
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const AppIcon = styled.div`
  width: 20px;
  height: 20px;
  background-color: #4299e1;
  border-radius: 4px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
  color: white;
  box-shadow: 0 2px 4px rgba(66, 153, 225, 0.3);
`;

const AppName = styled.span`
  font-size: 14px;
  font-weight: 600;
  opacity: 0.7;
  color: #444;
`;

const NotificationBody = styled.div``;

const Title = styled.h3`
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: bold;
  color: #000;
`;

const Message = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #333;
  white-space: pre-line;
  opacity: 0.9;
`;

interface TopPopupNotificationProps {
  onClose: () => void;
  title: string;
  message: string;
  appName?: string;
  appIcon?: ReactNode;
  duration?: number;
}

const TopPopupNotification: FC<TopPopupNotificationProps> = ({
  onClose,
  title,
  message,
  appName,
  appIcon,
  duration = 5000,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentTranslate = useRef({ x: 0, y: 0 });
  const dragAxis = useRef<"x" | "y" | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => triggerExitAnimation("up"), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const triggerExitAnimation = (direction: "up" | "left" | "right") => {
    if (isClosing || !notificationRef.current) return;
    setIsClosing(true);

    const el = notificationRef.current;

    el.style.transition =
      "transform 0.25s cubic-bezier(0.32, 0, 0.67, 0), opacity 0.2s ease-in";
    el.style.opacity = "0";

    if (direction === "up") {
      el.style.transform = `translateX(-50%) translateY(-150%)`;
    } else {
      const screenWidth = window.innerWidth;
      const targetX = direction === "right" ? screenWidth : -screenWidth;
      el.style.transform = `translateX(-50%) translate(${targetX}px, 0px)`;
    }

    setTimeout(onClose, 300);
  };

  const getPosition = (
    e: globalThis.MouseEvent | globalThis.TouchEvent,
  ): { x: number; y: number } => {
    if ("touches" in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const onDragStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (isClosing) return;
    isDragging.current = true;
    dragAxis.current = null;
    startPos.current = getPosition(e.nativeEvent);

    if (notificationRef.current) {
      notificationRef.current.style.transition = "none";
      notificationRef.current.style.animation = "none";
    }

    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("touchmove", onDragMove, { passive: false });
    window.addEventListener("mouseup", onDragEnd);
    window.addEventListener("touchend", onDragEnd);
  };

  const onDragMove = (e: globalThis.MouseEvent | globalThis.TouchEvent) => {
    if (!isDragging.current || !notificationRef.current) return;
    if (e.cancelable && "touches" in e) e.preventDefault();

    const currentPos = getPosition(e);
    const rawDeltaX = currentPos.x - startPos.current.x;
    const rawDeltaY = currentPos.y - startPos.current.y;

    if (!dragAxis.current) {
      if (Math.abs(rawDeltaX) > Math.abs(rawDeltaY)) {
        if (Math.abs(rawDeltaX) > 5) dragAxis.current = "x";
      } else {
        if (Math.abs(rawDeltaY) > 5) dragAxis.current = "y";
      }
    }

    let finalX = 0;
    let finalY = 0;

    if (dragAxis.current === "x") {
      finalX = rawDeltaX;
      finalY = 0;
    } else if (dragAxis.current === "y") {
      finalX = 0;
      finalY = rawDeltaY > 0 ? rawDeltaY * 0.2 : rawDeltaY;
    }

    currentTranslate.current = { x: finalX, y: finalY };

    const elementWidth = notificationRef.current.offsetWidth;
    const progressX = Math.min(Math.abs(finalX) / (elementWidth * 0.6), 1);
    const progressY = finalY < 0 ? Math.min(Math.abs(finalY) / 80, 1) : 0;
    const opacity = 1 - Math.max(progressX, progressY);

    notificationRef.current.style.transform = `translateX(-50%) translate(${finalX}px, ${finalY}px)`;
    notificationRef.current.style.opacity = `${opacity}`;
  };

  const onDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("touchmove", onDragMove);
    window.removeEventListener("mouseup", onDragEnd);
    window.removeEventListener("touchend", onDragEnd);

    if (!notificationRef.current) return;

    const { x, y } = currentTranslate.current;
    const thresholdX = 100;
    const thresholdY = -50;

    if (y < thresholdY) {
      triggerExitAnimation("up");
    } else if (Math.abs(x) > thresholdX) {
      triggerExitAnimation(x > 0 ? "right" : "left");
    } else {
      notificationRef.current.style.transition =
        "transform 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s";
      notificationRef.current.style.transform =
        "translateX(-50%) translate(0, 0)";
      notificationRef.current.style.opacity = "1";
    }
  };

  if (!mounted) return null;

  return createPortal(
    <NotificationWrapper
      ref={notificationRef}
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
    >
      {appName && (
        <NotificationHeader>
          <AppIcon>{appIcon}</AppIcon>
          <AppName>{appName}</AppName>
        </NotificationHeader>
      )}
      <NotificationBody>
        <Title>{title}</Title>
        <Message>{message}</Message>
      </NotificationBody>
    </NotificationWrapper>,
    document.body,
  );
};

export default TopPopupNotification;
