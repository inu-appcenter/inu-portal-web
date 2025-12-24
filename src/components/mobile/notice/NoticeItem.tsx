import styled from "styled-components";
import Badge from "@/components/common/Badge";

interface NoticeItemProps {
  category: string;
  title: string;
  date: string;
  writer: string;
}

const NoticeItem = ({ category, title, date, writer }: NoticeItemProps) => {
  return (
    <NoticeItemWrapper>
      <Category>{category}</Category>
      <Title>{title}</Title>
      <InfoLine>
        <div className="date">{date}</div>
        <Badge text={writer} />
      </InfoLine>
    </NoticeItemWrapper>
  );
};

export default NoticeItem;

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
