import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getPost } from '../../utils/API/Posts';
import PostContentContainer from '../containers/postdetail/PostContentContainer';
import PostUtilContainer from '../containers/postdetail/PostUtilContainer';

export default function PostDetail() {
  const token = useSelector((state: any) => state.user.token);
  const [post, setPost] = useState<Post | null>(null);
  const [id, setId] = useState('');

  useEffect(() => {
    if (location.pathname.includes('/tips/postdetail')) {
      const params = new URLSearchParams(location.search);
      setId(params.get('id') || '');
      if (id) {
        const fetchPost = async () => {
          const response = await getPost(token, id);
          if (response.status === 200) {
            setPost(response.body.data);
          }
        };
        fetchPost();
      }
    }
  }, [location.pathname, id]);

  return (
    <>
      {post ? (
        <>
          <PostWrapper>
            <PostUtilContainer id={post.id} like={post.like} isLiked={post.isLiked} scrap={post.scrap} isScraped={post.isScraped} hasAuthority={post.hasAuthority} />
            <PostContentContainer
              id={post.id}
              title={post.title}
              createDate={post.createDate}
              view={post.view}
              writer={post.writer}
              content={post.content}
              imageCount={post.imageCount}
              category={post.category}
              hasAuthority={post.hasAuthority}
            />
            
          </PostWrapper>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}


const PostWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  margin-top: 20px;
`;
