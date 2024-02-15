import styled from 'styled-components';
import MyPageListButton from '../../component/mypage/listbutton';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function MyPageContainer() {
  const token = useSelector((state: any) => state.user.token);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!token) {
      navigate('/home');
    }
  }, [token, navigate]);

  return (
    <MyPageWrapper>
      <MyPageListButton />
    </MyPageWrapper>
  );
}

const MyPageWrapper = styled.div`

`;
