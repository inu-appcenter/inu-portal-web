import styled from "styled-components";

interface ContentInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ContentInput({ value, onChange }: ContentInputProps) {
  return (
    <div>
      <ContentTextarea
        id="content"
        value={value}
        placeholder="내용을 입력하세요."
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// Styled Component
const ContentTextarea = styled.textarea`
  width: 90%;
  height: 400px;
  border: 0;
  font-size: 20px;
  font-weight: 500;
  resize: none;

  @media (max-width: 768px) {
    height: calc(100vh - 400px);
  }
`;
