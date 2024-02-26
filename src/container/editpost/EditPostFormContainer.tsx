import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TitleInput from '../../component/createPost/TitleInput';
import ContentInput from '../../component/createPost/ContentInput';
import CategorySelect from '../../component/createPost/CategorySelect';
import AnonymousCheckbox from '../../component/createPost/AnonymousCheckbox';
import { useSelector } from 'react-redux';
import ImageInput from '../../component/createPost/ImageInput';
import editPost from '../../utils/editPost';
import getPost from '../../utils/getPost';
import editImage from '../../utils/editImage'; // Import the editImage function

interface EditPostFormProps {
  onPostSubmit: () => void;
}

const EditPostFormContainer: React.FC<EditPostFormProps> = ({ onPostSubmit }) => {
  const { id } = useParams<{ id:any }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const navigate = useNavigate();
  const token = useSelector((state: any) => state.user.token);

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    console.log(value);
  };

  const handleAnonymousChange = (checked: boolean) => {
    setAnonymous(checked);
  };

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
    if (file) {
      setImages((prevImages) => [...prevImages, file]);
    }
  };

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    alert('저장은 아직 미구현');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPost(token, id);
        setTitle(data.title);
        setContent(data.content);
        setCategory(data.category);
        setAnonymous(data.anonymous);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchData();
  }, [token, id]);

  const handlePostSubmit = async () => {
    try {
      if (!title.trim() || !content.trim()) {
        console.error('모든 필드를 입력하세요.');
        alert('제목과 내용을 모두 작성하세요.');
        return;
      }
      if (category.trim() === '') {
        alert('카테고리를 선택하세요!');
        return;
      }

      // Edit post
      const response = await editPost({ title, content, category, anonymous }, id, token);
      if (response) {
        console.log('Post submitted successfully');
        const id = response.data; 
        
        // Edit image
        const editImageResponse = await editImage(token, id, images); 
        if (editImageResponse) {
          console.log('이미지 등록 성공');
        }
      }
    } catch (error) {
      console.error('Error submitting post:', error);
    }

    // Call the callback function
    onPostSubmit();

    // Navigate to '/tips'
    navigate(`/tips`);
  };

  return (
    <>
      <div className='bar'>
        <ImageInput onImageChange={handleImageChange} />
        <AnonymousCheckbox checked={anonymous} onChange={handleAnonymousChange} />
        <div className='post-button' onClick={handleSave}>
          저장
        </div>
        <div className='post-button' onClick={handlePostSubmit}>
          업로드
        </div>
      </div>
      <TitleInput value={title} onChange={(value) => setTitle(value)} />
      <ContentInput value={content} onChange={(value) => setContent(value)} />
      <CategorySelect value={category} onChange={(value) => setCategory(value)} />
      <button onClick={handlePostSubmit}>Submit</button>
    </>
  );
};

export default EditPostFormContainer;
