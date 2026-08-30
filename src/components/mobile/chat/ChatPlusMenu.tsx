import styled from "styled-components";
import { Image } from "lucide-react";
import TorchAiLogo from "@/resources/assets/ai/횃불이AI로고.svg";

interface ChatPlusMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChatbuli: () => void;
  onSelectImage: () => void;
}

export default function ChatPlusMenu({
  isOpen,
  onClose,
  onSelectChatbuli,
  onSelectImage,
}: ChatPlusMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      <MenuBackdrop onClick={onClose} />
      <MenuContainer>
        <MenuItem
          onClick={() => {
            onClose();
            onSelectChatbuli();
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <IconCircle $bg="#FFF4ED">
            <img src={TorchAiLogo} alt="챗불이" width={22} height={22} />
          </IconCircle>
          <ItemLabel>챗불이에게 질문</ItemLabel>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onClose();
            onSelectImage();
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <IconCircle $bg="#F0F4FF">
            <Image size={20} color="#5E92F0" />
          </IconCircle>
          <ItemLabel>사진 보내기</ItemLabel>
        </MenuItem>
      </MenuContainer>
    </>
  );
}

const MenuBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 105;
`;

const MenuContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 16px;
  margin-bottom: 8px;
  background: #ffffff;
  border: 1px solid #eaeef4;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 110;
  min-width: 170px;
  animation: menuFadeIn 0.18s ease-out;

  @media (min-width: 768px) {
    left: clamp(24px, 8vw, 120px);
  }

  @keyframes menuFadeIn {
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

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f7f9fc;
  }

  &:active {
    background-color: #f0f4f9;
  }
`;

const IconCircle = styled.div<{ $bg: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${(props) => props.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    border-radius: 50%;
    object-fit: contain;
  }
`;

const ItemLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #1c1c1e;
`;
