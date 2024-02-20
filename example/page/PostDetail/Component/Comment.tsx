import React from 'react';

interface CommnetProps {
  author: string;
  content: string;
}

const Comment: React.FC<CommnetProps> = ({ author, content }) => {
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
