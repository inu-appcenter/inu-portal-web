import React from 'react';
import styled from 'styled-components';



const ActiveTitle: React.FC = () => {
    return (
        <Title >내 활동</Title>
    );
};

const Title = styled.div`
  color: #0E4D9D;
  font-size: 30px;
  font-weight: 600;
  margin-bottom: 24px;
`;

export default ActiveTitle;