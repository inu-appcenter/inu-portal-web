import { useState } from "react";
import styled from "styled-components";
import Icon from "@/components/common/Icon";
import { useHeader } from "@/context/HeaderContext";
import AdminLayout from "@/components/admin/AdminLayout";
import Box from "@/components/common/Box";
import { MOBILE_PAGE_GUTTER, DESKTOP_MEDIA } from "@/styles/responsive";
import { createChatRoom } from "@/apis/chat";

// 체크박스 이미지 리소스 임포트
import checkedCheckbox from "@/resources/assets/posts/checked-checkbox.svg";
import uncheckedCheckbox from "@/resources/assets/posts/unchecked-checkbox.svg";

const MobileAdminChatPage = () => {
  useHeader({
    title: "채팅방 관리",
  });

  const [title, setTitle] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(100);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!title.trim()) {
      alert("채팅방 제목을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response: any = await createChatRoom(
        title,
        maxCapacity,
        isAnonymous,
        "OPEN",
      );
      // API 응답 구조에 따른 데이터 추출
      const actualData = response.data || response;
      const roomId = actualData.roomId || actualData.id;

      alert(`채팅방이 생성되었습니다. ID: ${roomId}`);
      setTitle("");
    } catch (error) {
      console.error("채팅방 생성 실패", error);
      alert("채팅방 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const setFestivalRoom = () => {
    setTitle("2026 대동제 실시간 채팅방");
    setMaxCapacity(500);
    setIsAnonymous(true);
  };

  return (
    <AdminLayout>
      <Wrapper>
        <SectionTitle>
          <Icon name="chat" size={20} />새 채팅방 생성
        </SectionTitle>

        <Box>
          <Form>
            <FormGroup>
              <Label>방 제목</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="채팅방 제목을 입력하세요"
              />
            </FormGroup>

            <FormGroup>
              <Label>최대 인원</Label>
              <Input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
              />
            </FormGroup>

            {/* 이미지 기반 커스텀 체크박스 적용 */}
            <CheckboxGroup onClick={() => setIsAnonymous(!isAnonymous)}>
              <img
                src={isAnonymous ? checkedCheckbox : uncheckedCheckbox}
                alt="익명 체크"
              />
              <span>익명 전용 채팅</span>
            </CheckboxGroup>

            <ButtonGroup>
              <SecondaryButton onClick={setFestivalRoom}>
                축제 채팅방 설정 자동 입력
              </SecondaryButton>
              <PrimaryButton onClick={handleCreateRoom} disabled={isLoading}>
                <Icon name="add-plus-sm" size={18} />
                {isLoading ? "생성 중..." : "채팅방 생성하기"}
              </PrimaryButton>
            </ButtonGroup>
          </Form>
        </Box>
      </Wrapper>
    </AdminLayout>
  );
};

export default MobileAdminChatPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0 ${MOBILE_PAGE_GUTTER};
  padding: 20px 0 24px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    margin: 0;
    padding: 40px 48px;
    gap: 32px;
  }
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
`;

const Input = styled.input`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #5844e4;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  color: #1e293b;
  cursor: pointer;
  padding: 4px 0;
  user-select: none;

  img {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    display: block;
  }

  span {
    font-weight: 500;
    color: #1e293b;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
`;

const PrimaryButton = styled.button`
  background: #5844e4;
  color: white;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background: #f1f5f9;
  color: #475569;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;
