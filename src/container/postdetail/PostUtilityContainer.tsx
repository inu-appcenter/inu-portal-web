// Like, 스크랩, 공유, 삭제, 수정 등

import PostLike from '../../component/postdetail/post/postlike';
import PostScrap from '../../component/postdetail/post/postscrap';
interface PostUtilityProps {
  good: number;
  scrap: number;
}

export default function PostUtility({ good, scrap }: PostUtilityProps) {

  return (
    <>
      <PostLike good={good} />
      <PostScrap scrap={scrap} />
    </>
  );
}
