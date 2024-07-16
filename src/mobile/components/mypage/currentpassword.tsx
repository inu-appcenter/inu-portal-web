import React from 'react';
import styled from 'styled-components';

interface   CurrentPasswordInputProps {
    currentpassword: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CurrentpasswordInput: React.FC<CurrentPasswordInputProps> = ({ currentpassword, onChange }) => {
    return (
        <Wrapper>
            <CurrentPasswordTitle>현재 비밀번호</CurrentPasswordTitle>
            <Input
                type="password"
                value={currentpassword}
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

const CurrentPasswordTitle = styled.span`
margin-bottom: 20px;
`;

const Input = styled.input`
    /* margin-left:36px;
    padding:10px 60px; */
`;

export default CurrentpasswordInput;