import React from 'react';

interface ContentInputProps {
  value: string;
  onChange: (value: string) => void;
}

const ContentInput: React.FC<ContentInputProps> = ({ value, onChange }) => {
  return (
    <div>
      <label htmlFor="content">내용:</label>
      <textarea id="content" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
};

export default ContentInput;
