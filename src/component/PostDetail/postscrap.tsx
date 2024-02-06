import React, { useState } from 'react';

 //스크랩 기능 추가
interface PostScrapProps {
  initialViews?: number;
}

const PostScrap: React.FC<PostScrapProps> = ({ initialViews = 0 }) => {
  const [views, setViews] = useState<number>(initialViews);

  return (
    <div className='Scraps' style={{fontSize:'45px'}}>
      🔖
    <span style={{fontSize:'18px'}}>{views}</span>
    </div>
  );
};

export default PostScrap;
