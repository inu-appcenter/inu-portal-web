import { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import { useCreatePoll } from "@/hooks/useSchedulePoll";
import { WizardToggle } from "@/components/mobile/timetable/wizard/ui";
import { buttonReset } from "@/components/mobile/timetable/wizard/ui/tokens";
import {
  PollBody,
  PollBottomBar,
  PollFieldHint,
  PollFieldLabel,
  PollPage,
  PollPrimaryButton,
} from "@/components/mobile/schedulePoll/PollUi";
import type { PollDay, PollDurationMode } from "@/types/schedulePolls";
import {
  POLL_DAYS,
  POLL_DAY_LABEL,
  POLL_MAX_ONE_TIME_DAYS,
  POLL_RANGE_MAX,
  POLL_RANGE_MIN,
  SLOT_MINUTES,
  formatDeadline,
  minutesToTime,
  parseDateKey,
  timeToMinutes,
  toDateKey,
  toOffsetIsoString,
} from "@/utils/schedulePoll";
import { getPollErrorMessage } from "@/utils/schedulePollError";
import { mixpanelTrack } from "@/utils/mixpanel";
import { showToast } from "@/utils/toast";
import { typography } from "@/styles/typography";

const DEFAULT_TITLE = "회의 시간 맞추기";
const TITLE_MAX_LENGTH = 30;

const DURATION_OPTIONS: {
  id: string;
  label: string;
  mode: PollDurationMode;
  minutes: number;
}[] = [
  { id: "30", label: "30분", mode: "FIXED", minutes: 30 },
  { id: "60", label: "1시간", mode: "FIXED", minutes: 60 },
  { id: "90", label: "1시간 30분", mode: "FIXED", minutes: 90 },
  { id: "120+", label: "2시간 +", mode: "AT_LEAST", minutes: 120 },
];

const TIME_OPTIONS = Array.from(
  { length: (POLL_RANGE_MAX - POLL_RANGE_MIN) / SLOT_MINUTES + 1 },
  (_unused, index) => minutesToTime(POLL_RANGE_MIN + index * SLOT_MINUTES),
);

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const formatDateField = (key: string) => {
  const date = parseDateKey(key);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`;
};

const addDays = (key: string, days: number) => {
  const date = parseDateKey(key);
  return toDateKey(
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + days),
  );
};

/** datetime-local 입력값(`YYYY-MM-DDTHH:mm`) */
const toLocalInputValue = (date: Date) =>
  `${toDateKey(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const isPast = (date: Date) => date.getTime() <= Date.now();

/** 마감을 켰을 때의 기본값: 내일 같은 시각(정시로 올림) */
const defaultDeadline = () => {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return toLocalInputValue(date);
};

/**
 * 조건 설정 (Figma B. 조건 설정 — 정기 약속 True/False).
 * 조율을 만들면 참여자 초대(보낼 곳 선택)로 넘어간다. 개설자도 일정을 등록해야 참여자가 된다.
 */
export default function SchedulePollCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // 채팅방 사이드메뉴에서 시작했으면 그 방을 보낼 곳 선택에서 미리 골라 둔다(FR-002).
  const originRoomId = Number(searchParams.get("roomId")) || null;

  const [today] = useState(() => toDateKey(new Date()));
  const [title, setTitle] = useState("");
  const [isRecurring, setIsRecurring] = useState(true);
  const [days, setDays] = useState<PollDay[]>(["MON", "TUE", "WED", "THU", "FRI"]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [rangeStart, setRangeStart] = useState("09:00");
  const [rangeEnd, setRangeEnd] = useState("18:00");
  const [durationId, setDurationId] = useState("60");
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState("");
  // 마감이 지금보다 뒤인지는 제출 시점의 시각으로 판단한다(렌더 중에는 시각을 읽지 않는다).
  const [deadlineError, setDeadlineError] = useState(false);

  const createMutation = useCreatePoll();
  const duration = DURATION_OPTIONS.find((option) => option.id === durationId)!;

  useHeader({ title: "시간 맞추기", hasback: true });

  const maxEndDate = startDate
    ? addDays(startDate, POLL_MAX_ONE_TIME_DAYS - 1)
    : undefined;

  // 조건이 맞지 않으면 '다음'을 막고 이유를 한 줄로 알려 준다.
  const validationMessage = useMemo(() => {
    if (isRecurring) {
      if (days.length === 0) return "요일을 하나 이상 골라 주세요";
    } else {
      if (!startDate || !endDate) return "기간을 골라 주세요";
      if (endDate < startDate) return "종료일이 시작일보다 빨라요";
      if (maxEndDate && endDate > maxEndDate) {
        return `기간은 최대 ${POLL_MAX_ONE_TIME_DAYS}일까지 고를 수 있어요`;
      }
    }
    const rangeMinutes = timeToMinutes(rangeEnd) - timeToMinutes(rangeStart);
    if (rangeMinutes <= 0) return "끝나는 시각이 시작 시각보다 늦어야 해요";
    if (rangeMinutes < duration.minutes) {
      return "시간 범위가 만나는 시간보다 짧아요";
    }
    if (hasDeadline && !deadline) return "응답 마감 시각을 골라 주세요";
    if (hasDeadline && deadlineError) return "응답 마감은 지금보다 뒤여야 해요";
    return null;
  }, [
    isRecurring,
    days,
    startDate,
    endDate,
    maxEndDate,
    rangeStart,
    rangeEnd,
    duration.minutes,
    hasDeadline,
    deadline,
    deadlineError,
  ]);

  const toggleDay = (day: PollDay) =>
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    // 시작일을 옮겨 종료일이 범위를 벗어나면 비운다.
    if (
      endDate &&
      value &&
      (endDate < value || endDate > addDays(value, POLL_MAX_ONE_TIME_DAYS - 1))
    ) {
      setEndDate("");
    }
  };

  const handleToggleDeadline = (checked: boolean) => {
    setHasDeadline(checked);
    setDeadlineError(false);
    if (checked && !deadline) setDeadline(defaultDeadline());
  };

  const handleSubmit = () => {
    if (validationMessage || createMutation.isPending) return;
    const deadlineDate = hasDeadline ? new Date(deadline) : null;
    if (deadlineDate && isPast(deadlineDate)) {
      setDeadlineError(true);
      return;
    }

    createMutation.mutate(
      {
        title: title.trim() || undefined,
        isRecurring,
        days: isRecurring ? POLL_DAYS.filter((day) => days.includes(day)) : null,
        startDate: isRecurring ? null : startDate,
        endDate: isRecurring ? null : endDate,
        rangeStart,
        rangeEnd,
        durationMode: duration.mode,
        durationMin: duration.minutes,
        deadlineAt: deadlineDate ? toOffsetIsoString(deadlineDate) : null,
        ...(originRoomId ? { originChatRoomId: originRoomId } : {}),
      },
      {
        onSuccess: (created) => {
          mixpanelTrack.pollCreate({
            pollId: created.pollId,
            entry: originRoomId ? "CHAT" : "STANDALONE",
            isRecurring,
            duration: duration.id,
            hasDeadline,
          });
          const query = originRoomId ? `?roomId=${originRoomId}` : "";
          // 조건 설정 화면으로 되돌아와 같은 조율을 또 만들지 않게 기록을 바꿔 끼운다.
          navigate(`${ROUTES.SCHEDULE_POLL.INVITE(created.pollId)}${query}`, {
            replace: true,
            state: { fromCreate: true },
          });
        },
        onError: (error) => {
          showToast(getPollErrorMessage(error, "시간 맞추기를 만들지 못했어요"), {
            action: { text: "다시 시도", onClick: handleSubmit },
          });
        },
      },
    );
  };

  return (
    <PollPage>
      <PollBody $gap={24}>
        <Field>
          <PollFieldLabel as="label" htmlFor="poll-title">
            제목
          </PollFieldLabel>
          <TextInput
            id="poll-title"
            value={title}
            maxLength={TITLE_MAX_LENGTH}
            placeholder={DEFAULT_TITLE}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>

        <ToggleRow>
          <ToggleText>
            <PollFieldLabel id="poll-recurring-label">정기 약속 여부</PollFieldLabel>
            <PollFieldHint>정기적으로 만나나요, 일회성으로 만나나요?</PollFieldHint>
          </ToggleText>
          <WizardToggle
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
            aria-labelledby="poll-recurring-label"
          />
        </ToggleRow>

        {isRecurring ? (
          <Field>
            <PollFieldLabel>요일</PollFieldLabel>
            <DayChips>
              {POLL_DAYS.map((day) => (
                <DayChip
                  key={day}
                  type="button"
                  aria-pressed={days.includes(day)}
                  $selected={days.includes(day)}
                  onClick={() => toggleDay(day)}
                >
                  {POLL_DAY_LABEL[day]}
                </DayChip>
              ))}
            </DayChips>
          </Field>
        ) : (
          <Field>
            <PollFieldLabel>기간</PollFieldLabel>
            <RangeRow>
              <PickerField>
                <PickerValue $placeholder={!startDate}>
                  {startDate ? formatDateField(startDate) : "날짜 선택"}
                </PickerValue>
                <NativePicker
                  type="date"
                  aria-label="시작일"
                  value={startDate}
                  min={today}
                  onChange={(event) => handleStartDateChange(event.target.value)}
                />
              </PickerField>
              <Tilde>~</Tilde>
              <PickerField>
                <PickerValue $placeholder={!endDate}>
                  {endDate ? formatDateField(endDate) : "날짜 선택"}
                </PickerValue>
                <NativePicker
                  type="date"
                  aria-label="종료일"
                  value={endDate}
                  min={startDate || today}
                  max={maxEndDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </PickerField>
            </RangeRow>
            <PollFieldHint>최대 {POLL_MAX_ONE_TIME_DAYS}일까지 고를 수 있어요</PollFieldHint>
          </Field>
        )}

        <Field>
          <PollFieldLabel>시간 범위 설정</PollFieldLabel>
          <RangeRow>
            <PickerField>
              <PickerValue>{rangeStart}</PickerValue>
              <NativePicker
                as="select"
                aria-label="시작 시각"
                value={rangeStart}
                onChange={(event) => setRangeStart(event.target.value)}
              >
                {TIME_OPTIONS.slice(0, -1).map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </NativePicker>
            </PickerField>
            <Tilde>~</Tilde>
            <PickerField>
              <PickerValue>{rangeEnd}</PickerValue>
              <NativePicker
                as="select"
                aria-label="끝나는 시각"
                value={rangeEnd}
                onChange={(event) => setRangeEnd(event.target.value)}
              >
                {TIME_OPTIONS.slice(1).map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </NativePicker>
            </PickerField>
          </RangeRow>
        </Field>

        <Field>
          <LabelGroup>
            <PollFieldLabel>
              만나는 시간 <Required aria-hidden>*</Required>
            </PollFieldLabel>
            <PollFieldHint>
              {duration.mode === "AT_LEAST"
                ? "2시간 이상 연속으로 비는 가장 긴 시간을 찾아요"
                : "이 길이만큼 연속으로 비는 시간을 찾아요"}
            </PollFieldHint>
          </LabelGroup>
          <DurationRow role="radiogroup" aria-label="만나는 시간">
            {DURATION_OPTIONS.map((option) => (
              <DurationChip
                key={option.id}
                type="button"
                role="radio"
                aria-checked={option.id === durationId}
                $selected={option.id === durationId}
                onClick={() => setDurationId(option.id)}
              >
                {option.label}
              </DurationChip>
            ))}
          </DurationRow>
        </Field>

        <Field>
          <ToggleRow>
            <ToggleText>
              <PollFieldLabel id="poll-deadline-label">응답 마감</PollFieldLabel>
              <PollFieldHint>
                마감되면 그때까지 모인 사람 기준으로 결과가 확정돼요
              </PollFieldHint>
            </ToggleText>
            <WizardToggle
              checked={hasDeadline}
              onCheckedChange={handleToggleDeadline}
              aria-labelledby="poll-deadline-label"
            />
          </ToggleRow>
          <PickerField $disabled={!hasDeadline}>
            <PickerValue $placeholder={!hasDeadline || !deadline}>
              {hasDeadline && deadline
                ? formatDeadline(toOffsetIsoString(new Date(deadline)))
                : "설정 안 함"}
            </PickerValue>
            {hasDeadline && (
              <NativePicker
                type="datetime-local"
                aria-label="응답 마감 시각"
                value={deadline}
                onChange={(event) => {
                  setDeadline(event.target.value);
                  setDeadlineError(false);
                }}
              />
            )}
          </PickerField>
        </Field>
      </PollBody>

      <PollBottomBar caption={validationMessage ?? undefined}>
        <PollPrimaryButton
          type="button"
          disabled={Boolean(validationMessage) || createMutation.isPending}
          onClick={handleSubmit}
        >
          {createMutation.isPending ? "만드는 중…" : "다음"}
        </PollPrimaryButton>
      </PollBottomBar>
    </PollPage>
  );
}

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LabelGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Required = styled.span`
  color: var(--text-error);
`;

const fieldBox = `
  height: 50px;
  box-sizing: border-box;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
`;

const TextInput = styled.input`
  ${fieldBox}
  width: 100%;
  color: var(--text-primary);
  outline: none;
  ${typography.body2}

  &::placeholder {
    color: var(--text-tertiary);
  }

  &:focus {
    border-color: var(--border-brand);
  }
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleText = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DayChips = styled.div`
  display: flex;
  gap: 8px;
`;

const chipSelected = `
  border-color: var(--border-brand);
  background: var(--interactive-primary);
  color: var(--text-inverse);
`;

const DayChip = styled.button<{ $selected: boolean }>`
  ${buttonReset}
  flex: 1 0 0;
  min-width: 0;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
  color: var(--text-secondary);
  ${typography.label2}
  ${({ $selected }) => $selected && chipSelected}
`;

const RangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Tilde = styled.span`
  flex-shrink: 0;
  color: var(--text-tertiary);
  ${typography.body2}
`;

// 값은 시안대로 span으로 그리고, 투명한 OS 기본 입력(date·select)을 그 위에 덮는다.
// 웹뷰에서도 네이티브 피커가 뜨고, 브라우저마다 다른 기본 모양을 숨길 수 있다.
const PickerField = styled.div<{ $disabled?: boolean }>`
  ${fieldBox}
  position: relative;
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  align-items: center;
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};

  &:focus-within {
    border-color: var(--border-brand);
  }
`;

const PickerValue = styled.span<{ $placeholder?: boolean }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ $placeholder }) =>
    $placeholder ? "var(--text-tertiary)" : "var(--text-primary)"};
  ${typography.label2}
`;

const NativePicker = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  opacity: 0;
  cursor: pointer;
  /* iOS는 16px 미만 입력에 포커스하면 화면을 확대한다 */
  font-size: 16px;

  &::-webkit-calendar-picker-indicator {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
`;

const DurationRow = styled.div`
  display: flex;
  gap: 8px;
`;

const DurationChip = styled.button<{ $selected: boolean }>`
  ${buttonReset}
  flex: 1 0 0;
  min-width: 0;
  height: 36px;
  padding: 0 4px;
  border-radius: 18px;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
  color: var(--text-secondary);
  white-space: nowrap;
  ${typography.label2}
  ${({ $selected }) => $selected && chipSelected}
`;
