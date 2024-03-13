import React from 'react';
import styled from 'styled-components';
import './TipsTitle.css';
import SearchBar from './SearachBar';

interface TipsTitleProps {
  selectedCategory: string;
}

const TipsTitle: React.FC<TipsTitleProps> = ({ selectedCategory }) => {

  return (
    <TipsTitleWrapper>
    <span>
    <span className='tips-title-text-1'>{selectedCategory}</span>
      {selectedCategory != '검색결과' && (
        <span className='tips-title-text-2'> TIP</span>
      )}</span>
    <SearchBar></SearchBar>
    </TipsTitleWrapper>
  );
};

export default TipsTitle;

const TipsTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
`;
