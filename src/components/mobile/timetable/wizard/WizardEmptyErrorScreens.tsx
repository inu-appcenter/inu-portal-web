import styled from "styled-components";
import { wizardFailed } from "@/resources/assets/illustrations/timetable";
import {
  WizardBottomCTA,
  WizardCard,
  WizardCourseSectionRow,
  WizardStatusMessage,
} from "@/components/mobile/timetable/wizard/ui";
import { buttonReset } from "@/components/mobile/timetable/wizard/ui/tokens";
import type {
  WizardConflictItem,
  WizardCourseOption,
} from "@/types/timetableWizard";
import { formatCourseMeetings, WIZARD_DAY_NAMES } from "@/utils/timetableWizardFormat";
import { typography } from "@/styles/typography";

interface WizardEmptyStateProps {
  conflicts: WizardConflictItem[];
  /** "조건 수정하기" */
  onRelax: () => void;
  /** 목표 학점. kind=credit 문구의 {N}. 생략하면 범위 문구 없이 안내한다 */
  targetCredit?: number;
  // 담은 강의끼리 시간이 겹치는 conflict(courses가 채워진 경우, 항상 위시리스트
  // 항목이다 - timetableWizardGenerator.ts의 findOverlappingRequiredPairs 참고)를
  // 이 화면에서 바로 뺄 수 있게 한다(#248). 없으면 빼기 버튼을 숨긴다.
  onRemoveWishlistCourse?: (subjectNumber: string) => void;
  // 같은 과목의 다른 분반으로 바꾸고 싶을 때 - 원인 강의를 빼고 그 과목명으로
  // 미리 필터링된 강의 검색 시트를 연다.
  onReplaceWishlistCourse?: (course: WizardCourseOption) => void;
}

// 실패 원인별 설명 (Figma 실패_겹침 / 실패_지정공강 / 실패_학점범위)
const describeConflict = (
  conflict: WizardConflictItem | undefined,
  targetCredit: number | undefined,
): React.ReactNode => {
  switch (conflict?.kind) {
    case "overlap":
      return conflict.courses && conflict.courses.length > 1
        ? "아래 두 강의가 같은 시간에 있어요"
        : "담은 강의끼리 시간이 겹쳐요";
    case "freeDay": {
      const days = (conflict.days ?? []).map((d) => WIZARD_DAY_NAMES[d]).join(", ");
      return `${days}요일 공강 조건 때문에 모든 조합이 걸렸어요`;
    }
    case "credit": {
      const max = conflict.achievableCredits?.at(-1);
      return (
        <>
          {targetCredit !== undefined
            ? `목표 ${targetCredit}학점에 맞는 조합이 없어요`
            : "목표 학점에 맞는 조합이 없어요"}
          {max !== undefined && (
            <>
              <br />
              지금 담은 강의로는 {max}학점까지 가능해요
            </>
          )}
        </>
      );
    }
    case "noWishlist":
      return "듣고 싶은 강의를 먼저 담아주세요";
    default:
      return conflict?.label ?? "조건을 조금만 풀면 결과가 나올 수 있어요";
  }
};

export function WizardEmptyState({
  conflicts,
  onRelax,
  targetCredit,
  onRemoveWishlistCourse,
  onReplaceWishlistCourse,
}: WizardEmptyStateProps) {
  const primary = conflicts[0];
  // 시안은 원인 하나만 보여 주고, 강의 카드는 "겹침" 실패에만 붙인다. 공강 요일 원인은
  // 걸린 강의가 많아 목록이 길어지고, 고칠 곳도 강의가 아니라 조건(조건 수정하기)이다.
  // 제외 조건 원인(그룹 마법사)은 강의를 짚어 줘야 뺄 수 있어 함께 붙인다.
  const conflictCourses =
    primary?.kind === "overlap" || primary?.kind === "exclusion"
      ? (primary.courses ?? [])
      : [];

  return (
    <Wrapper>
      <Center>
        <WizardStatusMessage
          illustration={wizardFailed}
          title="시간표를 만들 수 없어요"
          description={describeConflict(primary, targetCredit)}
        >
          {conflictCourses.length > 0 && (
            <WizardCard $radius={14}>
              {conflictCourses.map((course) => (
                <WizardCourseSectionRow
                  key={course.courseOfferingId}
                  professor={course.professor}
                  subjectNumber={`${course.title} · ${course.subjectNumber}`}
                  timeStr={formatCourseMeetings(course)}
                  action={
                    (onReplaceWishlistCourse || onRemoveWishlistCourse) && (
                      <RowActions>
                        {onReplaceWishlistCourse && (
                          <TextButton
                            type="button"
                            onClick={() => onReplaceWishlistCourse(course)}
                          >
                            교체
                          </TextButton>
                        )}
                        {onRemoveWishlistCourse && (
                          <TextButton
                            type="button"
                            onClick={() => onRemoveWishlistCourse(course.subjectNumber)}
                          >
                            빼기
                          </TextButton>
                        )}
                      </RowActions>
                    )
                  }
                />
              ))}
            </WizardCard>
          )}
        </WizardStatusMessage>
      </Center>
      <WizardBottomCTA onClick={onRelax}>조건 수정하기</WizardBottomCTA>
    </Wrapper>
  );
}

interface WizardErrorStateProps {
  onRetry: () => void;
}

export function WizardErrorState({ onRetry }: WizardErrorStateProps) {
  return (
    <Wrapper>
      <Center>
        <WizardStatusMessage
          illustration={wizardFailed}
          title="시간표를 만들지 못했어요"
          description="잠시 후 다시 시도해 주세요"
        />
      </Center>
      <WizardBottomCTA onClick={onRetry}>다시 시도</WizardBottomCTA>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  flex: 1;
  width: 100%;
  min-height: calc(100dvh - var(--header-height, 56px));
  display: flex;
  flex-direction: column;
`;

const Center = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px 0;
`;

const RowActions = styled.div`
  display: flex;
  gap: 4px;
`;

// 시안에 없는 보조 동작(#248 빼기/교체)이라 눈에 덜 띄는 외곽선 pill로 둔다
const TextButton = styled.button`
  ${buttonReset}
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
  color: var(--text-secondary);
  ${typography.label3}
`;
