import React from 'react';
import styled from 'styled-components';
import './TipsTitle.css';

interface TipsTitleProps {
  selectedCategory: string;
}

const TipsTitle: React.FC<TipsTitleProps> = ({ selectedCategory }) => {

  return (
    <TipsTitleWrapper>
      <span className='tips-title-text-1'>{selectedCategory}</span>
      <span className='tips-title-text-2'> TIP</span>
    </TipsTitleWrapper>
  );
};

export default TipsTitle;

const TipsTitleWrapper = styled.div`
`;
