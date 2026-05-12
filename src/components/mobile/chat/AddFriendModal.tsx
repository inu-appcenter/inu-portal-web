import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import { X, UserPlus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestFriend, searchFriend } from "@/apis/friends";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";
import SocialUserCard from "@/components/mobile/social/SocialUserCard";
import { FriendResponseDto } from "@/types/friends";

const contentShow = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

interface AddFriendModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddFriendModal({
  isOpen,
  onOpenChange,
}: AddFriendModalProps) {
  const queryClient = useQueryClient();
  const [studentIdInput, setStudentIdInput] = useState("");
  const [searchResult, setSearchResult] = useState<FriendResponseDto | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);

  const searchMutation = useMutation({
    mutationFn: searchFriend,
    onMutate: () => {
      setIsSearching(true);
      setSearchResult(null);
    },
    onSuccess: (res) => {
      setSearchResult(res.data);
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "유저를 찾을 수 없습니다.");
    },
    onSettled: () => {
      setIsSearching(false);
    },
  });

  const requestMutation = useMutation({
    mutationFn: (studentId: string) => requestFriend(studentId),
    onSuccess: () => {
      alert("친구 요청을 보냈습니다.");
      setStudentIdInput("");
      setSearchResult(null);
      queryClient.invalidateQueries({ queryKey: ["sentPendingFriends"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.msg || "친구 요청에 실패했습니다.");
    },
  });

  const handleSearch = () => {
    if (!studentIdInput.trim()) return;
    searchMutation.mutate(studentIdInput.trim());
  };

  const handleRequest = () => {
    if (!searchResult) return;
    requestMutation.mutate(searchResult.studentId);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <Header>
            <Title>친구 추가</Title>
            <CloseButton onClick={() => onOpenChange(false)}>
              <X size={24} color="#1C1C1E" />
            </CloseButton>
          </Header>

          <Content>
            <Description>
              학번으로 친구를 검색하고 요청을 보낼 수 있어요.
              <br />
              INTIP에 한번이라도 로그인한 적이 있어야 검색할 수 있어요.
            </Description>

            <ResultArea>
              {isSearching ? (
                <EmptyResult>검색 중...</EmptyResult>
              ) : searchResult ? (
                <div>
                  <SocialUserCard
                    name={searchResult.nickname}
                    subtitle={searchResult.studentId}
                    fireId={searchResult.fireId}
                  />
                  <SubmitButton
                    disabled={requestMutation.isPending}
                    onClick={handleRequest}
                  >
                    <UserPlus size={18} />
                    {requestMutation.isPending
                      ? "요청 중..."
                      : "친구 요청 보내기"}
                  </SubmitButton>
                </div>
              ) : (
                studentIdInput.trim() &&
                !isSearching && (
                  <EmptyResult>
                    학번을 입력하고 돋보기를 눌러주세요.
                  </EmptyResult>
                )
              )}
            </ResultArea>

            <MobilePillSearchBar
              value={studentIdInput}
              onChange={(val) => {
                setStudentIdInput(val);
                if (searchResult) setSearchResult(null);
              }}
              onSubmit={handleSearch}
              placeholder="친구의 학번을 입력하세요"
            />
          </Content>
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const StyledOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.4);
  animation: ${fadeIn} 200ms ease-out;
  backdrop-filter: blur(4px);
`;

const StyledContent = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 400px;
  background-color: white;
  border-radius: 24px;
  z-index: 2001;
  display: flex;
  flex-direction: column;
  outline: none;
  animation: ${contentShow} 250ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 20px;
  padding-bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1c1c1e;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
`;

const Content = styled.div`
  padding: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 50vh;
`;

const Description = styled.p`
  font-size: 14px;
  color: #8e8e93;
  margin: 0;
  line-height: 1.5;
`;

const ResultArea = styled.div`
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const EmptyResult = styled.div`
  text-align: center;
  color: #c7c7cc;
  font-size: 14px;
  padding: 20px 0;
`;

const SubmitButton = styled.button`
  margin-top: 12px;
  width: 100%;
  padding: 14px;
  background-color: #5E92F0;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:disabled {
    background-color: #e5e5ea;
    color: #8e8e93;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
    opacity: 0.9;
  }
`;
