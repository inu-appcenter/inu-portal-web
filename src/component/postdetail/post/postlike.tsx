import React, {useState} from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import handleLike from '../../../utils/handlePostLike';
import heartEmptyImg from '../../../resource/assets/heart-empty-img.png';
import heartFilledImg from '../../../resource/assets/heart-filled-img.png';
import styled from 'styled-components';

interface PostLikeProps{
  like: number
  isLikedProp: boolean;
}

const PostLike: React.FC<PostLikeProps> = ({like, isLikedProp}) =>{
  const [likes, setLikes] = useState(like);
  const { id } = useParams<{ id: string }>();
  const [isLiked, setIsLiked] = useState(isLikedProp);
  const token = useSelector((state: any) => state.user.token);
  
  const handleLikeClick = async() => {
      if (token) {
        const result = await handleLike(token, id);
        setIsLiked(!isLiked);
        console.log(result);
        if (result['data'] === -1) {
          setLikes(likes - 1);
        }
        else {
          setLikes(likes + 1);
         
        }
      }
      else {
        alert('로그인 필요');
      }
  };

  return(
    <span className='likeContainer'>
      <img className='UtilityImg'
        src={isLiked?heartFilledImg:heartEmptyImg}
        alt='heartImg'
        onClick={handleLikeClick}
      /> 
      <span className='UtilityText'>
        {likes}
      </span>
    </span>
    ); 
  };

  export default PostLike;


  const ErrorMessage = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  display: none;
`;
