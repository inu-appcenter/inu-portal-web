import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getNotices } from "@/apis/notices";
import { Notice } from "@/types/notices";
import { ROUTES } from "@/constants/routes";
import Icon from "@/components/common/Icon";

export default function DailyBriefNoticeCard() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    let isMounted = true;
    void getNotices("전체", "date", 1)
      .then((res) => {
        if (isMounted && res.data?.contents) {
          setNotices(res.data.contents);
        }
      })
      .catch((err) => {
        console.warn("공지사항 조회 실패:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayNotices = notices.slice(0, 4);

  return (
    <SectionWrapper>
      <ContextIntro>최신 공지사항을 확인해 보세요.</ContextIntro>
      <CardContainer>
        <CardHeader onClick={() => navigate(ROUTES.BOARD.NOTICE)}>
          <CardTitle>주요 공지사항</CardTitle>
          <HeaderMoreButton aria-label="공지사항 더보기">
            <Icon name="chevron-right" size={14} color="#6b7280" />
          </HeaderMoreButton>
        </CardHeader>

        <NoticeList>
          {displayNotices.length === 0 ? (
            <EmptyNoticeText>등록된 공지사항이 없습니다.</EmptyNoticeText>
          ) : (
            displayNotices.map((notice, idx) => (
              <ReactNoticeItem
                key={notice.id || idx}
                onClick={() => navigate(ROUTES.BOARD.NOTICE_DETAIL(notice.id))}
              >
                {idx > 0 && <ItemDivider />}
                <ItemContent>
                  <TopMetaRow>
                    <CategoryBadge>{notice.category || "일반"}</CategoryBadge>
                    <NoticeDate>{notice.createDate || ""}</NoticeDate>
                  </TopMetaRow>
                  <NoticeTitleText>{notice.title}</NoticeTitleText>
                </ItemContent>
              </ReactNoticeItem>
            ))
          )}
        </NoticeList>

        <FooterRow>
          <ViewAllButton onClick={() => navigate(ROUTES.BOARD.NOTICE)}>
            공지사항 전체보기
          </ViewAllButton>
        </FooterRow>
      </CardContainer>
    </SectionWrapper>
  );
}

const SectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

const ContextIntro = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding: 0 4px;
  letter-spacing: -0.3px;
  line-height: 1.35;
`;

const CardContainer = styled.div`
  background: #ffffff;
  border-radius: 28px;
  padding: 22px 20px 18px 20px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const CardTitle = styled.h2`
  font-size: 19px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.4px;
  margin: 0;
`;

const HeaderMoreButton = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NoticeList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ReactNoticeItem = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  padding: 8px 0;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.7;
  }
`;

const ItemDivider = styled.div`
  height: 1px;
  background-color: #f3f4f6;
  margin-bottom: 10px;
`;

const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TopMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryBadge = styled.span`
  font-size: 11.5px;
  font-weight: 700;
  color: #2563eb;
  background-color: #eff6ff;
  border: 1px solid #dbeafe;
  padding: 2px 7px;
  border-radius: 6px;
  line-height: 1.2;
`;

const NoticeDate = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
`;

const NoticeTitleText = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: -0.3px;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EmptyNoticeText = styled.p`
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
  margin: 16px 0;
`;

const FooterRow = styled.div`
  border-top: 1px solid #f3f4f6;
  padding-top: 12px;
  margin-top: 4px;
`;

const ViewAllButton = styled.button`
  width: 100%;
  height: 44px;
  border-radius: 22px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: #edf2f7;
    transform: scale(0.99);
  }
`;
