import React from 'react';
import Comment from './comment';
import CommentDelete from './commentdelete';

interface CommentListProps {
  comments: { id: number; author: string; content: string }[];
  onDelete: (id: number) => void;
}

const CommentList: React.FC<CommentListProps> = ({ comments, onDelete }) => {
  return (
    <div className='CommentListContainer'>
      <h3>댓글 목록</h3>
      {comments.map((comment) => (
        <div key={comment.id} className='CommentListItem'>
          <Comment {...comment} />
          <CommentDelete onDelete={() => onDelete(comment.id)} />
        </div>
      ))}
    </div>
  );
};

export default CommentList;
