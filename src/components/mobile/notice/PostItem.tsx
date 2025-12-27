import styled from "styled-components";
import Badge from "@/components/common/Badge";
import Skeleton from "@/components/common/Skeleton";

interface NoticeItemProps {
  category?: string;
  title?: string;
  content?: string;
  date?: string;
  writer?: string;
  isLoading?: boolean;
}

const PostItem = ({
  category,
  title,
  content,
  date,
  writer,
  isLoading,
}: NoticeItemProps) => {
  if (isLoading) {
    return (
      <NoticeItemWrapper>
        {/* 카테고리 스켈레톤 */}
        <Skeleton width={60} height={18} />
        {/* 제목 스켈레톤 */}
        <Skeleton width="100%" height={20} />
        <InfoLine>
          {/* 날짜 스켈레톤 */}
          <Skeleton width={80} height={14} />
          {/* 작성자 뱃지 스켈레톤 */}
          <Skeleton width={50} height={14} />
        </InfoLine>
      </NoticeItemWrapper>
    );
  }

  return (
    <NoticeItemWrapper>
      {category && <Category>{category}</Category>}
      <Title>{title || ""}</Title>
      <ContentLine>{content}</ContentLine>
      <InfoLine>
        <div className="date">{date}</div>
        {writer && <Badge text={writer} />}
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
`;

const Category = styled.div`
  color: #0e4d9d;
  font-size: 14px;
  font-weight: 700;
`;

const Title = styled.div`
  color: #000;
  font-size: 14px;
  font-weight: 400;
  align-self: stretch;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ContentLine = styled.div``;

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
