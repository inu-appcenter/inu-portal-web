import { useMemo, useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getNoticeDetail } from "@/apis/notices";
import { useHeader } from "@/context/HeaderContext";
import { NoticeAttachment } from "@/types/notices";
import Icon from "@/components/common/Icon";
import Skeleton from "@/components/common/Skeleton";
import CapsuleButton from "@/components/common/CapsuleButton";
import { torchAiLogo as TorchAiLogo } from "@/resources/assets/illustrations/ai";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
  DESKTOP_SEARCH_BAR_MAX_WIDTH,
  DESKTOP_GUTTER,
} from "@/styles/responsive";

export default function MobileSchoolNoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const noticeId = Number(id);

  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(true);

  useHeader({
    title: "공지사항",
    hasback: true,
    pageBgColor: "var(--bg-subtle, #f8f9fb)",
  });

  const {
    data: noticeResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notices", "detail", noticeId],
    queryFn: () => getNoticeDetail(noticeId),
    enabled: !isNaN(noticeId) && noticeId > 0,
  });

  const notice = noticeResponse?.data;

  // 카테고리 텍스트 포맷 (예: 장학금 - 국가근로장학금)
  const categoryLabel = useMemo(() => {
    if (!notice) return "";
    if (notice.subCategory && notice.subCategory.trim() !== "") {
      return `${notice.category} - ${notice.subCategory}`;
    }
    return notice.category;
  }, [notice]);

  // 첨부파일 다운로드 핸들러
  const handleAttachmentClick = (attachment: NoticeAttachment) => {
    let downloadUrl = attachment.url;
    if (downloadUrl.startsWith("/")) {
      downloadUrl = `https://www.inu.ac.kr${downloadUrl}`;
    }
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  };

  // 공유 버튼 핸들러
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = notice?.title || "공지사항";

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          await copyToClipboard(shareUrl);
        }
      }
    } else {
      await copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("공지 링크가 클립보드에 복사되었습니다.");
    } catch {
      alert("링크 복사에 실패했습니다.");
    }
  };

  // 원문 페이지 열기 핸들러
  const handleOpenOriginalPage = () => {
    if (notice?.url) {
      window.open(notice.url, "_blank", "noopener,noreferrer");
    } else {
      alert("원문 페이지 링크가 없습니다.");
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <HeaderBlock>
            <Skeleton width={120} height={28} style={{ borderRadius: 999 }} />
            <Skeleton width="90%" height={32} />
            <Skeleton width="60%" height={32} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Skeleton width={140} height={18} />
                <Skeleton width={110} height={18} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Skeleton width={80} height={18} />
              </div>
            </div>
          </HeaderBlock>

          <ArticleSection>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Skeleton width="100%" height={20} />
              <Skeleton width="95%" height={20} />
              <Skeleton width="88%" height={20} />
              <Skeleton width="70%" height={20} />
            </div>
          </ArticleSection>
        </ContentWrapper>
      </PageContainer>
    );
  }

  if (isError || !notice) {
    return (
      <PageContainer>
        <ContentWrapper>
          <ErrorContainer>
            <ErrorText>공지사항을 불러올 수 없습니다.</ErrorText>
            <BackButton onClick={() => navigate(-1)}>뒤로 가기</BackButton>
          </ErrorContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        {/* 1. 헤더 블록 */}
        <HeaderBlock>
          {categoryLabel && (
            <CategoryBadge>
              <CategoryText>{categoryLabel}</CategoryText>
            </CategoryBadge>
          )}

          <NoticeTitle>{notice.title}</NoticeTitle>

          <MetaContainer>
            <MetaColumn>
              <MetaRow>
                <MetaLabel>작성자</MetaLabel>
                <MetaValue>{notice.writer || "관리자"}</MetaValue>
              </MetaRow>
              <MetaRow>
                <MetaLabel>작성일</MetaLabel>
                <MetaValue>{notice.createDate}</MetaValue>
              </MetaRow>
            </MetaColumn>

            <MetaColumnRight>
              <MetaRow>
                <MetaLabel>글번호</MetaLabel>
                <MetaValueTertiary>{notice.id}</MetaValueTertiary>
              </MetaRow>
            </MetaColumnRight>
          </MetaContainer>
        </HeaderBlock>

        {/* 2. 본문 및 첨부파일 영역 */}
        <ArticleSection>
          {/* 횃불이 AI 요약 (Figma 2924:8866 사양 - API 데이터 있을 때만 표시) */}
          {Boolean(notice.aiSummary) && (
            <TorchAiSummaryCard>
              <AiSummaryHeader
                onClick={() => setIsAiSummaryOpen((prev) => !prev)}
              >
                <AiSummaryTitleGroup>
                  <AiLogoWrapper>
                    <img
                      src={TorchAiLogo}
                      alt="횃불이 AI"
                      width={28}
                      height={28}
                    />
                  </AiLogoWrapper>
                  <AiSummaryTitle>횃불이 AI 요약</AiSummaryTitle>
                </AiSummaryTitleGroup>
                <AiDropdownIconWrapper>
                  {isAiSummaryOpen ? (
                    <Icon name="chevron-up" size={20} />
                  ) : (
                    <Icon name="chevron-down" size={20} />
                  )}
                </AiDropdownIconWrapper>
              </AiSummaryHeader>

              {isAiSummaryOpen && (
                <AiSummaryBody>
                  <AiSummaryText>{notice.aiSummary}</AiSummaryText>
                  <AiDisclaimerText>
                    횃불이 AI가 제공하는 요약이에요. 중요한 정보는 직접
                    확인하세요.
                  </AiDisclaimerText>
                </AiSummaryBody>
              )}
            </TorchAiSummaryCard>
          )}

          {/* 본문 콘텐츠 (HTML 또는 Text) */}
          {notice.contentHtml ? (
            <BodyHtmlContent
              dangerouslySetInnerHTML={{ __html: notice.contentHtml }}
            />
          ) : (
            <BodyTextContent>
              {notice.contentText || notice.description || "내용이 없습니다."}
            </BodyTextContent>
          )}

          {/* 첨부파일 목록 (Figma 2924:8866 File container 사양) */}
          {notice.attachments && notice.attachments.length > 0 && (
            <AttachmentsContainer>
              {notice.attachments.map((file, idx) => (
                <AttachmentItem
                  key={`attachment-${idx}`}
                  onClick={() => handleAttachmentClick(file)}
                >
                  <FileIconWrapper>
                    <Icon name="file-document" size={20} color="var(--text-tertiary, #8b95a1)" />
                  </FileIconWrapper>
                  <FileInfo>
                    <FileName>{file.name}</FileName>
                    {(file.size || file.fileType) && (
                      <FileSize>
                        {[file.fileType?.toUpperCase(), file.size]
                          .filter(Boolean)
                          .join(" · ")}
                      </FileSize>
                    )}
                  </FileInfo>
                </AttachmentItem>
              ))}
            </AttachmentsContainer>
          )}
        </ArticleSection>
      </ContentWrapper>

      {/* 3. 하단 플로팅 CTA 버튼 (공유 / 페이지 열기) */}
      <BottomFloatingCTA>
        <ShareButton type="button" aria-label="공유하기" onClick={handleShare}>
          <Icon name="share" size={24} color="var(--text-secondary, #333d4b)" />
        </ShareButton>
        <StyledCapsuleButton variant="primary" onClick={handleOpenOriginalPage}>
          학교 홈페이지에서 보기
        </StyledCapsuleButton>
      </BottomFloatingCTA>
    </PageContainer>
  );
}

