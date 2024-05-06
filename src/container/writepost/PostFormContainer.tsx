import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TitleInput from '../../component/createPost/TitleInput';
import ContentInput from '../../component/createPost/ContentInput';
import CategorySelect from '../../component/createPost/CategorySelect';
import AnonymousCheckbox from '../../component/createPost/AnonymousCheckbox';
import { useSelector } from 'react-redux';
import ImageInput from '../../component/createPost/ImageInput';
import launchPost from '../../utils/launchPost';
import postImage from '../../utils/postImage';
import './PostFormContainer.css'
import inuLogoImg from '../../resource/assets/inu-logo-img.svg';
import getPost from '../../utils/getPost';
import editPost from '../../utils/editPost';
import editImage from '../../utils/editImage';
import getPostsImages from '../../utils/getPostsImages';

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


const PostFormContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const token = useSelector((state: any) => state.user.token);
  const [type, setType] = useState('');
  const [post, setPost] = useState<Post|null>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageCount, setImageCount] = useState<number>(0);
  const navigate = useNavigate();

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
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

  useEffect(() => {
    if (location.pathname.includes('/update')) {
      setType('update');
    }
    else if (location.pathname.includes('/write')) {
      setType('create');
    }
  });

  // setPost, 수정 권한 확인
  useEffect(() => {
    if (type == 'update' && id) {
      const fetchPost = async () => {
        const postDetail = await getPost(token, id);
        setPost(postDetail);
        if (!postDetail.hasAuthority) {
          window.alert('수정 권한이 없습니다');
          window.close();
        }
      };
      fetchPost();
    }
  }, [id, token]);

  // post 변경 시 set
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
      setImageCount(post.imageCount);
    }
  }, [post]);

  //
  useEffect(() => {
    const fetchImagesData = async () => {
      if (id === undefined) {
        console.log('ID is undefined');
        return;
      }
      try {
        let images = [];
        for (let imageId = 1; imageId <= imageCount; imageId++) {
          try {
          const imageUrl = await getPostsImages(id, imageId);
          const imageBlob = await fetch(imageUrl).then((res) => res.blob());
          const imageFile = new File([imageBlob], `image_${imageId}.png`);
          images.push(imageFile);
        } catch (error) {
          console.error(`Error fetching image:`, error);
          // 이미지를 찾지 못해도 계속 진행
          }
        }
        setImages(images);
        console.log(images);
        
      } catch (error) {
        console.error(error);
      }
    };
    fetchImagesData();
  }, [id, imageCount]);

  // 버튼 클릭
  const handlePostSubmit = async () => {
    if (content.length > 1999) {
      alert('내용은 2000자 이하로 작성해 주세요.');
      return;
    }
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 작성해 주세요.'); 
      return;
    }
    if (category.trim() ===''){
      alert('카테고리를 선택해 주세요.');
      return;
    }
    try {
      if (type == 'create') {
        let postId;
        const response = await launchPost({ title, content, category, anonymous}, token);
        if (response) {
          postId = response.data;
          if (images.length) {
            const responseImage = await postImage(token, postId, images);
            if (responseImage) {
              window.alert('게시글 등록 성공');
              window.close();
            }
          }
          else {
            window.alert('게시글 등록 성공');
            window.close();
          }
        }
      }
      else if (type == 'update') {
        if (id === undefined) {
          console.error('ID is undefined');
          return;
        }
        let postId = id;
        const response = await editPost({ title, content, category, anonymous }, token, postId);
        if (response) {
          if (images.length) {
            const responseImage = await editImage(token, postId, images);
            if (responseImage) {
              window.alert('게시글 수정 성공');
              window.close();
            }
          }
          else {
            window.alert('게시글 수정 성공');
            window.close();
          }
        }
      }
    }
    catch (error) {
      console.error(error);
    }
  };

  // 나갈 때 경고
  const handleGetOut = () =>{
    const result = window.confirm('해당 페이지를 나가시겠습니까? 변경사항이 저장되지 않을 수 있습니다.')
    if (result) {
      navigate('/');
    } else {
      return;
    }
  };

  return (
    <div className='PostFormContainer'>
      <div className='bar'>
      <img onClick={handleGetOut} 
      src={inuLogoImg} 
      alt="INU logo" 
      style={{ width: '180px',cursor: 'pointer'}} />
        <div className='PostForm-buttons'>
          <ImageInput onImageChange={handleImageChange} />
          <AnonymousCheckbox checked={anonymous} onChange={handleAnonymousChange} />
          <div className='post-button' onClick={handlePostSubmit}>
            {type=='create'? <span>업로드</span> : <span>수정 완료</span>}
          </div>
        </div>
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
    </div>
  );
};

export default PostFormContainer;
