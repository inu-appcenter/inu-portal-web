// import  { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import getUserPost from '../../utils/getUserPost';
import { useEffect, useState } from 'react';


import getUserLikePost from '../../utils/getUserLikePost';

import getUserComment from '../../utils/getUserComment';

import UserComment from './usercomment';
import ActiveTitle from './activetitle';
import LikePost from './likepost';
import UserPost from './userpost';

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
  postId:number;
  content: string;
  category:string;
}

export default function ActiveInfo() {
  const [PostInfo, setPostInfo] = useState<PostInfo[]>([]); 
  const [PostLikeInfo, setPostLikeInfo] = useState<PostInfo[]>([]); 
  const [PostCommentInfo, setPostCommentInfo] = useState<CommentInfo[]>([]); 
  const token = useSelector((state: loginInfo) => state.user.token);
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
        console.log(CommentInfo.data,'댓글');

      } catch (error) {
        console.error('에러가 발생했습니다.', error);
        alert('게시에 실패하였습니다.');
      }
    };

    CommentPostInfo(); 
  }, [token]); 


  return (
    <ActiveWrapper>
      <ActiveTitle/>
      <LikePost postLikeInfo ={PostLikeInfo}/>
      <UserComment postCommentInfo = {PostCommentInfo}/>
      <UserPost postinfo={PostInfo}/>

  </ActiveWrapper>
  );
}

const ActiveWrapper = styled.div`
  background-color:  #EFF2F9;
  padding:2.5rem 5rem;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items:stretch;
`;

