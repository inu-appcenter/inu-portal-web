import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { handlePostScrap } from '../../../utils/API/Posts';
import scrapEmptyImg from '../../../resource/assets/scrap-empty-img.svg';

interface PostScrapProps {
  scrap: number;
  isScrapedProp: boolean;
}

const PostScrap: React.FC<PostScrapProps> = ({ scrap, isScrapedProp }) => {
  const [scraps, setScraps] = useState(scrap);
  const { id } = useParams<{ id: string }>();
  const [isScraped, setIsScraped] = useState(isScrapedProp);
  const token = useSelector((state: any) => state.user.token);

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
      <span className='scrapRectangle' onClick={handleScrapClick}>
        <img
          className='UtilityImg'
          src={isScraped ? scrapEmptyImg : scrapEmptyImg}
          alt='scrapImg'
        />
        <span className='UtilityText'>스크랩</span>
      </span>
      <span className='UtilityText'>
        {scraps}
      </span>
    </span>
  );
};

export default PostScrap;
