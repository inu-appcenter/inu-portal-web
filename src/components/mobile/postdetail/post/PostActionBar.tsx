import styled from "styled-components";
import Icon from "@/components/common/Icon";
import PostUtilContainer from "../../../../containers/mobile/postdetail/PostUtilContainer";

interface PostActionBarProps {
  id: number;
  like?: number;
  isLiked?: boolean;
  scrap?: number;
  isScraped?: boolean;
  replyCount?: number;
  title?: string;
}

export default function PostActionBar({
  id,
  like,
  isLiked,
  scrap,
  isScraped,
  replyCount = 0,
  title,
}: PostActionBarProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("링크가 복사되었습니다.");
      } catch (e) {
        alert("링크 복사 실패");
      }
    }
  };

  return (
    <ActionRow>
      <CommentCountGroup>
        <Icon name="chat" size={20} color="#333D4B" />
        <span>댓글 {replyCount}</span>
      </CommentCountGroup>

      <ActionButtonsGroup>
        {like !== undefined &&
        isLiked !== undefined &&
        scrap !== undefined &&
        isScraped !== undefined ? (
          <PostUtilContainer
            id={id}
            like={like}
            isLiked={isLiked}
            scrap={scrap}
            isScraped={isScraped}
          />
        ) : null}
        <ShareBtn onClick={handleShare}>
          <Icon name="share" size={24} color="#333D4B" />
        </ShareBtn>
      </ActionButtonsGroup>
    </ActionRow>
  );
}

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  width: 100%;
  box-sizing: border-box;
  background-color: transparent;
`;

const CommentCountGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  height: 44px;

  span {
    font-family: Pretendard, sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.6;
    color: var(--text-secondary, #333d4b);
  }
`;

const ActionButtonsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ShareBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  cursor: pointer;
`;
