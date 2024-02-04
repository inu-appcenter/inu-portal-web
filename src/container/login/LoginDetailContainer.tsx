
import styled from 'styled-components';
import LoginTitle from '../../component/login/logintitle';
import LoginInput from '../../component/login/logininput';
import UtilButtons from '../../component/login/utilbuttons';

export default function LoginDetail () {

  return (
    <LoginDetaileWrapper>
        <LoginTitle/>
        <LoginInput/>
        <UtilButtons/>
    </LoginDetaileWrapper>
  );

}

const LoginDetaileWrapper = styled.div`
    
`



