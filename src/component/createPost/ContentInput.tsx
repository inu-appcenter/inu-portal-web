import React from 'react';

interface ContentInputProps {
  value: string;
  onChange: (value: string) => void;
}

const ContentInput: React.FC<ContentInputProps> = ({ value, onChange }) => {
  return (
    <div>
      <textarea
        id='content'
        value={value}
        placeholder='내용을 입력하세요.'
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default ContentInput;
