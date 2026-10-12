import styled from "styled-components";

export default function AiTitle() {
  return (
    <AiTitleWrapper>
      {/*<div className="buttons">*/}
      {/*  /!* <button onClick={() => navigate(isGalleryPage ? ROUTES.AI : ROUTES.ROOT)}>*/}
      {/*    {isGalleryPage ? "⬅ 생성하러 가기" : "⬅ INTIP 으로 돌아가기"}*/}
      {/*  </button> *!/*/}

      {/*  <button onClick={() => mobileNavigate(ROUTES.HOME)}>*/}
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
    color: var(--text-inverse);
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
  color: var(--text-inverse); /* 기본 텍스트 색상 */
`;

const AiTitle2 = styled.span`
  background: linear-gradient(
    270deg,
    rgb(255, 229, 174) 24.95%,
    rgb(254, 210, 167) 30.62%,
    rgb(253, 193, 161) 38.27%,
    rgb(251, 146, 145) 47.42%,
    rgb(209, 146, 192) 54.6%,
    rgb(152, 146, 255) 63.63%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;
