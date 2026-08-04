import { useEffect, useLayoutEffect } from "react";
import { useOutlet, useLocation } from "react-router-dom";
import styled from "styled-components";

interface FullscreenSubLayoutProps {
  backgroundColor?: string;
}

export default function FullscreenSubLayout({
  backgroundColor = "#ffffff",
}: FullscreenSubLayoutProps) {
  const outlet = useOutlet();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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

  return <LayoutContainer $backgroundColor={backgroundColor}>{outlet}</LayoutContainer>;
}

const LayoutContainer = styled.div<{ $backgroundColor: string }>`
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  position: relative;
  background-color: ${(props) => props.$backgroundColor};
`;
