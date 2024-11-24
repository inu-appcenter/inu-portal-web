import React from "react";
import styled from "styled-components";

interface TitleInputProps {
  value: string;
  onChange?: (value: string) => void;
}

export default function TitleInput({ value, onChange }: TitleInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div>
      <TitleInputField
        type="text"
        id="title"
        value={value}
        placeholder="제목"
        onChange={handleChange}
      />
    </div>
  );
}

// Styled Component
const TitleInputField = styled.input`
  width: 90%;
  border: 0;
  font-size: 30px;
  font-weight: 500;
  text-align: left;
`;
