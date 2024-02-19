import styled from 'styled-components';
import MyPageListButton from '../../component/mypage/listbutton';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import MypageLogo from '../../component/mypage/logo';
import MypageBigLogo from '../../component/mypage/biglogo';
import MypageLogout from '../../component/mypage/logout';

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
      <MypageLogo/>
      <MyPageListButton />
      <MypageBigLogo/>
      <MypageLogout/>
    </MyPageWrapper>
  );
}

const MyPageWrapper = styled.div`
  display: flex;
  position: relative;
  margin:40px;
  flex-direction: column;
`;
