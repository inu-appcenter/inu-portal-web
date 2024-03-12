// import  { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Link } from 'react-router-dom';
import commentlogo from "../../resource/assets/comment-logo.png"
import { useEffect, useState } from 'react';
import getPost from '../../utils/getPost';
import { useSelector } from 'react-redux';

interface postinfoProps {
    postCommentInfo: {
      id:number;
        postId: number;
        content: string;
        category: string;
    }[];
}

interface Post {

  category: string;

}


interface loginInfo {
  user: {
    token: string;
  };
}
export default function UserComment({postCommentInfo}:postinfoProps) {
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
      <CountWrapper>
        <Commentimg src={commentlogo} />
        <CommentCount>{postCommentInfo.length}</CommentCount>
      </CountWrapper>
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

const UserCommentWrapper = styled.div`

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
