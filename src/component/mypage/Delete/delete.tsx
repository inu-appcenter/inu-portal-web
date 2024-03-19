

import styled from 'styled-components';

import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useNavigate } from 'react-router-dom';
import DeleteUser from '../../../utils/deleteUser';
import { loginUser as loginUserAction } from "../../../reducer/userSlice";

import Title from "../common/title"
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

    const onCheckedItem = useCallback(
      (checked: boolean) => {
        if (checked) {
          setCheckedList(true);
        } else if (!checked) {
          setCheckedList(false);
        }
      },
      [checkedList]
    );

    const handleModifyClick = async () => {
        if(checkedList == true) {
              try {
                const response = await DeleteUser(token);
                console.log(response);
                dispatch(loginUserAction({email: "", token:""}));
                navigate('/');
      
          
              } catch (error) {
                console.error('로그인 에러:', error);
              }
            }   
        
        else {
            alert('체크박스를 선택해주세요');
        }
    
    }
  return (
    <DeleteWrapper>
        <Title title={"회원탈퇴"}/>
        <DeleteTotalWrapper>
        <Check>📌 INTIP 회원탈퇴 시 유의사항</Check>
        <Input></Input>
        <Checkbox>
            <input
                type='checkbox'
                onChange={(e) => {
                    onCheckedItem(e.target.checked);
                }}
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
  display  : flex;
align-items: center;
  flex-direction: column;
`

const Check = styled.div`
    font-size: 20px;
    font-weight: 700;
`;


const Input = styled.input`
    width: 672px;
    height:381px;
    border: none;
    margin-top: 40px;
`;

const Checkbox = styled.div`
font-family: Inter;
font-size: 15px;
font-weight: 400;
margin-top: 35px;
&input {
  margin-right: 2px;
}
`;




const ModifyClickButton = styled.button`
background-color: #0E4D9D;
font-family: Inter;
font-size: 15px;
font-weight: 400;
line-height: 20px;
letter-spacing: 0px;
text-align: left;
color:white;
padding:5px 156px;
margin-top: 34px;
border-radius: 5px;
text-align: center;
`;

