import React, { useState, useEffect } from 'react';

interface TipsCategoriesProps {
  setSelectCategory: (category: string) => void;
}

const TipsCategories: React.FC<TipsCategoriesProps> = ({ setSelectCategory }) => {
  const [categories, setCategories] = useState<string[]>([]);

  const getCategories = () => {
    // 현재 더미데이터 이용, 이곳에 백엔드에서 카테고리 가져오는 코드 작성.
    const dummyCategories = ['수강신청', '도서관', '대학생활', '기숙사', '동아리', '학사', '국제교류원', '장학금'];
    setCategories(dummyCategories);
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div>
      <h2>Tips</h2>
      <div>
        {categories.map((category, index) => (
          <div key={index} onClick={() => setSelectCategory(category)}>
            {category}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TipsCategories;
