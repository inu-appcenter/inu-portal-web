

import styled from 'styled-components';

import {  useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';


import NewNicknameInput from './nickname';



// import getUser from '../../../../utils/getUser';
import ModifyInfo from '../../../../utils/putNickname';

import { NicknameUser as NicknameUserAction, ProfileUser as ProfileUserAction } from "../../../../reducer/userSlice";


// import { profileimg } from '../../../../Resource/string/profileImg';
import { profileimg } from '../../../../resource/string/profileImg';
import { ProfileDropdown } from './profiledropdown';
import Title from '../../common/title';
import ModifyUserInfo from './modifyuserinfo';


interface loginInfo {
    user: {
      token: string;
    };
}

export default function ModifyMyInfo() {
    const token = useSelector((state: loginInfo) => state.user.token);



    const [newNickname, setNewNickname] = useState<string>("");
    const [newFireId, setNewFireId] = useState<string>(""); 
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

    
    const dispatch = useDispatch();

    const handleChangeImage = (image: string) => {
      console.log("선택한 이미지", Number(image.match(/\d+/)));
      setNewFireId(image);
    };

    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value)
        setNewNickname(e.target.value);
    };

    const handleModifyClick = async () => {
      try {
        console.log("new nickname , fireid ", newNickname, newFireId !== ""?String(newFireId.match(/\d+/)):"");
        const Response = await ModifyInfo(token,newNickname,newFireId !== ""?String(newFireId.match(/\d+/)):"");
        if (Response === 200) {
              alert( "이미지 변경 성공");
              dispatch(ProfileUserAction({"fireId":Number(newFireId.match(/\d+/))}));
              setNewNickname("");
        }
        else if (Response === 201) {
            alert("닉네임 변경 성공");
            dispatch(NicknameUserAction({"nickname":newNickname}));
            setNewNickname("");
        }
        else if (Response === 202) {
          alert("이미지 , 닉네임 변경 성공");
          dispatch(ProfileUserAction({"fireId":Number(newFireId.match(/\d+/))}));
          dispatch(NicknameUserAction({"nickname":newNickname}));
          setNewNickname("");
        }
        else {
          alert(Response);
          setNewNickname("");
        }

      } catch (error) {
          console.error('닉네임 변경 실패:', error);
          alert('닉네임 변경에 실패했습니다.');
      } 
  };
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // 드롭다운 상태 반전
  };

    
  return (
    <ModifyWrapper>
      <Title title={"개인정보 수정"}/>

      <ChangeWrapper>
      <ProfileChangeWrapper>
      <ModifyUserInfo />
      <ProfileChange onClick={toggleDropdown}>프로필 변경</ProfileChange>
      </ProfileChangeWrapper>
      <NicknameChangeWrapper>
        <NewNicknameInput onChange={handleNicknameChange} newNickname={newNickname}/>
      </NicknameChangeWrapper>
            
      </ChangeWrapper>
      {isDropdownOpen && (
          <ProfileDropdown images={profileimg} newFireId={newFireId} onChange={handleChangeImage} />
        )}
        <ButtonWrapper>
        <Modify onClick={handleModifyClick}>수정</Modify>
        </ButtonWrapper>

    </ModifyWrapper>
  );
}

const ModifyWrapper = styled.div`
padding: 20px 76px;
height: 100%;
`;


const ChangeWrapper = styled.div`
  display: flex;
  position: relative;
`
const ProfileChangeWrapper = styled.div`

`

const NicknameChangeWrapper=styled.ul`
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
  background: linear-gradient(90deg, #6F84E2 0%, #7BABE5 100%);
  border: 1px solid #fff;
  border-radius: 5px;
  color:white;
font-size: 17px;
font-weight: 700;
  margin-top: 20px;
  padding:6px 44px;
`


const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`
const ProfileChange = styled.button`
    width: 194px;
    margin-top: 48px;
    background: linear-gradient(90deg, #6F84E2 0%, #7BABE5 100%);
    color: white;
    font-family: Inter;
font-size: 20px;
font-weight: 700;
border: 1px solid #fff;
border-radius: 5px;
`