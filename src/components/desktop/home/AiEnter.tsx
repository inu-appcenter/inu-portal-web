import styled from "styled-components";
import aiEnter1 from "@/resources/assets/ai/횃불-ai-enter-1.svg";
import aiEnter2 from "@/resources/assets/ai/횃불-ai-enter-2.svg";

export default function AiEnter() {
  const handleAiBtnClick = () => {
    window.open(`/ai`);
  };

  return (
    <StyledAiEnter onClick={handleAiBtnClick}>
      <div className="enter-frame">
        <img src={aiEnter1} alt="" />
        <div>횃불이 AI 생성 ✨ 지금 바로 만들러 가기</div>
        <img src={aiEnter2} alt="" />
      </div>
    </StyledAiEnter>
  );
}

const StyledAiEnter = styled.button`
  padding: 0;
  height: 52px;
  background: linear-gradient(90deg, #6f84e2 0%, #7babe5 100%);
  border-radius: 12px;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;

  .enter-frame {
    justify-content: center;
    align-items: center;
    border: 1px solid #ffffff;

    display: flex;
    gap: 12px;
    width: calc(100% - 8px);
    height: calc(100% - 8px);
    border-radius: 12px;

    color: white;
    font-size: 14px;
    font-weight: 600;
  }
`;
