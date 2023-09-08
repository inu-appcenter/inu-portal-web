import React from 'react';

interface CommentProps {
  author: string; // 작성자 입력 시 (author, content)로 변경
  content: string;
}

const Comment: React.FC<CommentProps> = ({ author, content }) => {
  return (
    <div className='CommnetBox'>
      <div className='CBox-profile'>
        <div className='CBox-img'></div>
        <div className='CBox-name'>{author}</div>
      </div>
      <div className='CBox-comment'>
        <div className='comment-inbox'>{content}</div>
      </div>
    </div>
  );
};

export default Comment;
