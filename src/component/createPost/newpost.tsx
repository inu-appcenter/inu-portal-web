// NewPost.tsx

import React, { useState } from 'react';

import LaunchPosts from './postlaunch';

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
        <label>Title:</label>
        <input type="text" value={title} onChange={handleTitleChange} />

        <label>Content:</label>
        <textarea value={content} onChange={handleContentChange} />

        {/* 양식추가 */}
      </form>
      <LaunchPosts title={title} content={content} category={"수강신청"} anymous={true}/>
    </div>
  );
};

export default NewPost;
