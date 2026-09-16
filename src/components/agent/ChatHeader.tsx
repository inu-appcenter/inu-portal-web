import React from "react";
import styled from "styled-components";
import { Menu, PanelLeftClose, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "./colors";

const HeaderContainer = styled.div`
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: transparent;
  color: ${COLORS.textDark};
  z-index: 10;
  position: relative;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderTitleContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
  color: ${COLORS.textDark};
  font-family:
    "Pretendard",
    -apple-system,
    sans-serif;
`;

const BetaBadge = styled.span`
  background: linear-gradient(142deg, #007aff 26.94%, #570099 87.68%);
  color: #fafafa;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: ${COLORS.textDark};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NewChatIconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: ${COLORS.textDark};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onNewChat,
}) => {
  const navigate = useNavigate();

  return (
    <HeaderContainer>
      <HeaderLeft>
        <IconButton onClick={() => navigate(-1)} title="뒤로가기">
          <ArrowLeft size={20} />
        </IconButton>
        <IconButton onClick={onToggleSidebar} title="사이드바 토글">
          {isSidebarOpen ? <PanelLeftClose size={20} /> : <Menu size={20} />}
        </IconButton>
        <HeaderTitleContainer>
          <HeaderTitle>
            <span>인팁 비서</span>
            <BetaBadge>AI</BetaBadge>
          </HeaderTitle>
        </HeaderTitleContainer>
      </HeaderLeft>

      <HeaderRight>
        <NewChatIconButton onClick={onNewChat} title="새로운 대화">
          <Plus size={22} />
        </NewChatIconButton>
      </HeaderRight>
    </HeaderContainer>
  );
};
