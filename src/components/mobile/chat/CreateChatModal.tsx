import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import Box from "@/components/common/Box";
import BottomButtonGroup from "@/components/common/BottomButtonGroup";
import { useState } from "react";
import { createChatRoom } from "@/apis/chat";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

import checkedCheckbox from "@/resources/assets/posts/checked-checkbox.svg";
import uncheckedCheckbox from "@/resources/assets/posts/unchecked-checkbox.svg";

const contentShow = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

interface CreateChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateChatModal({
  isOpen,
  onOpenChange,
}: CreateChatModalProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("방 제목을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response: any = await createChatRoom(
        title.trim(),
        maxCapacity,
        isAnonymous,
        "OPEN", // 오픈 채팅 고정
        description.trim(),
      );
      const roomId = response.data?.id || response.id;
      onOpenChange(false);
      navigate(`${ROUTES.CHAT.ROOT}/${roomId}`);
    } catch (error) {
      console.error("채팅방 생성 실패:", error);
      alert("채팅방 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <Box
            style={{
              width: "100%",
              padding: "0",
              display: "flex",
              flexDirection: "column",
              gap: "0",
              alignItems: "stretch",
              overflow: "hidden",
            }}
          >
            <Header>
              <Title>오픈채팅방 만들기</Title>
            </Header>

            <FormArea>
              <FormGroup>
                <Label>방 제목</Label>
                <Input
                  placeholder="오픈채팅방 주제를 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>방 소개 (선택)</Label>
                <TextArea
                  placeholder="채팅방에 대해 짧게 소개해주세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </FormGroup>

              <FormGroup>
                <Label>최대 인원 (2~500명)</Label>
                <Input
                  type="number"
                  min={2}
                  max={500}
                  value={maxCapacity}
                  onChange={(e) =>
                    setMaxCapacity(
                      Math.min(500, Math.max(2, parseInt(e.target.value) || 2)),
                    )
                  }
                />
              </FormGroup>

              <CheckboxGroup onClick={() => setIsAnonymous(!isAnonymous)}>
                <img
                  src={isAnonymous ? checkedCheckbox : uncheckedCheckbox}
                  alt="익명 체크"
                />
                <span>익명 채팅</span>
              </CheckboxGroup>
            </FormArea>

            <BottomButtonGroup
              leftButton={{
                label: "취소",
                onClick: () => onOpenChange(false),
                backgroundColor: "#F2F2F7",
                textColor: "#1C1C1E",
              }}
              rightButton={{
                label: isLoading ? "생성 중..." : "방 만들기",
                onClick: handleCreate,
                backgroundColor: "#5E92F0",
                textColor: "#FFFFFF",
                disabled: isLoading,
              }}
              padding="16px 24px 24px"
              height="88px"
              position="static"
            />
          </Box>
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const StyledOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  animation: ${fadeIn} 200ms ease-out;
`;

const StyledContent = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 400px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  outline: none;
  animation: ${contentShow} 200ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const Header = styled.div`
  padding: 24px 24px 16px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1c1c1e;
  margin: 0;
`;

const FormArea = styled.div`
  padding: 0 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #767676;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 16px;
  box-sizing: border-box;
  outline: none;

  &:focus {
    border-color: #5E92F0;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 16px;
  box-sizing: border-box;
  outline: none;
  resize: none;
  font-family: inherit;

  &:focus {
    border-color: #5E92F0;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #1e293b;
  cursor: pointer;
  user-select: none;

  img {
    width: 20px;
    height: 20px;
  }
`;
