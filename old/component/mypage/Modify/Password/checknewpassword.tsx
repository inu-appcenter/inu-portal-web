import React from 'react';
import styled from 'styled-components';

interface   NewPasswordInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckNewPasswordInput: React.FC<NewPasswordInputProps> = ({ value, onChange }) => {
    return (
        <Wrapper>
            <NewPasswordTitle>새 비밀번호 확인</NewPasswordTitle>
            <Input
                type="password"
                value={value}
                onChange={onChange}
            />
        </Wrapper>
    );
};

const Wrapper = styled.li`
    list-style: none;
    padding-bottom: 55px;
    display: flex;
    justify-content: space-between;
`;

const NewPasswordTitle = styled.span`
    /* 원하는 스타일링을 여기에 추가하세요 */
`;

const Input = styled.input`
   margin-left:36px;
   padding:10px 60px;
`;

export default CheckNewPasswordInput;