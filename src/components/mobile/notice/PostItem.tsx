import styled, { css } from "styled-components";
import Skeleton from "@/components/common/Skeleton";
import { Eye, MessageSquare, Heart, Bookmark } from "lucide-react";
import Ripple from "@/components/common/Ripple";
import { formatTimeAgo } from "@/utils/date";

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
}: NoticeItemProps) => {
  const hasInfoLine =
    (showDate && !!date) ||
    (showWriter && !!writer) ||
    views !== undefined ||
    like !== undefined ||
    scrap !== undefined ||
    replyCount !== undefined;

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
            {writer && showWriter && (
              <WriterWrapper>
                <WriterName>{writer}</WriterName>
              </WriterWrapper>
            )}
            {content && <ContentLine isEllipsis={isEllipsis}>{content}</ContentLine>}

            {hasInfoLine && (
              <InfoLine>
                <MetaGroup>
                  {showDate && date && <div className="date">{formattedDate}</div>}
                  {replyCount !== undefined && (
                    <StatItem>
                      <MessageSquare size={16} strokeWidth={1.8} />
                      <span>{replyCount}</span>
                    </StatItem>
                  )}
                  {like !== undefined && (
                    <StatItem>
                      <Heart size={16} strokeWidth={1.8} />
                      <span>{like}</span>
                    </StatItem>
                  )}
                  {scrap !== undefined && (
                    <StatItem>
                      <Bookmark size={16} strokeWidth={1.8} />
                      <span>{scrap}</span>
                    </StatItem>
                  )}
                </MetaGroup>
                {views !== undefined && (
                  <ViewCount>
                    <Eye size={18} />
                    {views}
                  </ViewCount>
                )}
              </InfoLine>
            )}
          </TextContainer>

          {resolvedImageUrl && (
            <ThumbnailWrapper>
              <ThumbnailImage
                src={resolvedImageUrl}
                alt={title || "썸네일"}
              />
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
  gap: 6px;
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
  overflow: hidden;
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
      : css`
        `}
`;

const Category = styled.div`
  display: none;
`;

const Title = styled.div<{ isEllipsis: boolean }>`
  color: #20252d;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  align-self: stretch;

  ${({ isEllipsis }) =>
    isEllipsis &&
    css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`;

const WriterWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
`;

const WriterName = styled.span`
  color: #3f4a5a;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
`;

const ContentLine = styled.div<{ isEllipsis: boolean }>`
  color: #64748b;
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;

  ${({ isEllipsis }) =>
    isEllipsis &&
    css`
      display: -webkit-box;
      -webkit-line-clamp: 2; /* 두 줄 제한 */
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
`;

const InfoLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;

  .date {
    color: #8491a3;
    font-size: 14px;
    font-weight: 400;
    line-height: 1;
  }
`;

const MetaGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8491a3;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
`;

const ViewCount = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8491a3;
  font-size: 14px;
  font-weight: 400;
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
