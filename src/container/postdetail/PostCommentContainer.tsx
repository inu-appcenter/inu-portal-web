import CommentList from '../../component/postdetail/comment/commentlist';
import CommentInput from '../../component/postdetail/comment/commentinput';
import React, { useState } from 'react';

interface Replies {
  id: number;
  writer: string;
  content: string;
  like: number;
  isLiked: boolean;
  isAnonymous: boolean;
  createDate: string;
  modifiedDate: string;
  reReplies: Replies[];
}


interface PostCommentContainerProps {
  comments: Replies[];
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
