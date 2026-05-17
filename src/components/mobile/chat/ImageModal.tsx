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

  // 모달이 열려 있을 때 모바일/PC 브라우저 자체의 전체 화면 pinch-zoom 및 바운스 스크롤 누수를 원천 차단
  // 동시에 노트북 터치패드/트랙패드의 핀치 줌을 가로채서 이미지만을 마우스 커서 위치 기준으로 조준 확대/축소하도록 정밀 연동
  useEffect(() => {
    if (!isOpen) return;

    // 1. 모바일 멀티터치 페이지 줌 절대 차단
    const preventNativePinchZoom = (e: TouchEvent) => {
      // scale 변수를 이펙트 바깥에서 최신 상태로 추적하기 위해 document.touchmove는 container 이벤트를 사용하지 않고 
      // e.touches.length로 모바일 핀치 줌의 페이지 확장을 영리하게 봉쇄합니다.
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // 2. 노트북 터치패드(트랙패드) 핀치 줌 가로채기 -> 페이지 전체 확대를 막고, 이미지만을 핀치 중심점으로 줌인/줌아웃
    const handleWheelZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault(); // 브라우저 자체 페이지 줌 절대 차단

        // 핀치 줌 감도 보정 수치
        const zoomIntensity = 0.015;
        const delta = -e.deltaY * zoomIntensity;
        
        setScale((prevScale) => {
          const nextScale = Math.max(1, Math.min(4, prevScale + delta));
          
          if (nextScale === 1) {
            setPosition({ x: 0, y: 0 });
          } else {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const clientX = e.clientX;
            const clientY = e.clientY;
            
            setPosition((prevPos) => {
              // 이전 스케일 대비 다음 스케일 변화 비율 계산
              const scaleRatio = nextScale / prevScale;
              
              // 마우스 커서(조준점) 기준으로 드래그 벡터 보정량 연산
              let newX = prevPos.x - (clientX - centerX - prevPos.x) * (scaleRatio - 1);
              let newY = prevPos.y - (clientY - centerY - prevPos.y) * (scaleRatio - 1);
              
              // 확대 한계선에 부딪혔을 때의 화면 이탈 방지 클램핑
              const maxDragX = ((nextScale - 1) * window.innerWidth) / 2;
              const maxDragY = ((nextScale - 1) * window.innerHeight) / 2;
              newX = Math.max(-maxDragX, Math.min(maxDragX, newX));
              newY = Math.max(-maxDragY, Math.min(maxDragY, newY));
              
              return { x: newX, y: newY };
            });
          }
          return nextScale;
        });
      }
    };

    // passive: false를 주어 preventDefault()가 즉각 강제 차단되도록 보증
    document.addEventListener("touchmove", preventNativePinchZoom, { passive: false });
    document.addEventListener("wheel", handleWheelZoom, { passive: false });
    return () => {
      document.removeEventListener("touchmove", preventNativePinchZoom);
      document.removeEventListener("wheel", handleWheelZoom);
    };
  }, [isOpen]);

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
        // 더블 탭: 줌 토글 (1배 <-> 2.5배) - 더블 탭한 위치를 중심으로 확대
        if (scale > 1) {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        } else {
          const targetScale = 2.5;
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          
          const clientX = e.touches[0].clientX;
          const clientY = e.touches[0].clientY;
          
          // 터치 포인트 좌표 기준으로 줌 중심점 보정량 계산
          let newX = (centerX - clientX) * (targetScale - 1);
          let newY = (centerY - clientY) * (targetScale - 1);
          
          // 이미지 드래그 제한 한계 영역 내로 강제 고정
          const maxDragX = ((targetScale - 1) * window.innerWidth) / 2;
          const maxDragY = ((targetScale - 1) * window.innerHeight) / 2;
          newX = Math.max(-maxDragX, Math.min(maxDragX, newX));
          newY = Math.max(-maxDragY, Math.min(maxDragY, newY));
          
          setScale(targetScale);
          setPosition({ x: newX, y: newY });
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

    // 화면 드래그가 일어나지 않은 단순 화면 터치(탭) 시 상하단 컨트롤 바 표시 토글 (확대 상태에서도 자유로운 제어 허용)
    if (!hasMoved.current) {
      setShowControls((prev) => !prev);
    }

    if (scale < 1.05) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  // PC/노트북 마우스 및 터치패드 더블클릭 제어부 (더블클릭한 포인트를 정확히 조준하여 확대)
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      const targetScale = 2.5;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const clientX = e.clientX;
      const clientY = e.clientY;
      
      // 클릭한 마우스 좌표 기준 줌 중심점 보정량 계산
      let newX = (centerX - clientX) * (targetScale - 1);
      let newY = (centerY - clientY) * (targetScale - 1);
      
      const maxDragX = ((targetScale - 1) * window.innerWidth) / 2;
      const maxDragY = ((targetScale - 1) * window.innerHeight) / 2;
      newX = Math.max(-maxDragX, Math.min(maxDragX, newX));
      newY = Math.max(-maxDragY, Math.min(maxDragY, newY));
      
      setScale(targetScale);
      setPosition({ x: newX, y: newY });
    }
    hasMoved.current = true; // 컨트롤 바 깜빡임 방지 마킹
  };

  // 확대 여부와 관계없이 사용자의 탭 조작(showControls)에 따라 툴바를 부드럽게 노출
  const effectiveShowControls = showControls;

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
            onDoubleClick={handleDoubleClick}
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
