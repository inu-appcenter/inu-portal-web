import React, { useState } from 'react';

interface PostViewProps {
  initialViews?: number;
}

const PostView: React.FC<PostViewProps> = ({ initialViews = 0 }) => {
  const [views, setViews] = useState<number>(initialViews);

  return (
    <div className='Views' style={{fontSize:'45px'}}>
      👁️‍🗨️ 
    <span style={{fontSize:'18px'}}>{views}</span>
    </div>
  );
};

export default PostView;
