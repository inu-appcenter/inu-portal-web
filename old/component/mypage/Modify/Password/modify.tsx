import styled from "styled-components";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import CurrentpasswordInput from "./currentpassword";
import NewPasswordInput from "./newpassword";
import CheckNewPasswordInput from "./checknewpassword";
import ModifyButton from "./modifybutton";
import { getMembers } from "old/utils/API/Members";
import ModifyPassword from "../../../../utils/putPassword";
import Title from "../../common/title";

interface loginInfo {
  user: {
    token: string;
  };
}

export default function ModifyInfo() {
  const token = useSelector((state: loginInfo) => state.user.token);
  const [currentpassword, setCurrentpassword] = useState("");
  const [newpassword, setNewpassword] = useState("");
  const [checkpassword, setCheckPassword] = useState("");
  const [currnetnickname, setCurrentNickname] = useState("");
  const navigate = useNavigate();

  const handleCurrentPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCurrentpassword(e.target.value);
    console.log(currentpassword);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewpassword(e.target.value);
  };

  const handleCheckNewPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
        console.error("존재하지 않는 회원입니다.");
      } else {
        console.error("회원 정보 가져오기 실패:", response.status);
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
        const response = await ModifyPassword(
          token,
          currentpassword,
          newpassword,
        );
        console.log(response, "비밀번호 변경 결과:", response);
        if (response.status === 401) {
          alert("비밀번호가 틀립니다.");
        } else if (response.status === 404) {
          alert("존재하지 않는 회원입니다.");
        } else {
          alert("비밀번호 변경 성공");
          navigate("/mypage");
        }
      } catch (error) {
        console.error("비밀번호 변경 에러:", error);
        alert("비밀번호 변경에 실패했습니다.");
      }
    }
  };

  return (
    <ModifyWrapper>
      <Title title={"비밀번호 변경"} />
      <ChangeWrapper>
        <CurrentpasswordInput
          value={currentpassword}
          onChange={handleCurrentPasswordChange}
        />
        <NewPasswordInput
          value={newpassword}
          onChange={handleNewPasswordChange}
        />
        <CheckNewPasswordInput
          value={checkpassword}
          onChange={handleCheckNewPasswordChange}
        />
      </ChangeWrapper>
      <ModifyButton onClick={handleModifyClick} />
      <LostBtn to="/">비밀번호를 잊으셨나요?</LostBtn>
    </ModifyWrapper>
  );
}

const ModifyWrapper = styled.div`
  padding: 20px 76px;
`;

const ChangeWrapper = styled.ul`
  font-size: 20px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  width: 500px;
`;

const LostBtn = styled(Link)`
  width: 415px;
  display: flex;
  margin-left: 40px;
  justify-content: flex-end;
  font-size: 17px;
  font-weight: 500;
  color: #0e4d9d;
  text-decoration: none;
`;
