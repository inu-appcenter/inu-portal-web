import styled from "styled-components";
import PostLike from "mobile/components/postdetail/util/m.postlike";
import PostScrap from "mobile/components/postdetail/util/m.postscrap";

interface PostUtilityProps {
  id: number;
  like: number;
  isLiked: boolean;
  scrap: number;
  isScraped: boolean;
}

export default function PostUtilContainer({
  id,
  like,
  isLiked,
  scrap,
  isScraped,
}: PostUtilityProps) {
  return (
    <>
      <UtilWrapper>
        <PostLike id={id} like={like} isLikedProp={isLiked} />
        <PostScrap id={id} scrap={scrap} isScrapedProp={isScraped} />
      </UtilWrapper>
    </>
  );
}

const UtilWrapper = styled.div`
  margin-left: auto;
  display: flex;
  flex-direction: row;
  gap: 20px;
`;
