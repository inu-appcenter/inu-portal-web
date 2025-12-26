import React, {
  useState,
  useEffect,
  useRef,
  FC,
  ReactNode,
  // MouseEvent와 TouchEvent를 react에서 import하지 않습니다.
} from "react";
import styled, { keyframes, css } from "styled-components";

// --- STYLED COMPONENTS ---

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

const slideUp = keyframes`
  from {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  to {
    transform: translateX(-50%) translateY(-120%);
    opacity: 0;
  }
`;

const swipeOutToSide = keyframes`
  from {
    /* 수정: X축과 Y축 모두 드래그가 끝난 지점에서 시작하도록 수정 
    */
    transform: translateX(-50%) translate(
      var(--swipe-translate-x, 0px),
      var(--swipe-translate-y, 0px)
    );
    opacity: 1;
  }
  to {
    /*
      수정: X축만 3배로 멀리 보내고, Y축은 유지
    */
    transform: translateX(-50%) translate(
      calc(var(--swipe-translate-x, 0px) * 3),
      var(--swipe-translate-y, 0px)
    );
    opacity: 0;
  }
`;

const NotificationWrapper = styled.div<{
  isClosing: boolean;
  swipeDirection: "up" | "side" | "none";
}>`
  position: fixed;
  top: 20px;
  left: 50%;
  z-index: 9999;
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

  /* --- 수정됨: 화이트 테마 및 블러 효과 적용 --- */
  background-color: rgba(255, 255, 255, 0.85);
  color: #333;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  /* --- --------------------------------- --- */

  animation: ${slideDown} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;

  ${({ isClosing, swipeDirection }) => {
    if (!isClosing) return "";
    if (swipeDirection === "up")
      return css`
        animation: ${slideUp} 0.3s ease-out forwards;
      `;
    if (swipeDirection === "side")
      return css`
        animation: ${swipeOutToSide} 0.3s ease-out forwards;
      `;
    return css`
      animation: ${slideUp} 0.3s ease-out forwards;
    `;
  }}
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
  color: white; /* --- 수정됨: 아이콘 글자색 흰색으로 --- */
`;

const AppName = styled.span`
  font-size: 14px;
  font-weight: 600;
  opacity: 0.8;
  color: #333; /* --- 수정됨: 색상 명시 --- */
`;

const NotificationBody = styled.div`
  //padding-left: 28px;
`;

const Title = styled.h3`
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: bold;
  color: #111; /* --- 수정됨: 가독성을 위해 더 진하게 --- */
`;

const Message = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #444; /* --- 수정됨: 가독성을 위해 조정 --- */
  white-space: pre-line; /* ← \\n을 실제 줄바꿈으로 표시 */
`;

// const CloseButton = styled.button`
//   background: none;
//   border: none;
//   color: #999; /* --- 수정됨: 색상 조정 --- */
//   font-size: 14px;
//   font-weight: 500;
//   padding: 8px 0;
//   margin-top: 12px;
//   width: 100%;
//   //text-align: right;
//   cursor: pointer;
//   transition: color 0.2s;
//
//   &:hover {
//     color: #555; /* --- 수정됨: 호버 색상 조정 --- */
//   }
// `;
// --- COMPONENT ---

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
  const [swipeDirection, setSwipeDirection] = useState<"up" | "side" | "none">(
    "none",
  );
  const notificationRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const lastDragPos = useRef({ x: 0, y: 0 });

  const handleClose = (direction: "up" | "side" | "none" = "none") => {
    if (isClosing) return;
    setSwipeDirection(direction);
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => handleClose("up"), duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 수정: 파라미터 'e'의 타입을 브라우저 네이티브 이벤트로 명시합니다.
  const getPosition = (
    e: globalThis.MouseEvent | globalThis.TouchEvent,
  ): { x: number; y: number } => {
    if ("touches" in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const onDragStart = (
    // 수정: 파라미터 'e'의 타입을 React 이벤트로 명시합니다.
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if (isClosing) return;
    isDragging.current = true;
    // e.nativeEvent는 네이티브 이벤트이므로 getPosition과 타입이 일치합니다.
    startPos.current = getPosition(e.nativeEvent);
    lastDragPos.current = { x: 0, y: 0 };
    if (notificationRef.current) {
      notificationRef.current.style.transition = "none";
    }
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("touchmove", onDragMove, { passive: false });
    window.addEventListener("mouseup", onDragEnd);
    window.addEventListener("touchend", onDragEnd);
  };

  // 수정: 파라미터 'e'의 타입을 브라우저 네이티브 이벤트로 명시합니다.
  const onDragMove = (e: globalThis.MouseEvent | globalThis.TouchEvent) => {
    if (!isDragging.current || !notificationRef.current) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    // e는 네이티브 이벤트이므로 getPosition과 타입이 일치합니다.
    const currentPos = getPosition(e);
    const deltaX = currentPos.x - startPos.current.x;
    const deltaY = currentPos.y - startPos.current.y;

    lastDragPos.current = { x: deltaX, y: deltaY };

    notificationRef.current.style.transform = `translateX(-50%) translate(${deltaX}px, ${deltaY}px)`;
  };

  const onDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("touchmove", onDragMove);
    window.removeEventListener("mouseup", onDragEnd);
    window.removeEventListener("touchend", onDragEnd);

    if (notificationRef.current) {
      const finalDeltaX = lastDragPos.current.x;
      const finalDeltaY = lastDragPos.current.y; // Y축 값도 가져옵니다.

      const swipeOutThresholdX = notificationRef.current.offsetWidth * 0.4;
      const swipeOutThresholdY = 60;

      if (Math.abs(finalDeltaX) > swipeOutThresholdX) {
        // 수정: X축과 Y축 변수를 모두 설정합니다.
        notificationRef.current.style.setProperty(
          "--swipe-translate-x",
          `${finalDeltaX}px`,
        );
        notificationRef.current.style.setProperty(
          "--swipe-translate-y",
          `${finalDeltaY}px`,
        );
        handleClose("side");
      } else if (finalDeltaY < -swipeOutThresholdY) {
        handleClose("up");
      } else {
        notificationRef.current.style.transition =
          "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        notificationRef.current.style.transform = "translateX(-50%)";
      }
    }
  };

  return (
    <NotificationWrapper
      ref={notificationRef}
      isClosing={isClosing}
      swipeDirection={swipeDirection}
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
      {/*<CloseButton*/}
      {/*  onClick={(e) => {*/}
      {/*    e.stopPropagation();*/}
      {/*    handleClose("up");*/}
      {/*  }}*/}
      {/*>*/}
      {/*  닫기*/}
      {/*</CloseButton>*/}
    </NotificationWrapper>
  );
};

export default TopPopupNotification;
