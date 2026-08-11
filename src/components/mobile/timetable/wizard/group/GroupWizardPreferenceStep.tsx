import styled from "styled-components";
import type { WizardPreferenceConditions } from "@/types/timetableWizard";

const DAY_LABELS = ["월", "화", "수", "목", "금"];

interface GroupWizardPreferenceStepProps {
  preference: WizardPreferenceConditions;
  onChange: (
    updater: (prev: WizardPreferenceConditions) => WizardPreferenceConditions,
  ) => void;
}

/**
 * 그룹 마법사의 선호조건(C-01~06) 스텝. UI/조건 코드는 기존 마법사 2단계와 동일하되,
 * 스토어에 묶지 않고 (preference, onChange)만 받는 순수 표현 컴포넌트라 그룹 스토어에서
 * 값을 흘려보내 쓴다. 기존 페이지의 인라인 구현은 건드리지 않는다.
 */
export default function GroupWizardPreferenceStep({
  preference,
  onChange,
}: GroupWizardPreferenceStepProps) {
  const toggleDay = (day: number) => {
    onChange((prev) => {
      const days = prev.freeDayOfWeek.days.includes(day)
        ? prev.freeDayOfWeek.days.filter((d) => d !== day)
        : [...prev.freeDayOfWeek.days, day];
      return { ...prev, freeDayOfWeek: { ...prev.freeDayOfWeek, days } };
    });
  };

  return (
    <ScrollContent>
      <SectionHeading>원하는 조건을 골라주세요 (중복 선택 가능)</SectionHeading>

      <PreferenceCard
        checked={preference.manyFreeDays}
        onToggle={() => onChange((prev) => ({ ...prev, manyFreeDays: !prev.manyFreeDays }))}
        title="공강 많은 시간표"
        code="C-01"
      />

      <PreferenceCard
        checked={preference.freeDayOfWeek.enabled}
        onToggle={() =>
          onChange((prev) => ({
            ...prev,
            freeDayOfWeek: {
              ...prev.freeDayOfWeek,
              enabled: !prev.freeDayOfWeek.enabled,
            },
          }))
        }
        title="특정 요일 공강"
        code="C-02"
      >
        {preference.freeDayOfWeek.enabled && (
          <DayRow>
            {DAY_LABELS.map((label, index) => (
              <DayButton
                key={label}
                type="button"
                $active={preference.freeDayOfWeek.days.includes(index)}
                onClick={() => toggleDay(index)}
              >
                {label}
              </DayButton>
            ))}
          </DayRow>
        )}
      </PreferenceCard>

      <PreferenceCard
        checked={preference.noMorningClasses.enabled}
        onToggle={() =>
          onChange((prev) => ({
            ...prev,
            noMorningClasses: {
              ...prev.noMorningClasses,
              enabled: !prev.noMorningClasses.enabled,
            },
          }))
        }
        title="오전 수업 없는 시간표"
        code="C-03"
      >
        {preference.noMorningClasses.enabled && (
          <SelectBox
            value={preference.noMorningClasses.startAfter}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                noMorningClasses: {
                  ...prev.noMorningClasses,
                  startAfter: Number(e.target.value),
                },
              }))
            }
          >
            <option value={9.5}>9:30 이후 시작</option>
            <option value={10}>10:00 이후 시작</option>
            <option value={10.5}>10:30 이후 시작</option>
            <option value={11}>11:00 이후 시작</option>
            <option value={12}>12:00 이후 시작</option>
          </SelectBox>
        )}
        {preference.noMorningClasses.enabled && (
          <WarningInline>⚠ 선택한 조건으로는 시간표가 안 나올 수 있어요</WarningInline>
        )}
      </PreferenceCard>

      <PreferenceCard
        checked={preference.noNightClasses}
        onToggle={() =>
          onChange((prev) => ({ ...prev, noNightClasses: !prev.noNightClasses }))
        }
        title="야간 수업 제외"
        code="C-04"
      />

      <PreferenceCard
        checked={preference.fewConsecutive}
        onToggle={() =>
          onChange((prev) => ({ ...prev, fewConsecutive: !prev.fewConsecutive }))
        }
        title="연강 적은 시간표"
        code="C-05"
      />

      <PreferenceCard
        checked={preference.avoidCommute}
        onToggle={() => onChange((prev) => ({ ...prev, avoidCommute: !prev.avoidCommute }))}
        title="통학 시간 피하기"
        code="C-06"
      />

      <BottomActionsSpacer />
    </ScrollContent>
  );
}

