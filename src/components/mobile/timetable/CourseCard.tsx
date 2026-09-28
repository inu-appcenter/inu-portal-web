import React, { useId, useState } from "react";
import styled from "styled-components";
import Icon from "@/components/common/Icon";
import {
  WizardCourseSectionRow,
  WizardFavButton,
  WizardTag,
} from "@/components/mobile/timetable/wizard/ui";

import type {
  CourseCardOfferingView,
  CourseCardView,
} from "@/types/courseCardView";
import { typography } from "@/styles/typography";

interface CourseCardProps {
  /**
   * 카드가 그릴 내용 그 자체. 서버 응답 타입이 아니라 화면 계약(View Model)을 받는다.
   * 출처별 변환은 부르는 쪽에서 한다(위시리스트는 toWishlistCourseCards).
   */
  data: CourseCardView;
  /**
   * 분반 행의 담김(✓) 버튼을 눌렀을 때 — 장바구니에서 뺀다.
   * 생략하면 버튼을 그리지 않는다.
   */
  onRemoveOffering?: (offering: CourseCardOfferingView) => void;
  /** 분반 행 클릭 - 과목 상세 모달을 여는 용도(#397). 생략하면 행이 클릭 불가능해진다 */
  onSelectOffering?: (offering: CourseCardOfferingView) => void;
}

// Figma: INTIP / 시간표 마법사 / 강의선택 Course_Card (3853:12810)
export const CourseCard: React.FC<CourseCardProps> = ({
  data,
  onRemoveOffering,
  onSelectOffering,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const offeringsId = useId();

  // 출처에 따라 모르는 값은 아예 빼고 · 로 잇는다(빈 칸이나 "-"를 그리지 않는다)
  const metaParts = [
    `${data.credit}학점`,
    data.gradeLabel,
    data.gradeEvaluationLabel,
  ].filter((part): part is string => Boolean(part && part.trim()));

  return (
    <CourseCardWrapper>
      <Header
        type="button"
        aria-expanded={!collapsed}
        aria-controls={offeringsId}
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <HeaderInfo>
          <Title>{data.title}</Title>
          <MetaRow>
            {data.isuLabel && <WizardTag size="sm">{data.isuLabel}</WizardTag>}
            <MetaText>{metaParts.join(" · ")}</MetaText>
          </MetaRow>
        </HeaderInfo>
        <Chevron $collapsed={collapsed} aria-hidden>
          <Icon name="chevron-down" size={24} />
        </Chevron>
      </Header>

      {!collapsed && (
        <CourseContainer id={offeringsId}>
          {data.offerings.map((offering) => (
            <WizardCourseSectionRow
              key={offering.offeringId}
              professor={offering.professor}
              subjectNumber={offering.subjectNumber}
              timeStr={offering.timeStr}
              room={offering.room}
              // 담은 인원을 모르는 출처(스냅샷)에서는 아예 노출하지 않는다
              savedCount={offering.savedCount}
              onClick={
                onSelectOffering ? () => onSelectOffering(offering) : undefined
              }
              action={
                onRemoveOffering && (
                  <WizardFavButton
                    added
                    aria-label={`${data.title} ${offering.subjectNumber} 담기 취소`}
                    onClick={() => onRemoveOffering(offering)}
                  />
                )
              }
            />
          ))}
        </CourseContainer>
      )}
    </CourseCardWrapper>
  );
};

// --- Styled Components ---
const CourseCardWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  overflow: hidden;
`;

const Header = styled.button`
  width: 100%;
  margin: 0;
  padding: 12px 16px 8px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  border: none;
  background: none;
  font: inherit;
  text-align: left;
  color: var(--text-secondary, #333d4b);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:focus-visible {
    outline: 2px solid var(--interactive-brand, #0061ff);
    outline-offset: -2px;
  }
`;

const HeaderInfo = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;

const Title = styled.span`
  color: var(--text-primary, #191f28);
  word-break: break-word;
  ${typography.heading2}
`;

const MetaRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const MetaText = styled.span`
  color: var(--text-tertiary, #8b95a1);
  white-space: nowrap;
  ${typography.label3}
`;

const Chevron = styled.span<{ $collapsed: boolean }>`
  flex-shrink: 0;
  display: flex;
  transform: rotate(${({ $collapsed }) => ($collapsed ? "-90deg" : "0deg")});
  transition: transform 0.2s ease;
`;

const CourseContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
