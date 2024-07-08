import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getPost } from '../../utils/API/Posts';
import PostContentContainer from '../containers/postdetail/PostContentContainer';


interface Post {
  id: string;
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
  bestReplies: Replies[];
  replies: Replies[];
}

export default function PostDetail() {
  const token = useSelector((state: any) => state.user.token);
  const [post, setPost] = useState<Post | null>(null);


const pathname = location.pathname; 
const pathParts = pathname.split('/'); 
const id = pathParts[pathParts.length - 1];

console.log(id); 

  useEffect(() => {
    console.log(location.pathname);
    if (id) {
      const fetchPost = async () => {
        const response = await getPost(token, id);
        if (response.status === 200) {
          setPost(response.body.data);
    console.log(id);
        }
      };
      
      fetchPost();
    }
  }, [location.pathname, id]);

  return (
    <>
      {post ? (
        <>
          <PostWrapper>

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
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
