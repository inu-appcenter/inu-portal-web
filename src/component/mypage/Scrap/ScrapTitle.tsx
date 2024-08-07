import React from 'react';
import styled from 'styled-components';



const ScrapTitle: React.FC = () => {
    return (
        <Title >나의 스크랩</Title>
    );
};

const Title = styled.div`
  color: #0E4D9D;
  font-size: 30px;
  font-weight: 600;
  margin-bottom: 41px;
`;

export default ScrapTitle;