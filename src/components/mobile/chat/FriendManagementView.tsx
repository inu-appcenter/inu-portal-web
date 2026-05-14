import styled from "styled-components";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";
import EmptyState from "@/components/common/EmptyState";
import {
  getFriends,
  getPendingFriends,
  acceptFriend,
  deleteFriend,
} from "@/apis/friends";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import UserProfileModal from "@/components/mobile/social/UserProfileModal";
import Skeleton from "@/components/common/Skeleton";

export default function FriendManagementView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // 친구 목록 조회
  const { data: friendsRes, isLoading: friendsLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  // 대기 중인 요청 조회
  const { data: pendingRes } = useQuery({
    queryKey: ["pendingFriends"],
    queryFn: getPendingFriends,
  });

  // 친구 요청 수락
  const acceptMutation = useMutation({
    mutationFn: acceptFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["pendingFriends"] });
    },
  });

  // 친구 삭제/거절
  const deleteMutation = useMutation({
    mutationFn: deleteFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["pendingFriends"] });
    },
  });

  const friends = friendsRes?.data || [];
  const pendingRequests = pendingRes?.data || [];

  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return friends;
    return friends.filter(
      (friend) =>
        friend.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.friendAlias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (friend.studentId && friend.studentId.includes(searchTerm)),
    );
  }, [friends, searchTerm]);

  return (
    <ViewWrapper>
      {pendingRequests.length > 0 && (
        <TitleContentArea title={`받은 친구 요청 (${pendingRequests.length})`}>
          <Box>
            {pendingRequests.map((req, index) => (
              <div key={req.friendId} style={{ width: "100%" }}>
                <SocialUserCard
                  name={req.nickname}
                  subtitle={req.studentId}
                  fireId={req.fireId}
                  onActionClick={() => acceptMutation.mutate(req.friendId)}
                  onSecondaryActionClick={() =>
                    deleteMutation.mutate(req.friendId)
                  }
                  actionLabel="수락"
                  secondaryActionLabel="거절"
                  onClick={() => {
                    setSelectedMemberId(req.memberId);
                    setIsProfileModalOpen(true);
                  }}
                />
                {index < pendingRequests.length - 1 && <Divider />}
              </div>
            ))}
          </Box>
        </TitleContentArea>
      )}

      <TitleContentArea title={`내 친구 (${filteredFriends.length})`}>
        <Box>
          {friendsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "100%",
                    padding: "16px 0",
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                  }}
                >
                  <Skeleton width="48px" height="48px" circle />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <Skeleton width="120px" height="18px" />
                    <Skeleton width="180px" height="14px" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map((friend, index) => (
              <div key={friend.friendId} style={{ width: "100%" }}>
                <SocialUserCard
                  name={
                    friend.friendAlias
                      ? `${friend.friendAlias} (${friend.nickname})`
                      : friend.nickname
                  }
                  subtitle={
                    friend.friendAlias ? friend.nickname : friend.studentId
                  }
                  fireId={friend.fireId}
                  onClick={() => {
                    setSelectedMemberId(friend.memberId);
                    setIsProfileModalOpen(true);
                  }}
                />
                {index < filteredFriends.length - 1 && <Divider />}
              </div>
            ))
          ) : (
            <EmptyState>
              {searchTerm ? "검색 결과가 없습니다." : "아직 친구가 없습니다."}
            </EmptyState>
          )}
        </Box>
      </TitleContentArea>

      <FloatingSearchContainer>
        <MobilePillSearchBar
          placeholder="닉네임을 입력하세요."
          value={searchTerm}
          onChange={setSearchTerm}
          onSubmit={() => { }} // 실시간 검색이므로 별도 제출 로직 필요 없음
        />
      </FloatingSearchContainer>
      <UserProfileModal
        memberId={selectedMemberId}
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />
    </ViewWrapper>
  );
}

const ViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 120px; /* Floating search bar space */
`;

const FloatingSearchContainer = styled.div`
  position: fixed;
  bottom: 100px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
  z-index: 100;

  & > * {
    max-width: 400px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;
