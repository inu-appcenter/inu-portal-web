// AiPage.tsx
import Header from "components/common/Header";
import AiGenerate from "components/ai/AiGenerate";
import AiTitle from "components/ai/AiTitle";
// import AiIntroText from "components/ai/AiIntroText";
import HowToUse from "components/ai/HowToUse";
import styled from "styled-components";
import { useState } from "react";
import X_Vector from "resources/assets/mobile-mypage/X-Vector.svg";

export default function AiPage() {
  const [show, setShow] = useState(false);

  return (
    <AiPageWrapper>
      <div className="header-wrapper">
        <Header />
      </div>
      <AiContents>
        <AiTitle />
        <Info onClick={() => setShow(true)}>AI 횃불이 ❓</Info>
        {show && (
          <ModalBackGround>
            <Modal>
              <div className="close" onClick={() => setShow(false)}>
                <span>닫기</span>
                <img src={X_Vector} alt="X" />
              </div>
              {/* <AiIntroText /> */}
              <HowToUse />
            </Modal>
          </ModalBackGround>
        )}
        <AiGenerate />
        <h2>made by dnltjdwls1@naver.com</h2>
      </AiContents>
    </AiPageWrapper>
  );
}

const AiPageWrapper = styled.div`
  max-width: 1440px;

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

const Info = styled.div`
  width: 60%;
  background-color: rgba(255, 255, 255, 0.5);
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBackGround = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  inset: 0 0 0 0;
  z-index: 9999;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;
  background: linear-gradient(90deg, #6084d7 0%, #c294eb 100%);
  padding: 32px 12px;
  border-radius: 16px;
  width: 95%;
  height: 80%;
  background-color: black;

  .close {
    display: flex;
    gap: 8px;
    background-color: white;
    width: 64px;
    height: 32px;
    border-radius: 6px;
    align-items: center;
    justify-content: center;
  }
`;
