import styled from 'styled-components';
import RegisterTitle from '../../component/register/registertitle';
import RegisterInput from '../../component/register/registerinput';
export default function LoginDetail () {

  return (
    <RegisterDetaileWrapper>
        <RegisterTitle/>
        <RegisterInput/>
    </RegisterDetaileWrapper>
  );

}

const RegisterDetaileWrapper = styled.div`
  flex-grow: 1;
  max-width: 473px;
  margin: auto;
  padding-left: 40px;
  
  display: flex;
  flex-direction: column;
    
`