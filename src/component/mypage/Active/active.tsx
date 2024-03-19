// import  { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import getUserPost from '../../../utils/getUserPost';
import { useEffect, useState } from 'react';


import getUserLikePost from '../../../utils/getUserLikePost';

import getUserComment from '../../../utils/getUserComment';

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
    id: number;
    title: string;
    category: string;
    writer: string;
    content: string;
    like: number;
    scrap: number;
    createDate: string;
    modifiedDate: string;
  }

  interface CommentInfo {
    id:number;
    content: string;
    like:number;
    postId:number;
    createDate : string;
    modifiedDate: string;
}

interface ActiveDocumentsProps {
  likesort: string;
  commentsort: string;
  postsort: string;

  setLikeSort: (sort: string) => void;
  setCommentSort:(sort: string) => void;
  setPostSort:(sort: string) => void;
}



export default function ActiveInfo({likesort,commentsort,postsort,setLikeSort,setCommentSort,setPostSort}:ActiveDocumentsProps) {
  const [PostInfo, setPostInfo] = useState<PostInfo[]>([]); 
  const [PostLikeInfo, setPostLikeInfo] = useState<PostInfo[]>([]); 
  const [PostCommentInfo, setPostCommentInfo] = useState<CommentInfo[]>([]); 
  const token = useSelector((state: loginInfo) => state.user.token);

  useEffect(() => {
    const fetchPostInfo = async () => {
      try {
        const PostInfo = await getUserPost(token,postsort);
        setPostInfo(PostInfo.data); 
        console.log(PostInfo);
      } catch (error) {
        console.error('에러가 발생했습니다.', error);
        alert('게시에 실패하였습니다.');
      }
    };

    fetchPostInfo(); 
  }, [token,postsort]); 

  useEffect(() => {
    const likePostInfo = async () => {
      try {
        const LikeInfo = await getUserLikePost(token,likesort);
        setPostLikeInfo(LikeInfo.data); 
        console.log(LikeInfo);
      } catch (error) {
        console.error('에러가 발생했습니다.', error);
        alert('게시에 실패하였습니다.');
      }
    };

    likePostInfo(); 
  }, [token,likesort]); 

  useEffect(() => {
    const CommentPostInfo = async () => {
      try {
        const CommentInfo = await getUserComment(token,commentsort);
        setPostCommentInfo(CommentInfo.data); 
        console.log(CommentInfo.data,'댓글');

      } catch (error) {
        console.error('에러가 발생했습니다.', error);
        alert('게시에 실패하였습니다.');
      }
    };

    CommentPostInfo(); 
  }, [token,commentsort]); 


  return (
    <ActiveWrapper>
      <ActiveTitle/>
      <LikePost postLikeInfo ={PostLikeInfo} likesort={likesort} setLikeSort={setLikeSort}/>
      <UserComment postCommentInfo = {PostCommentInfo}  commentsort={commentsort} setCommentSort={setCommentSort}/>
      <UserPost postinfo={PostInfo}  postsort={postsort} setPostSort={setPostSort} />

  </ActiveWrapper>
  );
}



const ActiveWrapper = styled.div`
  padding:20px 76px;
`