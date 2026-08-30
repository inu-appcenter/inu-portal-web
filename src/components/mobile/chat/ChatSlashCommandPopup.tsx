import styled from "styled-components";
import TorchAiLogo from "@/resources/assets/ai/횃불이AI로고.svg";

interface ChatSlashCommandPopupProps {
  isOpen: boolean;
  onSelect: () => void;
}

export default function ChatSlashCommandPopup({
  isOpen,
  onSelect,
}: ChatSlashCommandPopupProps) {
  if (!isOpen) return null;

  return (
    <PopupContainer>
      <HeaderTitle>기능 선택</HeaderTitle>
      <CommandItem onClick={onSelect} onMouseDown={(e) => e.preventDefault()}>
        <IconWrapper>
          <img src={TorchAiLogo} alt="챗불이" width={24} height={24} />
        </IconWrapper>
        <CommandInfo>
          <CommandName>/챗불이</CommandName>
          <CommandDesc>대학 생활에 대해 챗불이에게 질문하기</CommandDesc>
        </CommandInfo>
      </CommandItem>
    </PopupContainer>
  );
}

const PopupContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 8px;
  margin-bottom: 10px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 14px 16px;
  z-index: 110;
  width: calc(100% - 16px);
  max-width: 360px;
  box-sizing: border-box;
  animation: popupFadeIn 0.18s ease-out;

  @media (min-width: 768px) {
    left: clamp(24px, 8vw, 120px);
    width: 360px;
  }

  @keyframes popupFadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const HeaderTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #767676;
  margin-bottom: 12px;
  padding-left: 2px;
`;

const CommandItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 2px 2px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f7f9fc;
  }

  &:active {
    background-color: #f0f4f9;
  }
`;

const IconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: #ebf4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    object-fit: contain;
  }
`;

const CommandInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

const CommandName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #1c1c1e;
  line-height: 1.2;
`;

const CommandDesc = styled.span`
  font-size: 13px;
  font-weight: 400;
  color: #767676;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
`;
