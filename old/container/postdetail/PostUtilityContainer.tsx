import PostLike from "../../component/postdetail/post/PostLike";
import PostScrap from "../../component/postdetail/post/PostScrap";
import styled from "styled-components";

interface PostUtilityProps {
  like: number;
  isLiked: boolean;
  scrap: number;
  isScraped: boolean;
  hasAuthority: boolean;
}

export default function PostUtility({
  like,
  isLiked,
  scrap,
  isScraped,
  hasAuthority,
}: PostUtilityProps) {
  return (
    <UtilityWrapper>
      <PostLike like={like} isLikedProp={isLiked} hasAuthority={hasAuthority} />
      <PostScrap scrap={scrap} isScrapedProp={isScraped} />
    </UtilityWrapper>
  );
}

// Styled Components
const UtilityWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  gap: 10px;
  height: 34px;
`;
