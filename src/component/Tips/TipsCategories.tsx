import { useState, useEffect } from 'react';
import getCategory from '../../utils/getCategory';
import './TipsCategories.css';

interface TipsCategoriesProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function TipsCategories({ selectedCategory, setSelectedCategory }: TipsCategoriesProps) {
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
    <div className='categories'>
      {categories.map((category, index) => (
        <div className={`categoryItem ${selectedCategory === category ? 'selected' : ''}`} key={index} onClick={() => setSelectedCategory(category)}>
          {category}
        </div>
      ))}
    </div>
  );
}
