import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import scrapEmptyImg from '../../../../resource/assets/scrap-empty-img.svg';
import { handlePostScrap } from '../../../../utils/API/Posts';
import scrapImg from '../../../../resource/assets/scrap.svg'
interface PostScrapProps {
  scrap: number;
  isScrapedProp: boolean;
}

const PostScrap: React.FC<PostScrapProps> = ({ scrap, isScrapedProp }) => {
  const [scraps, setScraps] = useState(scrap);
  const [isScraped, setIsScraped] = useState(isScrapedProp);
  const token = useSelector((state: any) => state.user.token);

  const pathname = location.pathname; 
  const pathParts = pathname.split('/'); 
  const id = pathParts[pathParts.length - 1];

  const handleScrapClick = async () => {
    if (id === undefined) {
      console.error('ID is undefined');
      return;
    }
    if (token) {
      try {
        const result = await handlePostScrap(token, id);
        setIsScraped(!isScraped);
        if (result.body.data === -1) {
          setScraps(scraps - 1);
          alert('스크랩 취소');
        } else {
          setScraps(scraps + 1);
          alert('스크랩 성공');
        }
      } catch (error) {
        console.error('스크랩 처리 에러', error);
        alert('스크랩 처리 에러');
      }
    } else {
      alert('로그인 필요');
    }
  };

  return (
    <span className='scrapContainer'>
    
        <img onClick={handleScrapClick}
          className='UtilityImg'
          src={isScraped ? scrapImg : scrapImg}
          alt='scrapImg'
        />
    </span>
  );
};

export default PostScrap;
