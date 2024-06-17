import styled from 'styled-components';
import TitleContentInput from '../../components/write/TitleContentInput';
import PhotoUpload from '../../components/write/PhotoUpload';
import AnonymousCheck from '../../components/write/AnonymousCheck';
import { useEffect, useState } from 'react';
import { getImages, getPost, postImages, postPosts, putImages, putPost } from '../../../utils/API/Posts';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface WriteFormProps {
  idProps?: string;
  category: string;
  setCategory: (value: string) => void;
  typeProps: string;
}

export default function WriteForm({ idProps, category, setCategory, typeProps }: WriteFormProps) {
  const token = useSelector((state: any) => state.user.token);
  const id = idProps;
  const type = typeProps;
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageCount, setImageCount] = useState<number>(0);
  const navigate = useNavigate();

  // setPost, 수정 권한 확인
  useEffect(() => {
    if (type === 'update' && id) {
      const fetchPost = async () => {
        const response = await getPost(token, id);
        if (response.status === 200) {
          if (!response.body.data.hasAuthority) {
            window.alert('수정 권한이 없습니다');
            navigate(-1);
          } else {
            setPost(response.body.data);
          }
        } else {
          alert(`${response.status} (${response.body.msg})`);
          navigate(-1);
        }
      };
      fetchPost();
    }
    else {
      setPost(null);
    }
  }, [type, id]);

  // post 변경 시 set
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
      setImageCount(post.imageCount);
    }
    else {
      setTitle('');
      setContent('');
      setCategory('');
      setImageCount(0);
    }
  }, [post]);

  // 이미지 찾기
  useEffect(() => {
    const fetchImages = async () => {
      if (imageCount === 0) {
        setImages([]);
        return;
      }
      if (id === undefined) {
        return;
      }
      let images: File[] = [];
      for (let imageId = 1; imageId <= imageCount; imageId++) {
        try {
          const response = await getImages(id, imageId);
          if (response.status === 200) {
            const imageBlob = response.body;
            const imageFile = new File([imageBlob], `image_${imageId}.png`);
            images.push(imageFile);
          }
        } catch (error) {
          console.error(`Error fetching image:`, error);
          // 이미지를 찾지 못해도 계속 진행
        }
      }
      setImages(images);
    };
    fetchImages();
  }, [id, imageCount]);

  // 업로드 버튼 클릭
  const handleUpload = async () => {
    if (content.length > 1999) {
      alert('내용은 2000자 이하로 작성해 주세요.');
      return;
    }
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 작성해 주세요.');
      return;
    }
    if (category.trim() === '') {
      alert('카테고리를 선택해 주세요.');
      return;
    }
    try {
      if (type === 'create') {
        let postId;
        const response = await postPosts({ title, content, category, anonymous }, token);
        if (response.status === 201) {
          postId = response.body.data;
          if (images.length) {
            const responseImage = await postImages(token, postId, images);
            if (responseImage.status === 201) {
              window.alert('게시글 등록 성공');
              navigate(`/m/tips/${postId}`);
            }
          } else {
            window.alert('게시글 등록 성공');
            navigate(`/m/tips/${postId}`);
          }
        } else if (response.status === 404) {
          console.error('존재하지 않는 회원입니다.', response.status);
          alert('존재하지 않는 회원입니다.');
        } else {
          console.error('게시글 등록 실패:', response.status);
        }
      } else if (type === 'update') {
        if (id === undefined) {
          console.error('ID is undefined');
          return;
        }
        let postId = id;
        const response = await putPost({ title, content, category, anonymous }, token, postId);
        if (response.status === 200) {
          if (images.length) {
            const responseImage = await putImages(token, postId, images);
            if (responseImage.status === 200) {
              window.alert('게시글 수정 성공');
              navigate(`/m/tips/${postId}`);
            }
          } else {
            window.alert('게시글 수정 성공');
            navigate(`/m/tips/${postId}`);
          }
        } else if (response.status === 403) {
          console.error('이 게시글의 수정/삭제에 대한 권한이 없습니다.', response.status);
          alert('이 게시글의 수정/삭제에 대한 권한이 없습니다.');
        } else {
          console.error('게시글 수정 실패:', response.status);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImages((prevImages) => [...prevImages, file]);
    }
  };

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <WriteFormWrapper>
      <TitleContentInput title={title} onTitleChange={(value: string) => setTitle(value)} content={content} onContentChange={(value: string) => setContent(value)} />
      <PhotoUpload images={images} onImageChange={handleImageChange} onImageRemove={handleImageRemove} />
      <AnonymousCheck checked={anonymous} onChange={(checked: boolean) => setAnonymous(checked)} />
      <UploadButton onClick={handleUpload}>업로드</UploadButton>
    </WriteFormWrapper>
  );
}

const WriteFormWrapper = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const UploadButton = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  background: #ADC7EC;
`;
