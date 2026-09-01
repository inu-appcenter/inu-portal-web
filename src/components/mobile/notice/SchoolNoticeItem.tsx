import styled, { css } from "styled-components";
import Skeleton from "@/components/common/Skeleton";
import Ripple from "@/components/common/Ripple";

interface SchoolNoticeItemProps {
  category?: string;
  title?: string;
  date?: string;
  writer?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export const SchoolNoticeItem = ({
  category,
  title,
  date,
  writer,
  onClick,
  isLoading,
}: SchoolNoticeItemProps) => {
  if (isLoading) {
    return (
      <ItemContainer $interactive={false}>
        <InnerContent>
          <Skeleton width={70} height={24} style={{ borderRadius: 999 }} />
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
        {category && (
          <CategoryBadge>
            <CategoryText>{category}</CategoryText>
          </CategoryBadge>
        )}
        <Title>{title || ""}</Title>
        <MetaRow>
          <MetaText>{date || ""}</MetaText>
          {writer && (
            <>
              <DividerPipe>|</DividerPipe>
              <MetaText>{writer}</MetaText>
            </>
          )}
        </MetaRow>
      </InnerContent>
    </ItemContainer>
  );
};

export default SchoolNoticeItem;

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

const CategoryBadge = styled.div`
  background: var(--bg-brand, #eff6ff);
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  border-radius: 999px;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CategoryText = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: var(--text-brand, #0061ff);
  white-space: nowrap;
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

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
`;

const MetaText = styled.span`
  color: var(--text-tertiary, #8b95a1);
  white-space: nowrap;
`;

const DividerPipe = styled.span`
  color: var(--border-default, #e5e8eb);
`;
