import { useState } from "react";
import styled from "styled-components";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getMyChatRooms, createPersonalChatRoom } from "@/apis/chat";
import { getFriends } from "@/apis/friends";
import BottomSheet from "@/components/common/BottomSheet";
import TabUpper from "@/components/common/TabUpper";
import { MessageSquare, Users, Check, Loader2 } from "lucide-react";
import { MyChatRoomResponseDto } from "@/types/chat";

interface ShareTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmShare: (roomId: number) => void;
}

export default function ShareTargetModal({
  isOpen,
  onClose,
  onConfirmShare,
}: ShareTargetModalProps) {
  const [activeTab, setActiveTab] = useState<"rooms" | "friends">("rooms");
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);

  // 1. 참여 중인 채팅방 목록 조회
  const { data: myChatRoomsRes, isLoading: isRoomsLoading } = useQuery({
    queryKey: ["myChatRooms"],
    queryFn: getMyChatRooms,
    enabled: isOpen,
  });
  const myChatRooms = myChatRoomsRes?.data || [];

  // 2. 친구 목록 조회
  const { data: friendsRes, isLoading: isFriendsLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    enabled: isOpen,
  });
  const friends = friendsRes?.data || [];

  // 3. 친구들과 개인/그룹 채팅방 생성 mutation
  const createRoomMutation = useMutation({
    mutationFn: (targetFriendIds: number[]) =>
      createPersonalChatRoom(targetFriendIds),
    onSuccess: (res: any) => {
      const roomData = res.data || res;
      const createdRoomId = roomData.id || roomData.roomId;
      if (createdRoomId) {
        onConfirmShare(createdRoomId);
      }
    },
    onError: (err) => {
      console.error("채팅방 생성 실패:", err);
      alert("채팅방 생성을 완료하지 못했습니다.");
    },
  });

  const handleFriendToggle = (friendId: number) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleConfirm = () => {
    if (activeTab === "rooms") {
      if (!selectedRoomId) {
        alert("공유할 채팅방을 선택해 주세요.");
        return;
      }
      onConfirmShare(selectedRoomId);
    } else {
      if (selectedFriendIds.length === 0) {
        alert("시간표를 함께 비교할 친구를 1명 이상 선택해 주세요.");
        return;
      }
      createRoomMutation.mutate(selectedFriendIds);
    }
  };

  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      snapPoints={[0.85]}
      height="85dvh"
    >
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>시간표 공유할 대상 선택</ModalTitle>
          <TabUpper
            tabs={[
              { id: "rooms", label: "채팅방 목록" },
              { id: "friends", label: "친구 목록" },
            ]}
            activeTabId={activeTab}
            onChange={(id) => setActiveTab(id as "rooms" | "friends")}
          />
        </ModalHeader>

        <ModalBody>
          {activeTab === "rooms" ? (
            isRoomsLoading ? (
              <LoadingArea>
                <Loader2 size={24} color="#3B82F6" className="spin" />
              </LoadingArea>
            ) : myChatRooms.length > 0 ? (
              <ListGroup>
                {myChatRooms.map((room: MyChatRoomResponseDto) => {
                  const isSelected = selectedRoomId === room.roomId;
                  return (
                    <ItemRow
                      key={room.roomId}
                      $isSelected={isSelected}
                      onClick={() => setSelectedRoomId(room.roomId)}
                    >
                      <IconWrapper $isSelected={isSelected}>
                        <MessageSquare size={20} />
                      </IconWrapper>
                      <ItemInfo>
                        <ItemName>{room.friendAlias || room.title}</ItemName>
                        <ItemSubText>
                          참여자 {room.currentParticipants}명
                        </ItemSubText>
                      </ItemInfo>
                      <CheckBadge $isSelected={isSelected}>
                        <Check size={16} color={isSelected ? "#ffffff" : "#9ca3af"} />
                      </CheckBadge>
                    </ItemRow>
                  );
                })}
              </ListGroup>
            ) : (
              <EmptyState>참여 중인 채팅방이 없습니다.</EmptyState>
            )
          ) : isFriendsLoading ? (
            <LoadingArea>
              <Loader2 size={24} color="#3B82F6" className="spin" />
            </LoadingArea>
          ) : friends.length > 0 ? (
            <ListGroup>
              {friends.map((friend: any) => {
                const isSelected = selectedFriendIds.includes(friend.friendId);
                return (
                  <ItemRow
                    key={friend.friendId}
                    $isSelected={isSelected}
                    onClick={() => handleFriendToggle(friend.friendId)}
                  >
                    <IconWrapper $isSelected={isSelected}>
                      <Users size={20} />
                    </IconWrapper>
                    <ItemInfo>
                      <ItemName>{friend.friendAlias || friend.nickname}</ItemName>
                      <ItemSubText>{friend.nickname}</ItemSubText>
                    </ItemInfo>
                    <CheckBadge $isSelected={isSelected}>
                      <Check size={16} color={isSelected ? "#ffffff" : "#9ca3af"} />
                    </CheckBadge>
                  </ItemRow>
                );
              })}
            </ListGroup>
          ) : (
            <EmptyState>등록된 친구가 없습니다.</EmptyState>
          )}
        </ModalBody>

        <ModalFooter>
          <SubmitButton
            onClick={handleConfirm}
            disabled={
              createRoomMutation.isPending ||
              (activeTab === "rooms" && !selectedRoomId) ||
              (activeTab === "friends" && selectedFriendIds.length === 0)
            }
          >
            {createRoomMutation.isPending ? (
              <Loader2 size={20} color="#ffffff" className="spin" />
            ) : activeTab === "rooms" ? (
              "이 채팅방에 공유하기"
            ) : (
              `선택한 ${selectedFriendIds.length}명과 채팅방 생성 및 공유`
            )}
          </SubmitButton>
        </ModalFooter>
      </ModalContainer>
    </BottomSheet>
  );
}

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 16px 16px 16px;
  box-sizing: border-box;
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #191f28;
  margin: 0;
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
`;

const ListGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemRow = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid
    ${({ $isSelected }) => ($isSelected ? "#3B82F6" : "#f1f5f9")};
  background: ${({ $isSelected }) => ($isSelected ? "#eff6ff" : "#f8fafc")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const IconWrapper = styled.div<{ $isSelected?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ $isSelected }) => ($isSelected ? "#dbeafe" : "#e2e8f0")};
  color: ${({ $isSelected }) => ($isSelected ? "#2563eb" : "#64748b")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #191f28;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemSubText = styled.span`
  font-size: 12px;
  color: #8b95a1;
`;

const CheckBadge = styled.div<{ $isSelected?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ $isSelected }) => ($isSelected ? "#3B82F6" : "#e5e8eb")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const LoadingArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: spin 1s linear infinite;
  }
`;

const EmptyState = styled.div`
  padding: 40px 0;
  text-align: center;
  color: #8b95a1;
  font-size: 14px;
`;

const ModalFooter = styled.div`
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 12px;
  background-color: #3b82f6;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease;

  &:disabled {
    background-color: #cbd5e1;
    cursor: not-allowed;
  }

  &:not(:disabled):active {
    background-color: #2563eb;
  }

  .spin {
    animation: spin 1s linear infinite;
  }
`;
