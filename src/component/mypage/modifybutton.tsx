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
    text-align: center;
    margin:0 auto;
`;

const StyledButton = styled.button`
    background-color: #0E4D9D;
    color: white;
    display: inline;
    text-align: center;
    border-radius: 5px;
`;

const ModifyButtonText = styled.div`
    font-family: Inter;
    font-size: 17px;
    font-weight: 700;
`;

export default ModifyButton;
