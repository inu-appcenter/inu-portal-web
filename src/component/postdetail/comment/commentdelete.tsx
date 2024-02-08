import React from 'react';

interface CommentDeleteProps {
  onDelete: () => void;
}

const CommentDelete: React.FC<CommentDeleteProps> = ({ onDelete }) => {
  return (
    <button className="delete-btn" onClick={onDelete}>
      삭제
    </button>
  );
};

export default CommentDelete;
