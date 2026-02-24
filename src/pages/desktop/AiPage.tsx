// AiPage.tsx
import AiGenerate from "@/components/desktop/ai/AiGenerate";
import AiTitle from "@/components/desktop/ai/AiTitle";
// import AiIntroText from "@/components/ai/AiIntroText";
import HowToUse from "@/components/desktop/ai/HowToUse";
import styled from "styled-components";
import { useState } from "react";
import X_Vector from "@/resources/assets/mobile-mypage/X-Vector.svg";
import TitleContentArea from "../../components/desktop/common/TitleContentArea.tsx";
import { useHeader } from "@/context/HeaderContext";

export default function AiPage() {
  const [show, setShow] = useState(false);

  // 헤더 설정 주입
  useHeader({
    title: "AI 횃불이",
  });

  return (
    <AiPageWrapper>
      <AiContents>
        <AiTitle />
        <TitleContentArea
          title={"AI 횃불이란?"}
          description={
            "AI 횃불이는 사용자가 원하는 모습의 횃불이 이미지를 만들 수 있는 서비스입니다."
          }
          children={
            <Info onClick={() => setShow(true)}>사용 방법 알아보기</Info>
          }
        />
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
  width: 100%;
  //margin: auto;
  padding: 0px 16px;
  box-sizing: border-box;

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
  //margin: 32px 16px;
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 16px;

  h2 {
    color: white;
  }
`;

const Info = styled.div`
  width: 60%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6d4dc7;
  color: white;
  font-weight: 600;
  font-size: 16px;
  border-radius: 25px / 50%; // 양쪽 끝만 둥글게
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #5060b0, #a57fd9);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
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
