import styled, { css } from "styled-components";
import Badge from "@/components/common/Badge";
import Skeleton from "@/components/common/Skeleton";
import { Eye } from "lucide-react";
import Ripple from "@/components/common/Ripple";

interface NoticeItemProps {
  category?: string;
  title?: string;
  content?: string;
  date?: string;
  writer?: string;
  views?: number;
  isLoading?: boolean;
  onClick?: () => void;
  /** 말줄임 여부 설정 (기본값: true) */
  isEllipsis?: boolean;
  showDate?: boolean;
  showWriter?: boolean;
}

const PostItem = ({
  category,
  title,
  content,
  date,
  writer,
  views,
  isLoading,
  onClick,
  isEllipsis = true,
  showDate = true,
  showWriter = true,
}: NoticeItemProps) => {
  const hasInfoLine =
    (showDate && !!date) || (showWriter && !!writer) || views !== undefined;

  if (isLoading) {
    return (
      <NoticeItemWrapper $interactive={false}>
        {/* 카테고리 스켈레톤 */}
        <Skeleton width={60} height={18} />
        {/* 제목 스켈레톤 */}
        <Skeleton width="100%" height={20} />
        {/* 내용 스켈레톤 */}
        <Skeleton width="100%" height={16} />
        <InfoLine>
          <div style={{ display: "flex", gap: "8px" }}>
            {/* 날짜 스켈레톤 */}
            <Skeleton width={80} height={14} />
          </div>
          {/* 작성자 뱃지 스켈레톤 */}
          <Skeleton width={50} height={14} />
        </InfoLine>
      </NoticeItemWrapper>
    );
  }

  return (
    <NoticeItemWrapper onClick={onClick} $interactive={!!onClick}>
      {category && <Category>{category}</Category>}
      <Title isEllipsis={isEllipsis}>{title || ""}</Title>
      {content && <ContentLine isEllipsis={isEllipsis}>{content}</ContentLine>}
      {hasInfoLine && (
        <InfoLine>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {showDate && date && <div className="date">{date}</div>}
            {showWriter && writer && <Badge text={writer} />}
          </div>
          {views !== undefined && (
            <ViewCount>
              <Eye size={14} />
              {views}
            </ViewCount>
          )}
        </InfoLine>
      )}
      {onClick && <Ripple color="#F3F4F7" />}
    </NoticeItemWrapper>
  );
};

export default PostItem;

const NoticeItemWrapper = styled.div<{ $interactive?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;

  ${({ $interactive }) =>
    $interactive
      ? css`
          padding: 12px;
          margin: 2px -12px;
          width: calc(100% + 24px);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          cursor: pointer;

          &.active-touch {
            > *:not(.ripple-container) {
              transform: scale(0.97);
            }
          }

          > *:not(.ripple-container) {
            transition: transform 0.12s ease-in-out;
          }
        `
      : css`
          padding: 0;
          margin: 0;
          width: 100%;
          border-radius: 0;
        `}
`;

const Category = styled.div`
  color: #0e4d9d;
  font-size: 14px;
  font-weight: 700;
`;

const Title = styled.div<{ isEllipsis: boolean }>`
  color: #000;
  font-size: 14px;
  font-weight: 400;
  align-self: stretch;

  ${({ isEllipsis }) =>
    isEllipsis &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`;

const ContentLine = styled.div<{ isEllipsis: boolean }>`
  color: #666;
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;

  ${({ isEllipsis }) =>
    isEllipsis &&
    css`
      display: -webkit-box;
      -webkit-line-clamp: 2; /* 두 줄 제한 */
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`;

const InfoLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .date {
    color: #969696;
    font-size: 12px;
    font-weight: 400;
  }
`;

const ViewCount = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #969696;
  font-size: 12px;
  font-weight: 400;
`;
