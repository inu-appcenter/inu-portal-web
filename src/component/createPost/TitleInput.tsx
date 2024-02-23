import React from 'react';

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TitleInput: React.FC<TitleInputProps> = ({ value, onChange }) => {
  return (
    <div>
      <input type="text" id="title" value={value} placeholder='제목' onChange={(e) => onChange(e.target.value)} />
    </div>
  );
};

export default TitleInput;
