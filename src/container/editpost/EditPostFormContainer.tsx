import React, { useState, useEffect } from 'react';
import TitleInput from '../../component/createPost/TitleInput';
import ContentInput from '../../component/createPost/ContentInput';
import CategorySelect from '../../component/createPost/CategorySelect';
import AnonymousCheckbox from '../../component/createPost/AnonymousCheckbox';
import { useNavigate } from 'react-router-dom';
import getPost from '../../utils/getPost';
import editPost from '../../utils/editPost';
import { useSelector } from 'react-redux';

interface EditPostBtnProps {
  id:number;
  onPostUpdate: () => void;
}

const EditPostFormContainer: React.FC<EditPostBtnProps> = ({ onPostUpdate, id}) => {
  const token = useSelector((state: any) => state.user.token);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [anonymous, setAnonymous] = useState(false);

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


  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        if (id) {
          const response = await getPost(token, id);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const { title, content, category, anonymous } = await response.json();
          return { title, content, category, anonymous };
        }
      } catch (error) {
        console.error('Error fetching board:', error);
        throw error;
      }
    };

    fetchPostDetails().then((result) => {
      if (result) {
        setTitle(result.title);
        setContent(result.content);
        setCategory(result.category);
        setAnonymous(result.anonymous);
      }
    });
  }, [id, token]);

  const handleEditSubmit = async () => {
    
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
          const response = await editPost({ title, content, category, anonymous }, token, id);
          if (response) {
            console.log('Post submitted successfully');
            onPostUpdate();
            navigate(`/post/${id}`); 
          }
      } catch (error) {
        console.error('Error submitting post:', error);
      }
    
  };

  return (
    <form>
      <TitleInput value={title} onChange={handleTitleChange} />
      <ContentInput value={content} onChange={handleContentChange} />
      <CategorySelect value={category} onChange={handleCategoryChange} />
      <AnonymousCheckbox checked={anonymous} onChange={handleAnonymousChange} />

      <button onClick={handleEditSubmit}>수정 완료</button>
    </form>
  );
};

export default EditPostFormContainer;
