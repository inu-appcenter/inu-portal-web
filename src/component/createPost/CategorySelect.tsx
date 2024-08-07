// CategorySelect.tsx
import React, { useState, useEffect } from 'react';
import { getCategories } from '../../utils/API/Categories';
import dropdownImg from '../../resource/assets/CategorySelectDropdown-img.svg';
import './CategorySelect.css';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange }) => {
  const [options, setOptions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategories();
        setOptions(categories.body.data);
      } catch (error) {
        console.error('카테고리를 불러오는 중 에러가 발생했습니다:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div>
      <div className={`dropdown-container ${isOpen ? 'open' : 'close'}`}>
        <div className="dropdown-selected" onClick={handleDropdownToggle}>
          <div className='dropdown-text'> {value || "카테고리 선택"} </div>
          <img className='dropdown-img' src={dropdownImg} alt="dropdown"/>
        </div>
        {isOpen && (
          <div className="dropdown-options">
            {options.map((option) => (
              <div key={option} className="dropdown-option" onClick={() => handleOptionClick(option)} >
                <div className='dropdown-option-line'></div>
                <div className='dropdown-option-text'>{option}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySelect;
