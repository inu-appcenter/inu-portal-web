import styled from "styled-components";

export const AppContainer = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100dvh;
  background: linear-gradient(
    163.11deg,
    rgb(240, 240, 255) 10.193%,
    rgb(253, 253, 255) 111.84%
  );
  font-family:
    "Pretendard",
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    Roboto,
    sans-serif;
`;

export const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${(props) => (props.$isOpen ? "block" : "none")};
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 40;
  }
`;

export const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

export const AmbientOrb = styled.img`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 30%);
  width: 512px;
  max-width: 120vw;
  height: auto;
  aspect-ratio: 512 / 549.5;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
`;

export const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-anchor: none;
  scrollbar-gutter: stable;
  padding: 10px 20px 100px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;

  will-change: scroll-position;
  transform: translateZ(0);
  overscroll-behavior-y: contain;

  scrollbar-width: auto;
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;

  &::-webkit-scrollbar {
    width: 14px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.25);
    border-radius: 9999px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.45);
    background-clip: content-box;
  }
`;
