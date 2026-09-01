import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Modal from "@/components/common/Modal";
import { getDepartmentOptionGroups } from "@/utils/departmentOptions";
import {
  MIN_ENTRY_YEAR,
  isGraduationRequirementSupported,
} from "@/utils/graduationRequirements";

export interface GraduationProfile {
  /** navBarList/서버와 같은 학과 코드. 미설정이면 "" */
  departmentCode: string;
  /** 입학연도(학번). 미설정이면 null */
  entryYear: number | null;
  /** 목표 평점. 미설정이면 null */
  targetGpa: number | null;
}

interface GraduationSettingModalProps {
  isOpen: boolean;
  profile: GraduationProfile;
  onClose: () => void;
  onSave: (profile: GraduationProfile) => void;
}

const buildEntryYears = (): number[] => {
  const latest = new Date().getFullYear();
  const years: number[] = [];
  for (let year = latest; year >= MIN_ENTRY_YEAR; year -= 1) {
    years.push(year);
  }
  return years;
};

export default function GraduationSettingModal({
  isOpen,
  profile,
  onClose,
  onSave,
}: GraduationSettingModalProps) {
  const [departmentCode, setDepartmentCode] = useState(profile.departmentCode);
  const [entryYear, setEntryYear] = useState<string>(
    profile.entryYear ? String(profile.entryYear) : "",
  );
  const [targetGpa, setTargetGpa] = useState<string>(
    profile.targetGpa ? profile.targetGpa.toFixed(2) : "",
  );

  // 모달을 다시 열 때는 저장된 값에서 시작한다.
  useEffect(() => {
    if (!isOpen) return;
    setDepartmentCode(profile.departmentCode);
    setEntryYear(profile.entryYear ? String(profile.entryYear) : "");
    setTargetGpa(profile.targetGpa ? profile.targetGpa.toFixed(2) : "");
  }, [isOpen, profile]);

  const groups = useMemo(() => getDepartmentOptionGroups(), []);
  const years = useMemo(() => buildEntryYears(), []);

  const parsedGpa = targetGpa === "" ? null : Number(targetGpa);
  const gpaError =
    parsedGpa !== null &&
    (!Number.isFinite(parsedGpa) || parsedGpa <= 0 || parsedGpa > 4.5);

  const unsupported =
    !!departmentCode && !isGraduationRequirementSupported(departmentCode);

  const handleSave = () => {
    if (gpaError) return;
    onSave({
      departmentCode,
      entryYear: entryYear ? Number(entryYear) : null,
      targetGpa: parsedGpa,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="졸업요건 설정"
      description="학과와 학번을 고르면 이수해야 할 학점을 자동으로 채워드려요."
      primaryButton={{
        text: "저장",
        variant: "brand",
        onClick: handleSave,
        disabled: gpaError,
      }}
      secondaryButton={{ text: "취소", onClick: onClose }}
    >
      <Fields>
        <Field>
          <FieldLabel htmlFor="graduation-department">학과</FieldLabel>
          <Select
            id="graduation-department"
            value={departmentCode}
            onChange={(e) => setDepartmentCode(e.target.value)}
          >
            <option value="">선택 안 함</option>
            {groups.map((group) => (
              <optgroup key={group.college} label={group.college}>
                {group.departments.map((department) => (
                  <option key={department.code} value={department.code}>
                    {department.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
          {unsupported && (
            <FieldHelp $warn>
              아직 이 학과의 졸업요건 데이터가 없어요. 취득 학점은 직접
              설정해 주세요.
            </FieldHelp>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="graduation-entry-year">학번(입학연도)</FieldLabel>
          <Select
            id="graduation-entry-year"
            value={entryYear}
            onChange={(e) => setEntryYear(e.target.value)}
          >
            <option value="">선택 안 함</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}학번
              </option>
            ))}
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="graduation-target-gpa">
            목표 평점 (선택)
          </FieldLabel>
          <TextInput
            id="graduation-target-gpa"
            value={targetGpa}
            onChange={(e) =>
              setTargetGpa(e.target.value.replace(/[^0-9.]/g, "").slice(0, 4))
            }
            placeholder="예: 4.00"
            inputMode="decimal"
            $error={gpaError}
          />
          <FieldHelp $warn={gpaError}>
            {gpaError
              ? "0보다 크고 4.5 이하인 값을 입력해 주세요."
              : "남은 학점으로 목표에 닿으려면 평균 몇 점이 필요한지 알려드려요."}
          </FieldHelp>
        </Field>
      </Fields>
    </Modal>
  );
}

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary, #333d4b);
`;

const Select = styled.select`
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  background-color: var(--bg-base, #ffffff);
  font-size: 15px;
  color: var(--text-secondary, #333d4b);
  outline: none;
`;

const TextInput = styled.input<{ $error?: boolean }>`
  width: 100%;
  height: 44px;
  padding: 0 12px;
  box-sizing: border-box;
  border: 1px solid
    ${({ $error }) =>
      $error ? "var(--border-error, #ef4444)" : "var(--border-default, #e5e8eb)"};
  border-radius: 12px;
  background-color: var(--bg-base, #ffffff);
  font-size: 15px;
  color: var(--text-secondary, #333d4b);
  outline: none;

  &::placeholder {
    color: var(--text-disabled, #b0b8c1);
  }
`;

const FieldHelp = styled.span<{ $warn?: boolean }>`
  font-size: 12px;
  line-height: 16px;
  color: ${({ $warn }) =>
    $warn ? "var(--text-error, #ef4444)" : "var(--text-tertiary, #8b95a1)"};
`;
