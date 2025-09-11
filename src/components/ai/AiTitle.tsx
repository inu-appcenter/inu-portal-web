import styled from "styled-components";

export default function AiTitle() {
  return (
    <AiTitleWrapper>
      {/*<div className="buttons">*/}
      {/*  /!* <button onClick={() => navigate(isGalleryPage ? "/ai" : "/")}>*/}
      {/*    {isGalleryPage ? "⬅ 생성하러 가기" : "⬅ INTIP 으로 돌아가기"}*/}
      {/*  </button> *!/*/}

      {/*  <button onClick={() => mobileNavigate("/home")}>*/}
      {/*    ⬅ INTIP 모바일로 돌아가기*/}
      {/*  </button>*/}
      {/*</div>*/}

      <div className="title">
        <AiTitle1>Hello, </AiTitle1>
        <AiTitle2>AI 횃불이</AiTitle2>
      </div>
    </AiTitleWrapper>
  );
}

const AiTitleWrapper = styled.div`
  font-size: 72px;
  font-weight: 800;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;

  .buttons {
    display: flex;
    gap: 32px;
  }
  .title {
    @media (max-width: 768px) {
      font-size: 36px;
    }
  }
  button {
    color: white;
    border: none;
    background-color: transparent;
    font-size: 18px;
    padding: 0;
  }
`;

// // 1440px 이상에서 보이는 버튼
// const DesktopButton = styled.button`
//   @media (max-width: 1440px) {
//     display: none;
//   }
// `;

// // 1440px 이하에서 보이는 버튼
// const MobileButton = styled.button`
//   @media (min-width: 1440px) {
//     display: none;
//   }
// `;

const AiTitle1 = styled.span`
  color: white; /* 기본 텍스트 색상 */
`;

const AiTitle2 = styled.span`
  background: linear-gradient(
    270deg,
    #ffe5ae 24.95%,
    #fed2a7 30.62%,
    #fdc1a1 38.27%,
    #fb9291 47.42%,
    #d192c0 54.6%,
    #9892ff 63.63%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;
