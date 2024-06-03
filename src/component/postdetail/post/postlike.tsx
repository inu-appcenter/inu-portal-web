import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { handlePostLike } from '../../../utils/API/Posts';
import heartEmptyImg from '../../../resource/assets/heart-empty-img.svg';
import heartFilledImg from '../../../resource/assets/heart-filled-img.svg';
import styled from 'styled-components';

interface PostLikeProps {
  like: number;
  isLikedProp: boolean;
  hasAuthority: boolean;
}

const PostLike: React.FC<PostLikeProps> = ({ like, isLikedProp, hasAuthority }) => {
  const [likes, setLikes] = useState(like);
  const { id } = useParams<{ id: string }>();
  const [isLiked, setIsLiked] = useState(isLikedProp);
  const token = useSelector((state: any) => state.user.token);
  const [showError, setShowError] = useState<boolean>(false);

  const handleLikeClick = async () => {
    if (hasAuthority) {
      setShowError(true); // 본인 게시글인 경우 에러 표시
      setTimeout(() => setShowError(false), 5000); // 5초 후 에러 메시지 숨김
      return;
    }
    if (id === undefined) {
      console.error('ID is undefined');
      return;
    }
    if (token) {
      try {
        const result = await handlePostLike(token, id);
        if (result.status === 400) {
          alert('본인의 게시글에는 좋아요를 누를 수 없습니다.');
          return;
        }
        setIsLiked(!isLiked);
        if (result.body.data === -1) {
          setLikes(likes - 1);
        } else {
          setLikes(likes + 1);
        }
      } catch (error) {
        console.error('좋아요 처리 에러', error);
        alert('좋아요 처리 에러');
      }
    } else {
      alert('로그인 필요');
    }
  };

  return (
    <span className='likeContainer'>
      <img
        className='UtilityImg'
        src={isLiked ? heartFilledImg : heartEmptyImg}
        alt='heartImg'
        onClick={handleLikeClick}
      />
      <span className='UtilityText'>
        {likes}
      </span>
      {showError && <ErrorMessage>본인 게시글에는 좋아요를 누를 수 없습니다.</ErrorMessage>}
    </span>
  );
};

export default PostLike;

const ErrorMessage = styled.div`
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
`;
