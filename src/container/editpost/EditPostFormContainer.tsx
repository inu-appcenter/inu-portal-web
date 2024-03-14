import React, { useState, useEffect } from 'react';
import TitleInput from '../../component/createPost/TitleInput';
import ContentInput from '../../component/createPost/ContentInput';
import CategorySelect from '../../component/createPost/CategorySelect';
import AnonymousCheckbox from '../../component/createPost/AnonymousCheckbox';
import { useNavigate, useParams } from 'react-router-dom';
import getPost from '../../utils/getPost';
import editPost from '../../utils/editPost';
import { useSelector } from 'react-redux';
import getPostsImages from '../../utils/getPostsImages';
import editImage from '../../utils/editImage';
import ImageInput from '../../component/createPost/ImageInput';



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

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [fetchImages, setfetchImages] = useState<string[]>([]);
  const [imageCount, setImageCount] = useState<number>(0);


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

console.log(images);

  const handleImageRemove = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
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
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
      setImageCount(post.imageCount);
    }
  }, [post])

  const fetchImagesData = async () => {
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


  useEffect(() => {
    fetchImagesData();
  }, [id, imageCount]);

  const handleEditSubmit = async () => {
    try {
      if (!title.trim() || !content.trim()) {
        console.error('모든 필드를 입력하세요.');
        alert('제목과 내용을 모두 작성하세요.');
        return;
      }
      if (content.length > 1999) {
        alert('내용은 2000자 이하로 작성해 주세요.');
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
          const postId = response.data;
  
          // 이미지 수정
          
            try {
              const responseImage = await editImage(token, postId,  images);
              if (responseImage) {
                console.log(`이미지 수정 성공`);
              }
            } catch (error) {
              console.error(`Error editing image`, error);
            }
          
  
          onPostUpdate();
          navigate(-1);
        }
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };
  
  
  return (
    <div className='EditPostFormContainer'>
      <div className='bar'>
      <ImageInput onImageChange={handleImageChange} />
      <AnonymousCheckbox checked={anonymous} onChange={handleAnonymousChange} />
      <div className='post-button' onClick={handleEditSubmit}>수정 완료</div>
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
        </div>
      <CategorySelect value={category} onChange={handleCategoryChange} />
      </div>
      
  );
};

export default EditPostFormContainer;
