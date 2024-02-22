import React from 'react';

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TitleInput: React.FC<TitleInputProps> = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="title">제목:</label>
      <input type="text" id="title" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
};

export default TitleInput;
