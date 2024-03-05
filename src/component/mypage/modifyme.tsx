

import styled from 'styled-components';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import MyInfo from './info';

import NewNicknameInput from './nickname';
import ModifyTitle from './modifytitle';


import getUser from '../../utils/getUser';
import ModifyNickname from '../../utils/putNickname';
import { NicknameUser as NicknameUserAction } from "../../reducer/userSlice";

interface loginInfo {
    user: {
      token: string;
    };
}

export default function ModifyMyInfo() {
    const token = useSelector((state: loginInfo) => state.user.token);
    const [currnetnickname, setCurrentNickname] = useState("");
    const [nickname, setNickname] = useState("");
    const dispatch = useDispatch();

    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value)
        setNickname(e.target.value);
    };

    useEffect(() => {
      handleUserInfo();
  }, []);

  const handleUserInfo = async () => {
      try {
          const response = await getUser(token);
          console.log(response);
          setCurrentNickname(response);
          console.log("닉네임이름",currnetnickname);
          
      } catch (error) {
          console.error("회원을 가져오지 못했습니다.", error);
      }
  };

    const handleModifyClick = async () => {
      try {
        console.log("닉네임",nickname);
          const nicknameResponse = await ModifyNickname(token, nickname);
          console.log(nicknameResponse, "닉네임 변경 성공");
          setCurrentNickname(nickname);
          dispatch(NicknameUserAction({"nickname":nickname}));
      } catch (error) {
          console.error('닉네임 변경 실패:', error);
          alert('닉네임 변경에 실패했습니다.');
      } 
  };
    
    
  return (
    <ModifyWrapper>
      <ModifyTitle/>
      <MyInfo />
      <ChangeWrapper>
        <ProfileChange>프로필 변경</ProfileChange>
        <span>닉네임 변경</span>
        <NewNicknameInput value={nickname} onChange={handleNicknameChange}/>
      </ChangeWrapper>
      <Modify onClick={handleModifyClick}>수정</Modify>
    </ModifyWrapper>
  );
}

const ModifyWrapper = styled.div`
  background-color:  #EFF2F9;
  padding:2.5rem 5rem;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: flex-start;
`;



const ChangeWrapper=styled.ul`
  font-family: Inter;
font-size: 20px;
font-weight: 700;
line-height: 20px;
letter-spacing: 0px;
text-align: right;
padding-right: 10%;
display: flex;
flex-direction: column;
`

const Modify = styled.button`
`
const ProfileChange = styled.button`
    
`