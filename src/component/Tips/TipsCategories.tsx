// TipsCategories.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import getCategories from '../../utils/getCategories';
import './TipsCategories.css';
import round from '../../resource/assets/round.svg';

interface Category {
  name: string;
  iconWhite: string;
  iconGray: string;
  hasError?: boolean;
}

interface TipsCategoriesProps {
  docState: DocState;
  setDocState: (docState: DocState) => void;
}

export default function TipsCategories({ docState, setDocState }: TipsCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [college, setCollege] = useState<Category[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isCollegeOpened, setIsCollegeOpened] = useState(false);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      if (docState.docType === 'TIPS') {
        const getCats = await getCategories();
        getCats.unshift('전체');
        const cats = getCats.map((cat: string) => ({
          name: cat,
          iconWhite: `/categoryIcons/${cat}_white.svg`,
          iconGray: `/categoryIcons/${cat}_gray.svg`
        }));
        const collegeCats: Category[] = [];
        const otherCats: Category[] = [];
      
        cats.forEach((cat: Category) => {
          if (cat.name.endsWith('대학') || cat.name === '동북아국제통상물류학부' || cat.name === '법학부') {
            collegeCats.push(cat);
          } else {
            otherCats.push(cat);
          }
        });
      
        setCollege(collegeCats);
        setCategories(otherCats);
      } else if (docState.docType === 'NOTICE') {
        const cats = ['전체', '학사', '모집', '학점교류', '교육시험'].map(cat => ({
          name: cat,
          iconWhite: `/categoryIcons/${cat}_white.svg`,
          iconGray: `/categoryIcons/${cat}_gray.svg`
        }));
        setCategories(cats);
      }
    } catch (error) {
      console.error('카테고리를 불러오는 중 에러가 발생했습니다:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [docState.docType]);

  const handleImageError = (index: number, type: 'college' | 'categories') => {
    if (type === 'categories') {
      setCategories(prevCategories => prevCategories.map((cat, idx) => idx === index ? { ...cat, hasError: true } : cat));
    } else {
      setCollege(prevCategories => prevCategories.map((cat, idx) => idx === index ? { ...cat, hasError: true } : cat));
    }
  };

  const handleClickCategory = (category: string) => {
    console.log(category);
    setDocState({ docType: docState.docType, selectedCategory: category, sort: 'date', page: '1' });
  
    if (docState.docType === 'TIPS') {
      navigate('/tips');
    } else if (docState.docType === 'NOTICE') {
      navigate('/tips/notice');
    }
  }

  const truncateText = (category: string) => {
    return category.length > 8 ? category.slice(0, 7) + '...' : category;
  };

  return (
    <>
      <div className='category-open' onClick={() => setIsVisible(!isVisible)}>카테고리 ▼</div>
      {isVisible && (
        <>
          <div className='categories'>
            {categories.map((category, index) => (
              <div className={`categoryItem ${docState.selectedCategory === category.name ? 'selected' : ''}`} key={index} onClick={() => handleClickCategory(category.name)}>
                {category.hasError ? (
                  <div style={{ width: '25px', height: '25px' }}></div>
                ) : (
                  <img
                    src={docState.selectedCategory === category.name ? category.iconWhite : category.iconGray}
                    alt={category.name}
                    onError={() => handleImageError(index, 'categories')}
                  />
                )}
                {category.name}
              </div>
            ))}
          </div>
          <div className='line' />
          {docState.docType === 'TIPS' && <div className='College' onClick={() => setIsCollegeOpened(!isCollegeOpened)}>단과대 ▼</div>}
          {isCollegeOpened && (
            <div className='colleges'>
              {college.map((category, index) => (
                <div className={`collegeItem ${docState.selectedCategory === category.name ? 'selected' : ''}`} key={index} onClick={() => handleClickCategory(category.name)}>
                  <img src={round} alt="icon" />
                  {truncateText(category.name)}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