// ==========================================
// 스타일 정의 (Figma 속성 100% 매칭)
// ==========================================

const PageContainer = styled.div`
  min-height: 100svh;
  background-color: var(--bg-subtle, #f8f9fb);
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 16px calc(112px + env(safe-area-inset-bottom, 0px));
  padding-top: 0;
  width: 100%;
  max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
  min-width: 0;
  margin: 0 auto;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    padding: 32px ${DESKTOP_GUTTER}
      calc(120px + env(safe-area-inset-bottom, 0px));
    gap: 28px;
  }
`;

const HeaderBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid var(--border-strong, #d1d6db);
  padding-bottom: 20px;
  width: 100%;
`;

const CategoryBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--bg-brand, #eff6ff);
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  width: fit-content;
`;

const CategoryText = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: var(--text-brand, #0061ff);
  margin: 0;
  white-space: nowrap;
`;

const NoticeTitle = styled.h1`
  font-family: "Pretendard", sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
  letter-spacing: -0.2px;
  color: var(--text-secondary, #333d4b);
  margin: 0;
  word-break: break-word;
`;

const MetaContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
`;

const MetaColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetaColumnRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  line-height: 1.6;
  white-space: nowrap;
`;

const MetaLabel = styled.span`
  color: var(--text-tertiary, #8b95a1);
`;

const MetaValue = styled.span`
  color: var(--text-secondary, #333d4b);
`;

const MetaValueTertiary = styled.span`
  color: var(--text-tertiary, #8b95a1);
`;

const ArticleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  min-width: 0;
  max-width: 100%;
`;

// 횃불이 AI 요약 카드 (Figma 2960:8684)
const TorchAiSummaryCard = styled.div`
  background: linear-gradient(
    100.63deg,
    rgb(230, 241, 255) 0%,
    rgb(235, 235, 255) 100%
  );
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const AiSummaryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
`;

const AiSummaryTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const AiLogoWrapper = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AiSummaryTitle = styled.span`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
`;

const AiDropdownIconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, #333d4b);
`;

const AiSummaryBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const AiSummaryText = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary, #333d4b);
  margin: 0;
  word-break: break-word;
`;

const AiDisclaimerText = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--text-secondary, #333d4b);
  opacity: 0.5;
  margin: 0;
`;

// 본문 콘텐츠
const BodyHtmlContent = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-primary, #191f28);
  word-break: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* 고정 폭 인라인 컨테이너가 화면을 뚫고 나가지 않도록 방어 */
  div,
  p,
  span,
  section,
  article {
    max-width: 100%;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  p {
    margin: 0 0 12px 0;
    line-height: 1.6;
  }

  img,
  video,
  iframe,
  embed,
  object {
    max-width: 100% !important;
    height: auto !important;
    border-radius: 8px;
    margin: 8px 0;
  }

  /* 테이블/표는 화면 폭을 넘을 수 있으므로 표 자체만 가로 스크롤 가능하게 처리 */
  table {
    width: 100%;
    max-width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    display: block;
  }

  /* pre, code 블록도 가로 스크롤 허용 */
  pre {
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    white-space: pre-wrap;
    word-break: break-word;
    background: var(--bg-muted, #f1f3f5);
    padding: 12px;
    border-radius: 8px;
    margin: 12px 0;
  }

  th,
  td {
    border: 1px solid var(--border-default, #e5e8eb);
    padding: 8px 12px;
    font-size: 14px;
    word-break: break-word;
  }

  th {
    background-color: var(--bg-muted, #f1f3f5);
    font-weight: 600;
  }

  a {
    color: var(--interactive-primary, #0061ff);
    text-decoration: underline;
    word-break: break-all;
  }
`;

const BodyTextContent = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-primary, #191f28);
  word-break: break-word;
  white-space: pre-wrap;
`;

// 첨부파일 컨테이너 (Figma 2948:8557)
const AttachmentsContainer = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
`;

const AttachmentItem = styled.div`
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: var(--bg-muted, #f1f3f5);
  }
`;

const FileIconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
`;

const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const FileName = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: var(--text-secondary, #333d4b);
  margin: 0;
  word-break: break-word;
`;

const FileSize = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--text-tertiary, #8b95a1);
  margin: 0;
  white-space: nowrap;
`;

// 하단 플로팅 CTA (Figma 2932:13959)
const BottomFloatingCTA = styled.div`
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: ${DESKTOP_SEARCH_BAR_MAX_WIDTH};
  display: flex;
  gap: 12px;
  z-index: 100;
  box-sizing: border-box;
  pointer-events: none;

  @media ${DESKTOP_MEDIA} {
    bottom: calc(32px + env(safe-area-inset-bottom, 0px));
    width: calc(100% - 48px);
  }
`;

const ShareButton = styled.button`
  pointer-events: auto;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: var(--bg-muted, #f1f3f5);
  border: 1px solid var(--border-default, #e5e8eb);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.15s ease,
    background-color 0.15s ease;

  &:active {
    transform: scale(0.95);
    background-color: var(--border-default, #e5e8eb);
  }
`;

const StyledCapsuleButton = styled(CapsuleButton)`
  pointer-events: auto;
  flex: 1;
  height: 56px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.16);
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  gap: 16px;
`;

const ErrorText = styled.p`
  font-family: "Pretendard", sans-serif;
  font-size: 16px;
  color: var(--text-tertiary, #8b95a1);
  margin: 0;
`;

const BackButton = styled.button`
  padding: 10px 20px;
  border-radius: 999px;
  background-color: var(--bg-muted, #f1f3f5);
  border: 1px solid var(--border-default, #e5e8eb);
  color: var(--text-secondary, #333d4b);
  font-family: "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
`;
