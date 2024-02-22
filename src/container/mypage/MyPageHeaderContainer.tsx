import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LoginInfo from '../../component/mypage/logininfo';


export default function MyPageHeaderContainer() {
  const token = useSelector((state: any) => state.user.token);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!token) {
      navigate('/home');
    }
  }, [token, navigate]);

  return (
    <MyPageWrapper>
      <LoginInfo/>
    </MyPageWrapper>
  );
}

const MyPageWrapper = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
`;
