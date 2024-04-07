

import styled from 'styled-components';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';


import NewNicknameInput from './nickname';



import getUser from '../../../../utils/getUser';
import ModifyNickname from '../../../../utils/putNickname';
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
    const [currnetnickname, setCurrentNickname] = useState("");
    const [nickname, setNickname] = useState("");
    const [currentfireid, setCurrentFireId] = useState(0);
    // const [images,setImages] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 표시 여부 상태
    const [selectedImage, setSelectedImage] = useState<string>(profileimg[0]); 
    const dispatch = useDispatch();

    const handleChangeImage = (image: string) => {
      setSelectedImage(image);
    };

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
          setCurrentNickname(response.nickname);
          console.log("닉네임이름",currnetnickname);
          
      } catch (error) {
          console.error("회원을 가져오지 못했습니다.", error);
      }
  };

    const handleModifyClick = async () => {
      try {
        console.log("닉네임",nickname);
        console.log(selectedImage,"현재 선택된 이미지 뭐양?");
         const fireId = Number(selectedImage.match(/\d+/));
         console.log("fire아이디뭐야",fireId);
          const nicknameResponse = await ModifyNickname(token, nickname,fireId);
          if (nicknameResponse === 400) {
            alert('입력한 닉네임과 현재 닉네임이 동일합니다.');
          }
          else if(nicknameResponse === 404 ) {
            alert('존재하지 않는 회원입니다.')
          }
          else {
            console.log(nicknameResponse, "닉네임 변경 성공");
            setCurrentNickname(currnetnickname);
            setCurrentFireId(fireId);
            console.log(currentfireid);
            dispatch(NicknameUserAction({"nickname":nickname}));
            dispatch(ProfileUserAction({"fireId":fireId}));
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
        <NewNicknameInput value={nickname} onChange={handleNicknameChange}/>
      </NicknameChangeWrapper>
            
      </ChangeWrapper>
      {isDropdownOpen && (
          <ProfileDropdown images={profileimg} onChange={handleChangeImage} />
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
  position: absolute;
  bottom: 50px;
  background: linear-gradient(90deg, #6F84E2 0%, #7BABE5 100%);
  border: 1px solid #fff;
  border-radius: 5px;
  color:white;
font-size: 17px;
font-weight: 700;

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