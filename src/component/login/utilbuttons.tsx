import styled from "styled-components";
import { useNavigate } from 'react-router-dom';

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
      <button onClick={handleRegisterClick}>회원가입</button>
      <button>아이디 찾기</button>
      <button>비밀번호 찾기</button>
    </UtilButtonsWrapper>
  )
}

const UtilButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
`