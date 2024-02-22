import React, {useState} from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import handleLike from '../../../utils/handlePostLike'

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
          // alert('좋아요 취소');
        }
        else {
          setLikes(likes + 1);
          // alert('좋아요 성공');
        }
      }
      else {
        alert('로그인 필요');
      }
  };

  return(
    <>
      <button className='Like' onClick={handleLikeClick} style={{fontSize:'45px'}}>
        {isLiked ? '❤️' :'🤍'}
      </button>
      {likes}
    </>
    ); 
  };

  export default PostLike;
