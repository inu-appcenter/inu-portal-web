//selectCat.tsx
import { useState, useEffect } from 'react';
import getCategory from '../../utils/getCategory';

interface CategoriesProps {
  setSelectedCategory: (category: string) => void;
}

export default function SelectCat({ setSelectedCategory }: CategoriesProps) {
  const [categories, setCategories] = useState<string[]>([]);

  const fetchCategories = async () => {
    const cats = await getCategory();
    setCategories(cats);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = event.target.value;
    setSelectedCategory(selectedCategory);
  };

  return (
    <div>
      <label htmlFor="categorySelect">카테고리 선택</label>
      <select id="categorySelect" onChange={handleCategoryChange}>
        {categories.map((category, index) => (
          <option key={index} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}
