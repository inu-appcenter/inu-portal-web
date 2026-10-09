import styled from "styled-components";
import { Sparkles } from "lucide-react";
import { torchAiLogo as TorchAiLogo } from "@/resources/assets/illustrations/ai";
import { createPortal } from "react-dom";

interface AIChatMenuCardProps {
  open: boolean;
  onScrimClick: () => void;
  onSelectAgent: () => void;
  onSelectLegacyChatBul: () => void;
}

export default function AIChatMenuCard({
  open,
  onScrimClick,
  onSelectAgent,
  onSelectLegacyChatBul,
}: AIChatMenuCardProps) {
  const handleScrimDismiss = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onScrimClick();
  };

  return (
    <>
      {open &&
        createPortal(
          <Scrim
            onClick={handleScrimDismiss}
            onTouchEnd={handleScrimDismiss}
          />,
          document.body
        )}
      <MenuCard $open={open}>
        <MenuRow type="button" onClick={onSelectAgent}>
          <IconCircle $bg="var(--blue-50)">
            <Sparkles size={18} color="var(--blue-600)" />
          </IconCircle>
          <TextGroup>
            <TitleRow>
              <MainTitle>챗불이 에이전트</MainTitle>
              <Badge>NEW</Badge>
            </TitleRow>
            <SubTitle>학식 · 버스 · 시간표 · 공지 통합 에이전트</SubTitle>
          </TextGroup>
        </MenuRow>

        <Divider />

        <MenuRow type="button" onClick={onSelectLegacyChatBul}>
          <IconCircle $bg="var(--bg-warn)">
            <img src={TorchAiLogo} alt="챗불이" width={20} height={20} />
          </IconCircle>
          <TextGroup>
            <TitleRow>
              <MainTitle>학사 챗봇 챗불이</MainTitle>
            </TitleRow>
            <SubTitle>기존 학사 일정 · 대학 규정 챗봇</SubTitle>
          </TextGroup>
        </MenuRow>
      </MenuCard>
    </>
  );
}

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background: transparent;
  cursor: default;
  -webkit-tap-highlight-color: transparent;
`;

const MenuCard = styled.div<{ $open: boolean }>`
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  display: flex;
  flex-direction: column;
  width: 250px;
  padding: 8px;
  background-color: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 20px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.15);
  transform-origin: bottom right;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: ${({ $open }) =>
    $open ? "scale(1) translateY(0)" : "scale(0.92) translateY(8px)"};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition:
    transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.15s ease;
  z-index: 1002;
`;

const MenuRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 8px;
  border: none;
  background: none;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  outline: none;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--bg-subtle);
  }

  &:active {
    background-color: var(--bg-muted);
  }
`;

const IconCircle = styled.div<{ $bg: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    object-fit: contain;
  }
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MainTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.2px;
`;

const Badge = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: var(--text-brand);
  background-color: var(--bg-brand);
  border: 1px solid var(--border-brand-subtle);
  padding: 1px 5px;
  border-radius: 6px;
  line-height: 1.2;
`;

const SubTitle = styled.span`
  font-size: 11px;
  color: var(--text-tertiary);
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Divider = styled.div`
  height: 1px;
  background-color: var(--bg-muted);
  margin: 4px 6px;
`;
