import React from 'react';

interface TitleInputProps {
  value: string;
  onChange?: (value: string) => void; // onChange를 선택적으로 받도록 변경
}

const TitleInput: React.FC<TitleInputProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div>
      <input type="text" id="title" value={value} placeholder='제목' onChange={handleChange} />
    </div>
  );
};

export default TitleInput;
