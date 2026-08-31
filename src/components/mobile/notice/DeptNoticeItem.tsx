import styled, { css } from "styled-components";
import Skeleton from "@/components/common/Skeleton";
import { Eye } from "lucide-react";
import { torchAiLogo as TorchAiLogo } from "@/resources/assets/illustrations/ai";
import Ripple from "@/components/common/Ripple";

interface DeptNoticeItemProps {
  title?: string;
  date?: string;
  views?: number;
  hasSchedules?: boolean;
  onCalendarClick?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  isLoading?: boolean;
}

export const DeptNoticeItem = ({
  title,
  date,
  views,
  hasSchedules,
  onCalendarClick,
  onClick,
  isLoading,
}: DeptNoticeItemProps) => {
  if (isLoading) {
    return (
      <ItemContainer $interactive={false}>
        <InnerContent>
          <Skeleton width="90%" height={24} />
          <Skeleton width="40%" height={18} />
        </InnerContent>
      </ItemContainer>
    );
  }

  return (
    <ItemContainer onClick={onClick} $interactive={!!onClick}>
      {onClick && <Ripple />}
      <InnerContent>
        <Title>{title || ""}</Title>
        <BottomRow>
          <InfoRow>
            <MetaText>{date || ""}</MetaText>
            {views !== undefined && (
              <>
                <DividerPipe>|</DividerPipe>
                <ViewCountWrapper>
                  <Eye size={14} color="var(--text-tertiary, #8b95a1)" />
                  <MetaText>{views}</MetaText>
                </ViewCountWrapper>
              </>
            )}
          </InfoRow>

          {hasSchedules && (
            <AiCalendarButton
              type="button"
              data-no-ripple="true"
              onClick={(e) => {
                e.stopPropagation();
                onCalendarClick?.(e);
              }}
            >
              <AiLogoWrapper>
                <img src={TorchAiLogo} alt="횃불이 AI" width={24} height={24} />
              </AiLogoWrapper>
              <AiCalendarButtonText>횃불이 AI 캘린더</AiCalendarButtonText>
            </AiCalendarButton>
          )}
        </BottomRow>
      </InnerContent>
    </ItemContainer>
  );
};

export default DeptNoticeItem;

const InnerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
  transition: transform 0.12s ease-in-out;
`;

const ItemContainer = styled.div<{ $interactive?: boolean }>`
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  display: flex;
  flex-direction: column;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  background: transparent;

  ${({ $interactive }) =>
    $interactive
      ? css`
          cursor: pointer;

          &.active-touch {
            ${InnerContent} {
              transform: scale(0.97);
            }
          }
        `
      : css``}
`;

const Title = styled.h3`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: var(--text-primary, #191f28);
  margin: 0;
  word-break: break-word;
  width: 100%;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  white-space: nowrap;
`;

const MetaText = styled.span`
  color: var(--text-tertiary, #8b95a1);
`;

const DividerPipe = styled.span`
  color: var(--border-default, #e5e8eb);
`;

const ViewCountWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AiCalendarButton = styled.button`
  pointer-events: auto;
  position: relative;
  z-index: 2;
  background: linear-gradient(107.78deg, rgb(230, 241, 255) 0%, rgb(235, 235, 255) 100%);
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  border-radius: 999px;
  padding: 2px 8px 2px 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.96);
  }
`;

const AiLogoWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AiCalendarButtonText = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: var(--text-brand, #0061ff);
  white-space: nowrap;
`;
