import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { X, KeyRound } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import useUserStore from "@/stores/useUserStore";

export interface PortalLinkBannerProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  onClose?: () => void;
  dismissKey?: string;
  hideCloseButton?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function PortalLinkBanner({
  title = "포털 계정 연동 필요",
  description,
  actionText = "연동",
  onAction,
  onClose,
  dismissKey = "dismiss_portal_link_banner",
  hideCloseButton = false,
  style,
  className,
}: PortalLinkBannerProps) {
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (dismissKey) {
      const dismissed = sessionStorage.getItem(dismissKey);
      if (dismissed === "true") {
        setIsDismissed(true);
      }
    }
  }, [dismissKey]);

  if (isDismissed) {
    return null;
  }

  const defaultDescription = userInfo?.nickname
    ? `${userInfo.nickname}님, 학적·이러닝·도서관을 연결해요`
    : "학적·이러닝·도서관 기능을 한 번에 연결해요";

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dismissKey) {
      sessionStorage.setItem(dismissKey, "true");
    }
    setIsDismissed(true);
    if (onClose) {
      onClose();
    }
  };

  return (
    <BannerWrapper style={style} className={className}>
      {!hideCloseButton && (
        <CloseButton onClick={handleClose} type="button" aria-label="닫기">
          <X size={15} color="#8b95a1" />
        </CloseButton>
      )}
      <IconBox>
        <KeyRound size={20} color="#0061ff" />
      </IconBox>
      <TextContent>
        <Title>{title}</Title>
        <Description>{description || defaultDescription}</Description>
      </TextContent>
      <ActionButton type="button" onClick={handleAction}>
        {actionText}
      </ActionButton>
    </BannerWrapper>
  );
}

const BannerWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 16px 18px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 16px;
  transition: transform 0.12s ease-in-out;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--bg-muted, #f2f4f6);
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background 0.15s ease;

  &:hover {
    background: var(--border-default, #e5e8eb);
  }

  &:active {
    transform: scale(0.92);
  }
`;

const IconBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--bg-brand-subtle, #eff6ff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TextContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-right: 8px;
`;

const Title = styled.h4`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
  line-height: 1.35;
  letter-spacing: -0.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Description = styled.p`
  margin: 0;
  font-size: 12.5px;
  font-weight: 400;
  color: var(--text-secondary, #6b7684);
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ActionButton = styled.button`
  flex-shrink: 0;
  background: var(--bg-brand-subtle, #eff6ff);
  color: var(--text-brand, #0061ff);
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(0, 97, 255, 0.12);
  }

  &:active {
    background: rgba(0, 97, 255, 0.18);
    transform: scale(0.96);
  }
`;
