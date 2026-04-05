import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import styled, { css } from "styled-components";

export type TooltipPosition = "top" | "bottom";
export type TooltipAlign = "left" | "right" | "center";

interface CommonTooltipProps {
  message: string;
  onClose: () => void;
  position?: TooltipPosition;
  align?: TooltipAlign;
  width?: string;
  minWidth?: string;
  anchorRef?: RefObject<HTMLElement | null>;
}

interface FloatingCoordinates {
  top: number;
  left: number;
}

function getFloatingLeft(rect: DOMRect, align: TooltipAlign) {
  switch (align) {
    case "left":
      return rect.left + window.scrollX;
    case "right":
      return rect.right + window.scrollX;
    case "center":
      return rect.left + rect.width / 2 + window.scrollX;
  }
}

function getFloatingTransform(position: TooltipPosition, align: TooltipAlign) {
  const translateX =
    align === "center" ? "-50%" : align === "right" ? "-100%" : "0";
  const translateY = position === "top" ? "calc(-100% - 14px)" : "14px";

  return `translate(${translateX}, ${translateY})`;
}

function getAbsoluteVerticalStyles(position: TooltipPosition) {
  return position === "top"
    ? css`
        bottom: calc(100% + 14px);
      `
    : css`
        top: calc(100% + 14px);
      `;
}

function getAbsoluteHorizontalStyles(align: TooltipAlign) {
  switch (align) {
    case "left":
      return css`
        left: 0;
      `;
    case "right":
      return css`
        right: 0;
      `;
    case "center":
      return css`
        left: 50%;
        transform: translateX(-50%);
      `;
  }
}

export default function TooltipMessage({
  message,
  onClose,
  position = "bottom",
  align = "right",
  width = "fit-content",
  minWidth,
  anchorRef,
}: CommonTooltipProps) {
  const [floatingCoordinates, setFloatingCoordinates] =
    useState<FloatingCoordinates | null>(null);
  const isFloating = Boolean(anchorRef);

  const updateFloatingCoordinates = useCallback(() => {
    const rect = anchorRef?.current?.getBoundingClientRect();

    if (!rect) {
      setFloatingCoordinates(null);
      return;
    }

    setFloatingCoordinates({
      top: (position === "top" ? rect.top : rect.bottom) + window.scrollY,
      left: getFloatingLeft(rect, align),
    });
  }, [align, anchorRef, position]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClose();
    },
    [onClose],
  );

  useLayoutEffect(() => {
    if (!anchorRef) {
      setFloatingCoordinates(null);
      return;
    }

    updateFloatingCoordinates();
  }, [anchorRef, updateFloatingCoordinates]);

  useEffect(() => {
    if (!anchorRef) {
      setFloatingCoordinates(null);
      return;
    }

    const animationFrameIds = new Set<number>();
    const scheduleInitialSync = (remainingFrames: number) => {
      updateFloatingCoordinates();

      if (remainingFrames <= 0) {
        return;
      }

      const nextFrameId = window.requestAnimationFrame(() => {
        animationFrameIds.delete(nextFrameId);
        scheduleInitialSync(remainingFrames - 1);
      });

      animationFrameIds.add(nextFrameId);
    };

    const handleWindowLoad = () => {
      updateFloatingCoordinates();
    };

    let resizeObserver: ResizeObserver | null = null;

    window.addEventListener("resize", updateFloatingCoordinates);
    window.addEventListener("load", handleWindowLoad);

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateFloatingCoordinates();
      });

      if (anchorRef.current) {
        resizeObserver.observe(anchorRef.current);
      }

      resizeObserver.observe(document.body);
      resizeObserver.observe(document.documentElement);
    }

    scheduleInitialSync(10);

    return () => {
      window.removeEventListener("resize", updateFloatingCoordinates);
      window.removeEventListener("load", handleWindowLoad);
      resizeObserver?.disconnect();
      animationFrameIds.forEach((frameId) => {
        window.cancelAnimationFrame(frameId);
      });
    };
  }, [anchorRef, updateFloatingCoordinates]);

  const tooltipElement: ReactNode = (
    <TooltipContainer
      $position={position}
      $align={align}
      $width={width}
      $minWidth={minWidth}
      $floating={isFloating}
      $floatingCoordinates={floatingCoordinates}
      onClick={handleClick}
    >
      <CloseButton onClick={handleClick} aria-label="close">
        &times;
      </CloseButton>
      {message.replace(/\\n/g, "\n")}
      <Arrow $position={position} $align={align} />
    </TooltipContainer>
  );

  if (!isFloating) {
    return tooltipElement;
  }

  if (typeof document === "undefined" || !floatingCoordinates) {
    return null;
  }

  return createPortal(tooltipElement, document.body);
}

const TOOLTIP_BG = "rgba(40, 40, 40, 0.9)";

const TooltipContainer = styled.div<{
  $position: TooltipPosition;
  $align: TooltipAlign;
  $width: string;
  $minWidth?: string;
  $floating: boolean;
  $floatingCoordinates: FloatingCoordinates | null;
}>`
  position: absolute;
  z-index: 2000;
  width: ${({ $width }) => $width};
  ${({ $minWidth }) => $minWidth && `min-width: ${$minWidth};`}
  padding: 10px 22px;
  color: #fff;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  white-space: pre-line;
  word-break: keep-all;
  line-height: 1.5;
  background-color: ${TOOLTIP_BG};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);

  ${({ $floating, $floatingCoordinates, $position, $align }) =>
    $floating
      ? css`
          top: ${$floatingCoordinates?.top ?? 0}px;
          left: ${$floatingCoordinates?.left ?? 0}px;
          transform: ${getFloatingTransform($position, $align)};
        `
      : css`
          ${getAbsoluteVerticalStyles($position)}
          ${getAbsoluteHorizontalStyles($align)}
        `}
`;

const Arrow = styled.div<{ $position: TooltipPosition; $align: TooltipAlign }>`
  position: absolute;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;

  ${({ $position }) =>
    $position === "top"
      ? css`
          top: 100%;
          border-top: 6px solid ${TOOLTIP_BG};
        `
      : css`
          bottom: 100%;
          border-bottom: 6px solid ${TOOLTIP_BG};
        `}

  ${({ $align }) => {
    switch ($align) {
      case "left":
        return css`
          left: 14px;
        `;
      case "right":
        return css`
          right: 14px;
        `;
      case "center":
        return css`
          left: 50%;
          transform: translateX(-50%);
        `;
    }
  }}
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s ease;

  &:hover {
    color: #fff;
  }
`;
