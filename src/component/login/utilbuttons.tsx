import styled from "styled-components";
import { useNavigate } from 'react-router-dom';
import './utilbuttons.css'

export default function UtilButtons() {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/register');
  };

  // const handleFindIdClick = () => {
  //   navigate('/');  // 페이지 url 입력 필요
  // };

  // const handleFindPasswordClick = () => {
  //   navigate('/');  // 페이지 url 입력 필요
  // };

  return(
    <UtilButtonsWrapper>
      <div className='text btn' onClick={handleRegisterClick}>회원가입 &gt;</div>
      <span>
        <span className='text btn'>아이디 찾기</span>
        <span className='text'> | </span>
        <span className='text btn'>비밀번호 찾기</span>
      </span>
    </UtilButtonsWrapper>
  )
}

const UtilButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  margin-top: 20px;
`