
import React, { useState, useEffect } from 'react';
import getCategory from '../../utils/getCategory';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange }) => {
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategory();
        setOptions(categories);
      } catch (error) {
        console.error('카테고리를 불러오는 중 에러가 발생했습니다:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <label htmlFor="category">카테고리:</label>
      <select id="category" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">카테고리 선택</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategorySelect;

// import { useState, useEffect } from 'react';
// import getCategory from '../../utils/getCategory';

// interface CategoriesProps {
//   setSelectedCategory: (category: string) => void;
// }

// export default function SelectCat({ setSelectedCategory }: CategoriesProps) {
//   const [categories, setCategories] = useState<string[]>([]);

//   const fetchCategories = async () => {
//     const cats = await getCategory();
//     setCategories(cats);
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedCategory = event.target.value;
//     setSelectedCategory(selectedCategory);
//   };

//   return (
//     <div>
//       <label htmlFor="categorySelect">카테고리 선택</label>
//       <select id="categorySelect" onChange={handleCategoryChange}>
//         {categories.map((category, index) => (
//           <option key={index} value={category}>
//             {category}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }
// src/components/CategorySelect.tsx
