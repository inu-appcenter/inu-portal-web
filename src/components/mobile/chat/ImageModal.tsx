import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { ArrowLeft, Download } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { getMobilePlatform } from "@/utils/getMobilePlatform";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const contentShow = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

interface ImageModalProps {
  imageUrl: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  senderName?: string;
  createDate?: string;
  senderId?: number | null;
  onSenderClick?: (senderId: number) => void;
}

export default function ImageModal({
  imageUrl,
  isOpen,
  onOpenChange,
  senderName = "알 수 없음",
  createDate,
  senderId,
  onSenderClick,
}: ImageModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDownloading, setIsDownloading] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Pinch 및 Drag 모션 제어를 위한 가상 Ref 변수들
  const touchStartDistance = useRef<number>(0);
  const touchStartScale = useRef<number>(1);
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchTime = useRef<number>(0);
  const hasMoved = useRef<boolean>(false);

  // 모달 열림/닫힘 상태 변화 시 스케일 및 컨트롤 바 초기화
  useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setShowControls(true);
    }
  }, [isOpen]);

  // 브라우저의 기본 페이지 줌인/줌아웃 제스처를 차단하기 위해 passive: false 이벤트 바인딩
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 || scale > 1) {
        e.preventDefault();
      }
    };

    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [scale]);

  if (!imageUrl) return null;

  // 한국어 전송일자 시간 포맷팅 ("2026. 5. 13. 오후 2:04 >")
  const formatHeaderDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const date = d.getDate();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "오후" : "오전";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0시 -> 12시
      return `${year}. ${month}. ${date}. ${ampm} ${hours}:${minutes} >`;
    } catch {
      return "";
    }
  };

  // Cross-Origin 보안 우회를 위한 Blob 이미지 다운로드 구현 (하이브리드 웹뷰 최적화)
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 차단
    if (!imageUrl || isDownloading) return;

    // 하이브리드 앱 웹뷰 환경인 경우, Blob 다운로드 차단 현상을 방지하고자 기기 브라우저/네이티브단으로 다운로드 위임
    const platform = getMobilePlatform();
    const isWebView = platform === "ios_webview" || platform === "android_webview";
    if (isWebView) {
      window.open(imageUrl, "_blank");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `intip_image_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("이미지 다운로드 실패, 새 창 열기로 폴백 처리:", error);
      // CORS 및 Blob 에러 발생 시, 새 창(브라우저)에서 원본을 열 수 있도록 완전한 안전망 제공
      window.open(imageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  // 터치 제스처 제어부
  const handleTouchStart = (e: React.TouchEvent) => {
    hasMoved.current = false;

    if (e.touches.length === 2) {
      // 1. 두 손가락 터치 시작 (Pinch Zoom)
      isDragging.current = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistance.current = dist;
      touchStartScale.current = scale;
    } else if (e.touches.length === 1) {
      // 2. 한 손가락 터치 (Double Tap 또는 Drag Pan)
      const now = Date.now();
      if (now - lastTouchTime.current < 300) {
        // 더블 탭: 줌 토글 (1배 <-> 2.5배)
        if (scale > 1) {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        } else {
          setScale(2.5);
          setPosition({ x: 0, y: 0 });
        }
        lastTouchTime.current = 0;
        hasMoved.current = true; // 더블 탭 시에는 싱글 탭 컨트롤 토글을 스킵하도록 마킹
        return;
      }
      lastTouchTime.current = now;

      if (scale > 1) {
        isDragging.current = true;
        dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        lastPosition.current = position;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    hasMoved.current = true;

    if (e.touches.length === 2 && touchStartDistance.current > 0) {
      // 1. 핀치로 크기 조정 중
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = touchStartScale.current * (dist / touchStartDistance.current);
      const clampedScale = Math.max(1, Math.min(4, newScale)); // 1배 ~ 4배 제한
      setScale(clampedScale);

      if (clampedScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isDragging.current && scale > 1) {
      // 2. 확대 상태에서 드래그하여 이동 중
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;

      let newX = lastPosition.current.x + dx;
      let newY = lastPosition.current.y + dy;

      // 모바일 디바이스 뷰포트를 벗어나서 빈 검은 화면이 크게 보이지 않도록 한계 영역 연산 바인딩
      const maxDragX = ((scale - 1) * window.innerWidth) / 2;
      const maxDragY = ((scale - 1) * window.innerHeight) / 2;
      newX = Math.max(-maxDragX, Math.min(maxDragX, newX));
      newY = Math.max(-maxDragY, Math.min(maxDragY, newY));

      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    touchStartDistance.current = 0;

    // 확대 상태가 아니면서 화면 드래그가 일어나지 않은 경우 (단순 화면 터치) -> 상하단 컨트롤 바 표시 토글
    if (!hasMoved.current && scale === 1) {
      setShowControls((prev) => !prev);
    }

    if (scale < 1.05) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  // 확대된 줌 모드 시에는 오버레이 컨트롤 바를 무조건 은닉하여 콘텐츠 감상 극대화
  const isZoomed = scale > 1;
  const effectiveShowControls = showControls && !isZoomed;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          {/* 중앙 전체화면 제스처 미디어 영역 */}
          <ImageContainer
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <StyledImage
              ref={imageRef}
              src={imageUrl}
              alt="전체화면 이미지"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging.current ? "none" : "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </ImageContainer>

          {/* 상단 플로팅 정보 바 */}
          <HeaderBar $show={effectiveShowControls}>
            <BackButton onClick={() => onOpenChange(false)}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </BackButton>

            <SenderInfo
              onClick={(e) => {
                e.stopPropagation();
                if (senderId && onSenderClick) {
                  onSenderClick(senderId);
                }
              }}
              $isClickable={!!senderId}
            >
              <SenderName>{senderName}</SenderName>
              <SenderTime>{formatHeaderDate(createDate)}</SenderTime>
            </SenderInfo>
          </HeaderBar>

          {/* 하단 플로팅 도구 바 (동작하지 않는 메뉴 완전 배제 후 다운로드 단일 버튼 배치) */}
          <FooterBar $show={effectiveShowControls}>
            <DownloadButton onClick={handleDownload} disabled={isDownloading}>
              <Download size={24} color={isDownloading ? "#767676" : "#FFFFFF"} />
            </DownloadButton>
          </FooterBar>
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const StyledOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 5000;
  background-color: #000000; /* Pure Black 배경색 */
  animation: ${fadeIn} 200ms ease-out;
`;

const StyledContent = styled(Dialog.Content)`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 5001;
  outline: none;
  background-color: #000000;
  box-sizing: border-box;
  animation: ${contentShow} 200ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
`;

const ImageContainer = styled.div`
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 5002;
  touch-action: none; /* 브라우저 기본 제스처 동작 비활성화 */
`;

const StyledImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  will-change: transform;
`;

const HeaderBar = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 72px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top, 0px);
  z-index: 5005;
  box-sizing: border-box;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
  
  /* 애니메이션 트랜지션 처리 */
  opacity: ${(props) => (props.$show ? 1 : 0)};
  transform: translateY(${(props) => (props.$show ? "0" : "-20px")});
  pointer-events: ${(props) => (props.$show ? "auto" : "none")};
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SenderInfo = styled.button<{ $isClickable: boolean }>`
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  margin-left: 12px;
  gap: 2px;
  text-align: left;
  cursor: ${(props) => (props.$isClickable ? "pointer" : "default")};
  padding: 4px 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:active {
    background-color: ${(props) => (props.$isClickable ? "rgba(255, 255, 255, 0.15)" : "transparent")};
  }
`;

const SenderName = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
`;

const SenderTime = styled.span`
  font-size: 11px;
  color: #ffffff;
  white-space: nowrap;
`;

const FooterBar = styled.div<{ $show: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center; /* 다운로드 단일 버튼 중앙 정렬 */
  align-items: center;
  padding: 24px 0;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  z-index: 5005;
  box-sizing: border-box;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
  
  /* 애니메이션 트랜지션 처리 */
  opacity: ${(props) => (props.$show ? 1 : 0)};
  transform: translateY(${(props) => (props.$show ? "0" : "20px")});
  pointer-events: ${(props) => (props.$show ? "auto" : "none")};
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
`;

const DownloadButton = styled.button`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%; /* 고급스러운 원형 디자인 */
  transition: transform 0.1s ease, background-color 0.2s ease;

  &:active {
    transform: scale(0.9);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;
