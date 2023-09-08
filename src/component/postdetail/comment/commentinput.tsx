import React, { useState } from 'react';

interface CommentInputProps {
  onAddComment: (content: string) => void;
}

const CommentInput: React.FC<CommentInputProps> = ({ onAddComment }) => {
  const [comment, setComment] = useState('');

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => setComment(event.target.value);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAddComment(comment);
    setComment('');
  };

  return (
    <div className='CommentInputBox'>
      <form onSubmit={handleSubmit}>
        {/* 주석 처리된 작성자 필드 부분
        <label className='CommentWriter'>
          작성자  
          <input
            type='text'
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </label> */}
        <br />
        <label className='CommentContent'>
          <textarea
            value={comment}
            placeholder='댓글을 입력하세요.'
            onChange={onChange}
          ></textarea>
        </label>

        <button className='commentbtn' type='submit'>등록</button>
      </form>
    </div>
  );
};

export default CommentInput;
