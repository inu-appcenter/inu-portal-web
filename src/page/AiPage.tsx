import styled from "styled-components";
import AiContainer from "../container/ai/AiContainer";
import Header from "../container/common/HeaderContainer";

export default function AiPage() {
  return (
    <>
      <header>
        <Header />
      </header>
      <AiWrapper>
        <AiContainer />
      </AiWrapper>
    </>
  );
}

const AiWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
