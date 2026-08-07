import styled from "styled-components";
import { Eye, MessageSquare, Share2 } from "lucide-react";
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

const formatDetailDate = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  } catch (e) {
    return dateStr;
  }
};

export default function PostTitle({
  id,
  title,
  createDate,
  view,
  writer,
  memberId,
  fireId = 1,
  onWriterClick,
}: PostTitleProps) {
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
            <DateText>{formatDetailDate(createDate)}</DateText>
          </AuthorDetailColumn>
        </AuthorInfoLeft>

        {view !== undefined && (
          <ViewCountRow>
            <Eye size={16} color="#8B95A1" />
            <span>{view}</span>
          </ViewCountRow>
        )}
      </AuthorRowContainer>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const TitleText = styled.h1`
  font-family: Pretendard, sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
  letter-spacing: -0.2px;
  color: var(--text-secondary, #333d4b);
  word-break: break-word;
  margin: 0;
`;

const AuthorRowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const AuthorInfoLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AvatarImg = styled.img<{ $isClickable: boolean }>`
  width: 32px;
  height: 32px;
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
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
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
