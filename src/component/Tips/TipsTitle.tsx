import React from 'react';
import styled from 'styled-components';
import './TipsTitle.css';
import SearchBar from './SearchBar';
import { useNavigate } from 'react-router-dom';
import MyPageUserInfo from '../mypage/common/MyPageUserInfo';
import { useSelector } from 'react-redux';

interface TipsTitleProps {
  docState: DocState;
}

interface loginInfo {
  user: {
    token: string;
  };
}

const TipsTitle: React.FC<TipsTitleProps> = ({ docState }) => {
  const navigate = useNavigate();
  const user = useSelector((state: loginInfo) => state.user);
  return (
    <TipsTitleWrapper>
      <span className='tips-title-text' onClick={() => navigate('/tips')}>
        <span className='tips-title-text-1'>{docState.selectedCategory}</span>
        <span className='tips-title-text-2'> {docState.docType}</span>
      </span>
      <SearchBarUserInfoWrapper>
        <SearchBar />
        {user.token && <MyPageUserInfo />}
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
