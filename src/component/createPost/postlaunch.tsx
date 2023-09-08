// Launch.tsx

import React from 'react';

const Launch: React.FC = () => {
  const handleLaunch = () => {
    //서버로 데이터 전송
    console.log('정상적으로 게시되었습니다!');
  };

  return (
    <div>
      <button onClick={handleLaunch}>Launch Post</button>
    </div>
  );
};

export default Launch;