interface PreferenceCardProps {
  checked: boolean;
  onToggle: () => void;
  title: string;
  code: string;
  children?: React.ReactNode;
}

function PreferenceCard({ checked, onToggle, title, code, children }: PreferenceCardProps) {
  return (
    <PreferenceCardBox $checked={checked}>
      <PreferenceHead onClick={onToggle}>
        <CheckboxInput type="checkbox" checked={checked} readOnly />
        <PreferenceTextWrap>
          <PreferenceTitle $checked={checked}>{title}</PreferenceTitle>
          <PreferenceCode>{code}</PreferenceCode>
        </PreferenceTextWrap>
      </PreferenceHead>
      {checked && children}
    </PreferenceCardBox>
  );
}

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
`;

const Card = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
`;

const PreferenceCardBox = styled(Card)<{ $checked: boolean }>`
  border-width: ${({ $checked }) => ($checked ? "1.5px" : "1px")};
  border-color: ${({ $checked }) =>
    $checked ? "var(--interactive-primary, #3b82f6)" : "var(--border-default, #e5e8eb)"};
`;

const WarningInline = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff8e9;
  border: 1px solid #fdd9aa;
  color: #d97706;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
`;

const SelectBox = styled.select`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-subtle, #f8f9fb);
  color: var(--text-primary, #191f28);
  font-size: 16px;
  font-weight: 500;
  line-height: 52px;
  box-sizing: border-box;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='%238B95A1' stroke-width='1.5' fill='none' fill-rule='evenodd'/></svg>");
  background-repeat: no-repeat;
  background-position: right 16px center;
`;

const SectionHeading = styled.h2`
  margin: 0 0 4px;
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
`;

const PreferenceHead = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const PreferenceTextWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PreferenceTitle = styled.span<{ $checked: boolean }>`
  color: var(--text-primary, #191f28);
  font-size: 15px;
  font-weight: ${({ $checked }) => ($checked ? 700 : 500)};
  line-height: 23px;
`;

const PreferenceCode = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 11px;
  line-height: 17px;
`;

const CheckboxInput = styled.input`
  appearance: none;
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 6px;
  border: 1.5px solid var(--gray-400, #b0b8c1);
  background-color: var(--bg-base, #ffffff);
  position: relative;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:checked {
    border-color: var(--interactive-primary, #3b82f6);
    background-color: var(--interactive-primary, #3b82f6);
  }

  &:checked::after {
    content: "";
    position: absolute;
    left: 7px;
    top: 3px;
    width: 5px;
    height: 10px;
    border: solid #ffffff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

const DayRow = styled.div`
  display: flex;
  gap: 8px;
`;

const DayButton = styled.button<{ $active: boolean }>`
  flex: 1;
  height: 44px;
  border-radius: 999px;
  border: 1px solid
    ${({ $active }) =>
      $active ? "var(--interactive-primary, #3b82f6)" : "var(--border-default, #e5e8eb)"};
  background: ${({ $active }) =>
    $active ? "var(--interactive-primary, #3b82f6)" : "var(--bg-subtle, #f8f9fb)"};
  color: ${({ $active }) => ($active ? "#ffffff" : "var(--text-secondary, #333d4b)")};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
`;

const BottomActionsSpacer = styled.div`
  height: 80px;
  flex-shrink: 0;
`;
