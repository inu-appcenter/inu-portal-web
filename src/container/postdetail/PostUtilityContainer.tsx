// Like, 스크랩, 공유, 삭제, 수정 등

import PostLike from '../../component/postdetail/post/postlike';
import PostScrap from '../../component/postdetail/post/postscrap';
import { useState } from 'react';

export default function PostUtility() {
  const [likes, setLikes] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const handleLike = () => {
    if (!isLiked) {
      setLikes(likes + 1);
    } else {
      setLikes(likes - 1);
    }
    setIsLiked(!isLiked);
  };



  return (
    <>
      <div className='LikeButton'>
        <PostLike onLike={handleLike} likes={likes} isLiked={isLiked} />
        <span>{likes}</span>
      </div>
      <div className='Scrap'>
        <PostScrap initialViews={10} />
      </div>
    </>
  );
}
