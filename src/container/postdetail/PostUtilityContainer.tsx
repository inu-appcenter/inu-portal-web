// Like, 스크랩, 공유, 삭제, 수정 등

import PostLike from '../../component/postdetail/post/postlike';
import PostScrap from '../../component/postdetail/post/postscrap';

interface PostUtilityProps {
  like: number;
  isLiked: boolean;
  scrap: number;
  isScraped: boolean;
}

export default function PostUtility({ like, isLiked, scrap, isScraped }: PostUtilityProps) {

  return (
    <>
      <PostLike like={like} isLikedProp={isLiked} />
      <PostScrap scrap={scrap} isScrapedProp={isScraped} />
    </>
  );
}
