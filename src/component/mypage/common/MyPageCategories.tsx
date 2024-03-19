import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

// import './TipsCategories.css';
import { MyPageCategory } from '../../../resource/string/mypage';

interface MyPageCategoriesProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function MyPageCategories({ selectedCategory, setSelectedCategory }: MyPageCategoriesProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    setCategories(MyPageCategory);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className='categories'>
      {categories.map((category, index) => (
        <div className={`categoryItem ${selectedCategory === category ? 'selected' : ''}`} key={index} onClick={() => {setSelectedCategory(category); navigate(`/mypage`);}}>
          {category}
        </div>
      ))}
    </div>
  );
}
