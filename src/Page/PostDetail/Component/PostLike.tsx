import React, {useState} from 'react'
import '../Post.css'

interface PostLikeProps{
  onLike:() => void;
  likes: number;
  isLiked: boolean;
}

const PostLike: React.FC<PostLikeProps> = ({onLike, likes, isLiked}) =>{
  

  const handleLikeClick = () => {
   onLike();
  };

  return(
    <button className='Like' onClick={handleLikeClick} style={{fontSize:'45px'}}>
      {isLiked ? '❤️' :'🤍'}
    </button>
  
  );
  };

  export default PostLike;
