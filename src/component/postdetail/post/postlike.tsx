import React, {useState} from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import handleLike from '../../../utils/handlePostLike';
import heartEmptyImg from '../../../resource/assets/heart-empty-img.png';
import heartFilledImg from '../../../resource/assets/heart-filled-img.png';

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
