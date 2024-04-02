import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import getCategory from '../../utils/getCategory';
import './TipsCategories.css';

interface Category {
  name: string;
  iconWhite: string;
  iconGray: string;
  hasError?: boolean;
}

interface TipsCategoriesProps {
  docType: string;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}



export default function TipsCategories({ docType, selectedCategory, setSelectedCategory }: TipsCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    if (docType === 'TIPS') {
      const getCats = await getCategory();
      getCats.unshift('전체');
      const cats = getCats.map((cat: string) => ({
        name: cat,
        iconWhite: `/src/resource/assets/categoryIcons/${cat}_white.svg`,
        iconGray: `/src/resource/assets/categoryIcons/${cat}_gray.svg`
      }));
      setCategories(cats);
    }
    else if (docType === 'NOTICE') {
      const cats = ['전체', '학사', '모집', '학점교류', '교육시험'].map(cat => ({
        name: cat,
        iconWhite: `/src/resource/assets/categoryIcons/${cat}_white.svg`,
        iconGray: `/src/resource/assets/categoryIcons/${cat}_gray.svg`
      }));
      setCategories(cats);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [docType]);

   // 이미지 로드 실패 시 호출될 핸들러
   const handleImageError = (index: number) => {
    setCategories(prevCategories => prevCategories.map((cat, idx) => idx === index ? { ...cat, hasError: true } : cat));
  };

  const handleClickCategory = (category: string) => {
    setSelectedCategory(category);
  
    if (docType === 'TIPS') {
      window.location.href = '/tips';
    } else if (docType === 'NOTICE') {
      window.location.href = '/tips/notice';
    }
  }
  

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
    </div>
  );
}
