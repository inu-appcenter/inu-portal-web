import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import { useCreatePoll } from "@/hooks/useSchedulePoll";
import { WizardToggle } from "@/components/mobile/timetable/wizard/ui";
import { buttonReset } from "@/components/mobile/timetable/wizard/ui/tokens";
import PollCalendar, {
  PollWeekdayRow,
} from "@/components/mobile/schedulePoll/PollCalendar";
import {
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
  buildPollColumns,
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
const STEP_COUNT = 4;

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

const WEEKDAYS: PollDay[] = ["MON", "TUE", "WED", "THU", "FRI"];
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const formatDateShort = (key: string) => {
  const date = parseDateKey(key);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`;
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

const sameDays = (a: PollDay[], b: PollDay[]) =>
  a.length === b.length && a.every((day) => b.includes(day));

/**
 * 조건 설정 (Figma B. 조건 설정 v4 — 단계 1~4).
 * 이름 → 날짜/요일 → 시간대·길이 → 응답 마감 순서로 한 화면씩 묻는다.
 * 만들면 참여자 초대(보낼 곳 선택)로 넘어간다. 개설자도 일정을 등록해야 참여자가 된다.
 */
export default function SchedulePollCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // 채팅방 사이드메뉴에서 시작했으면 그 방을 보낼 곳 선택에서 미리 골라 둔다(FR-002).
  const originRoomId = Number(searchParams.get("roomId")) || null;

  const [step, setStep] = useState(0);
  const [today] = useState(() => toDateKey(new Date()));
  const [title, setTitle] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  // 날짜 모드는 고른 기간을 그대로 쓰도록 모두로, 매주 반복은 평일만으로 시작한다.
  const [days, setDays] = useState<PollDay[]>([...POLL_DAYS]);
  const [startDate, setStartDate] = useState("");
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

  useHeader({
    title: "시간 맞추기",
    hasback: true,
    // 단계 안에서는 뒤로 가기가 이전 단계로 돌아간다.
    onBack: step > 0 ? () => setStep((prev) => prev - 1) : undefined,
  });

  const orderedDays = useMemo(
    () => POLL_DAYS.filter((day) => days.includes(day)),
    [days],
  );
  const rangeEndKey = endDate || startDate;
  const rangeDayCount = startDate
    ? Math.round(
        (parseDateKey(rangeEndKey).getTime() - parseDateKey(startDate).getTime()) /
          (24 * 60 * 60 * 1000),
      ) + 1
    : 0;
  const pickedDateCount = useMemo(
    () =>
      startDate
        ? buildPollColumns({
            isRecurring: false,
            days: orderedDays,
            startDate,
            endDate: rangeEndKey,
          }).length
        : 0,
    [startDate, rangeEndKey, orderedDays],
  );

  // 단계마다 '다음'을 막는 이유를 한 줄로 알려 준다.
  const stepError = useMemo(() => {
    if (step === 1) {
      if (days.length === 0) return "요일을 하나 이상 골라 주세요";
      if (!isRecurring) {
        if (!startDate) return "기간을 골라 주세요";
        if (pickedDateCount === 0) return "고른 기간에 만날 날짜가 없어요";
      }
    }
    if (step === 2) {
      const rangeMinutes = timeToMinutes(rangeEnd) - timeToMinutes(rangeStart);
      if (rangeMinutes <= 0) return "끝나는 시각이 시작 시각보다 늦어야 해요";
      if (rangeMinutes < duration.minutes) return "시간대가 만나는 길이보다 짧아요";
    }
    if (step === 3) {
      if (hasDeadline && !deadline) return "응답 마감 시각을 골라 주세요";
      if (hasDeadline && deadlineError) return "응답 마감은 지금보다 뒤여야 해요";
    }
    return null;
  }, [
    step,
    days.length,
    isRecurring,
    startDate,
    pickedDateCount,
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

  const handleToggleDeadline = (checked: boolean) => {
    setHasDeadline(checked);
    setDeadlineError(false);
    if (checked && !deadline) setDeadline(defaultDeadline());
  };

  const handleSubmit = () => {
    if (createMutation.isPending) return;
    const deadlineDate = hasDeadline ? new Date(deadline) : null;
    if (deadlineDate && isPast(deadlineDate)) {
      setDeadlineError(true);
      return;
    }

    createMutation.mutate(
      {
        title: title.trim() || undefined,
        isRecurring,
        // 일회성도 기간 안에서 만날 요일을 함께 보낸다(서버 규칙: 기간 + days).
        days: orderedDays,
        startDate: isRecurring ? null : startDate,
        endDate: isRecurring ? null : rangeEndKey,
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
            action: {
              text: "다시 시도",
              onClick: () => handleSubmitRef.current(),
            },
          });
        },
      },
    );
  };

  // 토스트의 '다시 시도'는 실패한 뒤 고친 조건으로 보내야 하므로 항상 최신 핸들러를 부른다.
  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  const handleNext = () => {
    if (stepError) return;
    if (step < STEP_COUNT - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    handleSubmit();
  };

  const isLastStep = step === STEP_COUNT - 1;

  const heading = [
    {
      title: "약속 이름을 정해 주세요",
      description: `안 정해도 돼요. 비워 두면 '${DEFAULT_TITLE}'로 만들어요`,
    },
    {
      title: "언제 만날까요?",
      description: isRecurring
        ? "매주 만날 수 있는 요일을 골라 주세요"
        : "기간을 고르고, 안 되는 요일은 빼 주세요",
    },
    {
      title: "몇 시쯤, 얼마나 만날까요?",
      description: "이 시간대 안에서 다 같이 비는 시간을 찾아요",
    },
    {
      title: "응답 마감을 정할까요?",
      description: "정하지 않아도 돼요. 나중에 직접 끝낼 수 있어요",
    },
  ][step];

  const summary =
    step !== 1 ? null : isRecurring ? (
      <Summary>
        <span>매주 {orderedDays.map((day) => POLL_DAY_LABEL[day]).join(" · ")}</span>
        <SummaryCount>주 {orderedDays.length}일</SummaryCount>
      </Summary>
    ) : startDate ? (
      <Summary>
        <span>
          {formatDateShort(startDate)}
          {endDate && endDate !== startDate ? ` ~ ${formatDateShort(endDate)}` : ""}
        </span>
        <SummaryCount>{pickedDateCount}일 선택</SummaryCount>
      </Summary>
    ) : null;

  return (
    <PollPage>
      <Progress
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEP_COUNT}
        aria-valuenow={step + 1}
      >
        <ProgressFill style={{ width: `${((step + 1) / STEP_COUNT) * 100}%` }} />
      </Progress>

      <Body>
        <Heading>
          <StepCount>
            {step + 1} / {STEP_COUNT}
          </StepCount>
          <HeadingTitle>{heading.title}</HeadingTitle>
          <HeadingDescription>{heading.description}</HeadingDescription>
        </Heading>

        {step === 0 && (
          <Field>
            <PollFieldLabel as="label" htmlFor="poll-title">
              약속 이름 <Optional>선택</Optional>
            </PollFieldLabel>
            <TextInput
              id="poll-title"
              value={title}
              maxLength={TITLE_MAX_LENGTH}
              placeholder={DEFAULT_TITLE}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
        )}

        {step === 1 && (
          <>
            <ToggleRow>
              <ToggleText>
                <PollFieldLabel id="poll-recurring-label">매주 반복해요</PollFieldLabel>
                <PollFieldHint>
                  {isRecurring
                    ? "매주 같은 요일에 반복해서 맞춰요"
                    : "끄면 정한 기간 안에서 한 번만 맞춰요"}
                </PollFieldHint>
              </ToggleText>
              <WizardToggle
                checked={isRecurring}
                onCheckedChange={(checked) => {
                  setIsRecurring(checked);
                  setDays(checked ? WEEKDAYS : [...POLL_DAYS]);
                }}
                aria-labelledby="poll-recurring-label"
              />
            </ToggleRow>

            <Field>
              <LabelRow>
                <LabelGroup>
                  <PollFieldLabel>{isRecurring ? "요일" : "날짜"}</PollFieldLabel>
                  <PollFieldHint>
                    {isRecurring
                      ? `안 되는 요일은 눌러서 빼 주세요 · 7개 중 ${orderedDays.length}개`
                      : startDate
                        ? `기간을 고른 뒤 뺄 요일을 눌러요 · ${rangeDayCount}일 중 ${pickedDateCount}일`
                        : `시작일과 끝나는 날을 눌러요 · 최대 ${POLL_MAX_ONE_TIME_DAYS}일`}
                  </PollFieldHint>
                </LabelGroup>
                <QuickChips>
                  <QuickChip
                    type="button"
                    aria-pressed={days.length === 7}
                    $selected={days.length === 7}
                    onClick={() => setDays([...POLL_DAYS])}
                  >
                    모두
                  </QuickChip>
                  <QuickChip
                    type="button"
                    aria-pressed={sameDays(days, WEEKDAYS)}
                    $selected={sameDays(days, WEEKDAYS)}
                    onClick={() => setDays(WEEKDAYS)}
                  >
                    평일만
                  </QuickChip>
                </QuickChips>
              </LabelRow>
              {isRecurring ? (
                <PollWeekdayRow days={days} onToggleDay={toggleDay} />
              ) : (
                <PollCalendar
                  today={today}
                  startDate={startDate}
                  endDate={endDate}
                  days={days}
                  maxDays={POLL_MAX_ONE_TIME_DAYS}
                  onRangeChange={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                  }}
                  onToggleDay={toggleDay}
                />
              )}
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field>
              <PollFieldLabel>하루 중 시간대</PollFieldLabel>
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
                  만나는 길이 <Required aria-hidden>*</Required>
                </PollFieldLabel>
                <PollFieldHint>
                  {duration.mode === "AT_LEAST"
                    ? "2시간 이상 연속으로 비는 가장 긴 시간을 찾아요"
                    : "이 길이만큼 연속으로 비는 시간을 찾아요"}
                </PollFieldHint>
              </LabelGroup>
              <DurationRow role="radiogroup" aria-label="만나는 길이">
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
          </>
        )}

        {step === 3 && (
          <Field>
            <ToggleRow>
              <ToggleText>
                <PollFieldLabel id="poll-deadline-label">응답 마감</PollFieldLabel>
                <PollFieldHint>
                  마감되면 그때까지 등록한 사람 기준으로 결과가 정해져요
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
        )}
      </Body>

      <PollBottomBar caption={summary ?? stepError ?? undefined}>
        <PollPrimaryButton
          type="button"
          disabled={Boolean(stepError) || createMutation.isPending}
          onClick={handleNext}
        >
          {isLastStep ? (createMutation.isPending ? "만드는 중…" : "만들기") : "다음"}
        </PollPrimaryButton>
      </PollBottomBar>
    </PollPage>
  );
}

const Progress = styled.div`
  margin: 16px 16px 0;
  height: 4px;
  border-radius: 2px;
  background: var(--bg-muted);
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 2px;
  background: var(--interactive-primary);
  transition: width 0.25s ease;
`;

const Body = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 20px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 4px;
`;

const StepCount = styled.span`
  color: var(--text-tertiary);
  ${typography.caption1}
`;

const HeadingTitle = styled.h2`
  margin: 0;
  color: var(--text-primary);
  ${typography.title2}
`;

const HeadingDescription = styled.p`
  margin: 0;
  color: var(--text-tertiary);
  ${typography.body2}
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

const LabelGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Optional = styled.span`
  margin-left: 2px;
  color: var(--text-tertiary);
  ${typography.caption1}
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

const chipSelected = `
  border-color: var(--border-brand);
  background: var(--interactive-primary);
  color: var(--text-on-brand);
`;

const QuickChips = styled.div`
  flex-shrink: 0;
  display: flex;
  gap: 6px;
`;

const QuickChip = styled.button<{ $selected: boolean }>`
  ${buttonReset}
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid
    ${({ $selected }) => ($selected ? "var(--border-brand)" : "var(--border-default)")};
  background: var(--bg-base);
  color: ${({ $selected }) => ($selected ? "var(--text-brand)" : "var(--text-secondary)")};
  ${typography.label3}
`;

const Summary = styled.span`
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
  color: var(--text-primary);
  ${typography.label2}
`;

const SummaryCount = styled.span`
  color: var(--text-brand);
`;

const RangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  /* 시작·끝 입력이 남는 폭을 똑같이 나눠 갖는다 */
  & > div {
    flex: 1 0 0;
  }
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
  flex-shrink: 0;
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
