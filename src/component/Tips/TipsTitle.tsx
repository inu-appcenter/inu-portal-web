import React from 'react';
import styled from 'styled-components';
import './TipsTitle.css';
import SearchBar from './SearchBar';
import { useNavigate } from 'react-router-dom';
import MyPageUserInfo from '../mypage/common/MyPageUserInfo';

interface TipsTitleProps {
  selectedCategory: string;
}

const TipsTitle: React.FC<TipsTitleProps> = ({ selectedCategory }) => {
  const navigate = useNavigate();

  const getSecondaryText = () => {
    switch(selectedCategory) {
      case '검색결과':
        return 'SEARCH';
      case '공지사항':
        return 'NOTICE';
      default:
        return 'TIP';
    }
  }

  return (
    <TipsTitleWrapper>
      <span className='tips-title-text' onClick={() => navigate('/tips')}>
        <span className='tips-title-text-1'>{selectedCategory}</span>
        <span className='tips-title-text-2'> {getSecondaryText()}</span>
      </span>
      <SearchBarUserInfoWrapper>
        <SearchBar />
        <MyPageUserInfo />
      </SearchBarUserInfoWrapper>
    </TipsTitleWrapper>
  );
};

export default TipsTitle;

const TipsTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  padding-right: 30px;
  gap: 20px;
`;

const SearchBarUserInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
`
