import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { ArrowLeft, Download } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import { useSheetBackHandler } from "@/hooks/useSheetBackHandler";

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
  senderName,
  createDate,
  senderId,
  onSenderClick,
}: ImageModalProps) {
  useSheetBackHandler(
    isOpen,
    () => onOpenChange(false),
    Boolean(imageUrl),
  );

  const [isDownloading, setIsDownloading] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const swiperRef = useRef<SwiperClass | null>(null);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTapTime = useRef<number>(0);

  const hasSenderInfo = Boolean(senderName && senderName !== "알 수 없음");

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
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }

      if (swiperRef.current && swiperRef.current.zoom) {
        const swiperZoom = swiperRef.current.zoom;

        if (swiperZoom.scale > 1) {
          swiperZoom.out();
        } else {
          if (event) {
            swiperZoom.in(event);
          } else {
            swiperZoom.in();
          }
        }
      }

      lastTapTime.current = 0;
    } else {
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
              zoom={{
                maxRatio: 1.8,
                minRatio: 1,
                toggle: false,
              }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onTap={handleTap}
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

            {hasSenderInfo && (
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
                {createDate && (
                  <SenderTime>{formatHeaderDate(createDate)}</SenderTime>
                )}
              </SenderInfo>
            )}
          </HeaderBar>

          <FooterBar $show={showControls}>
            <DownloadButton onClick={handleDownload} disabled={isDownloading}>
              <Download
                size={24}
                color={isDownloading ? "#767676" : "#FFFFFF"}
              />
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
  z-index: 20000;
  background-color: #000000;
  animation: ${fadeIn} 200ms ease-out;
`;

const StyledContent = styled(Dialog.Content)`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 20001;
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
  z-index: 20002;
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
  padding-top: var(--native-safe-area-inset-top);
  z-index: 20005;
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
  z-index: 20005;
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
