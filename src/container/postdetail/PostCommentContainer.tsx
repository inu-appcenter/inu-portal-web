import Comment from '../../component/PostDetail/comment';
import CommentForm from '../../component/PostDetail/commentform';
import CommentList from '../../component/PostDetail/commentlist';
import React, { useState } from 'react';

interface CommentData {
  author: string;
  content: string;
}

//글의 댓글
export default function PostComment() {
  const [comments, setComments] = useState<CommentData[]>([]);

  const addComment = (author: string, content: string): void => {
    const newComment = { author, content };
    setComments([...comments, newComment]);
  };

  return (
    <>
      <Comment author={''} content={''} />
      <CommentForm
        onAddComment={function (author: string, content: string): void {}}
      />
      <CommentList comments={[]} />
      <CommentForm onAddComment={addComment} />
      <CommentList comments={comments} />
    </>
  );
}
