import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import getCategory from '../../utils/getCategory';
import './TipsCategories.css';

interface Category {
  name: string;
  iconWhite: string;
  iconGray: string;
  hasError?: boolean;
  originalName?: string; 
}

interface TipsCategoriesProps {
  docState: DocState;
  setDocState: (docState: DocState) => void;
}



export default function TipsCategories({ docState, setDocState }: TipsCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const fetchCategories = async () => {
    let cats: Category[] = [];
    if (docState.docType === 'TIPS') {
      const getCats = await getCategory();
      const groupedCategories = ["동북아국제통상물류학부", "법학부"];
  
      cats = getCats.map((cat: string) => ({
        name: groupedCategories.includes(cat) || cat.endsWith('대학') ? '단과대' : cat,
        originalName: cat,
        iconWhite: `/categoryIcons/${cat}_white.svg`,
        iconGray: `/categoryIcons/${cat}_gray.svg`
      }));
    } 
    else if (docState.docType === 'NOTICE') {
      cats = ['전체', '학사', '모집', '학점교류', '교육시험'].map(cat => ({
        name: cat,
        iconWhite: `/categoryIcons/${cat}_white.svg`,
        iconGray: `/categoryIcons/${cat}_gray.svg`
      }));
    }
    setCategories(cats);
  };
  
  useEffect(() => {
    fetchCategories();
    
  }, [docState.docType]);

   // 이미지 로드 실패 시 호출될 핸들러
   const handleImageError = (index: number) => {
    setCategories(prevCategories => prevCategories.map((cat, idx) => idx === index ? { ...cat, hasError: true } : cat));
  };

  const handleClickCategory = (category: Category) => {
    const categoryName = category.originalName ? category.originalName : category.name;
    
    if (categoryName === '단과대') {
      setIsCollapsed(!isCollapsed);
    } else {
      setDocState({docType: docState.docType, selectedCategory: categoryName, sort: 'date', page: '1'});
  
      const route = docState.docType === 'TIPS' ? '/tips' : '/tips/notice';
      navigate(route);
    }
  }
  
  return (
    <div className='categories'>
      {categories.map((category, index) => (
        <div className={`categoryItem ${docState.selectedCategory === category.name ? 'selected' : ''}`} key={index} onClick={() => handleClickCategory(category)}>
          {category.name === '단과대' && isCollapsed ? (
            <div style={{ width: '25px', height: '25px' }}> {/* 단과대 아이콘 표시 */}</div>
          ) : (
            <>
              {category.hasError ? (
                <div style={{ width: '25px', height: '25px' }}> {/* 이미지 로드 실패 시 공백을 위한 div */}</div>
              ) : (
                <img 
                  src={docState.selectedCategory === category.name ? category.iconWhite : category.iconGray} 
                  alt={category.name} 
                  onError={() => handleImageError(index)}
                />
              )}
              {category.name}
            </>
          )}
        </div>
      ))}
    </div>
  );
}