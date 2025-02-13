import styled from "styled-components";
import aienterimg1 from "resources/assets/ai/횃불-ai-enter-1.svg";
import aienterimg2 from "resources/assets/ai/횃불-ai-enter-2.svg";
import useMobileNavigate from "hooks/useMobileNavigate";
import { ReactSVG } from "react-svg";

export default function AiForm() {
  const mobileNavigate = useMobileNavigate();
  const handleAiBtnClick = () => {
    mobileNavigate(`/ai`);
  };
  return (
    <AiEnterWrapper>
      <AiEnter onClick={handleAiBtnClick}>
        <div className="enter-frame">
          <ReactSVG src={aienterimg1} />
          <div className="enter-title">
            횃불이 AI 생성 ✨ 지금 바로 만들러 가기
          </div>
          <ReactSVG src={aienterimg2} />
        </div>
      </AiEnter>
    </AiEnterWrapper>
  );
}

const AiEnterWrapper = styled.div`
  margin-top: 40px;
  background: linear-gradient(90deg, #6f84e2 0%, #7babe5 100%);
  border-radius: 10px;
  padding: 3px 3px;
`;

const AiEnter = styled.div`
  box-sizing: border-box;
  border: 1px solid #ffffff;
  padding: 4px;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  .enter-frame {
    justify-content: center;
    align-items: center;
    display: flex;
    border-radius: 10px;
    gap: 12px;
  }

  .enter-title {
    font-size: 13px;
    font-weight: 500;
    color: white;
  }
`;
