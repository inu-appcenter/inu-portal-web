import styled from "styled-components";
import TitleLine from "./TitleLine.tsx";

interface TitleContentAreaProps {
  title: string; // 공지사항, 기숙사 꿀팁 등
  link?: string;
  description?: string;
  children: React.ReactNode;
}

const TitleContentArea = ({
  title,
  link,
  description,
  children,
}: TitleContentAreaProps) => {
  return (
    <TitleContentAreaWrapper>
      <TitleLine title={title} link={link} />
      {description && <DescriptionText>{description}</DescriptionText>}
      {children}
    </TitleContentAreaWrapper>
  );
};

export default TitleContentArea;

const TitleContentAreaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: fit-content;

  gap: 8px;
`;

const DescriptionText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 8px;
  text-align: start;
  width: 100%;
`;
