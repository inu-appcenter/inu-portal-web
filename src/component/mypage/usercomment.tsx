// import  { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Link } from 'react-router-dom';
import commentlogo from "../../resource/assets/comment-logo.png"
import { useEffect, useState } from 'react';
import getPost from '../../utils/getPost';
import { useSelector } from 'react-redux';
import SortDropDown from './sortdropdown';

interface postCommentInfo {
      id:number;
        postId: number;
        content: string;
        category: string;
    
}

interface Post {

  category: string;

}


interface loginInfo {
  user: {
    token: string;
  };
}

interface CommentInfoProps {
  postCommentInfo: postCommentInfo[],
  onSearchTypeChange:  (type: string) => void;
}


export default function UserComment({postCommentInfo,onSearchTypeChange}:CommentInfoProps) {
  const [postInfo, setPostInfo] = useState<Post[]>([]);
  const token = useSelector((state: loginInfo) => state.user.token);

  useEffect(() => {
    const fetchPost = async () => {
      const ids = postCommentInfo.map(comment => comment.postId);
      const posts: Post[] = [];
      for (const id of ids) {
        const postDetail = await getPost(token, id);
        posts.push({ category: postDetail.category });
        console.log(posts, "gmdma");
      }
      setPostInfo(posts);
      console.log(postInfo);
    };

    fetchPost();
}, [postCommentInfo]);
  return (
    <UserCommentWrapper>
      {/* <CountWrapper>
        <Commentimg src={commentlogo} />
        <CommentCount>{postCommentInfo.length}</CommentCount>
      </CountWrapper> */}
          <Wrapper>
          <CountWrapper>
            <Commentimg src={commentlogo} />
            <CommentCount>{postCommentInfo.length}</CommentCount>
          </CountWrapper>
        <SortWrapper>
          <ScrapText>sort by</ScrapText>
          <SortDropDown onSearchTypeChange={onSearchTypeChange} />
        </SortWrapper>
    </Wrapper>
      <Items>
      {postCommentInfo.map((item,index) => (
  <PostLink  to={`/tips/${item.postId}`} key={item.id}>
    <CommentPostItem>
    <p className='category'>{postInfo[index]?.category}</p>
      <p className='title'>{item.content}</p>
    </CommentPostItem>
  </PostLink>
))}
      </Items>
  </UserCommentWrapper>
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

const UserCommentWrapper = styled.div`

`;
const ScrapText = styled.p`
color: #969696;


`;
const CountWrapper = styled.div`
  display: flex;
  margin-top: 26px;
  align-items: center;
`
const Commentimg = styled.img`
  width: 24px;
  height: 20px;
`;

const CommentCount = styled.p`
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

const CommentPostItem = styled.div`
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
