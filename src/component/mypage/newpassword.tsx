import React from 'react';
import styled from 'styled-components';

interface   NewPasswordInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NewPasswordInput: React.FC<NewPasswordInputProps> = ({ value, onChange }) => {
    return (
        <Wrapper>
            <NewPasswordTitle>새 비밀번호</NewPasswordTitle>
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
`;

const NewPasswordTitle = styled.span`
    text-align: right;
`;

const Input = styled.input`
     margin-left:36px;
     padding:10px 60px;
`;

export default NewPasswordInput;