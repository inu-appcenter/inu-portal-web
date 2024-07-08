import styled from 'styled-components';
import PostContentContainer from '../container/postdetail/PostContentContainer';
import PostUtility from '../container/postdetail/PostUtilityContainer';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPost } from '../utils/API/Posts';
import ReturnButton from '../component/postdetail/post/ReturnButton';
import CommentList from '../component/postdetail/comment/commentlist';
import CommentInput from '../component/postdetail/comment/commentinput';
import { useSelector } from 'react-redux';

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
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [commentUpdated, setCommentUpdated] = useState(false);

  useEffect(() => {
    console.log(id);
    
    if (id) {
      const fetchPost = async () => {
        const response = await getPost(token, id);
        if (response.status === 200) {
          setPost(response.body.data);
        }
      };
      setCommentUpdated(false);
      fetchPost();
    }
  }, [id, commentUpdated, token]);

  return (
    <>
      {post ? (
        <>
          <PostWrapper>
            <ReturnButton />
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
            <PostUtility
              like={post.like}
              isLiked={post.isLiked}
              scrap={post.scrap}
              isScraped={post.isScraped}
              hasAuthority={post.hasAuthority}
            />
          </PostWrapper>
          <CommentWrapper>
            <CommentList bestComment={post.bestReplies[0]} comments={post.replies} onCommentUpdate={() => setCommentUpdated(true)} />
            <CommentInput onCommentUpdate={() => setCommentUpdated(true)} />
          </CommentWrapper>
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

const CommentWrapper = styled.div`
  border-top: solid #eaeaea 5px;
  padding-top: 20px;
  padding-bottom: 80px;
`;
