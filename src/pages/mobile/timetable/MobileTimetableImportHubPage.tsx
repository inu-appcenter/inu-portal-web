import { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { School, ScanLine, ChevronRight, Calendar, ChevronDown, Check, ShieldCheck } from "lucide-react";
import { useHeader } from "@/context/HeaderContext";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { ROUTES } from "@/constants/routes";
import { TERM_LABELS, TERM_ORDER } from "@/utils/semester";
import BottomSheet from "@/components/common/BottomSheet";
import type { Term } from "@/types/timetables";

export default function MobileTimetableImportHubPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { timetables, activeTimetableId, setActiveTimetable, setSemester } =
    useTimetableStore();

  const [isTimetableSheetOpen, setIsTimetableSheetOpen] = useState(false);

  const targetTimetableId = useMemo(() => {
    const paramId = searchParams.get("id");
    if (paramId && !Number.isNaN(Number(paramId))) {
      return Number(paramId);
    }
    return activeTimetableId;
  }, [searchParams, activeTimetableId]);

  const activeTimetable = useMemo(() => {
    return timetables.find((t) => t.id === targetTimetableId) || null;
  }, [timetables, targetTimetableId]);

  const year = activeTimetable?.year ?? new Date().getFullYear();
  const term = activeTimetable?.term ?? "FIRST";

  const groupedTimetables = useMemo(() => {
    type SemesterGroup = {
      semester: string;
      year: number;
      term: Term;
      timetables: typeof timetables;
    };

    const groupMap = new Map<string, SemesterGroup>();

    timetables.forEach((t) => {
      const existing = groupMap.get(t.semester);
      if (existing) {
        existing.timetables.push(t);
      } else {
        groupMap.set(t.semester, {
          semester: t.semester,
          year: t.year,
          term: t.term,
          timetables: [t],
        });
      }
    });

    const sortedGroups = Array.from(groupMap.values()).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return (TERM_ORDER[b.term] ?? 0) - (TERM_ORDER[a.term] ?? 0);
    });

    sortedGroups.forEach((group) => {
      group.timetables.sort((a, b) => {
        if (a.isRepresentative !== b.isRepresentative) {
          return a.isRepresentative ? -1 : 1;
        }
        return a.id - b.id;
      });
    });

    return sortedGroups;
  }, [timetables]);

  useHeader({
    title: "시간표 및 성적 가져오기",
    hasback: true,
    pageBgColor: "var(--bg-subtle, #f8f9fb)",
  });

  return (
    <PageWrapper>
      <ScrollContainer>
        {/* 상단 대상 시간표 배지 */}
        <TargetTimetableRow>
          <TargetTimetableBadge
            type="button"
            onClick={() => setIsTimetableSheetOpen(true)}
          >
            <Calendar className="calendar" size={15} />
            <span>
              {year}년 {TERM_LABELS[term]} · {activeTimetable?.name ?? "기본 시간표"}
            </span>
            <ChevronDown className="chevron" size={14} />
          </TargetTimetableBadge>
        </TargetTimetableRow>

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
            <CardTitle>인천대학교 포털에서 가져오기</CardTitle>
            <CardDesc>
              포털 로그인 한 번으로 시간표를 가져오고, 전 학기 성적까지 학점 계산기에 한 번에 등록해요.
            </CardDesc>
          </CardTitleGroup>

          <BenefitList>
            <BenefitItem>
              <Check size={14} color="#0061ff" strokeWidth={2.5} />
              <span>수강신청 시간표 자동 등록 (요일, 교시, 강의실)</span>
            </BenefitItem>
            <BenefitItem>
              <Check size={14} color="#0061ff" strokeWidth={2.5} />
              <span>학기별·과목별 성적을 학점 계산기에 원클릭 연동</span>
            </BenefitItem>
            <BenefitItem>
              <ShieldCheck size={14} color="#0061ff" strokeWidth={2.5} />
              <span>서버 저장 없이 휴대폰 보안 영역에서만 안전하게 처리</span>
            </BenefitItem>
          </BenefitList>

          <CardActionRow $highlight>
            <span>포털 연동으로 가져오기</span>
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

          <BenefitList>
            <BenefitItem>
              <Check size={14} color="#4e5968" strokeWidth={2.5} />
              <span>캡처 사진만 올리면 AI가 강의명과 분반을 자동 인식</span>
            </BenefitItem>
            <BenefitItem>
              <Check size={14} color="#4e5968" strokeWidth={2.5} />
              <span>포털 로그인 없이 갤러리 이미지로 바로 등록</span>
            </BenefitItem>
          </BenefitList>

          <CardActionRow>
            <span>이미지 선택하러 가기</span>
            <ChevronRight size={18} />
          </CardActionRow>
        </MethodCard>
      </ScrollContainer>

      {/* 대상 시간표 변경 바텀시트 */}
      <BottomSheet
        open={isTimetableSheetOpen}
        onOpenChange={(open) => setIsTimetableSheetOpen(open)}
        height="auto"
        maxHeight="75%"
      >
        <SheetContainer>
          <SheetHeader>
            <SheetTitle>가져올 시간표 선택</SheetTitle>
          </SheetHeader>
          <SheetContent>
            {groupedTimetables.map((group) => (
              <SemesterSection key={group.semester}>
                <SemesterHeader>{group.semester}</SemesterHeader>
                <TimetableCardList>
                  {group.timetables.map((t) => {
                    const isSelected = t.id === targetTimetableId;
                    return (
                      <TimetableRowButton
                        key={t.id}
                        type="button"
                        $selected={isSelected}
                        onClick={() => {
                          setSearchParams({ id: String(t.id) });
                          setActiveTimetable(t.id);
                          setSemester(t.semester);
                          setIsTimetableSheetOpen(false);
                        }}
                      >
                        <TimetableRowLeft>
                          <TimetableRowName $selected={isSelected}>
                            {t.name}
                            {t.isRepresentative && (
                              <PrimaryBadge>대표</PrimaryBadge>
                            )}
                          </TimetableRowName>
                          <TimetableRowMeta>
                            과목 {t.events.length}개
                          </TimetableRowMeta>
                        </TimetableRowLeft>
                        {isSelected && (
                          <Check size={20} color="#0061ff" strokeWidth={2.5} />
                        )}
                      </TimetableRowButton>
                    );
                  })}
                </TimetableCardList>
              </SemesterSection>
            ))}
          </SheetContent>
        </SheetContainer>
      </BottomSheet>
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

const TargetTimetableRow = styled.div`
  display: flex;
  align-items: center;
`;

const TargetTimetableBadge = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #333d4b;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.15s ease;

  &:active {
    background: #f2f4f6;
  }

  .calendar {
    color: #0061ff;
  }

  .chevron {
    color: #8b95a1;
  }
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
  gap: 6px;
`;

const CardTitle = styled.h2`
  font-size: 17px;
  font-weight: 700;
  color: #191f28;
  margin: 0;
`;

const CardDesc = styled.p`
  font-size: 13.5px;
  color: #6b7684;
  margin: 0;
  line-height: 1.45;
`;

const BenefitList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  background: #f9fafb;
  border-radius: 12px;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #4e5968;
  line-height: 1.35;
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

const SheetContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 16px 24px;
  gap: 16px;
`;

const SheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SheetTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #191f28;
  margin: 0;
`;

const SheetContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 60vh;
  overflow-y: auto;
`;

const SemesterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SemesterHeader = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #8b95a1;
`;

const TimetableCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TimetableRowButton = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${(props) => (props.$selected ? "#0061ff" : "#f2f4f6")};
  background: ${(props) => (props.$selected ? "#f0f6ff" : "#ffffff")};
  cursor: pointer;
  text-align: left;
`;

const TimetableRowLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TimetableRowName = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => (props.$selected ? "#0061ff" : "#191f28")};
`;

const PrimaryBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  background: #e5f0ff;
  color: #0061ff;
  font-size: 11px;
  font-weight: 600;
`;

const TimetableRowMeta = styled.div`
  font-size: 12px;
  color: #8b95a1;
`;
