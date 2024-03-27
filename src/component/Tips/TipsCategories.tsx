import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import getCategory from '../../utils/getCategory';
import './TipsCategories.css';

interface TipsCategoriesProps {
  docType: string;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function TipsCategories({ docType, selectedCategory, setSelectedCategory }: TipsCategoriesProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    console.log('docType!!!', docType);
    if (docType === 'TIPS') {
      const cats = await getCategory();
      cats.unshift('전체');
      setCategories(cats);
    }
    else if (docType === 'NOTICE') {
      const cats = ['전체', '학사', '모집', '학점교류', '교육시험'];
      setCategories(cats);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [docType]);

  const handleClickCategory = (category: string) => {
    setSelectedCategory(category);
    if (docType === 'TIPS') {
      navigate('/tips');
    }
    else if (docType === 'NOTICE') {
      navigate('/tips/notice');
    }
  }

  return (
    <div className='categories'>
      {categories.map((category, index) => (
        <div className={`categoryItem ${selectedCategory === category ? 'selected' : ''}`} key={index} onClick={() => handleClickCategory(category)}>
          {category}
        </div>
      ))}
    </div>
  );
}
