import styled from "styled-components";

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
  return (
    <TitleContentInputWrapper>
      <TitleInput
        type="text"
        placeholder="제목"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />
      <Line />
      <ContentTextarea
        placeholder="내용을 입력하세요."
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
      />
    </TitleContentInputWrapper>
  );
}

const TitleContentInputWrapper = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  border-radius: 1px;
  border: 1px solid #e0e0e0;
`;

const TitleInput = styled.input`
  margin: 8px;
  border: none;
  font-size: 14px;
  font-weight: 400;
`;

const Line = styled.div`
  margin-left: 8px;
  width: 40%;
  border: 1px solid #bebebe;
`;

const ContentTextarea = styled.textarea`
  margin: 8px;
  flex: 1;
  border: none;
  font-size: 10px;
  font-weight: 300;
  font-family: inherit;
`;
