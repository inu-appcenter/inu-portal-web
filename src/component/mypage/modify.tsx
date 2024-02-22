

import styled from 'styled-components';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ModifyUser from '../../utils/PutUser';
import { Link, useNavigate } from 'react-router-dom';
import MyInfo from './info';
import CurrentpasswordInput from './currentpassword';
import NewPasswordInput from './newpassword';
import CheckNewPasswordInput from './checknewpassword';
import NewNicknameInput from './nickname';
import ModifyTitle from './modifytitle';
import ModifyButton from './modifybutton';
import postPasswordCheck from '../../utils/postCheckPassword';
import getUser from '../../utils/getUser';

interface loginInfo {
    user: {
      token: string;
    };
}
interface PasswordResponse {
  data: boolean;
  msg: string;
}
export default function ModifyInfo() {
    const token = useSelector((state: loginInfo) => state.user.token);
    const [currentpassword, setCurrentpassword] = useState("");
    const [newpassword, setNewpassword] = useState("");
    const [checkpassword, setCheckPassword] = useState("");
    const [currnetnickname, setCurrentNickname] = useState("");
    const [nickname, setNickname] = useState("");

    const navigate = useNavigate();


    const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentpassword(e.target.value);
      console.log(currentpassword);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewpassword(e.target.value);
  };

  const handleCheckNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCheckPassword(e.target.value);
      
  };


    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          const passwordResponse:PasswordResponse = await postPasswordCheck(token, currentpassword);
          console.log(passwordResponse, "비밀번호 일치 여부:", passwordResponse.data);
          
          if (passwordResponse.data && newpassword === checkpassword && nickname !== "") {
              const data = {
                  password: checkpassword,
                  nickname: nickname
              };
              try {
                  const response = await ModifyUser(token, data);
                  console.log(response, "비밀번호 변경 결과:", response);
  
                  navigate('/');
              } catch (error) {
                  console.error('비밀번호 변경 에러:', error);
                  alert('비밀번호 변경에 실패했습니다.');
              }
          } else {
              if(passwordResponse.data == false) {
                alert("현재 비밀번호가 틀렸습니다.");
              }
              else if (nickname === "") {
                  alert("닉네임을 입력해주세요");
              } else {
                  alert("비밀번호가 일치하지 않습니다.");
              }
          }
      } catch (error) {
          console.error('비밀번호 확인 에러:', error);
          alert('비밀번호 확인에 실패했습니다.');
      }
  };
    
    
  return (
    <ModifyWrapper>
      <ModifyTitle/>
      <MyInfo nickname={currnetnickname} />
      <ChangeWrapper>
        <CurrentpasswordInput value={currentpassword} onChange={handleCurrentPasswordChange}/>
        <NewPasswordInput value={newpassword} onChange={handleNewPasswordChange}/>
        <CheckNewPasswordInput value={checkpassword} onChange={handleCheckNewPasswordChange}/>
        <NewNicknameInput value={nickname} onChange={handleNicknameChange}/>
      </ChangeWrapper>
      <ModifyButton onClick={handleModifyClick}/>
      <LostBtn to="/home">비밀번호를 잃어버리셨습니까?</LostBtn>
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
const LostBtn = styled(Link)`
  font-family: Inter;
font-size: 17px;
font-weight: 700;
line-height: 20px;
letter-spacing: 0px;
margin: 0 auto;
color: #0e4d9d;
margin-top: 72px;
text-decoration: none;
`