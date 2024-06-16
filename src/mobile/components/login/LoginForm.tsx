import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../utils/API/Members';
import { tokenUser as tokenUserAction, studentIdUser as studentIdUserAction } from "../../../reducer/userSlice";
import styled from 'styled-components';
import LoginUser from '../../../resource/assets/login-user.svg';
import LoginPassword from '../../../resource/assets/login-password.svg';

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const data = {studentId: studentId, password: password};
    try {
      const response = await login(data);
      if (response.status === 200) {
        const responseData = response.body.data;
        const token = responseData.accessToken;
        const tokenExpiredTime = responseData.accessTokenExpiredTime;
        const refreshToken = responseData.refreshToken;
        const refreshTokenExpiredTime = responseData.refreshTokenExpiredTime;

        localStorage.setItem('token', token);
        localStorage.setItem('tokenExpiredTime', tokenExpiredTime);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('refreshTokenExpiredTime', refreshTokenExpiredTime);
        
        dispatch(studentIdUserAction({ studentId: studentId }));
        dispatch(tokenUserAction({ token, tokenExpiredTime, refreshToken, refreshTokenExpiredTime }));

        navigate(-1);
      } else if (response.status === 401) {
        alert("학번 또는 비밀번호가 틀립니다.");
      } else if (response.status === 404) {
        alert("존재하지 않는 회원입니다.")
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("알 수 없는 오류가 발생했습니다.");
    }
  };

  return (
    <FormWrapper>
      <FormItemWrapper>
        <Label>학번</Label>
        <FormInputWrapper>
          <Input 
            type="text" 
            placeholder="예) 202100000" 
            value={studentId} 
            onChange={(e) => setStudentId(e.target.value)} 
          />
          <FormIcon src={LoginUser} alt="LoginUser" />
        </FormInputWrapper>
        <InputLine />
      </FormItemWrapper>
      <FormItemWrapper>
        <Label>비밀번호</Label>
        <FormInputWrapper>
          <Input 
            type="password" 
            placeholder="" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <FormIcon src={LoginPassword} alt="LoginPassword" />
        </FormInputWrapper>
        <InputLine />
      </FormItemWrapper>
      <LoginButton onClick={handleLogin}>로그인</LoginButton>
    </FormWrapper>
  );
};

const FormWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const FormItemWrapper = styled.div`
  width: 90%;
  max-width: 384px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.div`
  font-size: 18px;
  font-weight: 600;
`

const FormInputWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 0 8px 0 8px;
`

const Input = styled.input`
  border: none;
  font-size: 18px;
  flex: 1;
`;

const FormIcon = styled.img`
  width: 24px;
`

const InputLine = styled.div`
  border: 1px solid #969696;
`

const LoginButton = styled.div`
  width: 90%;
  max-width: 384px;
  height: 56px;
  background: linear-gradient(90deg, rgba(156, 175, 226, 0.7) 0%, rgba(181, 197, 242, 0.7) 55%, rgba(156, 175, 226, 0.7) 100%);
  color: white;
  border-radius: 16px;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
`;
