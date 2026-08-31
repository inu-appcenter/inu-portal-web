import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  torchAiEnter1 as aienterimg1,
  torchAiEnter2 as aienterimg2,
} from "@/resources/assets/illustrations/ai";

export default function AiForm() {
  const navigate = useNavigate();
  const handleAiBtnClick = () => {
    navigate(`/ai`);
  };
  return (
    <AiEnterWrapper>
      <AiEnter onClick={handleAiBtnClick}>
        <div className="enter-frame">
          <img src={aienterimg1} alt="" />
          <div className="enter-title">
            횃불이 AI 생성 ✨ 지금 바로 만들러 가기
          </div>
          <img src={aienterimg2} alt="" />
        </div>
      </AiEnter>
    </AiEnterWrapper>
  );
}

const AiEnterWrapper = styled.div`
  //margin-top: 40px;
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
    text-align: center;
  }
`;
