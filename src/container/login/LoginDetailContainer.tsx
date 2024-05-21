import styled from 'styled-components';
import LoginTitle from '../../component/login/logintitle';
import LoginInput from '../../component/login/logininput';
// import UtilButtons from '../../component/login/utilbuttons';

export default function LoginDetail () {

  return (
    <LoginDetaileWrapper>
      <LoginDetailItemWrapper>
        <LoginTitle/>
        <LoginInput/>
      </LoginDetailItemWrapper>
        {/* <UtilButtons/> */}
    </LoginDetaileWrapper>
  );

}

const LoginDetaileWrapper = styled.div`
    flex-grow: 1;
    z-index: 2;
    height: 100%;
    border-radius: 40px 0px 0px 40px;
    min-width: 473px;
    background-color: white;
    
    display: flex;
    align-items: center;
    justify-content: center;
    @media (max-width: 768px) { /* 모바일 */
      padding-left: 20px;
      padding-right: 20px;
    }
`

const LoginDetailItemWrapper = styled.div`
  padding-left: 40px;
  padding-right: 40px;
  max-width: 473px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-itmes: center;
  justify-content: center;
`
