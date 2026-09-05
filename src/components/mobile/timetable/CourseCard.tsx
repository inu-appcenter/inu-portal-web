import React, { useState } from "react";
import styled from "styled-components";
import { MessagesSquare } from "lucide-react";
import Icon from "@/components/common/Icon";
import type {
  CourseCardOfferingView,
  CourseCardView,
} from "@/types/courseCardView";
import { openLectureReview, SYLLABUS_UNAVAILABLE_MESSAGE } from "@/utils/lectureReview";

interface CourseCardProps {
  /**
   * 카드가 그릴 내용 그 자체. 서버 응답 타입이 아니라 화면 계약(View Model)을 받는다.
   * 출처별 변환은 부르는 쪽에서 한다(위시리스트는 toWishlistCourseCards).
   */
  data: CourseCardView;
  /** 분반 행의 X 버튼. 생략하면 버튼을 그리지 않는다 */
  onRemoveOffering?: (offering: CourseCardOfferingView) => void;
  /** 필수/선택 토글. required가 정의된 출처에서만 의미가 있다 */
  onToggleRequired?: (offering: CourseCardOfferingView) => void;
}

// --- Component ---
export const CourseCard: React.FC<CourseCardProps> = ({
  data,
  onRemoveOffering,
  onToggleRequired,
}) => {
  // 후보로 담긴 강의를 눌러도 검색 상태와 동일하게 상세(강의평/강의계획서)가
  // 열리게 한다 - 예전에는 이 행에 onClick 자체가 없어 담기 전(WizardCourseSearchSheet)
  // 에서만 상세를 볼 수 있었다.
  const [expandedOfferingId, setExpandedOfferingId] = useState<number | null>(
    null,
  );

  // 출처에 따라 모르는 값은 아예 빼고 · 로 잇는다(빈 칸이나 "-"를 그리지 않는다)
  const metaParts = [
    `${data.credit}학점`,
    data.gradeLabel,
    data.gradeEvaluationLabel,
  ].filter((part): part is string => Boolean(part && part.trim()));

  return (
    <CourseCardWrapper>
      <Header>
        <HeaderContainer>
          <HeaderInfo>
            <Title>{data.title}</Title>
            <MetaRow>
              {data.isuLabel && (
                <Badge>
                  <BadgeText>{data.isuLabel}</BadgeText>
                </Badge>
              )}

              <CreditInfo>
                {metaParts.map((part, index) => (
                  <React.Fragment key={part}>
                    {index > 0 && <MetaText>·</MetaText>}
                    <MetaText>{part}</MetaText>
                  </React.Fragment>
                ))}
              </CreditInfo>
            </MetaRow>
          </HeaderInfo>
          <Icon name="chevron-down" size={24} />
        </HeaderContainer>
      </Header>

      <CourseContainer>
        {data.offerings.map((offering) => {
          const isExpanded = expandedOfferingId === offering.offeringId;

          return (
            <SectionRow
              key={offering.offeringId}
              onClick={() =>
                setExpandedOfferingId((prev) =>
                  prev === offering.offeringId ? null : offering.offeringId,
                )
              }
            >
              <SectionRowMain>
                <SectionInfo>
                  <ProfRow>
                    <ProfName>{offering.professor || "교수 미정"}</ProfName>
                    <CourseCode>{offering.subjectNumber}</CourseCode>
                  </ProfRow>
                  <SubText>{offering.timeStr}</SubText>
                  {offering.room && <SubText>{offering.room}</SubText>}
                </SectionInfo>

                <RightAction>
                  {offering.required !== undefined && onToggleRequired && (
                    <RequiredToggle
                      type="button"
                      $active={offering.required}
                      aria-pressed={offering.required}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleRequired(offering);
                      }}
                    >
                      {offering.required ? "필수" : "선택"}
                    </RequiredToggle>
                  )}
                  {/* 담은 인원을 모르는 출처(스냅샷)에서는 아예 노출하지 않는다 */}
                  {offering.savedCount !== null && (
                    <SavedCount>{offering.savedCount}명 담음</SavedCount>
                  )}
                  {onRemoveOffering && (
                    // 시안의 44px 정사각형은 터치 영역이고, 파란 원은 그 안의 36px이다.
                    <FavButton
                      type="button"
                      aria-label="담기 취소"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveOffering(offering);
                      }}
                    >
                      <FavCircle>
                        <Icon name="close-md" size={20} />
                      </FavCircle>
                    </FavButton>
                  )}
                </RightAction>
              </SectionRowMain>

              {isExpanded && (
                <ExpandedArea>
                  <SecondaryActionButton
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLectureReview(offering.professor);
                    }}
                  >
                    <MessagesSquare size={18} />
                    강의평
                  </SecondaryActionButton>
                  <SecondaryActionButton
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(SYLLABUS_UNAVAILABLE_MESSAGE);
                    }}
                  >
                    <Icon name="file-document" size={18} />
                    강의계획서
                  </SecondaryActionButton>
                </ExpandedArea>
              )}
            </SectionRow>
          );
        })}
      </CourseContainer>
    </CourseCardWrapper>
  );
};

