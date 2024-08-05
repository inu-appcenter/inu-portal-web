// ModifyButton.tsx

import React from 'react';
import styled from 'styled-components';

interface ModifyButtonProps {
    onClick: () => void;
}

const ModifyButton: React.FC<ModifyButtonProps> = ({ onClick }) => {
    return (
        <ButtonWrapper>
            <StyledButton onClick={onClick}>
                <ModifyButtonText>비밀번호 변경</ModifyButtonText>
            </StyledButton>
        </ButtonWrapper>
    );
};

const ButtonWrapper = styled.div`

    /* width: 350px;
    display: flex;
    margin-left: 40px;
    justify-content: flex-end;
    margin-bottom: 48px; */

`;

const StyledButton = styled.button`
    /* background: linear-gradient(90deg, #6F84E2 0%, #7BABE5 100%);
    color: white;
    display: inline;
    text-align: center;
    border-radius: 10px;
    border: 1px solid white;
    padding:6px 5px; */
    width: 100%;
    background-color: #0E4D9D;
    border-radius: 5px;

`;

const ModifyButtonText = styled.div`
font-family: Inter;
font-size: 18px;
font-weight: 700;
line-height: 21.78px;
color: white;
/* font-size: 17px;
font-weight: 700; */
`;

export default ModifyButton;
