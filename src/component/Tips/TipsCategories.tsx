import { useState, useEffect } from 'react';
import getCategory from '../../utils/getCategory';

interface TipsCategoriesProps {
  setSelectedCategory: (category: string) => void;
}

export default function TipsCategories({setSelectedCategory,}: TipsCategoriesProps) {
  const [categories, setCategories] = useState<string[]>([]);

  const fetchCategories = async () => {
    const cats = await getCategory();
    cats.push('전체');
    setCategories(cats);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      {categories.map((category, index) => (
        <div key={index} onClick={() => setSelectedCategory(category)}>
          {category}
        </div>
      ))}
    </div>
  );
}
