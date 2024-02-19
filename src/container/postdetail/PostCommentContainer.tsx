import CommentList from '../../component/postdetail/comment/commentlist';
import CommentInput from '../../component/postdetail/comment/commentinput';
import React, { useState } from 'react';


interface replies {
  id: number;
  writer: string;
  content: string;
  like: number;
  isLiked: boolean;
  createDate: string;
  modifiedDate: string;
  reReplies: any;
}

interface PostCommentContainerProps {
  comments: replies[];
  onCommentUpdate: () => void; 
}

// 글의 댓글
export default function PostComment({ comments, onCommentUpdate }: PostCommentContainerProps) {
  return (
    <>
      <CommentInput onCommentUpdate={onCommentUpdate}></CommentInput>
      <CommentList comments={comments} onCommentUpdate={onCommentUpdate}></CommentList>
    </>
  );
}
