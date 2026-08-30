import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ChevronLeft } from "lucide-react";
import CapsuleButton from "@/components/common/CapsuleButton";
import { useSemesters } from "@/hooks/useSemesters";
import { pickCurrentSemester } from "@/utils/semester";
import { useCourses } from "@/hooks/useCourses";
import useUserStore from "@/stores/useUserStore";
import { parseSmartCampusGrades } from "@/utils/parseSmartCampusGrades";
import { resolveGradeCourses } from "@/utils/resolveGradeCourses";
import GradeImportGuideSheet from "@/components/mobile/timetable/GradeImportGuideSheet";
import type {
  GradeMatchStatus,
  ParsedGradeSheet,
  ResolvedGradeRow,
} from "@/types/gradeImport";
import type { Term } from "@/types/timetables";

interface GradeImportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** 불러온 과목이 들어갈 계산기 학기 라벨(예: "3학년 1학기"). 안내 문구에만 쓴다. */
  targetSemesterLabel: string;
  /** source는 학기를 특정하지 못한 경우(학기 목록 조회 실패 등) null이 될 수 있다. */
  onApply: (
    rows: ResolvedGradeRow[],
    source: { year: number; term: Term } | null,
  ) => void;
}

const PLACEHOLDER = `기업가정신 / 0005103	1	P	심화교양	사회
운영체제 / IAA6018	3	B+	전공핵심	전공핵심`;

const MATCH_BADGE: Record<GradeMatchStatus, string> = {
  MATCHED_BY_CODE: "과목 연결됨",
  MATCHED_BY_TITLE: "과목 연결됨",
  AMBIGUOUS: "동명 과목 여러 개",
  UNMATCHED: "연결 안 됨",
};

