import styled from "styled-components";

interface Props {
  title?: string;
  content?: string;
  style?: React.CSSProperties;
  onClick?: () => void; // 클릭 이벤트 추가
}

const MoreFeaturesBox = ({ title, content, style, onClick }: Props) => {
  return (
    <Container style={style} onClick={onClick} $isClickable={!!onClick}>
      <Title>{title}</Title>
      <Content>{content}</Content>
    </Container>
  );
};

export default MoreFeaturesBox;

const Container = styled.div<{ $isClickable: boolean }>`
  background-color: #e2e8f4;
  border-radius: 20px;
  padding: 20px 24px;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;

  /* 클릭 가능 여부에 따른 스타일 */
  cursor: ${({ $isClickable }) => ($isClickable ? "pointer" : "default")};
  transition: opacity 0.2s ease-in-out;

  &:active {
    opacity: ${({ $isClickable }) => ($isClickable ? 0.7 : 1)};
  }
`;

const Title = styled.p`
  font-size: 17px;
  font-weight: 500;
  color: #242529;
  margin: 0 0 12px 0;
`;

const Content = styled.div`
  color: #3d6fd0;
  font-size: 16px;
  white-space: pre-line;
`;
