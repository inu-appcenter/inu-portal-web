import React, {useState, useEffect} from 'react';
import TitleInput from '../../component/createPost/TitleInput';
import ContentInput from '../../component/createPost/ContentInput';
import CategorySelect from '../../component/createPost/CategorySelect';
import AnonymousCheckbox from '../../component/createPost/AnonymousCheckbox';
import { useNavigate, useParams } from 'react-router-dom';
import getPost from '../../utils/getPost';
import editPost from '../../utils/editPost';
import EditPost from '../../Page/EditPostPage';
import { useSelector } from 'react-redux';

interface EditPostBtnProps {
  onPostUpdate: () => void;
}

const EditPostFormContainer :React.FC<EditPostBtnProps>= ({ onPostUpdate }) => {
  const token = useSelector((state: any) => state.user.token);
  const navigate = useNavigate();
  const {postId} = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        if (postId){
        const response = await getPost(token, postId);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } 
     } catch (error) {
        console.error('Error fetching board:', error);
        throw error;
      }
    
    };

    fetchPostDetails().then((result)=>{
      setTitle(result.title);
      setContent(result.content);
    });
  }, [postId, token])
; 

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


  const handleEditSubmit = async () => {
    try {
      if (!title.trim() || !content.trim()) {
        console.error('모든 필드를 입력하세요.');
        alert('제목과 내용을 모두 작성하세요.')
        return;
      }
      if (category.trim() ===''){
        alert('카테고리를 선택하세요!');
      return;
      }
      try{
        const response = await editPost({ title, content, category, anonymous }, token, postId);
        if(response){
          console.log('Post submitted successfully');
          onPostUpdate();
          
        }
      }
      catch (error) {
        console.error('Error submitting post:', error);
      }
    } catch (error) {
      console.error('Error editing post:', error);
    
    }
  };

  return (
    <form>
      <TitleInput value={title} onChange={handleTitleChange} />
      <ContentInput value={content} onChange={handleContentChange} />
      <CategorySelect value={category} onChange={handleCategoryChange} />
      <AnonymousCheckbox checked={anonymous} onChange={handleAnonymousChange} />


      <button onClick={handleEditSubmit} >수정 완료</button>
    </form>
  );
};

export default EditPostFormContainer;