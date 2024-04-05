import React from 'react';
import styled from 'styled-components';

interface   CurrentPasswordInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CurrentpasswordInput: React.FC<CurrentPasswordInputProps> = ({ value, onChange }) => {
    return (
        <Wrapper>
            <CurrentPasswordTitle>현재 비밀번호</CurrentPasswordTitle>
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

const CurrentPasswordTitle = styled.span`
`;

const Input = styled.input`
    margin-left:36px;
    padding:10px 60px;
`;

export default CurrentpasswordInput;