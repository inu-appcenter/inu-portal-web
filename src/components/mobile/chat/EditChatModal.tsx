import * as Dialog from "@radix-ui/react-dialog";
import styled, { keyframes } from "styled-components";
import BottomButtonGroup from "@/components/common/BottomButtonGroup";
import { useState, useEffect } from "react";
import { updateChatRoomInfo } from "@/apis/chat";
import { useQueryClient } from "@tanstack/react-query";
import Icon from "@/components/common/Icon";
import { ChatRoom } from "@/types/chat";
import { pickValidImage } from "@/utils/fileValidation";

const contentShow = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

interface EditChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: number | string;
  initialData?: ChatRoom | null;
}

export default function EditChatModal({
  isOpen,
  onOpenChange,
  roomId,
  initialData,
}: EditChatModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [maxCapacity, setMaxCapacity] = useState(
    initialData?.maxCapacity || 10,
  );
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.thumbnailUrl || null,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setMaxCapacity(initialData.maxCapacity);
      setPreviewUrl(initialData.thumbnailUrl);
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = pickValidImage(e.target.files?.[0]);
    e.target.value = "";
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      alert("방 제목을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      await updateChatRoomInfo(
        roomId,
        {
          title: title.trim(),
          maxCapacity,
          description: description.trim(),
        },
        thumbnail || undefined,
      );
      alert("채팅방 정보가 수정되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["chatMessages", roomId] });
      queryClient.invalidateQueries({ queryKey: ["myChatRooms"] });
      onOpenChange(false);
    } catch (error) {
      console.error("채팅방 수정 실패:", error);
      alert("채팅방 수정에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <Header>
            <Title>채팅방 정보 수정</Title>
          </Header>

          <FormArea>
            <ThumbnailGroup>
              <Label>방 썸네일</Label>
              <ThumbnailInputWrapper>
                <ThumbnailPreview src={previewUrl || ""}>
                  {!previewUrl && <Icon name="camera" size={24} color="#CBD5E1" />}
                </ThumbnailPreview>
                <FileInput
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <EditBadge>
                  <Icon name="camera" size={14} color="white" />
                </EditBadge>
              </ThumbnailInputWrapper>
            </ThumbnailGroup>

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
          </FormArea>

          <BottomButtonGroup
            leftButton={{
              label: "취소",
              onClick: () => onOpenChange(false),
              backgroundColor: "#F2F2F7",
              textColor: "#1C1C1E",
            }}
            rightButton={{
              label: isLoading ? "수정 중..." : "수정하기",
              onClick: handleUpdate,
              backgroundColor: "#5E92F0",
              textColor: "#FFFFFF",
              disabled: isLoading,
            }}
            padding="16px 24px 24px"
            height="88px"
            position="static"
          />
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
  z-index: 2001;
  display: flex;
  flex-direction: column;
  outline: none;
  animation: ${contentShow} 200ms cubic-bezier(0.16, 1, 0.3, 1);
  background-color: white;
  border-radius: 24px;
  max-height: 85vh;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px 24px 16px;
  flex-shrink: 0;
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
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 0;
    display: none;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ThumbnailGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const ThumbnailInputWrapper = styled.label`
  position: relative;
  cursor: pointer;
`;

const ThumbnailPreview = styled.div<{ src: string }>`
  width: 100px;
  height: 100px;
  border-radius: 20px;
  background-color: #f1f5f9;
  background-image: ${({ src }) => (src ? `url(${src})` : "none")};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

const FileInput = styled.input`
  display: none;
`;

const EditBadge = styled.div`
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #5e92f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #767676;
  align-self: flex-start;
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
    border-color: #5e92f0;
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
    border-color: #5e92f0;
  }
`;
