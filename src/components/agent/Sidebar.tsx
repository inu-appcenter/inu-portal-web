import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  PanelLeftClose,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export interface ChatRoomData {
  id: string;
  title: string;
  createdAt: number;
}

const SidebarContainer = styled.aside<{ $isOpen: boolean }>`
  width: 270px;
  flex-shrink: 0;
  background-color: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 16px 10px;
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 50;

  ${(props) =>
    !props.$isOpen &&
    `
    margin-left: -270px;
    opacity: 0;
    pointer-events: none;
  `}

  @media (max-width: 768px) {
    position: absolute;
    height: 100%;
    margin-left: 0;
    opacity: 1;
    pointer-events: auto;
    transform: translateX(${(props) => (props.$isOpen ? "0" : "-100%")});
    box-shadow: 4px 0 16px rgba(0, 0, 0, 0.08);
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 14px;
  padding: 0 4px;
`;

const BrandName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`;

const NewChatButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  background-color: #0958d9;
  color: #ffffff;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(9, 88, 217, 0.25);
  transition: all 0.2s ease;

  &:hover {
    background-color: #003eb3;
  }
`;

const RoomListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  padding: 4px 8px 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RoomItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${(props) => (props.$isActive ? "#f0f7ff" : "transparent")};
  color: ${(props) => (props.$isActive ? "#0958d9" : "#334155")};
  font-weight: ${(props) => (props.$isActive ? "600" : "500")};
  font-size: 13px;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${(props) => (props.$isActive ? "#f0f7ff" : "#f8fafc")};
    color: ${(props) => (props.$isActive ? "#0958d9" : "#0f172a")};
  }
`;

const RoomTitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: 1;
`;

const RoomActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const SmallIconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #94a3b8;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #0f172a;
    background: #e2e8f0;
  }
`;

const EditInput = styled.input`
  font-size: 13px;
  border: 1px solid #0958d9;
  border-radius: 4px;
  padding: 2px 6px;
  outline: none;
  width: 100%;
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;

  &:hover {
    color: #ef4444;
    background: #fef2f2;
  }
`;

interface SidebarProps {
  isOpen: boolean;
  rooms: ChatRoomData[];
  currentRoomId: string;
  onSelectRoom: (id: string) => void;
  onNewChat: () => void;
  onDeleteRoom: (id: string) => void;
  onUpdateRoomTitle: (id: string, title: string) => void;
  onClearHistory: () => void;
  onToggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  rooms,
  currentRoomId,
  onSelectRoom,
  onNewChat,
  onDeleteRoom,
  onUpdateRoomTitle,
  onClearHistory,
  onToggleSidebar,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleStartEdit = (e: React.MouseEvent, room: ChatRoomData) => {
    e.stopPropagation();
    setEditingId(room.id);
    setEditTitle(room.title);
  };

  const handleSaveEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onUpdateRoomTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <SidebarContainer $isOpen={isOpen}>
      <SidebarHeader>
        <BrandName>
          <Sparkles size={16} color="#0958d9" />
          대화 목록
        </BrandName>
        <CollapseButton onClick={onToggleSidebar} title="사이드바 닫기">
          <PanelLeftClose size={18} />
        </CollapseButton>
      </SidebarHeader>

      <NewChatButton onClick={onNewChat}>
        <Plus size={16} /> 새로운 대화 시작
      </NewChatButton>

      <SectionTitle>최근 대화</SectionTitle>
      <RoomListContainer>
        {rooms.length === 0 ? (
          <div style={{ padding: "12px 8px", fontSize: "12px", color: "#94a3b8" }}>
            진행 중인 대화가 없습니다.
          </div>
        ) : (
          rooms.map((room) => {
            const isEditing = editingId === room.id;
            const isActive = currentRoomId === room.id;

            return (
              <RoomItem
                key={room.id}
                $isActive={isActive}
                onClick={() => onSelectRoom(room.id)}
              >
                {isEditing ? (
                  <div
                    style={{ display: "flex", gap: "4px", width: "100%" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EditInput
                      ref={inputRef}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(e as any, room.id);
                        if (e.key === "Escape") handleCancelEdit(e as any);
                      }}
                    />
                    <SmallIconButton onClick={(e) => handleSaveEdit(e, room.id)}>
                      <Check size={14} color="#10b981" />
                    </SmallIconButton>
                    <SmallIconButton onClick={handleCancelEdit}>
                      <X size={14} color="#ef4444" />
                    </SmallIconButton>
                  </div>
                ) : (
                  <>
                    <RoomTitleArea>
                      <MessageSquare size={14} />
                      <span>{room.title || "새로운 대화"}</span>
                    </RoomTitleArea>
                    <RoomActions>
                      <SmallIconButton onClick={(e) => handleStartEdit(e, room)} title="제목 수정">
                        <Edit2 size={12} />
                      </SmallIconButton>
                      <SmallIconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("이 대화를 삭제할까요?")) {
                            onDeleteRoom(room.id);
                          }
                        }}
                        title="삭제"
                      >
                        <Trash2 size={12} />
                      </SmallIconButton>
                    </RoomActions>
                  </>
                )}
              </RoomItem>
            );
          })
        )}
      </RoomListContainer>

      {rooms.length > 0 && (
        <SidebarFooter>
          <ClearButton onClick={onClearHistory}>
            <Trash2 size={14} /> 전체 대화 기록 지우기
          </ClearButton>
        </SidebarFooter>
      )}
    </SidebarContainer>
  );
};
