import React from 'react';
import styled from 'styled-components';


interface TitleProps {
    title: string;
}

// React.FC 타입에 TitleProps 추가
const Title: React.FC<TitleProps> = ({ title }) => {
    return (
        <TitleInfo>{title}</TitleInfo>
    );
};

const TitleInfo = styled.div`
  color: #0E4D9D;
  font-size: 30px;
  font-weight: 600;
  margin-bottom: 72px;
  width: 420px;
`;

export default Title;
