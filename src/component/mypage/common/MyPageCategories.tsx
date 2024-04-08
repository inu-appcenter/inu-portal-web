import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

// import './TipsCategories.css';
import { MyPageCategory } from '../../../resource/string/mypage.tsx';
import MypageLogout from './logout';

interface Category {
  name: string;
  iconWhite: string;
  iconGray: string;
  hasError?: boolean;
}

interface MyPageCategoriesProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function MyPageCategories({ selectedCategory, setSelectedCategory }: MyPageCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    const cats = MyPageCategory.map((cat: string) => ({
      name: cat,
      iconWhite: `/assets/categoryImages/${cat}_white.svg`,
      iconGray: `/assets/categoryImages/${cat}_gray.svg`
    }));
    setCategories(cats);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 이미지 로드 실패 시 호출될 핸들러
  const handleImageError = (index: number) => {
    setCategories(prevCategories => prevCategories.map((cat, idx) => idx === index ? { ...cat, hasError: true } : cat));
  };
  
  const handleClickCategory = (category: string) => {
    setSelectedCategory(category);
    navigate(`/mypage`);
  };

  return (
    <div className='categories'>
      {categories.map((category, index) => (
        <div className={`categoryItem ${selectedCategory === category.name ? 'selected' : ''}`} key={index} onClick={() => handleClickCategory(category.name)}>
          {category.hasError ? (
            <div style={{ width: '25px', height: '25px' }}> {/* 이미지 로드 실패 시 공백을 위한 div */}</div>
          ) : (
            <img 
              src={selectedCategory === category.name ? category.iconWhite : category.iconGray} 
              alt={category.name} 
              onError={() => handleImageError(index)}
            />
          )}
          {category.name}
        </div>
      ))}
      <MypageLogout/>
    </div>
  );
}
