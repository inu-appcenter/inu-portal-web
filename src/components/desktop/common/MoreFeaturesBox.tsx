import styled from "styled-components";

interface Props {
  title?: string;
  content?: string;
}
const MoreFeaturesBox = ({ title, content }: Props) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Content>{content}</Content>
    </Container>
  );
};

export default MoreFeaturesBox;

const Container = styled.div`
  background-color: #e2e8f4; /* 연한 회색 배경 */
  border-radius: 20px;
  padding: 20px 24px;
  margin: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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
  white-space: pre-line; /* 엔터 처리 */
`;
