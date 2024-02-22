// import  { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Link } from 'react-router-dom';

interface postinfoProps {
    postScrapInfo: {
        id:number;
        title: string;
        category: string;
    }[];
}

export default function ScrapPost({postScrapInfo}:postinfoProps) {
    
  return (
    <ScrapWrapper>
      <CountWrapper>
        <ScrapText>All scraps</ScrapText>
        <ScrapCount>{postScrapInfo.length}</ScrapCount>
      </CountWrapper>
      <Items>
        {postScrapInfo.map((item) => (
          <PostLink  to={`/tips/${item.id}`}>
            <PostScrapItem key={item.id}>
              <p className='category'>{item.category}</p>
              <p className='title'>{item.title}</p>
          </PostScrapItem>
          </PostLink>
        ))}
      </Items>
  </ScrapWrapper>
  );
}

const ScrapWrapper = styled.div`

`;

const CountWrapper = styled.div`
  display: flex;
  margin-top: 26px;
  align-items: center;
  font-family: Inter;
font-size: 15px;
font-weight: 600;
line-height: 20px;
letter-spacing: 0px;
width: 100%;
`
const ScrapText = styled.p`
color: #969696;


`;

const ScrapCount = styled.p`
color: #0E4D9D;
margin-left:10px;
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 150px; 
  overflow-y: auto; 
`;

const PostScrapItem = styled.div`
  display: flex;
  gap:2px;
  background-color:white;
  .category {
    background-color: #a4c8e4; 
    padding:10px;
    margin:10px;
    color:white;
    font-weight: 600;
    border-radius: 10px;
  }
  .title {
    padding:10px;
    margin:10px;
    color:black;
    font-weight: 600;
    border-radius: 10px;
  }

`;

const PostLink = styled(Link)`
    text-decoration:none;
  color:black;
  box-sizing: border-box;
`;
