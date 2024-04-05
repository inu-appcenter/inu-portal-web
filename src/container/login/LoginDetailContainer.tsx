
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
    flex-grow: 1;
    max-width: 473px;
    margin: auto;
    padding-left: 40px;

    display: flex;
    flex-direction: column;
`
