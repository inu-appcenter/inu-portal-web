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
            <span style={{fontSize: "20px", lineHeight: "30px"}}>
        <strong>1.</strong> 원하는 행동 또는 상황을 입력해주세요.<br/>예를 들어, "Surfing", "hawaiian
        shirts", "sunset" 등을 입력하세요.<br/>한글로 입력할 경우 자동으로 영어로 번역되어 생성돼요. 한글은 최대 30자까지 입력 가능해요.
        <br/><br/>
                <strong>2.</strong> 'AI 횃불이'는 입력된 내용을 바탕으로 AI로 횃불이 이미지를 생성해요.
        <br/><br/>
        <strong>3.</strong> 생성된 이미지를 즐겨보세요!<br/>필요에 따라 저장하고 공유할 수
        있어요.
        <br/><br/>
                <strong>TIP!!</strong><br/>구체적으로 작성할수록 생성되는 이미지의 품질이 좋아져요.<br/>
                '횃불이' 키워드는 제외하고 입력해 주세요.
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
