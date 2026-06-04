import { useLayoutEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes.ts";

export default function MobileSugangSimulatorPage() {
  const [isLoading, setIsLoading] = useState(true);

  useHeader({
    title: "모의 수강 신청",
    hasback: true,
    pageBgColor: "#ffffff",
    backPath: ROUTES.TIMETABLE.ROOT,
  });

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousStyles = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
    };

    html.style.overflow = "hidden";
    html.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.height = "100%";

    return () => {
      html.style.overflow = previousStyles.htmlOverflow;
      html.style.height = previousStyles.htmlHeight;
      body.style.overflow = previousStyles.bodyOverflow;
      body.style.height = previousStyles.bodyHeight;
    };
  }, []);

  return (
    <PageWrapper>
      {isLoading && (
        <LoadingOverlay>
          <Spinner />
          <LoadingText>시뮬레이터를 불러오는 중입니다...</LoadingText>
        </LoadingOverlay>
      )}
      <StyledIframe
        src="https://inu-sugang-simulator.pages.dev"
        title="모의 수강 신청 시뮬레이터"
        allow="fullscreen"
        onLoad={() => setIsLoading(false)}
      />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 100%;
  height: calc(100dvh - var(--header-height, 56px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #ffffff;
  position: relative;
`;

const StyledIframe = styled.iframe`
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  z-index: 10;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid var(--gray-100, #f1f3f5);
  border-top: 4px solid var(--blue-600, #0061ff);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: 16px;
  font-size: 15px;
  color: var(--text-secondary, #333d4b);
  font-weight: 500;
`;
