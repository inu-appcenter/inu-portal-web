import styled from "styled-components";

export default function Empty() {
  return (
    <EmptyWrapper>
      <p>피드가 텅 비었어요 !</p>
    </EmptyWrapper>
  );
}

const EmptyWrapper = styled.div`
  display: flex;
  height: 60vh;
  align-items: center;
  justify-content: center;
  p {
    font-family: Roboto;
    font-size: 14px;
    font-weight: 400;
    color: #999898;
  }
`;
