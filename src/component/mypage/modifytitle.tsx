import React from 'react';
import styled from 'styled-components';



const ModifyTitle: React.FC = () => {
    return (
        <Title >비밀번호 변경</Title>
    );
};

const Title = styled.div`
  color: #0E4D9D;
  font-family: Inter;
  font-size: 30px;
  font-weight: 600;
  
`;

export default ModifyTitle;