// --- Styled Components ---
// Figma: INTIP / Course_Card (3853:12810). 색은 전부 src/styles/variables.css 토큰,
// 타이포는 시안의 heading-2 / heading-3 / label-3 / caption-1 스타일을 그대로 옮겼다.
const CourseCardWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  overflow: hidden;
`;

const Header = styled.div`
  width: 100%;
  padding: 12px 16px 8px;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  color: var(--text-secondary, #333d4b);
`;

const HeaderInfo = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;

/* heading-2 */
const Title = styled.h2`
  margin: 0;
  color: var(--text-primary, #191f28);
  font-size: 16px;
  font-family: Pretendard, sans-serif;
  font-weight: 600;
  line-height: 24px;
  word-break: break-word;
`;

const MetaRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const Badge = styled.div`
  padding: 2px 8px;
  display: flex;
  align-items: center;
  background: var(--bg-brand, #eff6ff);
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  border-radius: 999px;
  overflow: hidden;
`;

/* label-3 */
const BadgeText = styled.span`
  color: var(--text-brand, #0061ff);
  font-size: 12px;
  font-family: Pretendard, sans-serif;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
`;

const CreditInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

/* label-3 */
const MetaText = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 12px;
  font-family: Pretendard, sans-serif;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
`;

const CourseContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const SectionRow = styled.div`
  width: 100%;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
`;

const SectionRowMain = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ExpandedArea = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
`;

const SecondaryActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);
  color: var(--text-secondary, #333d4b);
  font-size: 12px;
  font-family: Pretendard, sans-serif;
  font-weight: 500;
  line-height: 16px;
  cursor: pointer;
`;

const SectionInfo = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  word-break: break-word;
`;

const ProfRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: var(--text-secondary, #333d4b);
  white-space: nowrap;
`;

/* heading-3 */
const ProfName = styled.span`
  font-size: 14px;
  font-family: Pretendard, sans-serif;
  font-weight: 600;
  line-height: 20px;
`;

/* caption-1 */
const CourseCode = styled.span`
  font-size: 12px;
  font-family: Pretendard, sans-serif;
  font-weight: 400;
  line-height: 16px;
`;

/* caption-1 */
const SubText = styled.p`
  margin: 0;
  width: 100%;
  color: var(--text-tertiary, #8b95a1);
  font-size: 12px;
  font-family: Pretendard, sans-serif;
  font-weight: 400;
  line-height: 16px;
`;

// 시안에서 오른쪽 열은 정보 열과 같은 높이를 채우고, 담은 인원은 위 / 버튼은 아래에 붙는다.
const RightAction = styled.div`
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
`;

/* caption-1 */
const SavedCount = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 12px;
  font-family: Pretendard, sans-serif;
  font-weight: 400;
  line-height: 16px;
  white-space: nowrap;
`;

const FavButton = styled.button`
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const FavCircle = styled.span`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: var(--text-inverse, #ffffff);
  /* 시안의 interactive/primary는 #0061ff인데 프로젝트 --interactive-primary는
     #3b82f6이라 값이 어긋나 있다. 토큰을 고치는 건 앱 전역에 영향이 가므로
     여기서는 시안 값을 그대로 쓴다(토큰 정리는 별건). */
  background: #0061ff;
`;

const RequiredToggle = styled.button<{ $active: boolean }>`
  padding: 2px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 12px;
  font-family: Pretendard, sans-serif;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
  background: ${({ $active }) =>
    $active ? "var(--bg-brand, #eff6ff)" : "var(--bg-subtle, #f8f9fb)"};
  border: 1px solid
    ${({ $active }) =>
      $active
        ? "var(--border-brand-subtle, #d3e5ff)"
        : "var(--border-default, #e5e8eb)"};
  color: ${({ $active }) =>
    $active ? "var(--text-brand, #0061ff)" : "var(--text-secondary, #333d4b)"};
`;
