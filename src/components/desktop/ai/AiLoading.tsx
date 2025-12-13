import loading from "@/resources/assets/ai/loading.svg";
import styled from "styled-components";
import randomImg1 from "@/resources/assets/ai/횃불-random1.svg";
import randomImg2 from "@/resources/assets/ai/횃불-random2.svg";
import randomImg3 from "@/resources/assets/ai/횃불-random3.svg";

export default function AiLoading() {
  return (
    <AiLoadingWrapper>
      <div className="ai-random-img">
        <img src={randomImg2} alt="" className="side" />
        <img src={randomImg1} alt="" />
        <img src={randomImg3} alt="" className="side" />
      </div>
      <img className="spinner" src={loading} />
      <div className="loading-title">AI 그림 생성중 ···</div>
    </AiLoadingWrapper>
  );
}

const AiLoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  .ai-random-img {
    gap: 48px;
    display: flex;
    @media (max-width: 1024px) {
      .side {
        display: none;
      }
    }

    @media (max-width: 768px) {
      img {
        width: 280px;
      }
    }
  }

  .spinner {
    display: flex;
    justify-content: center;
  }

  .loading-title {
    width: 200px;
    height: 48px;
    border-radius: 16px;
    border: 1px solid #ffffff;
    font-size: 22px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
  }
`;
