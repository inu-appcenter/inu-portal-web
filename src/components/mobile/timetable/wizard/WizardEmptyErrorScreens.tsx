import styled from "styled-components";
import CapsuleButton from "@/components/common/CapsuleButton";
import { guideMascot as 안내횃불이 } from "@/resources/assets/illustrations/book";
import type {
  WizardConflictItem,
  WizardCourseOption,
} from "@/types/timetableWizard";
import { formatCourseMeta } from "@/utils/timetableWizardFormat";

interface WizardEmptyStateProps {
  conflicts: WizardConflictItem[];
  onRelax: () => void;
  // 원인이 지목된 conflict(courses가 채워진 경우, 항상 위시리스트 항목이다 -
  // timetableWizardGenerator.ts의 findOverlappingRequiredPairs/
  // findRequiredCoursesIn*/findRequiredCoursesOnFreeDays 참고)를 이 화면에서
  // 바로 뺄 수 있게 한다. 없으면(레거시 호출부) 빼기 버튼을 숨긴다.
  onRemoveWishlistCourse?: (subjectNumber: string) => void;
  // 같은 과목의 다른 분반으로 바꾸고 싶을 때 - 원인 강의를 빼고 그 과목명으로
  // 미리 필터링된 강의 검색 시트를 연다.
  onReplaceWishlistCourse?: (course: WizardCourseOption) => void;
}

export function WizardEmptyState({
  conflicts,
  onRelax,
  onRemoveWishlistCourse,
  onReplaceWishlistCourse,
}: WizardEmptyStateProps) {
  return (
    <Wrapper>
      <Body>
        <Illustration src={안내횃불이} alt="" />
        <Title>조건에 맞는 시간표를 못 찾았어요</Title>
        <Subtitle>조건을 조금만 풀면 결과가 나올 수 있어요</Subtitle>

        {conflicts.length > 0 && (
          <ConflictCard>
            <ConflictHead>⚠ 서로 충돌하는 조건</ConflictHead>
            <ConflictList>
              {conflicts.map((c, index) => (
                <ConflictItem key={index}>
                  · {c.label}
                  {c.courses && c.courses.length > 0 && (
                    <ConflictCourseList>
                      {c.courses.map((course, courseIndex) => (
                        <ConflictCourseRow key={courseIndex}>
                          <ConflictCourse>
                            {course.title} ({formatCourseMeta(course)})
                          </ConflictCourse>
                          <ConflictCourseActions>
                            {onReplaceWishlistCourse && (
                              <ConflictCourseRemoveButton
                                type="button"
                                onClick={() =>
                                  onReplaceWishlistCourse(course)
                                }
                              >
                                교체
                              </ConflictCourseRemoveButton>
                            )}
                            {onRemoveWishlistCourse && (
                              <ConflictCourseRemoveButton
                                type="button"
                                onClick={() =>
                                  onRemoveWishlistCourse(course.subjectNumber)
                                }
                              >
                                빼기
                              </ConflictCourseRemoveButton>
                            )}
                          </ConflictCourseActions>
                        </ConflictCourseRow>
                      ))}
                    </ConflictCourseList>
                  )}
                </ConflictItem>
              ))}
            </ConflictList>
            <ConflictFootnote>이 조건들을 동시에 만족하는 조합이 없어요.</ConflictFootnote>
          </ConflictCard>
        )}
      </Body>
      <BottomArea>
        <CapsuleButton variant="primary" fullWidth onClick={onRelax}>
          조건 완화하기
        </CapsuleButton>
      </BottomArea>
    </Wrapper>
  );
}

interface WizardErrorStateProps {
  onRetry: () => void;
}

export function WizardErrorState({ onRetry }: WizardErrorStateProps) {
  return (
    <Wrapper>
      <Body>
        <ErrorIllustration>!</ErrorIllustration>
        <Title>시간표를 만들지 못했어요</Title>
        <Subtitle>네트워크 상태를 확인하고 다시 시도해주세요</Subtitle>
      </Body>
      <BottomArea>
        <CapsuleButton variant="primary" fullWidth onClick={onRetry}>
          다시 시도
        </CapsuleButton>
      </BottomArea>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  min-height: calc(100vh - var(--header-height));
  width: 100%;
  box-sizing: border-box;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 16px 24px;
  gap: 8px;
`;

const Illustration = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 16px;
`;

const ErrorIllustration = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--bg-subtle, #f8f9fb);
  border: 1px solid var(--border-default, #e5e8eb);
  color: var(--text-tertiary, #8b95a1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 16px;
  box-sizing: border-box;
`;

const Title = styled.h1`
  margin: 0;
  color: var(--text-primary, #191f28);
  font-size: 18px;
  font-weight: 700;
  line-height: 27px;
  text-align: center;
`;

const Subtitle = styled.p`
  margin: 0 0 16px;
  color: var(--text-secondary, #333d4b);
  font-size: 14px;
  line-height: 21px;
  text-align: center;
`;

const ConflictCard = styled.div`
  width: 100%;
  background: #fff8e9;
  border: 1px solid #fdd9aa;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  color: #d97706;
`;

const ConflictHead = styled.span`
  font-size: 14px;
  font-weight: 700;
`;

const ConflictList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ConflictItem = styled.div`
  font-size: 13px;
  line-height: 20px;
`;

const ConflictCourseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 2px;
  padding-left: 12px;
`;

const ConflictCourseRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const ConflictCourseActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const ConflictCourse = styled.span`
  font-size: 12px;
  line-height: 18px;
  word-break: break-all;
`;

const ConflictCourseRemoveButton = styled.button`
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);
  color: var(--text-secondary, #4e5968);
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
`;

const ConflictFootnote = styled.span`
  font-size: 12px;
  line-height: 18px;
`;

const BottomArea = styled.div`
  padding: 16px 20px calc(24px + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
`;
