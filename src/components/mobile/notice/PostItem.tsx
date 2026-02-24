import styled, { css } from "styled-components";
import Badge from "@/components/common/Badge";
import Skeleton from "@/components/common/Skeleton";
import { Eye } from "lucide-react";

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
}: NoticeItemProps) => {
  if (isLoading) {
    return (
      <NoticeItemWrapper>
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
    <NoticeItemWrapper onClick={onClick}>
      {category && <Category>{category}</Category>}
      <Title isEllipsis={isEllipsis}>{title || ""}</Title>
      {content && <ContentLine isEllipsis={isEllipsis}>{content}</ContentLine>}
      <InfoLine>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div className="date">{date}</div>
          {writer && <Badge text={writer} />}
        </div>
        {views !== undefined && (
          <ViewCount>
            <Eye size={14} />
            {views}
          </ViewCount>
        )}
      </InfoLine>
    </NoticeItemWrapper>
  );
};

export default PostItem;

const NoticeItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  cursor: pointer;
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
