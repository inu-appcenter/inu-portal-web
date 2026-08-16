import styled from "styled-components";
import useUserStore from "@/stores/useUserStore";

interface TitleContentInputProps {
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

export default function TitleContentInput({
  title,
  content,
  onTitleChange,
  onContentChange,
}: TitleContentInputProps) {
  const { userInfo } = useUserStore();
  const nickname = userInfo?.nickname || "유니";

  return (
    <InputContainer>
      <TitleInput
        type="text"
        placeholder="제목을 입력하세요."
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />
      <TitleDivider />
      <ContentTextarea
        placeholder={`${nickname}님의 TIP을 자유롭게 공유해 보세요.`}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
      />
    </InputContainer>
  );
}

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
`;

const TitleInput = styled.input`
  width: 100%;
  padding: 16px 0 12px;
  border: none;
  outline: none;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
  background: transparent;

  &::placeholder {
    color: var(--text-tertiary, #8b95a1);
    font-weight: 600;
  }
`;

const TitleDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: var(--border-default, #e5e8eb);
  margin-bottom: 16px;
`;

const ContentTextarea = styled.textarea`
  width: 100%;
  flex: 1;
  min-height: 250px;
  border: none;
  outline: none;
  resize: none;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-primary, #333d4b);
  background: transparent;

  &::placeholder {
    color: var(--text-tertiary, #8b95a1);
  }
`;
