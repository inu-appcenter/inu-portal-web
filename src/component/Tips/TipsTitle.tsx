import React from 'react';
import styled from 'styled-components';

interface TipsTitleProps {
  selectedCategory: string;
}

const TipsTitle: React.FC<TipsTitleProps> = ({ selectedCategory }) => {

  return (
    <TipsTitleWrapper>
      <h2>{selectedCategory} Tips</h2>
    </TipsTitleWrapper>
  );
};

export default TipsTitle;

const TipsTitleWrapper = styled.div`
`;
