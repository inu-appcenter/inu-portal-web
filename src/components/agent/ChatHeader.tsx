import React from "react";
import styled from "styled-components";
import { Menu, PanelLeftClose, Plus, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeaderContainer = styled.header`
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid #e2e8f0;
  z-index: 10;
  position: relative;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  transition: all 0.15s ease;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`;

const HeaderTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #0f172a;
`;

const BetaBadge = styled.span`
  background: linear-gradient(135deg, #0958d9 0%, #7c3aed 100%);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  letter-spacing: 0.5px;
`;

const TagBadge = styled.span`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 3px;

  @media (max-width: 640px) {
    display: none;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NewChatButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: #f0f7ff;
  border: 1px solid #bae0ff;
  color: #0958d9;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #0958d9;
    color: #ffffff;
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
      <LeftSection>
        <IconButton onClick={() => navigate(-1)} title="뒤로가기">
          <ArrowLeft size={18} />
        </IconButton>
        <IconButton onClick={onToggleSidebar} title="사이드바 토글">
          {isSidebarOpen ? <PanelLeftClose size={18} /> : <Menu size={18} />}
        </IconButton>
        <HeaderTitle>
          <span>인팁 캠퍼스 비서</span>
          <BetaBadge>AI</BetaBadge>
          <TagBadge>
            <Sparkles size={11} /> inuai 학사 RAG 연동
          </TagBadge>
        </HeaderTitle>
      </LeftSection>

      <RightSection>
        <NewChatButton onClick={onNewChat}>
          <Plus size={15} /> 새 대화
        </NewChatButton>
      </RightSection>
    </HeaderContainer>
  );
};
