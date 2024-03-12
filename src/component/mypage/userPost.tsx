// import  { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Link } from 'react-router-dom';
import postlogo from "../../resource/assets/comment-logo.png"
import SortDropDown from './sortdropdown';

interface  postinfo {
        id: number;
        title: string;
        category: string;
}

interface PostinfoProps {
  postinfo: postinfo[],
  onSearchTypeChange:  (type: string) => void;
}

export default function UserPost({postinfo,onSearchTypeChange}:PostinfoProps) {
    
  return (
    <UserPostWrapper>

            <Wrapper>
            <CountWrapper>
      <Postimg src={postlogo} />
      <PostCount>{postinfo.length}</PostCount>
    </CountWrapper>
      <SortWrapper>
        <ScrapText>sort by</ScrapText>
        <SortDropDown onSearchTypeChange={onSearchTypeChange} />
      </SortWrapper>
      </Wrapper>
   
    <Items>
        {postinfo.map((item) => (
          <PostLink  to={`/tips/${item.id}`}>
            <PostItem key={item.id}>
              <p className='category'>{item.category}</p>
              <p className='title'>{item.title}</p>
          </PostItem>
          </PostLink>
        ))}
      </Items>
</UserPostWrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
`
const SortWrapper = styled.div`
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
const UserPostWrapper = styled.div`

`;

const CountWrapper = styled.div`
  display: flex;
  margin-top: 26px;
  align-items: center;
`
const Postimg = styled.img`
  width: 24px;
  height: 20px;
`;

const PostCount = styled.p`
font-family: Inter;
font-size: 15px;
font-weight: 600;
margin-left: 15px;
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 150px; 
  overflow-y: auto; 
`;

const PostItem = styled.div`
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


