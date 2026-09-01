import styled from "styled-components";
import Icon from "@/components/common/Icon";
import { formatTimeAgo } from "@/utils/date";

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
}

export default function PostTitle({
  title,
  createDate,
  view,
  writer,
  fireId = 1,
}: PostTitleProps) {
  const profileImgUrl = fireId
    ? `https://portal.inuappcenter.kr/images/profile/${fireId}`
    : "https://portal.inuappcenter.kr/images/profile/1";

  return (
    <HeaderContainer>
      <TitleText>{title}</TitleText>

      <AuthorRowContainer>
        <AuthorInfoLeft>
          <AvatarImg src={profileImgUrl} alt={writer || "작성자"} />
          <AuthorDetailColumn>
            <AuthorName>{writer || "익명"}</AuthorName>
            <DateText>{formatTimeAgo(createDate)}</DateText>
          </AuthorDetailColumn>
        </AuthorInfoLeft>

        {view !== undefined && (
          <ViewCountRow>
            <Icon name="eye" size={16} color="#8B95A1" />
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

const AvatarImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
`;

const AuthorDetailColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const AuthorName = styled.div`
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary, #333d4b);
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
