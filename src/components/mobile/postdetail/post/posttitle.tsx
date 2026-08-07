import styled from "styled-components";
import { Eye, MessageSquare, Heart, Bookmark, Share2 } from "lucide-react";
import PostUtilContainer from "../../../../containers/mobile/postdetail/PostUtilContainer.tsx";

interface PostTitleProps {
  id: number;
  title: string;
  createDate: string;
  view?: number;
  writer?: string;
  like?: number;
  isLiked?: boolean;
  scrap?: number;
  isScraped?: boolean;
  memberId?: number | null;
  fireId?: number | null;
  replyCount?: number;
  onWriterClick?: (id: number) => void;
}

export default function PostTitle({
  id,
  title,
  createDate,
  view,
  writer,
  like,
  isLiked,
  scrap,
  isScraped,
  memberId,
  fireId = 1,
  replyCount = 0,
  onWriterClick,
}: PostTitleProps) {
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

  const profileImgUrl = fireId
    ? `https://portal.inuappcenter.kr/images/profile/${fireId}`
    : "https://portal.inuappcenter.kr/images/profile/1";

  return (
    <HeaderContainer>
      <TitleText>{title}</TitleText>

      <AuthorRowContainer>
        <AuthorInfoLeft>
          <AvatarImg
            src={profileImgUrl}
            alt={writer || "작성자"}
            onClick={() => {
              if (memberId && onWriterClick) {
                onWriterClick(memberId);
              }
            }}
            $isClickable={Boolean(memberId && onWriterClick)}
          />
          <AuthorDetailColumn>
            <AuthorName
              onClick={() => {
                if (memberId && onWriterClick) {
                  onWriterClick(memberId);
                }
              }}
              $isClickable={Boolean(memberId && onWriterClick)}
            >
              {writer || "익명"}
            </AuthorName>
            <DateText>{createDate}</DateText>
          </AuthorDetailColumn>
        </AuthorInfoLeft>

        {view !== undefined && (
          <ViewCountRow>
            <Eye size={16} color="#8B95A1" />
            <span>{view}</span>
          </ViewCountRow>
        )}
      </AuthorRowContainer>

      <ActionRow>
        <CommentCountGroup>
          <MessageSquare size={24} color="#333D4B" />
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
            <Share2 size={24} color="#333D4B" />
          </ShareBtn>
        </ActionButtonsGroup>
      </ActionRow>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const TitleText = styled.h1`
  font-family: Pretendard, sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
  letter-spacing: -0.2px;
  color: var(--text-secondary, #333d4b);
  word-break: break-word;
  margin: 0;
`;

const AuthorRowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
`;

const AuthorInfoLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AvatarImg = styled.img<{ $isClickable: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  cursor: ${({ $isClickable }) => ($isClickable ? "pointer" : "default")};
`;

const AuthorDetailColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const AuthorName = styled.div<{ $isClickable: boolean }>`
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary, #333d4b);
  cursor: ${({ $isClickable }) => ($isClickable ? "pointer" : "default")};
`;

const DateText = styled.div`
  font-family: Pretendard, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--text-tertiary, #8b95a1);
`;

const ViewCountRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;

  span {
    font-family: Pretendard, sans-serif;
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    color: var(--text-tertiary, #8b95a1);
  }
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  width: 100%;
  margin-top: 12px;
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
