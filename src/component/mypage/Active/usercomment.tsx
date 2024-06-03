// usercomment.tsx
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import commentlogo from "../../../resource/assets/comment-img.svg";
import { useEffect, useState } from 'react';
import { getPost } from '../../../utils/API/Posts';
import { useSelector } from 'react-redux';
import HeartImg from "../../../resource/assets/heart-logo.svg";
import CalendarImg from "../../../resource/assets/bx_calendar.svg";
import SortDropBox from '../../common/SortDropBox';

interface Document {
  id: number;
  content: string;
  like: number;
  postId: string;
  createDate: string;
  modifiedDate: string;
}

interface Post {
  category: string;
}

interface loginInfo {
  user: {
    token: string;
  };
}

interface CommentInfoProps {
  postCommentInfo: Document[];
  commentsort: string;
  setCommentSort: (sort: string) => void;
}

export default function UserComment({ postCommentInfo, commentsort, setCommentSort }: CommentInfoProps) {
  const [postInfo, setPostInfo] = useState<Post[]>([]);
  const token = useSelector((state: loginInfo) => state.user.token);

  useEffect(() => {
    const fetchPost = async () => {
      const ids = postCommentInfo.map(comment => comment.postId);
      const posts: Post[] = [];
      for (const id of ids) {
        try {
          const postDetail = await getPost(token, id);
          posts.push({ category: postDetail.body.category });
        } catch (error) {
          console.error(`Error fetching post with id ${id}:`, error);
        }
      }
      setPostInfo(posts);
    };

    fetchPost();
  }, [postCommentInfo, token]);

  return (
    <>
      <CommentWrapper>
        <CountWrapper>
          <Commentimg src={commentlogo} />
          <CommentCount>{postCommentInfo.length}</CommentCount>
        </CountWrapper>
        <SortDropBox sort={commentsort} setSort={setCommentSort} />
      </CommentWrapper>
      <PostWrapper>
        {postCommentInfo.map((item, index) => (
          <PostDetailWrapper>
            <PostScrapItem key={item.id}>
              <PostLink to={`/tips/${item.postId}`}>
                <PostScrapItem>
                  <p className='category'>{postInfo[index]?.category}</p>
                  <p className='title'>{`[${item.content}`}</p>
                  <p className='close-title'>{`]`}</p>
                </PostScrapItem>
              </PostLink>
              <PostListWrapper>
                <PostInfoWrapper>
                  <img src={CalendarImg} alt="" className='calender-image' />
                  <p className='createdate'>{item.createDate}</p>
                  <img src={HeartImg} alt="" className='heart-image' />
                  <p className='like'>{item.like}</p>
                </PostInfoWrapper>
              </PostListWrapper>
            </PostScrapItem>
          </PostDetailWrapper>
        ))}
      </PostWrapper>
    </>
  );
}

const CommentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const PostWrapper = styled.div`
  max-height: 170px; 
  overflow-y: auto; 
  scrollbar-width: thin; 
  scrollbar-color: #82ADE899 #DBEBFF; 
  padding-left: 5px;

  &::-webkit-scrollbar {
    width: 8px; 
  }

  &::-webkit-scrollbar-track {
    background-color: #f1f1f1; 
  }

  &::-webkit-scrollbar-thumb {
    background-color: #DBEBFF; 
    border-radius: 4px; 
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #DBEBFF;
  }
`;

const PostDetailWrapper = styled.div`
  border: 1px solid #AAC9EE;
  margin-bottom: 22px;
`;

const PostScrapItem = styled.div`
  display: flex;
  gap: 2px;
  background-color: white;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;

  .category {
    background-color: #a4c8e4; 
    padding: 10px;
    margin: 10px;
    color: white;
    font-weight: 600;
    border-radius: 10px;
    font-size: 15px;
  }

  .title {
    padding: 10px 0 10px 10px;
    margin: 10px 0 10px 10px;
    font-size: 20px;
    font-weight: 600;
    color: #656565;
    max-width: 500px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; 
  }

  .close-title {
    font-size: 20px;
    font-weight: 600;
    color: #656565;
  }
`;

const PostListWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CountWrapper = styled.div`
  display: flex;
  margin-top: 26px;
  align-items: center;
`;

const Commentimg = styled.img`
  width: 24px;
  height: 20px;
  margin-right: 16px;
`;

const CommentCount = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #0E4D9D;
`;

const PostLink = styled(Link)`
  text-decoration: none;
  color: black;
  box-sizing: border-box;
`;

const PostInfoWrapper = styled.div`
  display: flex;
  align-items: center;

  .createdate {
    font-size: 10px;
    font-weight: 500;
    color: #969696;
    margin: 0 26px 0 3px;
  }

  .like {
    font-size: 8px;
    font-weight: 600;
    margin: 0 26px 0 6px;
  }
`;
