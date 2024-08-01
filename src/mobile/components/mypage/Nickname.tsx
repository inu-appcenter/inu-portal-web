import * as React from 'react';
import styled from 'styled-components';

interface   NewPasswordInputProps {
    newNickname: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NewNicknameInput: React.FC<NewPasswordInputProps> = ({ newNickname,onChange }) => {
    return (
        <Wrapper>
            <NewNicknameTitle>닉네임</NewNicknameTitle>
            <Input
                type="text"
                value={newNickname}
                onChange={onChange}
            />
        </Wrapper>
    );
};

const Wrapper = styled.li`
    list-style: none;
    display: flex;
    flex-direction: column;
    margin: 24px;
`;

const NewNicknameTitle = styled.span`
font-size: 14px;
font-weight: 700;
line-height: 16.94px;
`;

const Input = styled.input`
    padding:10px 5px;
    border-radius: 5px;
    margin-top: 13px;
`;

export default NewNicknameInput;