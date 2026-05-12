import styled from "styled-components";
import { User, ChevronRight } from "lucide-react";
import {
  normalizeProfileImageId,
  DEFAULT_PROFILE_IMAGE_ID,
} from "@/utils/userInfo";

interface SocialUserCardProps {
  name: string;
  subtitle?: string;
  fireId?: number;
  onActionClick?: () => void;
  onSecondaryActionClick?: () => void;
  actionLabel?: string;
  secondaryActionLabel?: string;
}

export default function SocialUserCard({
  name,
  subtitle,
  fireId,
  onActionClick,
  onSecondaryActionClick,
  actionLabel,
  secondaryActionLabel,
}: SocialUserCardProps) {
  const safeFireId = normalizeProfileImageId(fireId, DEFAULT_PROFILE_IMAGE_ID);

  return (
    <CardWrapper>
      <ProfileArea>
        <ProfileImage
          src={`https://portal.inuappcenter.kr/images/profile/${safeFireId}`}
          alt="Profile"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <DefaultIconArea>
          <User size={24} color="#D6D1D5" />
        </DefaultIconArea>
      </ProfileArea>

      <InfoArea>
        <Name>{name}</Name>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </InfoArea>

      <ActionArea>
        {onSecondaryActionClick && (
          <ActionButton onClick={onSecondaryActionClick} $variant="secondary">
            {secondaryActionLabel || "거절"}
          </ActionButton>
        )}
        {onActionClick && (
          <ActionButton onClick={onActionClick} $variant="primary">
            {actionLabel || "수락"}
          </ActionButton>
        )}
        {!onActionClick && !onSecondaryActionClick && (
          <ChevronRight size={20} color="#D1D1D6" />
        )}
      </ActionArea>
    </CardWrapper>
  );
}

const CardWrapper = styled.div`
  display: flex;
  align-items: center;
  //padding: 14px 0;
  gap: 12px;
  width: 100%;
`;

const ProfileArea = styled.div`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  position: relative;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
  background-color: #f4f4f4;
`;

const DefaultIconArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const InfoArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
`;

const Name = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Subtitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #8e8e93;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ActionArea = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button<{ $variant: "primary" | "secondary" }>`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;

  background-color: ${({ $variant }) =>
    $variant === "primary" ? "#5E92F0" : "#F2F2F7"};
  color: ${({ $variant }) => ($variant === "primary" ? "white" : "#3A3A3C")};

  &:active {
    opacity: 0.7;
  }
`;
