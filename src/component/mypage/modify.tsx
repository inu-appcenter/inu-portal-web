

import styled from 'styled-components';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import ModifyUser from '../../utils/PutUser';
import { useNavigate } from 'react-router-dom';
import MyInfo from './info';

interface loginInfo {
    user: {
      token: string;
    };
  }

export default function ModifyInfo() {
    const token = useSelector((state: loginInfo) => state.user.token);
    const [currentpassword, setCurrentpassword] = useState("");
    const [newpassword, setNewpassword] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const navigate = useNavigate();
const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Username changed:', e.target.value);
    setNickname(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Password changed:', e.target.value);
    setPassword(e.target.value);
    };

    const handleModifyClick = async () => {
        
        const data = {
          password: password,
          nickname: nickname
        };
    
        try {
          const response = await ModifyUser(token, data);
          console.log(response);
          navigate('/');

    
        } catch (error) {
          console.error('로그인 에러:', error);
        }
      };
    
    
  return (
    <ModifyWrapper>
      <Title >비밀번호 변경</Title>
      <MyInfo/>
      <PasswordWrapper>
        <CurrentPassword>
        <CurrentPasswordTitle>현재 비밀번호</CurrentPasswordTitle>
        {/* <CurrentPasswordInput type="passowrd" value={currentpassword} onChange={handlePasswordChange} /> */}
        <CurrentPasswordInput type="passowrd" value={currentpassword} />
        </CurrentPassword>
        <NewPasswordTitle>새 비밀번호</NewPasswordTitle>
        {/* <NewPasswordInput type="passowrd" value={newpassword} onChange={handlePasswordChange} /> */}
        <NewPasswordInput type="passowrd" value={newpassword} onChange={handlePasswordChange} />
        <div></div>
        <CheckasswordTitle>새 비밀번호 확인</CheckasswordTitle>
        <CheckasswordInput type="passowrd" value={password} onChange={handlePasswordChange} />
        <div></div>
      </PasswordWrapper>
        <NewNicknameTitle>닉네임</NewNicknameTitle>
        <NewNicknameInput type="nickname" placeholder="닉네임" value={nickname} onChange={handleNicknameChange}/>
        <div></div>
        <ButtonWrapper>
          <ModifyClickButton onClick={handleModifyClick}>
          <ModifyClickText>비밀번호 변경</ModifyClickText>
        </ModifyClickButton>
        </ButtonWrapper>

    </ModifyWrapper>
  );
}

const ModifyWrapper = styled.div`
  width: 100%;
  background-color:  #EFF2F9;
  padding:40px;
`;

const Title = styled.div`
  color: #0E4D9D;
  font-family: Inter;
  font-size: 30px;
  font-weight: 600;
  
`;

const CurrentPassword = styled.div`
  /* display: flex; */
`
const PasswordWrapper=styled.div`
  font-family: Inter;
  font-size: 20px;
  font-weight: 700;
`
const CurrentPasswordTitle = styled.span`
`

const CurrentPasswordInput = styled.input`
  width: 470px;
  border:none;
  padding:10px;
  margin-left:36px;
  margin-bottom: 55px;
`
const NewPasswordTitle = styled.span`
  margin-left: 19px;
`
const NewPasswordInput = styled.input`
  width: 470px;
  border:none;
  padding:10px;
  margin-left:36px;
  margin-bottom: 55px;
`


const NewNicknameTitle = styled.span`
  font-family: Inter;
  font-size: 20px;
  font-weight: 700;
`

const NewNicknameInput = styled.input`
  width: 470px;
  border:none;
  padding:10px;
  margin-left:36px;
  margin-bottom: 55px;
`



const CheckasswordTitle = styled.span`

`
const CheckasswordInput = styled.input`
  width: 470px;
  border:none;
  padding:10px;
  margin-left:9px;
  margin-bottom: 55px;
`
const ButtonWrapper = styled.div`
  text-align: center;
`


const ModifyClickButton = styled.button`
background-color:  #0E4D9D;
color: white;
display: inline;
text-align:center;
border-radius: 5px;
`;


const ModifyClickText = styled.div`
  font-family: Inter;
  font-size: 17px;
  font-weight: 700;
  

`;

