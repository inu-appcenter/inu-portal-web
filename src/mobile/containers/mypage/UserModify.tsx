import styled from "styled-components";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  NicknameUser as NicknameUserAction,
  ProfileUser as ProfileUserAction,
} from "../../../reducer/userSlice";
import NewNicknameInput from "../../components/mypage/Nickname";
import { profileimg } from "../../../resource/string/profileImg";
import { putMembers } from "../../../utils/API/Members";
import { ProfileDropdown } from "../../components/mypage/ProfielImg";
import { useNavigate } from "react-router-dom";
import BackImg from "../../../resource/assets/backbtn.svg";
interface loginInfo {
  user: {
    token: string;
  };
}

export default function UserModify() {
  const token = useSelector((state: loginInfo) => state.user.token);
  const [newNickname, setNewNickname] = useState<string>("");
  const [newFireId, setNewFireId] = useState<string>("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChangeImage = (image: string) => {
    console.log("선택한 이미지", Number(image.match(/\d+/)));
    setNewFireId(image);
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setNewNickname(e.target.value);
  };

  const handleModifyClick = async () => {
    try {
      console.log(
        "new nickname , fireid ",
        newNickname,
        newFireId !== "" ? String(newFireId.match(/\d+/)) : ""
      );
      const response = await putMembers(
        token,
        newNickname,
        newFireId !== "" ? String(newFireId.match(/\d+/)) : ""
      );

      if (response.status === 200) {
        alert(response.body.msg);
        if (newNickname) {
          dispatch(NicknameUserAction({ nickname: newNickname }));
        }
        if (newFireId) {
          dispatch(
            ProfileUserAction({ fireId: Number(newFireId.match(/\d+/)) })
          );
        }
        setNewNickname("");
        setNewFireId("");
      } else if (response.status === 400 || response.status === 404) {
        alert(response.body.msg);
        setNewNickname("");
        setNewFireId("");
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
        setNewNickname("");
        setNewFireId("");
      }
    } catch (error) {
      console.error("닉네임 변경 실패:", error);
      alert("닉네임 변경에 실패했습니다.");
    }
  };

  return (
    <UserModifyWrapper>
      <BackButton onClick={() => navigate("/m/mypage")}>
        <img src={BackImg} alt="뒤로가기 버튼" />
      </BackButton>
      <NewNicknameInput
        onChange={handleNicknameChange}
        newNickname={newNickname}
      />
      <ProfileDropdown
        images={profileimg}
        newFireId={newFireId}
        onChange={handleChangeImage}
      />
      <ButtonWrapper>
        <Modify onClick={handleModifyClick}>수정</Modify>
      </ButtonWrapper>
    </UserModifyWrapper>
  );
}

const UserModifyWrapper = styled.div`
  position: absolute;
  top: 310px;
  width: 100%;
  /* padding: 20px 76px;
  height: 100%; */
`;

const BackButton = styled.div`
  margin: 20px 24px 0;
  background-color: white;
  font-size: 14px;
  font-weight: 700;
  line-height: 16.94px;
  img {
    width: 15px;
    height: 15px;
  }
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Modify = styled.button`
  /* background: linear-graient(90deg, #6F84E2 0%, #7BABE5 100%);
  border: 1px solid #fff;
  border-radius: 5px;
  color: white;
  font-size: 17px;
  font-weight: 700;
  margin-top: 20px;
  padding: 6px 44px; */
  margin: 0 24px;
  box-sizing: border-box;
  margin-bottom: 90px;
  background-color: #0e4d9d;
  border: 1px solid white;
  color: white;
  width: 100%;
  padding: 12px;
  border-radius: 5px;
`;
