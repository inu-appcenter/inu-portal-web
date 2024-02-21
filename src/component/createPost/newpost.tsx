
import React, { useState } from 'react';

const NewPost: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div>
      <h2>Create New Post</h2>
      <form>
        <label>제목</label>
        <input 
        type='text' 
        value={title} 
        onChange={handleTitleChange} />

        <label>내용</label>
        <textarea 
        value={content} 
        onChange={handleContentChange} />
      </form>
    </div>
  );
};

export default NewPost;
