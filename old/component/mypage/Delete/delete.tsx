import styled from "styled-components";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteMembers } from "../../../utils/API/Members";
import {
  tokenUser as tokenUserAction,
  studentIdUser as studentIdUserAction,
} from "../../../reducer/userSlice";
import Title from "../common/title";
import SubContent from "../../../mobile/components/delete/SubContent";

interface loginInfo {
  user: {
    token: string;
  };
}

export default function DeleteInfo() {
  const token = useSelector((state: loginInfo) => state.user.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [checkedList, setCheckedList] = useState(false);

  const onCheckedItem = useCallback((checked: boolean) => {
    setCheckedList(checked);
  }, []);

  const handleModifyClick = async () => {
    if (checkedList) {
      try {
        const response = await deleteMembers(token);
        if (response.status === 200) {
          console.log(response);
          dispatch(studentIdUserAction({ studentId: "" }));
          dispatch(tokenUserAction({ token: "" }));
          navigate("/");
        } else {
          alert("탈퇴 실패");
        }
      } catch (error) {
        console.error("회원 탈퇴 에러:", error);
      }
    } else {
      alert("체크박스를 선택해주세요");
    }
  };

  return (
    <DeleteWrapper>
      <Title title={"회원탈퇴"} />
      <DeleteTotalWrapper>
        <Check>📌 INTIP 회원탈퇴 시 유의사항</Check>
        <SubContent />
        <Checkbox>
          <input
            type="checkbox"
            onChange={(e) => onCheckedItem(e.target.checked)}
          />
          회원탈퇴 후 3일간 재가입 불가에 대해 동의합니다
        </Checkbox>
        <ModifyClickButton onClick={handleModifyClick}>
          회원탈퇴
        </ModifyClickButton>
      </DeleteTotalWrapper>
    </DeleteWrapper>
  );
}

const DeleteWrapper = styled.div`
  padding: 20px 76px;
  height: 100%;
`;

const DeleteTotalWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const Check = styled.div`
  font-size: 20px;
  font-weight: 700;
`;

const Checkbox = styled.div`
  font-size: 15px;
  font-weight: 400;
  margin-top: 35px;
  & input {
    margin-right: 2px;
  }
`;

const ModifyClickButton = styled.button`
  background-color: #0e4d9d;
  font-size: 15px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0px;
  text-align: left;
  color: white;
  padding: 5px 156px;
  margin-top: 34px;
  border-radius: 5px;
  text-align: center;
`;
