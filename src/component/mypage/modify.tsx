

import styled from 'styled-components';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import ModifyUser from '../../utils/PutUser';
import { useNavigate } from 'react-router-dom';

interface loginInfo {
    user: {
      token: string;
    };
  }

export default function ModifyInfo() {
    const token = useSelector((state: loginInfo) => state.user.token);
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

        <input
                type="passowrd"  
                placeholder="비밀번호"
                value={password}
                onChange={handlePasswordChange}
       />
      <div className="line"></div>
      <input
        type="nickname"
        placeholder="닉네임"
        value={nickname}
        onChange={handleNicknameChange}
      />
       <ModifyClickButton onClick={handleModifyClick}>
        <ModifyClickText>변경</ModifyClickText>
      </ModifyClickButton>
    </ModifyWrapper>
  );
}

const ModifyWrapper = styled.div`


`;


const ModifyClickButton = styled.button`

`;

const ModifyClickText = styled.div`

`;

