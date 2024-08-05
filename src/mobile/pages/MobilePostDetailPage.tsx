import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getPost } from '../../utils/API/Posts';
import PostContentContainer from '../containers/postdetail/PostContentContainer';
import PostUtilContainer from '../containers/postdetail/PostUtilContainer';
import CommentListMobile from '../containers/postdetail/CommentListContainer';
import CommentInput from '../components/postdetail/comment/m.commentInput';

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

interface Replies {
  id: number;
  writer: string;
  fireId: number;
  content: string;
  like: number;
  isLiked: boolean;
  isAnonymous: boolean;
  hasAuthority: boolean;
  createDate: string;
  modifiedDate: string;
  reReplies: Replies[];
}


export default function PostDetail() {
  const token = useSelector((state: any) => state.user.token);
  const [post, setPost] = useState<Post | null>(null);
  const [id, setId] = useState('');
  const [commentUpdated, setCommentUpdated] = useState(false);

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
  }, [location.pathname, id, commentUpdated]);

  return (
    <>
      {post ? (
        <>
        <Wrapper>
          <PostTopWrapper>
            <PostUtilContainer id={post.id} like={post.like} isLiked={post.isLiked} scrap={post.scrap} isScraped={post.isScraped} hasAuthority={post.hasAuthority} />
          </PostTopWrapper>
          {/* <Line /> */}
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
          <CommentWrapper>
            <CommentListMobile bestComment={post.bestReplies[0]} comments={post.replies} onCommentUpdate={() => setCommentUpdated(true)} />
            <CommentInput id={post.id} onCommentUpdate={() => setCommentUpdated(true)}/>
          </CommentWrapper>
          </Wrapper>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
const Wrapper = styled.div`
  width:100%;
  height: 100%;
`
const PostTopWrapper = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
  border-bottom: 1px solid #ccc;  
  `

const PostWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px;
  padding-bottom:30px;
  top: 6%;

  position: relative;
  z-index: 1;
`;
const CommentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-bottom: 20px;
`;

// const Line = styled.div`
//   border-top: 1px solid #ccc; 
//   margin-top:100px;
// `