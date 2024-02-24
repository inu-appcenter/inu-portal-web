import React from 'react';
import checkedCheckbox from '../../resource/assets/checked-checkbox.png';
import uncheckedCheckbox from '../../resource/assets/unchecked-checkbox.png';
import './AnonymousCheckbox.css';

interface AnonymousCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const AnonymousCheckbox: React.FC<AnonymousCheckboxProps> = ({ checked, onChange }) => {
  const handleCheckboxClick = () => {
    onChange(!checked); // 현재 상태의 반대로 변경
    console.log(`${!checked ? '익명' : '익명 취소'}`);
  };

  return (
    <span className='checkboxContainer' onClick={handleCheckboxClick} style={{ cursor: 'pointer' }}>
      <img className='checkbox'
        src={checked ? checkedCheckbox : uncheckedCheckbox}
        alt={checked ? 'Checked' : 'Unchecked'}
        role="checkbox"
        aria-checked={checked}
      />
      <span className='checkbox-text' style={{textAlign: 'center'}}>익명</span>
    </span>
  );
};

export default AnonymousCheckbox;
