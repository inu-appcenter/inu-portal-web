import styled from 'styled-components';
import RegisterImgContainer from '../container/register/RegisterImgContainer';
import RegisterDetailContainer from '../container/register/RegisterDetailContainer';

export default function RegisterPage() {

  return (
    <RegisterWrapper>
      <RegisterImgContainer/>
      <RegisterDetailContainer/>
    </RegisterWrapper>
  )
};

const RegisterWrapper = styled.div `
  display: flex;
  flex-direction: row;

  padding-top: 200px; // 임시 (나중에 MainPage에서 위치 조절 필요)
`