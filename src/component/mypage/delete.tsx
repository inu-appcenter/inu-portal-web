

import styled from 'styled-components';

import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useNavigate } from 'react-router-dom';
import DeleteUser from '../../utils/deleteUser';
import { loginUser as loginUserAction } from "../../reducer/userSlice";

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
    <ModifyWrapper>
        <h2>회원탈퇴</h2>
        <p>INTIP 회원탈퇴 시 유의사항</p>
        {/* label을 사용하여 체크박스와 텍스트를 함께 렌더링 */}
        <label>
            <input
                type='checkbox'
                onChange={(e) => {
                    onCheckedItem(e.target.checked);
                }}
            />
            회원탈퇴 후 3일간 재가입 불가에 대해 동의합니다
        </label>
       <ModifyClickButton onClick={handleModifyClick}>
        <ModifyClickText>회원탈퇴</ModifyClickText>
      </ModifyClickButton>
    </ModifyWrapper>
  );
}
const ModifyWrapper = styled.div`


`;


const ModifyClickButton = styled.button`

`;

const ModifyClickText = styled.div`

`;