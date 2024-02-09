import React, {useState} from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import handleLike from '../../../utils/handleLike'

interface PostLikeProps{
  good: number
}

const PostLike: React.FC<PostLikeProps> = ({good}) =>{
  const [likes, setLikes] = useState(good);
  const { id } = useParams<{ id: string }>();
  const isLiked = true; // 백엔드에서 like 여부 가져오기 필요
  const token = useSelector((state: any) => state.user.token);

  const handleLikeClick = async() => {
      if (token) {
        const result = await handleLike(token, id);
        console.log(result);
        if (result['data'] === -1) {
          setLikes(likes - 1);
        }
        else {
          setLikes(likes + 1);
        }
        alert('좋아요 반영 성공');
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
