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
        <strong>1. 프롬프트(Prompt) 작성하기</strong>
        <br />
        프롬프트는 <strong>모델에게 생성할 이미지를 설명하는 문장</strong>
        입니다.
        <br />
        <strong>영어로 작성하는 것이 가장 좋으며,</strong> 길고 구체적으로
        쓸수록 좋은 이미지를 얻을 가능성이 높아집니다.
        <br />
        <strong>좋은 프롬프트를 위한 팁:</strong>
        <br />
        <strong>✅ 캐릭터의 행동</strong> – 무엇을 하고 있는지 (예: surfing,
        sleeping)
        <br />
        <strong>✅ 의상 및 외형</strong> – 어떤 옷을 입고 있는지, 헤어스타일은
        어떤지
        <br />
        <strong>✅ 배경 및 분위기</strong> – 어디에서 촬영된 듯한 이미지인지,
        조명이나 시간대는 어떤지
        <br />
        <br />
        <strong>2. 원하는 이미지가 나오지 않는다면?</strong>
        <br />
        <strong>✔ 같은 프롬프트로 여러 번 시도해 보세요!</strong>
        <br />
        AI 모델은 같은 문장을 입력해도 <strong>매번 다른 이미지</strong>를
        생성합니다.
        <br />
        <strong>✔ 프롬프트를 조금 수정해 보세요!</strong>
        <br />
        설명을 더 추가하거나 단어를 구체적으로 바꿔보면 더 좋은 결과를 얻을 수
        있습니다.
      </span>
    </HowToUseWrapper>
  );
}

const HowToUseWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: white;
  overflow-y: auto;

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
