// Like, 스크랩

import PostLike from '../../component/postdetail/post/postlike';
import PostScrap from '../../component/postdetail/post/postscrap';
import './PostUtilityContainer.css';

interface PostUtilityProps {
  like: number;
  isLiked: boolean;
  scrap: number;
  isScraped: boolean;
  hasAuthority: boolean;
}

export default function PostUtility({ like, isLiked, scrap, isScraped, hasAuthority }: PostUtilityProps) {

  return (
    <div className='UtilityWrapper'>
      <PostLike like={like} isLikedProp={isLiked} hasAuthority={hasAuthority} />
      <PostScrap scrap={scrap} isScrapedProp={isScraped} />
    </div>
  );
}
