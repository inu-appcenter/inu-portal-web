import { ChangeEvent, useRef } from "react";
import styled from "styled-components";
import { Camera, Image as ImageIcon } from "lucide-react";
import AnonymousCheck from "@/components/mobile/write/AnonymousCheck";
import { DESKTOP_CONTENT_MAX_WIDTH, MOBILE_PAGE_GUTTER } from "@/styles/responsive";

interface WriteBottomBarProps {
  anonymous: boolean;
  onAnonymousChange: (checked: boolean) => void;
  onImageChange: (files: File[]) => void;
  onSubmit: () => void;
  loading: boolean;
  imageCount: number;
}

export default function WriteBottomBar({
  anonymous,
  onAnonymousChange,
  onImageChange,
  onSubmit,
  loading,
  imageCount,
}: WriteBottomBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageChange(Array.from(e.target.files));
    }
  };

  return (
    <BottomBarWrapper>
      <LeftGroup>
        <AnonymousCheck checked={anonymous} onChange={onAnonymousChange} />

        <IconButton onClick={() => cameraInputRef.current?.click()} type="button">
          <Camera size={24} color="#333D4B" />
        </IconButton>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <IconButton onClick={() => fileInputRef.current?.click()} type="button">
          <ImageIcon size={24} color="#333D4B" />
          {imageCount > 0 && <ImageBadge>{imageCount}</ImageBadge>}
        </IconButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </LeftGroup>

      <SubmitButton onClick={onSubmit} disabled={loading} type="button">
        {loading ? "등록 중..." : "등록하기"}
      </SubmitButton>
    </BottomBarWrapper>
  );
}

const BottomBarWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
  background: #ffffff;
  border-top: 1px solid var(--border-default, #e5e8eb);
  padding: 12px ${MOBILE_PAGE_GUTTER} calc(12px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 4px;
  transition: opacity 0.15s ease-in-out;

  &:active {
    opacity: 0.6;
  }
`;

const ImageBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -4px;
  background: var(--text-brand, #0061ff);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SubmitButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-brand, #0061ff);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  transition: opacity 0.15s ease-in-out;

  &:disabled {
    color: var(--text-tertiary, #8b95a1);
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    opacity: 0.6;
  }
`;
