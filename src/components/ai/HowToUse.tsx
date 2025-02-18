// HowToUse.tsx
import styled from "styled-components";
// import AiExample from "resources/assets/ai/ai-example.svg";

export default function HowToUse() {
  return (
    <HowToUseWrapper>
      <div className="title-img">
        <span className="title">HOW TO USE</span>
        {/* <img src={AiExample} alt="" /> */}
      </div>
      <span style={{ fontSize: "20px", lineHeight: "30px" }}>
        1. 원하는 행동 또는 상황을 입력합니다. 예를 들어, "Surfing", "hawaiian
        shirts", "sunset" 등을 입력하세요. 입력은 영어로만 가능합니다.
        <br />
        2. 앱은 입력된 내용을 바탕으로 AI로 캐릭터 이미지를 생성합니다.
        <br />
        3. 생성된 이미지를 즐겨보세요! 필요에 따라 저장하거나 공유할 수
        있습니다.
        <br />
      </span>
    </HowToUseWrapper>
  );
}

const HowToUseWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: white;
  .title-img {
    border-bottom: 2px solid white;
    display: flex;
    justify-content: space-between;
  }
  .title {
    align-self: flex-end;
    font-size: 32px;
    font-weight: 800;
  }
  img {
    @media (max-width: 768px) {
      width: 100px;
    }
  }
`;
