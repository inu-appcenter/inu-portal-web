import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TitleInput from '../../component/createPost/TitleInput';
import ContentInput from '../../component/createPost/ContentInput';
import CategorySelect from '../../component/createPost/CategorySelect';
import AnonymousCheckbox from '../../component/createPost/AnonymousCheckbox';
import { useSelector } from 'react-redux';
// import ImageInput from '../../component/createPost/ImageInput';
import launchPost from '../../utils/launchPost';
// import postImage from '../../utils/postImage';
import getPost from '../../utils/getPost';

interface EditPostFormProps {
  postId: string;
  onPostSubmit: () => void;
}

const EditPostFormContainer: React.FC<EditPostFormProps> = ({
  onPostSubmit,
  postId,
}) => {
  

  useEffect(() => {
    // 게시물 정보를 불러와서 초기값으로 설정
    const fetchPostData = async () => {
      try {
        const data = await getPost(token, postId);
        setTitle(data.title);
        setContent(data.content);
        setCategory(data.category);
        setAnonymous(data.anonymous);
        // 이미지를 설정하는 로직도 필요하다면 여기에 추가
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPostData();
  }, [postId]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  // const [images, setImages] = useState<File[]>([]);
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

  // const handleImageChange = (file: File | null) => {
  //   setSelectedImage(file);
  //   if (file) {
  //     setImages((prevImages) => [...prevImages, file]);
  //   }
  // };

  // const handleImageRemove = (index: number) => {
  //   setImages(images.filter((_, i) => i !== index));
  // };

  const handleSave = () => {
    alert('저장은 아직 미구현');
  };

  const handlePostSubmit = async () => {
    try {
      // 각 필드가 비어있지 않은지 검사
      if (!title.trim() || !content.trim()) {
        console.error('모든 필드를 입력하세요.');
        alert('제목과 내용을 모두 작성하세요.');
        return;
      }
      if (category.trim() === '') {
        alert('카테고리를 선택하세요!');
        return;
      }

      try {
        const response = await launchPost(
          { title, content, category, anonymous },
          token
        );
        // if (response) {
        //   console.log('Post submitted successfully');
        //   const postId = response.data;
        //   const responseImage = await postImage(token, postId, images);
        //   if (responseImage) {
        //     console.log(`이미지 등록 성공`);
        //   }
        // }
      } catch (error) {
        console.log(error);
      }
      // 게시 성공 후 부모 컴포넌트에서 전달한 콜백 함수 호출
      onPostSubmit();
      navigate(`/tips`);
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  return (
    <div className='PostFormContainer'>
      <div className='bar'>
        {/* <ImageInput onImageChange={handleImageChange} /> */}
        <AnonymousCheckbox
          checked={anonymous}
          onChange={handleAnonymousChange}
        />
        <div className='post-button' onClick={handleSave}>
          저장
        </div>
        <div className='post-button' onClick={handlePostSubmit}>
          업로드
        </div>
      </div>
      <div className='container1'>
        <div className='container2'>
          <TitleInput value={title} onChange={handleTitleChange} />
          <div className='write-line'></div>
          <ContentInput value={content} onChange={handleContentChange} />
          {/* <div className='write-line'></div>
          <div>
            {images.map((image, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  margin: '10px',
                }}
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt={`preview ${index}`}
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
                <button
                  onClick={() => handleImageRemove(index)}
                  style={{ position: 'absolute', top: 0, right: 0 }}
                >
                  X
                </button>
              </div>
            ))}
              </div>*/}
        </div> 
        <CategorySelect value={category} onChange={handleCategoryChange} />
      </div>
    </div>
  );
};

export default EditPostFormContainer;
