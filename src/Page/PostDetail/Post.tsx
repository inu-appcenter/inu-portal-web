import  { useState } from 'react';
import './Post.css';
import CommentForm from './Component/CommentForm';
import CommentList from './Component/CommnetList';
import PostLike from './Component/PostLike';
import PostView from './Component/PostView';

interface CommentData {
  author: string;
  content: string;
}

function Post() {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [likes, setLikes] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const addComment = (author: string, content: string): void => {
    const newComment = { author, content };
    setComments([...comments, newComment]);
  };


  const handleLike = () =>{
    if(!isLiked){
      setLikes(likes +1);
    } else{
      setLikes(likes -1);
    }
    setIsLiked(!isLiked);
  };
  
return(
  <>
  <div className='Banner'>
    <div className='임시'>임시배너</div>
  </div>

  <div className='container'>
    <div className='PostSidePart'>

      <div className='연결후변경'>
        <button>글쓰기</button>
      </div>

      <div className='Views'>
        <PostView initialViews={10}/>
      </div>
      <div className='LikeButton'>
        <PostLike onLike={handleLike} likes={likes} isLiked={isLiked} />
        <span>{likes}</span>
      </div>
    </div>
    <div className='PostCenterPart'>
      <div className='sub-navi-container'>
        <div className='SubNavi'>
          <span>임시카테고리 이동 베너</span>
        </div>
        <div className='subject'>카테고리</div>
      </div>

      <div className='post-info-container'>
        <div className='view-info'>
          <span className='view-title'>제목</span>
          <div className='divider'></div>
          <div className='view-detail'>
            <div className='inline-list'>
              <span className='author'>홍길동</span>
              <span className='PublishDate'>2024/01/15</span>
            </div>
          </div>
        </div>
      </div>
      <div className='post-contents'>
        <div className='contents'>본문입니다.</div>
      </div>
      <div className='divider'></div>
    <div className='CommentBox'>

      <CommentForm onAddComment={addComment} />
      <CommentList comments={comments} />
      
    </div>
  </div>
  </div>
  </>

  );
}
export default Post;
