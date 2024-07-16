import React from 'react';
import styled from 'styled-components';

interface   NewPasswordInputProps {
    newpassword: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NewPasswordInput: React.FC<NewPasswordInputProps> = ({ newpassword, onChange }) => {
    return (
        <Wrapper>
            <NewPasswordTitle>새 비밀번호</NewPasswordTitle>
            <Input
                type="password"
                value={newpassword}
                onChange={onChange}
            />
        </Wrapper>
    );
};

const Wrapper = styled.li`
    list-style: none;
    display: flex;
    flex-direction: column;
    /* list-style: none;
    padding-bottom: 55px;
    display: flex;
    justify-content: space-between; */
`;

const NewPasswordTitle = styled.span`
margin-bottom: 20px;
    /* text-align: right; */
`;

const Input = styled.input`
     /* margin-left:36px;
     padding:10px 60px; */
`;

export default NewPasswordInput;