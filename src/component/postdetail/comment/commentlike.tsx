import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { handleRepliesLike } from '../../../utils/API/Replies';
import heartEmptyImg from '../../../resource/assets/heart-empty-img.svg';
import heartFilledImg from '../../../resource/assets/heart-filled-img.svg';

interface PostLikeProps {
  id: number;
  like: number;
  isLikedProp: boolean;
}

const CommentLike: React.FC<PostLikeProps> = ({ id, like, isLikedProp }) => {
  const [likes, setLikes] = useState(like);
  const [isLiked, setIsLiked] = useState(isLikedProp);
  const token = useSelector((state: any) => state.user.token);

  const handleLikeClick = async () => {
    if (token) {
      try {
        const result = await handleRepliesLike(token, id);
        if (result.status === 200) {
          setIsLiked(!isLiked);
          if (result.body.data === -1) {
            setLikes(likes - 1);
          } else {
            setLikes(likes + 1);
          }
        } else if (result.status === 400) {
          alert('자신의 댓글에는 추천을 할 수 없습니다.');
        } else if (result.status === 401) {
          alert('존재하지 않는 회원입니다. / 존재하지 않는 댓글입니다.');
        } else {
          alert('좋아요 실패');
        }
      } catch (error) {
        console.error('좋아요 에러', error);
        alert('좋아요 에러');
      }
    } else {
      alert('로그인 필요');
    }
  };

  return (
    <div className='likeContainer'>
      <img className='UtilityImg'
        src={isLiked ? heartFilledImg : heartEmptyImg}
        alt='heartImg'
        onClick={handleLikeClick}
      />
      <span className='content-text'> {likes}</span>
    </div>
  );
};

export default CommentLike;
