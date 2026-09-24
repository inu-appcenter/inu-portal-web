import { useMemo } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { School, ScanLine, ChevronRight } from "lucide-react";
import { useHeader } from "@/context/HeaderContext";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { ROUTES } from "@/constants/routes";

export default function MobileTimetableImportHubPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { activeTimetableId } = useTimetableStore();

  const targetTimetableId = useMemo(() => {
    const paramId = searchParams.get("id");
    if (paramId && !Number.isNaN(Number(paramId))) {
      return Number(paramId);
    }
    return activeTimetableId;
  }, [searchParams, activeTimetableId]);

  useHeader({
    title: "시간표 및 성적 가져오기",
    hasback: true,
    pageBgColor: "var(--bg-subtle, #f8f9fb)",
  });

  return (
    <PageWrapper>
      <ScrollContainer>
        <HeadlineGroup>
          <MainTitle>시간표를 어떻게 가져올까요?</MainTitle>
          <MainSubtitle>
            편리한 방법을 선택해 시간표를 빠르게 등록해보세요.
          </MainSubtitle>
        </HeadlineGroup>

        {/* 옵션 1: 포털에서 가져오기 (추천) */}
        <MethodCard
          type="button"
          $highlight
          onClick={() => {
            navigate(
              `${ROUTES.TIMETABLE.PORTAL_IMPORT}${targetTimetableId ? `?id=${targetTimetableId}` : ""}`,
            );
          }}
        >
          <CardTopRow>
            <CardIconBox $highlight>
              <School size={24} color="#0061ff" />
            </CardIconBox>
            <BadgeRow>
              <RecommendBadge>추천</RecommendBadge>
              <FeatureBadge>시간표 + 성적</FeatureBadge>
            </BadgeRow>
          </CardTopRow>

          <CardTitleGroup>
            <CardTitle>인천대학교 포털 사이트에서 가져오기</CardTitle>
            <CardDesc>
              인천대학교 포털사이트에서 시간표 정보를 가져와요.{" "}
              <strong>가져오는 과정은 이 기기에서만 처리</strong>되며, 가져온
              데이터를 INTIP 시간표에 등록해요.
            </CardDesc>
          </CardTitleGroup>

          <CardActionRow $highlight>
            <span>포털에서 가져오기</span>
            <ChevronRight size={18} />
          </CardActionRow>
        </MethodCard>

        {/* 옵션 2: 이미지로 가져오기 */}
        <MethodCard
          type="button"
          onClick={() => {
            navigate(
              `${ROUTES.TIMETABLE.IMAGE_IMPORT}${targetTimetableId ? `?id=${targetTimetableId}` : ""}`,
            );
          }}
        >
          <CardTopRow>
            <CardIconBox>
              <ScanLine size={24} color="#4e5968" />
            </CardIconBox>
            <BadgeRow>
              <NormalBadge>캡처 인식</NormalBadge>
            </BadgeRow>
          </CardTopRow>

          <CardTitleGroup>
            <CardTitle>시간표 이미지로 가져오기</CardTitle>
            <CardDesc>
              에브리타임, 인천대 수강신청 앱, 포털 수강신청확인원의 캡처 이미지로 등록해요.
            </CardDesc>
          </CardTitleGroup>

          <CardActionRow>
            <span>이미지 선택하러 가기</span>
            <ChevronRight size={18} />
          </CardActionRow>
        </MethodCard>
      </ScrollContainer>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height, 56px));
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-subtle, #f8f9fb);
`;

const ScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HeadlineGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
  margin-bottom: 4px;
`;

const MainTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #191f28;
  margin: 0;
  line-height: 1.35;
`;

const MainSubtitle = styled.p`
  font-size: 14px;
  color: #6b7684;
  margin: 0;
  line-height: 1.45;
`;

const MethodCard = styled.button<{ $highlight?: boolean }>`
  width: 100%;
  background: #ffffff;
  border: 1.5px solid ${(props) => (props.$highlight ? "#0061ff" : "#e5e8eb")};
  border-radius: 20px;
  padding: 22px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
  cursor: pointer;
  box-shadow: ${(props) =>
    props.$highlight
      ? "0 4px 20px rgba(0, 97, 255, 0.08)"
      : "0 2px 8px rgba(0, 0, 0, 0.03)"};
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.99);
  }
`;

const CardTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardIconBox = styled.div<{ $highlight?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${(props) => (props.$highlight ? "#e8f3ff" : "#f2f4f6")};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RecommendBadge = styled.span`
  padding: 3px 8px;
  border-radius: 6px;
  background: #0061ff;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
`;

const FeatureBadge = styled.span`
  padding: 3px 8px;
  border-radius: 6px;
  background: #e8f3ff;
  color: #0061ff;
  font-size: 11px;
  font-weight: 600;
`;

const NormalBadge = styled.span`
  padding: 3px 8px;
  border-radius: 6px;
  background: #f2f4f6;
  color: #4e5968;
  font-size: 11px;
  font-weight: 600;
`;

const CardTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardTitle = styled.h2`
  font-size: 17px;
  font-weight: 700;
  color: #191f28;
  margin: 0;
`;

const CardDesc = styled.p`
  font-size: 13.5px;
  color: #4e5968;
  margin: 0;
  line-height: 1.5;

  strong {
    color: #191f28;
    font-weight: 600;
  }
`;

const CardActionRow = styled.div<{ $highlight?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
  border-top: 1px solid #f2f4f6;
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => (props.$highlight ? "#0061ff" : "#4e5968")};
`;