export default function GradeImportSheet({
  isOpen,
  onClose,
  targetSemesterLabel,
  onApply,
}: GradeImportSheetProps) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedGradeSheet | null>(null);
  const [resolvedRows, setResolvedRows] = useState<ResolvedGradeRow[] | null>(
    null,
  );
  const [isResolving, setIsResolving] = useState(false);
  const [detectedSemester, setDetectedSemester] = useState<{
    year: number;
    term: Term;
  } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const { semesters } = useSemesters();
  // 과목명 매칭용 전 학과 Course 목록. 시트를 열 때만 받아온다(3천여 건, 한 번에 옴).
  const { courses, isLoading: isCoursesLoading } = useCourses(undefined, {
    enabled: isOpen,
  });
  const myDepartment = useUserStore((state) => state.userInfo.department);

  // 시트를 닫았다 열면 항상 처음 상태에서 시작한다.
  useEffect(() => {
    if (isOpen) return;
    setText("");
    setParsed(null);
    setResolvedRows(null);
    setIsResolving(false);
    setDetectedSemester(null);
  }, [isOpen]);

  // 붙여넣은 텍스트에서 학기를 못 읽었으면 가장 최근 학기를 쓴다. 이 학기는 학수번호로
  // 개설강의를 되짚을 때만 쓰이는데, 학수번호는 개설이 아니라 과목의 식별자라 그 과목이
  // 열린 학기면 어느 학기로 조회하든 같은 courseId가 나온다. 그래서 사용자에게 고르게
  // 하지 않는다.
  const effectiveSemester = useMemo(() => {
    if (detectedSemester) return detectedSemester;
    // 진행중(OPEN) 학기를 우선한다 — 다음 학기가 개설강의 동기화 전에
    // 미리 등록돼 있으면(#235) 최신 학기가 아직 텅 빈 학기일 수 있다.
    const preferred = pickCurrentSemester(semesters);
    if (preferred) {
      return { year: preferred.year, term: preferred.term };
    }
    return null;
  }, [detectedSemester, semesters]);

  const handleParse = async () => {
    const result = parseSmartCampusGrades(text);
    setParsed(result);

    if (result.rows.length === 0) {
      setResolvedRows([]);
      return;
    }

    // 붙여넣은 텍스트에 "2026년 1학기 과목별 성적" 제목이 같이 왔다면 그 학기를 쓴다.
    const semester = result.detectedSemester ?? effectiveSemester;
    if (result.detectedSemester) {
      setDetectedSemester(result.detectedSemester);
    }

    setIsResolving(true);
    try {
      // 매칭 본체는 Course 목록(학기 무관)이고, semester는 과목명으로 못 좁힌 행을
      // 학수번호로 보강할 때만 쓴다. 학기를 몰라도 매칭 자체는 돌아간다.
      const resolved = await resolveGradeCourses(result.rows, courses, {
        myDepartment,
        semester,
      });
      setResolvedRows(resolved);
    } finally {
      setIsResolving(false);
    }
  };

  const handleApply = () => {
    if (!resolvedRows || resolvedRows.length === 0) return;
    onApply(resolvedRows, effectiveSemester);
  };

  const matchedCount = useMemo(
    () =>
      (resolvedRows ?? []).filter(
        (row) =>
          row.matchStatus === "MATCHED_BY_CODE" ||
          row.matchStatus === "MATCHED_BY_TITLE",
      ).length,
    [resolvedRows],
  );

  const voidedCount = useMemo(
    () => (resolvedRows ?? []).filter((row) => row.voided).length,
    [resolvedRows],
  );

  if (!isOpen) return null;

  const isPreview = resolvedRows !== null;

  return (
    <>
      <SheetOverlay onClick={onClose} />
      <Sheet>
        <SheetHeader>
          <div className="drag-handle" />
          <div className="title-row">
            {isPreview && (
              <BackButton
                onClick={() => {
                  setResolvedRows(null);
                  setParsed(null);
                }}
                aria-label="다시 붙여넣기"
              >
                <ChevronLeft size={20} />
              </BackButton>
            )}
            <div className="title">
              {isPreview ? "불러올 과목 확인" : "성적 붙여넣기"}
            </div>
          </div>
        </SheetHeader>

        <SheetBody>
          {!isPreview ? (
            <>
              <GuideBox>
                <p>
                  스마트캠퍼스 <b>성적조회 &gt; 과목별 성적</b> 표를 드래그해
                  복사한 뒤 그대로 붙여넣으세요.
                </p>
                <p className="sub">
                  화면을 통째로 복사하거나("모두 선택") 표 중간부터 드래그해도
                  과목 행만 알아서 골라내요. 표 제목까지 함께 붙여넣으면 학기도
                  자동으로 인식해요.
                </p>
                <GuideLinkButton type="button" onClick={() => setShowGuide(true)}>
                  복사하는 방법이 궁금하다면? 예시로 보기
                </GuideLinkButton>
              </GuideBox>

              <PasteArea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={PLACEHOLDER}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
              />
            </>
          ) : (
            <>
              {resolvedRows.length === 0 ? (
                <EmptyBox>
                  <b>과목을 하나도 찾지 못했어요.</b>
                  <span>
                    표를 셀 단위로 복사했는지 확인해주세요. 과목명과 과목코드가
                    `/`로 이어진 형태여야 인식할 수 있어요.
                  </span>
                  {parsed && parsed.skippedLines.length > 0 && (
                    <SkippedList>
                      {parsed.skippedLines.slice(0, 3).map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                    </SkippedList>
                  )}
                </EmptyBox>
              ) : (
                <>
                  <SummaryLine>
                    <b>{resolvedRows.length}개 과목</b>을 찾았어요. 이 중{" "}
                    {matchedCount}개는 학교 강의 정보와 연결됐어요.
                    {voidedCount > 0 && (
                      <span className="target">
                        재수강으로 성적이 취소된 {voidedCount}개는 평점 계산에서
                        빠집니다.
                      </span>
                    )}
                    {matchedCount > 0 && (
                      <span className="target">
                        학점은 현재 편람 기준으로 표시돼요. 이수 당시와
                        학점이 바뀐 과목은 실제와 다를 수 있어요 — 다르면
                        직접 수정해주세요.
                      </span>
                    )}
                    <span className="target">
                      {targetSemesterLabel}에 추가됩니다.
                    </span>
                  </SummaryLine>

                  <PreviewList>
                    {resolvedRows.map((row) => (
                      <PreviewRow
                        key={`${row.courseCode}-${row.title}`}
                        $dimmed={row.voided}
                      >
                        <div className="main">
                          <span className="name">{row.title}</span>
                          <span className="meta">
                            {row.courseCode}
                            {row.resolvedCredit !== null
                              ? ` · ${row.resolvedCredit}학점`
                              : " · 학점 미상"}
                            {row.resolvedIsuName
                              ? ` · ${row.resolvedIsuName}`
                              : ""}
                            {row.note ? ` · ${row.note}` : ""}
                          </span>
                        </div>
                        <div className="right">
                          <GradePill $empty={!row.grade || row.voided}>
                            {row.voided
                              ? "성적취소"
                              : (row.grade ?? "미입력")}
                          </GradePill>
                          <MatchBadge $status={row.matchStatus}>
                            {MATCH_BADGE[row.matchStatus]}
                          </MatchBadge>
                        </div>
                      </PreviewRow>
                    ))}
                  </PreviewList>
                </>
              )}
            </>
          )}
        </SheetBody>

        <SheetFooter>
          {!isPreview ? (
            <CapsuleButton
              variant="primary"
              fullWidth
              loading={isResolving || isCoursesLoading}
              disabled={!text.trim() || isResolving || isCoursesLoading}
              onClick={handleParse}
            >
              {isResolving
                ? "과목 연결 중…"
                : isCoursesLoading
                  ? "강의 정보 불러오는 중…"
                  : "불러오기"}
            </CapsuleButton>
          ) : (
            <CapsuleButton
              variant="primary"
              fullWidth
              disabled={resolvedRows.length === 0}
              onClick={handleApply}
            >
              {resolvedRows.length}개 과목 적용
            </CapsuleButton>
          )}
        </SheetFooter>
      </Sheet>

      <GradeImportGuideSheet
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </>
  );
}

const SheetOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 2000;
`;

const Sheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-base, #ffffff);
  border-radius: 24px 24px 0 0;
  max-height: 88vh;
  z-index: 2001;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.25s cubic-bezier(0.1, 0.76, 0.55, 0.94);

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const SheetHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px 8px;
  flex-shrink: 0;

  .drag-handle {
    width: 36px;
    height: 4px;
    background-color: var(--border-default, #e5e8eb);
    border-radius: 2px;
    margin-bottom: 12px;
  }

  .title-row {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-secondary, #333d4b);
  }
`;

const BackButton = styled.button`
  position: absolute;
  left: 0;
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  color: var(--text-tertiary, #8b95a1);
  cursor: pointer;
  outline: none;
`;

const SheetBody = styled.div`
  overflow-y: auto;
  padding: 8px 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

const GuideBox = styled.div`
  background-color: var(--bg-subtle, #f8f9fb);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  p {
    margin: 0;
    font-size: 13px;
    line-height: 18px;
    color: var(--text-secondary, #333d4b);
  }

  .sub {
    color: var(--text-tertiary, #8b95a1);
  }
`;

const GuideLinkButton = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  padding: 2px 0 0;
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-brand, #0061ff);
  cursor: pointer;
  outline: none;
  text-decoration: underline;
  text-underline-offset: 2px;
`;

const PasteArea = styled.textarea`
  width: 100%;
  min-height: 160px;
  box-sizing: border-box;
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-secondary, #333d4b);
  background-color: var(--bg-base, #ffffff);
  resize: vertical;
  outline: none;

  &:focus {
    border-color: var(--border-brand, #0061ff);
  }

  &::placeholder {
    color: var(--text-disabled, #b0b8c1);
    white-space: pre;
  }
`;

const SummaryLine = styled.div`
  font-size: 14px;
  line-height: 20px;
  color: var(--text-secondary, #333d4b);

  .target {
    display: block;
    margin-top: 2px;
    font-size: 12px;
    color: var(--text-tertiary, #8b95a1);
  }
`;

const PreviewList = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  overflow: hidden;
`;

const PreviewRow = styled.div<{ $dimmed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  opacity: ${({ $dimmed }) => ($dimmed ? 0.55 : 1)};

  &:last-child {
    border-bottom: none;
  }

  .main {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary, #333d4b);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta {
    font-size: 12px;
    color: var(--text-tertiary, #8b95a1);
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
  }
`;

const GradePill = styled.span<{ $empty: boolean }>`
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 13px;
  font-weight: 500;
  background-color: ${({ $empty }) =>
    $empty ? "var(--bg-muted, #f1f3f5)" : "var(--bg-warn-subtle, #fffaeb)"};
  color: ${({ $empty }) =>
    $empty ? "var(--text-tertiary, #8b95a1)" : "var(--yellow-600, #b58000)"};
`;

const MatchBadge = styled.span<{ $status: GradeMatchStatus }>`
  font-size: 11px;
  color: ${({ $status }) =>
    $status === "MATCHED_BY_CODE" || $status === "MATCHED_BY_TITLE"
      ? "var(--text-brand, #0061ff)"
      : "var(--text-tertiary, #8b95a1)"};
`;

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 24px 4px;
  font-size: 13px;
  line-height: 19px;
  color: var(--text-tertiary, #8b95a1);

  b {
    font-size: 14px;
    color: var(--text-secondary, #333d4b);
  }
`;

const SkippedList = styled.ul`
  margin: 4px 0 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--text-disabled, #b0b8c1);

  li {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const SheetFooter = styled.div`
  flex-shrink: 0;
  padding: 12px 20px calc(20px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--border-default, #e5e8eb);
`;
