import { useState } from 'react';
import { useSelector } from 'react-redux';
import scrapEmptyImg from '../../../../resource/assets/scrap.svg'
import scrapFilledImg from '../../../../resource/assets/scrap-filled-img.svg';
import { handlePostScrap } from '../../../../utils/API/Posts';

interface PostScrapProps {
  id: string;
  scrap: number;
  isScrapedProp: boolean;
}

export default function PostScrap({ id, scrap, isScrapedProp }: PostScrapProps) {
  const [scraps, setScraps] = useState(scrap);
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
        if (result.body.data === +1) {
          setScraps(scraps + 1);
          alert('스크랩 성공');
        } else {
          setScraps(scraps - 1);
          alert('스크랩 취소');
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
          src={isScraped ? scrapFilledImg : scrapEmptyImg}
          alt='scrapImg'
        />
    </span>
  );
};
