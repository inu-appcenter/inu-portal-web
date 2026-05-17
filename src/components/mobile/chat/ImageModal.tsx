import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { ArrowLeft, Download } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { getMobilePlatform } from "@/utils/getMobilePlatform";

import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";

import "swiper/css";
import "swiper/css/zoom";

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

  const swiperRef = useRef<SwiperClass | null>(null);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTapTime = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      setShowControls(true);
    }
  }, [isOpen]);

  if (!imageUrl) return null;

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
      hours = hours ? hours : 12;
      return `${year}. ${month}. ${date}. ${ampm} ${hours}:${minutes} >`;
    } catch {
      return "";
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl || isDownloading) return;

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
      window.open(imageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  // 싱글탭/더블탭 분리 및 튕김 현상 해결을 위한 공식 제스처 이벤트 연동
  const handleTap = (_swiper: SwiperClass, event: any) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 250;

    if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
      // 1. [더블 탭 판정 시점] - 보류 중인 싱글 탭 타이머 취소하여 툴바 토글 차단
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }

      if (swiperRef.current && swiperRef.current.zoom) {
        const swiperZoom = swiperRef.current.zoom;

        if (swiperZoom.scale > 1) {
          // 이미 확대된 상태라면 축소
          swiperZoom.out();
        } else {
          // [핵심 변경] 강제 CSS 수동 변조 조항을 전면 제거하고 오직 공식 API 매개변수 조합만 활용
          // Swiper Zoom 내장 메서드의 정석 명세: zoom.in(e) 구조로 탑승
          // 이렇게 원본 이벤트(event)를 그대로 넘겨주어야 Swiper 내부 가속 트래커 좌표와 동기화가 깨지지 않습니다.
          if (event) {
            swiperZoom.in(event);
          } else {
            swiperZoom.in();
          }
        }
      }

      lastTapTime.current = 0;
    } else {
      // 2. [싱글 탭 대기 시점]
      lastTapTime.current = now;

      if (tapTimer.current) clearTimeout(tapTimer.current);

      tapTimer.current = setTimeout(() => {
        setShowControls((prev) => !prev);
        tapTimer.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <ImageContainer>
            <StyledSwiper
              modules={[Zoom]}
              // 더블클릭 확대율 스케일을 선언식으로 설정 (maxRatio를 의도하신 1.8배 수준으로 매핑)
              // 이렇게 주입해야 zoom.in(event) 호출 시 내부 상태 머신이 완벽히 1.8배 타겟으로 자동 가속 연산합니다.
              zoom={{
                maxRatio: 1.8,
                minRatio: 1,
                toggle: false,
              }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onTap={handleTap}
              // 위치 이동(패닝 드래그)이 내부 좌표 충돌 없이 부드럽게 작동하도록 전면 개방
              allowTouchMove={true}
              style={{ width: "100%", height: "100%" }}
            >
              <SwiperSlide>
                <div className="swiper-zoom-container">
                  <StyledImage src={imageUrl} alt="전체화면 이미지" />
                </div>
              </SwiperSlide>
            </StyledSwiper>
          </ImageContainer>

          <HeaderBar $show={showControls}>
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

          <FooterBar $show={showControls}>
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
  background-color: #000000;
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
  z-index: 5002;
  overflow: hidden;
`;

const StyledSwiper = styled(Swiper)`
  .swiper-zoom-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000000;
  }
`;

const StyledImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
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
  justify-content: center;
  align-items: center;
  padding: 24px 0;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  z-index: 5005;
  box-sizing: border-box;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
  
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
  border-radius: 50%;
  transition: transform 0.1s ease, background-color 0.2s ease;

  &:active {
    transform: scale(0.9);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;