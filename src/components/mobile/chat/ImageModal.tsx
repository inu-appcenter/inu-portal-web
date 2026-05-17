import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { ArrowLeft, Download } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // 드래그/핀치와 단순 탭을 구분하기 위한 네이티브 터치 리스너
  // react-zoom-pan-pinch가 synthetic 이벤트를 소비하므로 네이티브 레벨에서 직접 감지
  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length !== 1) return;
      const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
      const dt = Date.now() - touchStartTime;
      // 이동 거리가 10px 이하이고 300ms 이내인 경우만 단순 탭으로 판정
      if (dx < 10 && dy < 10 && dt < 300) {
        setShowControls((prev) => !prev);
      }
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [isOpen]);

  // 모달 열림/닫힘 상태 변화 시 컨트롤 바 초기화
  useEffect(() => {
    if (isOpen) {
      setShowControls(true);
    }
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

  // 확대 여부와 관계없이 사용자의 탭 조작(showControls)에 따라 툴바를 부드럽게 노출
  const effectiveShowControls = showControls;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          {/* 중앙 전체화면 제스처 미디어 영역 */}
          <ImageContainer ref={containerRef}>
            <TransformWrapper
              key={isOpen ? "open" : "closed"} // 모달이 닫히고 다시 열릴 때 줌 배율(scale=1) 및 위치 자동 복원
              initialScale={1}
              initialPositionX={0}
              initialPositionY={0}
              centerOnInit={true}
              minScale={1}
              maxScale={4}
              disablePadding={true} /* minScale 이하로 줌아웃되는 탄성(elastic) 효과 완전 차단 */
              // 모바일 더블탭 / PC 더블클릭 시 클릭된 좌표 조준 자동 줌 기능 활성화
              doubleClick={{
                step: 1.5,
                mode: "toggle",
              }}
              // PC/노트북 트랙패드 핀치 줌 및 마우스 휠 줌(Ctrl 키 연계) 지원
              wheel={{
                step: 0.05,
                activationKeys: ["Control"],
              }}
              // 줌 상태에서의 스무스한 관성 드래그(Velocity Panning) 설정
              panning={{
                velocityDisabled: false,
              }}
            >
              {() => (
                <TransformComponent
                  wrapperStyle={{ width: "100%", height: "100%" }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <StyledImage src={imageUrl} alt="전체화면 이미지" />
                </TransformComponent>
              )}
            </TransformWrapper>
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
