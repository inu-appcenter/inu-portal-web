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
      <CommandItem onClick={onSelect} onMouseDown={(e) => e.preventDefault()}>
        <IconWrapper>
          <img src={TorchAiLogo} alt="챗불이" width={22} height={22} />
        </IconWrapper>
        <CommandInfo>
          <CommandNameWrapper>
            <CommandName>/챗불이</CommandName>
            <CommandBadge>AI 질문</CommandBadge>
          </CommandNameWrapper>
          <CommandDesc>인천대 학사/학교생활 관련 질문을 물어보세요</CommandDesc>
        </CommandInfo>
      </CommandItem>
    </PopupContainer>
  );
}

const PopupContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 16px;
  right: 16px;
  margin-bottom: 8px;
  background: #ffffff;
  border: 1px solid #eaeef4;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 110;
  animation: popupFadeIn 0.18s ease-out;

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

const CommandItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  cursor: pointer;
  background-color: #ffffff;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f7f9fc;
  }

  &:active {
    background-color: #f0f4f9;
  }
`;

const IconWrapper = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: #fff4ed;
  border: 1px solid #ffe5d3;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    border-radius: 50%;
    object-fit: contain;
  }
`;

const CommandInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const CommandNameWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CommandName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #1c1c1e;
`;

const CommandBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #ff6b00;
  background-color: #fff0e6;
  padding: 1px 5px;
  border-radius: 4px;
`;

const CommandDesc = styled.span`
  font-size: 12px;
  color: #8e8e93;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
