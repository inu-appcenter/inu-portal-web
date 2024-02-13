import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import handleScrap from '../../../utils/handleScrap'

interface PostScrapProps {
  scrap: number;
  isScrapedProp: boolean;
}

const PostScrap: React.FC<PostScrapProps> = ({ scrap, isScrapedProp }) => {
  const [scraps, setScraps] = useState(scrap);
  const { id } = useParams<{ id: string }>();
  const [isScraped, setIsScraped] = useState(isScrapedProp);
  const token = useSelector((state: any) => state.user.token);

  const handleScrapClick = async() => {
    if (token) {
      const result = await handleScrap(token, id);
      setIsScraped(!isScraped);
      if (result['data'] === -1) {
        setScraps(scraps - 1);
        alert('스크랩 취소');
      }
      else {
        setScraps(scraps + 1);
        alert('스크랩 성공');
      }
    }
    else {
      alert('로그인 필요');
    }
  };

  return (
    <div className='Scraps' onClick={handleScrapClick} style={{fontSize:'45px'}}>
    🔖
    <span style={{fontSize:'18px'}}>{scraps}</span>
    </div>
  );
};

export default PostScrap;
