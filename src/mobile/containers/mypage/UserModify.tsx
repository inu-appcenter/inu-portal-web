import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getMembers } from "../../../utils/API/Members";
import ModifyPassword from "../../../utils/putPassword";
import styled from "styled-components";
import ModifyButton from "../../components/mypage/modifybutton";
import NewPasswordInput from "../../components/mypage/newpassword";
import CheckNewPasswordInput from "../../components/mypage/checknewpassword";
import CurrentpasswordInput from "../../components/mypage/currentpassword";

interface loginInfo {
    user: {
      token: string;
    };
  }
  

export default function UserModify () {

    const token = useSelector((state: loginInfo) => state.user.token);
    const [currentpassword, setCurrentpassword] = useState("");
    const [newpassword, setNewpassword] = useState("");
    const [checkpassword, setCheckPassword] = useState("");
    const [currnetnickname, setCurrentNickname] = useState("");
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
  
    useEffect(() => {
      handleUserInfo();
    }, []);
  
    const handleUserInfo = async () => {
      try {
        const response = await getMembers(token);
        if (response.status === 200) {
          const userInfo = response.body.data;
          setCurrentNickname(userInfo.nickname);
          console.log("닉네임이름", currnetnickname);
        } else if (response.status === 404) {
          console.error('존재하지 않는 회원입니다.');
        } else {
          console.error('회원 정보 가져오기 실패:', response.status);
        }
      } catch (error) {
        console.error("회원을 가져오지 못했습니다.", error);
      }
    };
  
    const handleModifyClick = async () => {
      if (newpassword !== checkpassword) {
        alert("비밀번호가 일치하지 않습니다.");
      } else {
        try {
          const response = await ModifyPassword(token, currentpassword, newpassword);
          console.log(response, "비밀번호 변경 결과:", response);
          if (response.status === 401) {
            alert('비밀번호가 틀립니다.');
          } else if (response.status === 404) {
            alert('존재하지 않는 회원입니다.');
          } else {
            alert('비밀번호 변경 성공');
            navigate('/mypage');
          }
        } catch (error) {
          console.error('비밀번호 변경 에러:', error);
          alert('비밀번호 변경에 실패했습니다.');
        }
      }
    };

    
    return (
        <UserModifyWrapper>
            <CurrentpasswordInput onChange={handleCurrentPasswordChange} currentpassword={currentpassword}/>
             <NewPasswordInput onChange={handleNewPasswordChange} newpassword={newpassword} />
             <CheckNewPasswordInput  onChange={handleCheckNewPasswordChange} checkpassword={checkpassword}/>
            <ModifyButton onClick={handleModifyClick}/>
        </UserModifyWrapper>
    )
}

const UserModifyWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    justify-content: flex-end;
    height: 85%;
    input {
        padding: 10px;
        border-radius: 5px;
    }
`