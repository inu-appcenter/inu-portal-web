import React, { useState, useEffect } from 'react';
import getCategory from '../../utils/getCategory';

interface Category {
  id: number;
  name: string;
}

interface SelectCatProps {
  onSelect: (selectedCategory: string) => void;
}

const SelectCat: React.FC<SelectCatProps> = ({ onSelect }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategory();
        setCategories(data);
      } catch (error) {
        console.error('카테고리를 불러오는데 실패했습니다.', error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedCategory(selectedValue);
    onSelect(selectedValue);
  };

  return (
    <div>
      <label htmlFor="categorySelect">카테고리 선택:</label>
      <select
        id="categorySelect"
        value={selectedCategory}
        onChange={handleCategoryChange}
      >
        <option value="" disabled>
          선택하세요
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectCat;
