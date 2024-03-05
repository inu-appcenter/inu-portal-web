import React, { useState, useEffect } from 'react';
import TitleInput from '../../component/createPost/TitleInput';
import ContentInput from '../../component/createPost/ContentInput';
import CategorySelect from '../../component/createPost/CategorySelect';
import AnonymousCheckbox from '../../component/createPost/AnonymousCheckbox';
import { useNavigate, useParams } from 'react-router-dom';
import getPost from '../../utils/getPost';
import editPost from '../../utils/editPost';
import { useSelector } from 'react-redux';

interface EditPostBtnProps {
  onPostUpdate: () => void;
}

interface Post {
  id: number;
  title: string;
  category: string;
  writer: string;
  content: string;
  like: number;
  scrap: number;
  view: number;
  isLiked: boolean;
  isScraped: boolean;
  hasAuthority: boolean;
  createDate: string;
  modifiedDate: string;
  imageCount: number;
  bestReplies: Replies;
  replies: Replies[];
}

interface Replies {
  id: number;
  writer: string;
  content: string;
  like: number;
  isLiked: boolean;
  isAnonymous: boolean;
  hasAuthority: boolean;
  createDate: string;
  modifiedDate: string;
  reReplies: Replies[];
}

const EditPostFormContainer: React.FC<EditPostBtnProps> = ({ onPostUpdate}) => {
  const { id } = useParams<{ id: string }>();
  const token = useSelector((state: any) => state.user.token);
  const navigate = useNavigate();
  const [post, setPost] = useState<Post|null>();
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
    console.log('id', id);
      if (id) {
          const fetchPost = async () => {
            const postDetail = await getPost(token, id);
            setPost(postDetail);
          };
          fetchPost();
      }
  }, [id, token]);

  useEffect(() => {
    console.log(post);
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
    }
  }, [post])

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
