import styled from "styled-components";
import AiContainer from "../container/ai/AiContainer";
import Header from "../container/common/HeaderContainer";

export default function AiPage() {
  return (
    <>
      <StyledHeader>
        <Header />
      </StyledHeader>
      <AiWrapper>
        <AiContainer />
      </AiWrapper>
    </>
  );
}

const StyledHeader = styled.header`
  @media (max-width: 768px) {
    display: none;
  }
`;

const AiWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
