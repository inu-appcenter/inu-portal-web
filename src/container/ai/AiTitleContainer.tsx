// AiTitleContainer.tsx
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

export default function AiTitleContainer() {
  const navigate = useNavigate();
  return (
    <AiTitleWrapper>
      <div>
        <AiTitle1>Hello, </AiTitle1>
        <AiTitle2>AI 횃불이</AiTitle2>
      </div>
      <AiTitleLogo
        onClick={() => {
          navigate("/");
        }}
      >
        INTIP
      </AiTitleLogo>
    </AiTitleWrapper>
  );
}

const AiTitleWrapper = styled.div`
  padding: 30px;
  padding-bottom: 0;
  max-width: 100vw;
  height: fit-content;
  font-size: 60px;
  font-weight: 800;
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

const AiTitleLogo = styled.div`
  position: absolute;
  top: 5px;
  font-weight: 300;
  z-index: 1000;
  font-size: 20px;
  color: #ffffff;
  cursor: pointer;
`;
