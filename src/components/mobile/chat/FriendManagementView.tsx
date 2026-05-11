import styled from "styled-components";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import { getFriends, getPendingFriends, requestFriend, acceptFriend, deleteFriend } from "@/apis/friends";
import { getBlockedUsers, unblockUser } from "@/apis/blocks";

export default function FriendManagementView() {
  const queryClient = useQueryClient();
  const [studentIdInput, setStudentIdInput] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);

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

  // 차단 목록 조회
  const { data: blockedRes } = useQuery({
    queryKey: ["blockedUsers"],
    queryFn: getBlockedUsers,
    enabled: showBlocked,
  });

  // 친구 요청 보내기
  const requestMutation = useMutation({
    mutationFn: requestFriend,
    onSuccess: () => {
      alert("친구 요청을 보냈습니다.");
      setStudentIdInput("");
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "친구 요청에 실패했습니다.");
    },
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

  // 차단 해제
  const unblockMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      alert("차단이 해제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });

  const handleRequest = () => {
    if (!studentIdInput.trim()) return;
    requestMutation.mutate(studentIdInput.trim());
  };

  const friends = friendsRes?.data || [];
  const pendingRequests = pendingRes?.data || [];
  const blockedUsers = blockedRes?.data || [];

  return (
    <ViewWrapper>
      <SearchSection>
        <SectionTitle>친구 추가</SectionTitle>
        <MobilePillSearchBar
          value={studentIdInput}
          onChange={setStudentIdInput}
          onSubmit={handleRequest}
          placeholder="친구의 학번을 입력하세요"
        />
        <HelperText>학번을 입력하여 친구 요청을 보낼 수 있습니다.</HelperText>
      </SearchSection>

      {pendingRequests.length > 0 && (
        <Section>
          <SectionTitle>받은 친구 요청 ({pendingRequests.length})</SectionTitle>
          <Box>
            {pendingRequests.map((req, index) => (
              <div key={req.friendId}>
                <SocialUserCard
                  name={req.nickname}
                  subtitle={req.studentId}
                  fireId={req.fireId}
                  onActionClick={() => acceptMutation.mutate(req.friendId)}
                  onSecondaryActionClick={() => deleteMutation.mutate(req.friendId)}
                  actionLabel="수락"
                  secondaryActionLabel="거절"
                />
                {index < pendingRequests.length - 1 && <Divider />}
              </div>
            ))}
          </Box>
        </Section>
      )}

      <Section>
        <SectionTitle>내 친구 ({friends.length})</SectionTitle>
        <Box>
          {friendsLoading ? (
            <EmptyState>불러오는 중...</EmptyState>
          ) : friends.length > 0 ? (
            friends.map((friend, index) => (
              <div key={friend.friendId}>
                <SocialUserCard
                  name={friend.nickname}
                  subtitle={friend.studentId}
                  fireId={friend.fireId}
                  onActionClick={() => {
                    if (confirm("친구를 삭제하시겠습니까?")) {
                      deleteMutation.mutate(friend.friendId);
                    }
                  }}
                  actionLabel="삭제"
                />
                {index < friends.length - 1 && <Divider />}
              </div>
            ))
          ) : (
            <EmptyState>아직 친구가 없습니다.</EmptyState>
          )}
        </Box>
      </Section>

      <FooterSection>
        <ToggleButton onClick={() => setShowBlocked(!showBlocked)}>
          {showBlocked ? "차단 목록 숨기기" : "차단 유저 관리"}
        </ToggleButton>
        
        {showBlocked && (
          <BlockedList>
            {blockedUsers.length > 0 ? (
              blockedUsers.map((user, index) => (
                <div key={user.blockId}>
                  <SocialUserCard
                    name={user.nickname}
                    subtitle={user.studentId}
                    onActionClick={() => unblockMutation.mutate(user.blockedMemberId)}
                    actionLabel="차단 해제"
                  />
                  {index < blockedUsers.length - 1 && <Divider />}
                </div>
              ))
            ) : (
              <EmptyStateSmall>차단한 유저가 없습니다.</EmptyStateSmall>
            )}
          </BlockedList>
        )}
      </FooterSection>
    </ViewWrapper>
  );
}

const ViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 40px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SearchSection = styled(Section)`
  margin-bottom: 8px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #1c1c1e;
  margin: 0;
  padding-left: 4px;
`;

const HelperText = styled.p`
  font-size: 12px;
  color: #8e8e93;
  margin: 0;
  padding-left: 8px;
`;

const EmptyState = styled.div`
  padding: 32px 0;
  text-align: center;
  color: #969696;
  font-size: 14px;
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 12px;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #8e8e93;
  font-size: 13px;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
  padding: 8px;
`;

const BlockedList = styled(Box)`
  width: 100%;
  margin-top: 12px;
`;

const EmptyStateSmall = styled.div`
  padding: 20px 0;
  text-align: center;
  color: #969696;
  font-size: 13px;
`;
