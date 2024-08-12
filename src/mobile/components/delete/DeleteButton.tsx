import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { deleteMembers } from "../../../utils/API/Members";
import { useDispatch, useSelector } from 'react-redux';
import { tokenUser as tokenUserAction, studentIdUser as studentIdUserAction }  from "../../../reducer/userSlice";

interface loginInfo {
    user: {
      token: string;
    };
}
export default function DeleteButton() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = useSelector((state: loginInfo) => state.user?.token);
    // 계정 삭제 핸들러
    const handleModifyClick = async () => {
          try {
            const response = await deleteMembers(token);
            if (response.status === 200) {
              console.log(response);
              dispatch(studentIdUserAction({ studentId: "" }));
              dispatch(tokenUserAction({ token: "" }));
              navigate('/');
            } else {
              alert('탈퇴 실패');
            }
          } catch (error) {
            console.error('회원 탈퇴 에러:', error);
          }
    } 
      

    return (
        <ButtonWrapper>
            <UserCancelButton onClick={() => navigate(-1)}>
                취소
            </UserCancelButton>
            <UserDeleteButton onClick={()=>handleModifyClick()}>
                계정 삭제
            </UserDeleteButton>
        </ButtonWrapper>
    );
}

const ButtonWrapper = styled.div`
    display: flex;
    padding:0 40px;
    justify-content: space-between;
`;

const UserCancelButton = styled.button`
    background-color: #F0F0F0;
    border: none;
    padding: 10px 60px;
    cursor: pointer;
    font-family: Roboto;
    font-size: 14px;
    font-weight: 500;
    color:#0E4D9D;
    border-radius: 10px;
    box-sizing: border-box;
`;

const UserDeleteButton = styled.button`
    background-color: #F0F0F0;
    border: none;
    padding: 10px 50px;
    cursor: pointer;
    font-family: Roboto;
    font-size: 14px;
    font-weight: 500;
    color:#DF5532;
    border-radius: 10px;
    box-sizing: border-box;
`;

