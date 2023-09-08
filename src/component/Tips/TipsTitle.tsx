
import React from 'react';
import styled from 'styled-components';

interface TipsTitleProps {
  selectedCategory: string;
  onCategoryClick: (category: string) => void; // 부모 컴포넌트로 카테고리 클릭 이벤트를 전달하는 함수
}

const TipsTitle: React.FC<TipsTitleProps> = ({ selectedCategory, onCategoryClick }) => {
  const handleClick = () => {
    // 클릭 이벤트 발생 시 부모 컴포넌트로 선택된 카테고리 정보 전달
    onCategoryClick(selectedCategory);
  };

  return (
    <TipsTitleWrapper>
    <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      <h2>{selectedCategory} Tips</h2>
    </div>
    </TipsTitleWrapper>
  );
};

export default TipsTitle;

const TipsTitleWrapper = styled.div``;
