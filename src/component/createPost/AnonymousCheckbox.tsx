
import React from 'react';

interface AnonymousCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const AnonymousCheckbox: React.FC<AnonymousCheckboxProps> = ({ checked, onChange }) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    onChange(newChecked);
    console.log(`${newChecked ? '익명' : '익명 취소'}`);
  };

  return (
    <div>
      <label>
        익명:
        <input type="checkbox" checked={checked} onChange={handleCheckboxChange} />
      </label>
    </div>
  );
};

export default AnonymousCheckbox;
