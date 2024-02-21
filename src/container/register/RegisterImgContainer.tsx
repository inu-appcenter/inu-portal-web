import RegisterImage from '../../component/register/registerimg';
import styled from 'styled-components';
export default function RegisterImg () {


  return (
    <RegisterImageWrapper>
      <RegisterImage/>
    </RegisterImageWrapper>
  );

}

const RegisterImageWrapper = styled.div`
  background-color: #0E4D9D;
  border-radius: 40px 0px 0px 0px;
  height: 100%;
  width: 769px;
`



