import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TitleInput from '../../component/createPost/TitleInput';
import ContentInput from '../../component/createPost/ContentInput';
import CategorySelect from '../../component/createPost/CategorySelect';
import PostService from '../../component/createPost/PostService';
import AnonymousCheckbox from '../../component/createPost/AnonymousCheckbox';
import { useSelector } from 'react-redux';
import ImageInput from '../../component/createPost/ImageInput';

interface PostFormProps {
  onPostSubmit: () => void;
}

const PostFormContainer: React.FC<PostFormProps> = ({ onPostSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const token = useSelector((state: any) => state.user.token); 
  const navigate = useNavigate();

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    console.log(value)
  };

  const handleAnonymousChange = (checked: boolean) => {
    setAnonymous(checked);
  };

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
  };

  const handlePostSubmit = async () => {
    try {
      // 각 필드가 비어있지 않은지 검사
      if (!title.trim() || !content.trim()) {
        console.error('모든 필드를 입력하세요.');
        alert('제목과 내용을 모두 작성하세요.')
        return;
      }

      // 서버로의 통신은 PostService에서 담당
      await PostService.submitPost({ title, content, category, anonymous, image: selectedImage }, token);

      console.log('Post submitted successfully');


      
      // 게시 성공 후 부모 컴포넌트에서 전달한 콜백 함수 호출
      onPostSubmit();
      navigate(`/tips`);
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  return (
    <div>
      <TitleInput value={title} onChange={handleTitleChange} />
      <ContentInput value={content} onChange={handleContentChange} />
      <CategorySelect value={category}  onChange={handleCategoryChange} />
      <AnonymousCheckbox checked={anonymous} onChange={handleAnonymousChange} />
      <ImageInput onImageChange={handleImageChange} />
      <button onClick={handlePostSubmit}>게시 버튼</button>
    </div>
  );
};

export default PostFormContainer;
