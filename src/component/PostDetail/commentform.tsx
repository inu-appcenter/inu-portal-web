import React, { useState } from 'react';
import '../Post.css'

interface CommentFormProps {
  onAddComment: (author: string, content: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onAddComment }) => {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddComment(author, content);
    setAuthor('');
    setContent('');
  };

  return (
    <div className='CommentInputBox'>
      <form onSubmit={handleSubmit}>
        <label className='CommentWriter'>
          작성자  
          <input
            type='text'
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </label>
        <br />
        <label className='CommentContent'> 
          <textarea
            value={content}
            placeholder='댓글을 입력하세요.'
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </label>
        
        <button type='submit'>등록</button>
      </form>
    </div>
  );
};

export default CommentForm;
