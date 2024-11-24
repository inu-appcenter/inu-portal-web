import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";

export default function AiTitleContainer() {
  const navigate = useNavigate();
  const location = useLocation();

  const isGalleryPage = location.pathname === "/ai/gallery";

  return (
    <AiTitleWrapper>
      {/* 768px 이상 화면에서만 보이는 버튼 */}
      <DesktopButton onClick={() => navigate(isGalleryPage ? "/ai" : "/")}>
        {isGalleryPage ? "⬅ 생성하러 가기" : "⬅ INTIP으로 돌아가기"}
      </DesktopButton>

      {/* 768px 이하 화면에서만 보이는 버튼 */}
      <MobileButton onClick={() => navigate(isGalleryPage ? "/ai" : "/m/home")}>
        {isGalleryPage ? "⬅ 생성하러 가기" : "⬅ INTIP 모바일로 돌아가기"}
      </MobileButton>

      <div>
        <AiTitle1>Hello, </AiTitle1>
        <AiTitle2>AI 횃불이</AiTitle2>
      </div>
    </AiTitleWrapper>
  );
}

const AiTitleWrapper = styled.div`
  padding: 0 32px 0 32px;
  max-width: 100vw;
  height: fit-content;
  font-size: 60px;
  font-weight: 800;

  div {
    @media (max-width: 500px) {
      display: flex;
      flex-direction: column;
    }
  }
`;

// 768px 이상에서 보이는 버튼
const DesktopButton = styled.button`
  color: white;
  border: none;
  background-color: transparent;
  font-size: 16px;
  padding: 0;
  cursor: pointer;

  @media (max-width: 768px) {
    display: none;
  }
`;

// 768px 이하에서 보이는 버튼
const MobileButton = styled.button`
  color: white;
  border: none;
  background-color: transparent;
  font-size: 16px;
  padding: 0;
  cursor: pointer;

  @media (min-width: 769px) {
    display: none;
  }
`;

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
