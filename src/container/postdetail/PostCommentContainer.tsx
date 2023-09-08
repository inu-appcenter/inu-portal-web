import Comment from '../../component/postdetail/comment/comment';
import CommentInput from '../../component/postdetail/comment/commentinput';
import CommentList from '../../component/postdetail/comment/commentlist';
import React, { useState } from 'react';

interface CommentData {
  id: number;
  author: string; // 작성자 추가
  content: string;
  editable: boolean;
}

// 글의 댓글
export default function PostComment() {
  const [comments, setComments] = useState<CommentData[]>([]);

  const handleSubmit = (content: string) => {
    const newComment = { id: Date.now(), author: 'Anonymous', content, editable: false };
    setComments([...comments, newComment]);
  };

  return (
    <>
      <CommentInput onAddComment={handleSubmit} />
      <CommentList comments={comments} onDelete={function (id: number): void {
        throw new Error('Function not implemented.');
      } } />
    </>
  );
}
