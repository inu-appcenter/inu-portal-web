import React from 'react';
import styled from 'styled-components';

interface   NewPasswordInputProps {
    checkpassword: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckNewPasswordInput: React.FC<NewPasswordInputProps> = ({ checkpassword, onChange }) => {
    return (
        <Wrapper>
            <NewPasswordTitle>새 비밀번호 확인</NewPasswordTitle>
            <Input
                type="password"
                value={checkpassword}
                onChange={onChange}
            />
        </Wrapper>
    );
};

const Wrapper = styled.li`
    list-style: none;
    display: flex;
    flex-direction: column;
    /* padding-bottom: 55px;
    display: flex;
    justify-content: space-between; */
`;

const NewPasswordTitle = styled.span`
margin-bottom: 20px;
    /* 원하는 스타일링을 여기에 추가하세요 */
`;

const Input = styled.input`
   /* margin-left:36px; */
   /* padding:10px 60px; */
`;

export default CheckNewPasswordInput;