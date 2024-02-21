// import  { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import getUserPost from '../../utils/getUserPost';
import { useEffect, useState } from 'react';


import getUserLikePost from '../../utils/getUserLikePost';
import UserPost from './userPost';
import getUserComment from '../../utils/getUserComment';
import LikePost from './likePost';
import UserComment from './usercomment';

interface loginInfo {
    user: {
      token: string;
    };
  }

interface PostInfo {
  // 스크랩 정보의 타입 정의
  id: number;
  title: string;
  category:string;
}

interface CommentInfo {
  // 스크랩 정보의 타입 정의
  id: number;
  content: string;
  category:string;
}

export default function ActiveInfo() {
  const [PostInfo, setPostInfo] = useState<PostInfo[]>([]); 
  const [PostLikeInfo, setPostLikeInfo] = useState<PostInfo[]>([]); 
  const [PostCommentInfo, setPostCommentInfo] = useState<CommentInfo[]>([]); 
  const token = useSelector((state: loginInfo) => state.user.token);
  console.log(PostInfo,"정보1");
  console.log(PostLikeInfo,"정보2");
  console.log(PostCommentInfo,"정보2");
  useEffect(() => {
    const fetchPostInfo = async () => {
      try {
        const PostInfo = await getUserPost(token);
        setPostInfo(PostInfo.data); 
        console.log(PostInfo);
      } catch (error) {
        console.error('에러가 발생했습니다.', error);
        alert('게시에 실패하였습니다.');
      }
    };

    fetchPostInfo(); 
  }, [token]); 

  useEffect(() => {
    const likePostInfo = async () => {
      try {
        const LikeInfo = await getUserLikePost(token);
        setPostLikeInfo(LikeInfo.data); 
        console.log(LikeInfo);
      } catch (error) {
        console.error('에러가 발생했습니다.', error);
        alert('게시에 실패하였습니다.');
      }
    };

    likePostInfo(); 
  }, [token]); 

  useEffect(() => {
    const CommentPostInfo = async () => {
      try {
        const CommentInfo = await getUserComment(token);
        setPostCommentInfo(CommentInfo.data); 
        console.log(CommentInfo);
      } catch (error) {
        console.error('에러가 발생했습니다.', error);
        alert('게시에 실패하였습니다.');
      }
    };

    CommentPostInfo(); 
  }, [token]); 


  return (
    <ScrapWrapper>
      <LikePost postLikeInfo ={PostLikeInfo}/>
      <UserComment postCommentInfo = {PostCommentInfo}/>
      <div>dadaf</div>
      <UserPost postinfo={PostInfo}/>
      <div>dadaf</div>

  </ScrapWrapper>
  );
}

const ScrapWrapper = styled.div`
width: 100%;
  background-color:  #EFF2F9;
  padding:40px;
`;

