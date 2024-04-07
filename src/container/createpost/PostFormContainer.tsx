import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TitleInput from '../../component/createPost/TitleInput';
import ContentInput from '../../component/createPost/ContentInput';
import CategorySelect from '../../component/createPost/CategorySelect';
import AnonymousCheckbox from '../../component/createPost/AnonymousCheckbox';
import { useSelector } from 'react-redux';
import ImageInput from '../../component/createPost/ImageInput';
import launchPost from '../../utils/launchPost';
import postImage from '../../utils/postImage';
import './PostFormContainer.css'
import CanCelWriteModal from '../../component/createPost/CanCelWriteModal';

CanCelWriteModal

interface PostFormProps {
  onPostSubmit: () => void;
}

const PostFormContainer: React.FC<PostFormProps> = ({ onPostSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const token = useSelector((state: any) => state.user.token); 
  const navigate = useNavigate();
  
  // 글 작성 중인지 여부를 확인하는 useEffect
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => { 
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

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
    if (file) {
      setImages((prevImages) => [...prevImages, file]);
    }
  };

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  }

  const handlePostSubmit = async () => {
    try {
      // 각 필드가 비어있지 않은지 검사
      if (!title.trim() || !content.trim()) {
        console.error('모든 필드를 입력하세요.');
        alert('제목과 내용을 모두 작성하세요.')
        return;
      }
      if (content.length > 1999) {
        alert('내용은 2000자 이하로 작성해 주세요.');
        return;
      }
      if (category.trim() ===''){
        alert('카테고리를 선택하세요!');
      return;
      }
      let postId;
      try {
        const response = await launchPost({ title, content, category, anonymous }, token);
        if (response) {
          console.log('Post submitted successfully');
          postId = response.data;
          
            const responseImage = await postImage(token, postId, images);
            if (responseImage) {
              console.log(`이미지 등록 성공`);
            }
          }
        }
      catch (error) {
        console.log(error);
      }
      // 게시 성공 후 부모 컴포넌트에서 전달한 콜백 함수 호출
      onPostSubmit();
      navigate(`/tips/${postId}`);
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };
  const handleCloseModal = () => {
    setShowCancelModal(false);
  };

  // 글 작성 취소 함수
  const handleCancelWrite = () => {
    setShowCancelModal(false);
    // 글 작성 중이던 내용 초기화
    setTitle('');
    setContent('');
    setCategory('');
    setAnonymous(false);
    setImages([]);
    // 이전 페이지로 이동
  };
  return (
    <div className='PostFormContainer'>
      <div className='bar'>
        <ImageInput onImageChange={handleImageChange} />
        <AnonymousCheckbox checked={anonymous} onChange={handleAnonymousChange} />
        <div className='post-button' onClick={handlePostSubmit}>업로드</div>
      </div>
      <div className='container1'>
        <div className='container2'>
          <TitleInput value={title} onChange={handleTitleChange} />
          <div className='write-line'></div>
          <ContentInput value={content} onChange={handleContentChange} />
          <div className='write-line'></div>
          <div>
            {images.map((image, index) => (
              <div key={index} style={{ position: 'relative', display: 'inline-block', margin: '10px' }}>
                <img src={URL.createObjectURL(image)} alt={`preview ${index}`} style={{ maxWidth: '200px', maxHeight: '200px' }} />
                <button onClick={() => handleImageRemove(index)} style={{ position: 'absolute', top: 0, right: 0 }}>X</button>
              </div>
            ))}
          </div>
        </div>
        <CategorySelect value={category} onChange={handleCategoryChange} />
      </div>
      {showCancelModal && <CanCelWriteModal setOpenModal={handleCancelWrite} closeModal={handleCloseModal} />}
    </div>
  );
};

export default PostFormContainer;
