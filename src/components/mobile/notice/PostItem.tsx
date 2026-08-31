import { ReactNode } from "react";
import styled, { css } from "styled-components";
import Skeleton from "@/components/common/Skeleton";
import Icon from "@/components/common/Icon";
import Ripple from "@/components/common/Ripple";
import { formatTimeAgo } from "@/utils/date";
export type TextVariant = "tertiary" | "error" | "brand";

interface NoticeItemProps {
  id?: number;
  category?: string;
  title?: string;
  content?: string;
  date?: string;
  writer?: string;
  views?: number;
  like?: number;
  scrap?: number;
  replyCount?: number;
  imageCount?: number;
  imageUrl?: string | null;
  isLoading?: boolean;
  onClick?: () => void;
  /** 말줄임 여부 설정 (기본값: true) */
  isEllipsis?: boolean;
  showDate?: boolean;
  showWriter?: boolean;
  /** 신고/차단/숨기기 등 게시글 관리 메뉴 (목록에서 바로 처리하기 위함) */
  menuSlot?: ReactNode;
}

const PostItem = ({
  category,
  title,
  content,
  date,
  writer,
  views,
  like,
  scrap,
  replyCount,
  imageUrl,
  isLoading,
  onClick,
  isEllipsis = true,
  showDate = true,
  showWriter = true,
  menuSlot,
}: NoticeItemProps) => {
  const hasInfoLine =
    (showDate && !!date) ||
    (showWriter && !!writer) ||
    views !== undefined ||
    like !== undefined ||
    scrap !== undefined ||
    replyCount !== undefined ||
    !!menuSlot;

  const formattedDate = date ? formatTimeAgo(date) : "";

  const resolvedImageUrl = imageUrl
    ? new URL(
        imageUrl,
        import.meta.env.VITE_API_BASE_URL || window.location.origin,
      ).toString()
    : null;

  if (isLoading) {
    return (
      <NoticeItemWrapper $interactive={false}>
        <InnerContent>
          <MainSection>
            <TextContainer>
              <Skeleton width={60} height={18} />
              <Skeleton width="100%" height={20} />
              <Skeleton width="100%" height={16} />
              <InfoLine>
                <Skeleton width={80} height={14} />
                <Skeleton width={50} height={14} />
              </InfoLine>
            </TextContainer>
            <Skeleton width={76} height={76} style={{ borderRadius: "10px" }} />
          </MainSection>
        </InnerContent>
      </NoticeItemWrapper>
    );
  }

  return (
    <NoticeItemWrapper onClick={onClick} $interactive={!!onClick}>
      {onClick && <Ripple />}
      <InnerContent>
        <MainSection>
          <TextContainer>
            {category && <Category>{category}</Category>}
            <Title isEllipsis={isEllipsis}>{title || ""}</Title>
            {content && (
              <ContentLine isEllipsis={isEllipsis}>{content}</ContentLine>
            )}

            {hasInfoLine && (
              <InfoLine>
                <MetaGroup>
                  {like !== undefined && (
                    <StatItem $variant="error">
                      <i className="icon-heart" />

                      <span>{like}</span>
                    </StatItem>
                  )}
                  {replyCount !== undefined && (
                    <StatItem $variant="brand">
                      <i className="icon-chat-dots" />

                      <span>{replyCount}</span>
                    </StatItem>
                  )}
                  {/* {scrap !== undefined && (
                    <StatItem>
                      <Bookmark size={16} strokeWidth={1.8} />
                      <span>{scrap}</span>
                    </StatItem>
                  )} */}
                  {showDate && date && <div className="dot">·</div>}
                  {showDate && date && (
                    <div className="date">{formattedDate}</div>
                  )}
                  {showDate && date && showWriter && writer && (
                    <div className="dot">·</div>
                  )}
                  {showWriter && writer && (
                    <div className="writer">{writer}</div>
                  )}
                </MetaGroup>
                {(views !== undefined || menuSlot) && (
                  <TrailingGroup>
                    {views !== undefined && (
                      <ViewCount>
                        <Icon name="eye" size={18} />
                        {views}
                      </ViewCount>
                    )}
                    {menuSlot}
                  </TrailingGroup>
                )}
              </InfoLine>
            )}
          </TextContainer>

          {resolvedImageUrl && (
            <ThumbnailWrapper>
              <ThumbnailImage src={resolvedImageUrl} alt={title || "썸네일"} />
            </ThumbnailWrapper>
          )}
        </MainSection>
      </InnerContent>
    </NoticeItemWrapper>
  );
};

export default PostItem;

const InnerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  transition: transform 0.12s ease-in-out;
`;

const MainSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const NoticeItemWrapper = styled.div<{ $interactive?: boolean }>`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 16px;
  width: 100%;
  min-height: 108px;
  position: relative;
  overflow: visible;
  background: transparent;

  ${({ $interactive }) =>
    $interactive
      ? css`
          cursor: pointer;

          &.active-touch {
            ${InnerContent} {
              transform: scale(0.97);
            }
          }
        `
      : css``}
`;

const Category = styled.div`
  display: none;
`;

const Title = styled.div<{ isEllipsis: boolean }>`
  color: var(--text-primary, #191f28);
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  align-self: stretch;

  ${({ isEllipsis }) =>
    isEllipsis &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`;

const ContentLine = styled.div<{ isEllipsis: boolean }>`
  color: var(--text-secondary, #333d4b);
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 160%;

  ${({ isEllipsis }) =>
    isEllipsis &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`;

const InfoLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .writer {
    color: var(--text-tertiary, #8b95a1);
    font-family: Pretendard, sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 160%;
  }

  .dot {
    color: var(--text-tertiary, #8b95a1);
    font-family: Pretendard, sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 160%;
  }

  .date {
    color: var(--text-tertiary, #8b95a1);
    font-family: Pretendard, sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 160%;
  }
`;

const MetaGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex-wrap: wrap;
`;

const StatItem = styled.div<{ $variant?: TextVariant }>`
  display: flex;
  align-items: center;

  color: var(--text-${(props) => props.$variant ?? "teritary"}, #8b95a1);
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 160%;
`;

const TrailingGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
`;

const ViewCount = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-tertiary, #8b95a1);
  font-family: Pretendard, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 160%;
`;

const ThumbnailWrapper = styled.div`
  width: 76px;
  height: 76px;
  min-width: 76px;
  min-height: 76px;
  border-radius: 10px;
  overflow: hidden;
  background-color: #e3e7ec;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
