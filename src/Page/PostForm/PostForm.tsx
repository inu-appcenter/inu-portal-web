import React, { useState } from 'react';

interface PostFormProps {
  onSubmit: (title: string, body: string) => void;
  onTemporarySave: (title: string, body: string) => void;
}

const PostForm: React.FC<PostFormProps> = ({ onSubmit, onTemporarySave }) => {
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  const handleBodyChange = (value: string) => {
    setBody(value);
  };

  const handlePost = () => {
    if (title.trim() !== '' && body.trim() !== '') {
      onSubmit(title, body);
    } else {
      alert('제목과 본문 내용을 입력하세요');
    }
  };

  const handleTemporarySave = () => {
    onTemporarySave(title, body);
  };

  return (
    <div>
      <input
        type='text'
        placeholder='제목'
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
      />
      <textarea
        placeholder='본문을 작성하세요'
        value={body}
        onChange={(e) => handleBodyChange(e.target.value)}
      />

      <div>
        <button onClick={handlePost}>게시</button>
        <button onClick={handleTemporarySave}>임시 저장</button>
      </div>
    </div>
  );
};

export default PostForm;
