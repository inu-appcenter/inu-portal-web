// EditPostPage.tsx
import EditPostFormContainer from '../container/editpost/EditPostFormContainer';
import styled from 'styled-components';
// // import getPost from '../utils/getPost';
import { useSelector } from 'react-redux';
// import { useEffect, useState } from 'react';
// import { Route, useParams, useNavigate } from 'react-router-dom';

export default function EditPost() {
  const token = useSelector((state: any) => state.user.token);
  // const { id } = useParams<{ id: string }>();
  // const [post, setPost] = useState<any>({});
  // const [title, setTitle] = useState('');
  // const [content, setContent] = useState('');
  // const [postUpdated, setPostUpdated] = useState(false);
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (id) {
  //     const fetchData = async () => {
  //       try {
  //         const postData = await getPost(token, id);
  //         setPost(postData);
  //         setTitle(postData.title);
  //         setContent(postData.content);
  //       } catch (error) {
  //         console.error('Error fetching post:', error);
  //       }
  //     };

  //     fetchData();
  //   }
  // }, [id, postUpdated, token]);

  // const handlePostUpdate = () => {
  //   setPostUpdated(true);
  // };

  // const handlePostSubmit = () => {
  //   // 이 부분에 필요한 로직을 추가해주세요
  //   // 예를 들어, 게시물 업데이트 후에 할 작업 등을 여기에 추가할 수 있습니다.
  //   console.log('Post submitted successfully');
  //   navigate(`/tips`); // 예시로 '/tips'로 이동하는 코드 추가
  // };

  return (
    <EditPostWrapper>
      <EditPostFormContainer onPostSubmit={() => console.log('Post submitted!')} />
    </EditPostWrapper>
  );
}

const EditPostWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
