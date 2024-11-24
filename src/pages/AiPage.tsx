import AiGallery from "components/ai/AiGallery";
import AiIntro from "components/ai/AiIntro";
import AiTitle from "components/ai/AiTitle";
import Header from "components/common/Header";
import { Route, Routes } from "react-router-dom";
import styled from "styled-components";

export default function AiPage() {
  return (
    <AiPageWrapper>
      <Header />
      <AiContents>
        <AiTitle />
        <Routes>
          <Route index element={<AiIntro />} />
          <Route path="gallery" element={<AiGallery />} />
        </Routes>
        <h2>made by dnltjdwls1@naver.com</h2>
      </AiContents>
    </AiPageWrapper>
  );
}

const AiPageWrapper = styled.div`
  max-width: 1440px;
  margin: auto;
`;

const AiContents = styled.div`
  min-height: 75vh;
  background: linear-gradient(90deg, #6084d7 0%, #c294eb 100%);
  border-radius: 12px;
  margin: 32px 16px;
  padding: 64px 32px;
  display: flex;
  flex-direction: column;

  h2 {
    color: white;
  }
`;
