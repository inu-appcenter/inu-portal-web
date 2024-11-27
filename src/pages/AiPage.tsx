// AiPage.tsx
import Header from "components/common/Header";
import AiGenerate from "components/ai/AiGenerate";
import AiTitle from "components/ai/AiTitle";
import AiIntroText from "components/ai/AiIntroText";
import HowToUse from "components/ai/HowToUse";
import styled from "styled-components";

export default function AiPage() {
  return (
    <AiPageWrapper>
      <div className="header-wrapper">
        <Header />
      </div>
      <AiContents>
        <AiTitle />
        <AiIntroText />
        <HowToUse />
        <AiGenerate />
        <h2>made by dnltjdwls1@naver.com</h2>
      </AiContents>
    </AiPageWrapper>
  );
}

const AiPageWrapper = styled.div`
  max-width: 1440px;
  margin: auto;

  .header-wrapper {
    @media (max-width: 425px) {
      display: none;
    }
  }
`;

const AiContents = styled.div`
  min-height: 75vh;
  background: linear-gradient(90deg, #6084d7 0%, #c294eb 100%);
  border-radius: 12px;
  margin: 32px 16px;
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  h2 {
    color: white;
  }
`;
