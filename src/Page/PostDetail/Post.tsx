import  { useState } from 'react';
import './Post.css';
import CommentForm from './Component/CommentForm';
import CommentList from './Component/CommnetList';

interface CommentData {
  author: string;
  content: string;
}

function Post() {
  const [comments, setComments] = useState<CommentData[]>([]);

  const addComment = (author: string, content: string): void => {
    const newComment = { author, content };
    setComments([...comments, newComment]);
  };

  return (
    <div className='container'>
      <div className='subject'>카테고리</div>
      <br/>
      <div className='post-info-container'>
        <div className='view-info'>
          <h2 className='view-title'>제목</h2>
        </div>
        <div className='view-detail'>
          <dl className='inline-list'>
            <div>
              <dt className='date'>작성일</dt>
              <dd>2024-00-00</dd>
            </div>

            <div>
              <dt className='author'>작성자</dt>
              <dd>홍길동</dd>
            </div>
            <div>
              <dt className='score'>별점</dt>
              <dd>4.5/5</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className='post-contents'>
        <h2 className='contents'>본문입니다.</h2>
      </div>

      <CommentForm onAddComment={addComment} />
      <CommentList comments={comments} />
    </div>
  );
}

export default Post;
