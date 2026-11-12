import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/common/Modal";
import Skeleton from "@/components/common/Skeleton";
import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import { getMyPollSubmission } from "@/apis/schedulePolls";
import {
  POLL_INTERVAL,
  refetchPollRevision,
  useMyPollSubmission,
  usePollDetail,
  usePollRevision,
  useSubmitPoll,
} from "@/hooks/useSchedulePoll";
import { useLeaveConfirm } from "@/hooks/useLeaveConfirm";
import { buildLoginRedirect, usePollLoggedIn } from "@/hooks/usePollAuth";
import { useSemesters } from "@/hooks/useSemesters";
import { useTimeTableDetail, useTimeTables } from "@/hooks/useTimeTables";
import { buttonReset } from "@/components/mobile/timetable/wizard/ui/tokens";
import PollPaintGrid from "@/components/mobile/schedulePoll/PollPaintGrid";
import { POLL_BLOCK_OPACITY } from "@/components/mobile/schedulePoll/PollGrid";
import {
  PollBody,
  PollBottomBar,
  PollNotice,
  PollPage,
  PollPrimaryButton,
  PollSecondaryButton,
} from "@/components/mobile/schedulePoll/PollUi";
import type {
  PollDetail,
  PollJoinSource,
  PollSubmission,
  SubmitPollRequest,
} from "@/types/schedulePolls";
import {
  buildOverlayItems,
  cellIndex,
  cellsToRanges,
  countCells,
  createEmptyCells,
  formatDuration,
  getPollGridShape,
  isDateKey,
  overlayBlockedCells,
  parseDateKey,
  rangesToCells,
  type PollOverlayItem,
} from "@/utils/schedulePoll";
import {
  getPollErrorCode,
  getPollErrorMessage,
} from "@/utils/schedulePollError";
import { mixpanelTrack } from "@/utils/mixpanel";
import { pickCurrentSemester } from "@/utils/semester";
import { showToast } from "@/utils/toast";
import { typography } from "@/styles/typography";

const createSubmissionId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
        const random = Math.floor(Math.random() * 16);
        return (char === "x" ? random : (random & 0x3) | 0x8).toString(16);
      });

/**
 * 내 일정 입력 (Figma C. 내 일정 입력).
 * 여기서 '등록하기'를 누르는 순간 참여자가 된다. 링크·채팅 카드·개설 직후 모두 이 화면으로 들어온다.
 */
export default function SchedulePollInputPage() {
  const { pollId: pollIdParam = "" } = useParams<{ pollId: string }>();
  const pollId = Number(pollIdParam);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = usePollLoggedIn();

  const pollQuery = usePollDetail(pollId, { enabled: isLoggedIn });
  const submissionQuery = useMyPollSubmission(pollId, { enabled: isLoggedIn });
  const poll = pollQuery.data;
  // 폼을 한 번 띄운 뒤에는 그때의 등록본으로 고정한다. 백그라운드 재조회나 조율 상태 변화로
  // 폼을 다시 만들면 칠하던 내용이 사라지므로, '최신본 불러오기'를 고를 때만 바꿔 끼운다.
  const [formSeed, setFormSeed] = useState<{
    id: number;
    submission: PollSubmission | null;
  } | null>(null);

  const { semesters, isLoading: isSemestersLoading } = useSemesters();
  const { timeTables, isLoading: isTimeTablesLoading } = useTimeTables(
    undefined,
    undefined,
    { enabled: isLoggedIn },
  );
  // 대표 시간표: 지금 학기의 대표 시간표만 겹쳐 보여 준다.
  const currentSemester = pickCurrentSemester(semesters);
  const primaryTimeTable =
    timeTables.find(
      (table) => table.isPrimary && table.semesterId === currentSemester?.id,
    ) ?? null;
  const detailQuery = useTimeTableDetail(primaryTimeTable?.id);

  const shape = useMemo(() => (poll ? getPollGridShape(poll) : null), [poll]);
  const overlayItems = useMemo(
    () =>
      shape && detailQuery.detail
        ? buildOverlayItems(shape, detailQuery.detail.items, currentSemester)
        : [],
    [shape, detailQuery.detail, currentSemester],
  );

  useHeader({ title: "내 일정 입력", hasback: true });

  if (!isLoggedIn) {
    return (
      <Navigate
        replace
        to={buildLoginRedirect(
          ROUTES.LOGIN,
          `${location.pathname}${location.search}`,
        )}
      />
    );
  }

  /** 다른 기기에서 먼저 등록한 내용을 불러와 폼을 새로 만든다. */
  const handleLoadLatest = async () => {
    const latest = await submissionQuery.refetch();
    if (latest.isError) {
      showToast("최신 내용을 불러오지 못했어요. 잠시 후 다시 시도해 주세요");
      return;
    }
    setFormSeed((prev) => ({
      id: (prev?.id ?? 0) + 1,
      submission: latest.data ?? null,
    }));
  };

  if (formSeed && poll && shape) {
    return (
      <PollInputForm
        key={formSeed.id}
        poll={poll}
        submission={formSeed.submission}
        overlayItems={overlayItems}
        hasPrimaryTimetable={primaryTimeTable != null}
        onLoadLatest={handleLoadLatest}
      />
    );
  }

  const isTimetableLoading =
    isSemestersLoading ||
    isTimeTablesLoading ||
    (primaryTimeTable != null && detailQuery.isLoading);

  if (
    pollQuery.isLoading ||
    submissionQuery.isLoading ||
    submissionQuery.isFetching ||
    isTimetableLoading
  ) {
    return (
      <PollPage>
        <PollBody>
          <Skeleton variant="card" height={67} />
          <Skeleton variant="card" height={67} />
          <Skeleton variant="card" height={420} />
        </PollBody>
      </PollPage>
    );
  }

  if (!poll || !shape || submissionQuery.isError) {
    const error = pollQuery.error ?? submissionQuery.error;
    return (
      <PollPage>
        <PollNotice
          title={getPollErrorMessage(error, "시간 맞추기를 불러오지 못했어요")}
        >
          {getPollErrorCode(error) === null && (
            <PollPrimaryButton
              type="button"
              onClick={() => {
                void pollQuery.refetch();
                void submissionQuery.refetch();
              }}
            >
              다시 시도
            </PollPrimaryButton>
          )}
        </PollNotice>
      </PollPage>
    );
  }

  const submission = submissionQuery.data ?? null;
  const isParticipant = poll.myStatus === "SUBMITTED" || submission !== null;

  // 입력하고 나서 거부당하지 않게, 들어올 수 없는 조율은 입력 전에 안내한다(FR-021).
  if (poll.status === "CLOSED") {
    return (
      <PollPage>
        <PollNotice
          title="종료된 시간 맞추기예요"
          description={
            isParticipant && poll.resultVersion != null
              ? "최종 결과를 확인해 보세요"
              : "더 이상 일정을 등록할 수 없어요"
          }
        >
          {isParticipant && (
            <PollPrimaryButton
              type="button"
              onClick={() =>
                navigate(
                  poll.resultVersion != null
                    ? ROUTES.SCHEDULE_POLL.RESULT(pollId)
                    : ROUTES.SCHEDULE_POLL.STATUS(pollId),
                  { replace: true },
                )
              }
            >
              {poll.resultVersion != null ? "결과 보기" : "참여 현황 보기"}
            </PollPrimaryButton>
          )}
        </PollNotice>
      </PollPage>
    );
  }

  if (!isParticipant && poll.participantCount >= poll.maxParticipants) {
    return (
      <PollPage>
        <PollNotice
          title="인원이 가득 찼어요"
          description={`이 시간 맞추기는 최대 ${poll.maxParticipants}명까지 참여할 수 있어요`}
        />
      </PollPage>
    );
  }

  // 여기까지 왔으면 입력할 수 있는 조율이다. 지금 등록본으로 폼을 띄운다.
  setFormSeed({ id: 0, submission });
  return null;
}

interface PollInputFormProps {
  poll: PollDetail;
  submission: PollSubmission | null;
  overlayItems: PollOverlayItem[];
  hasPrimaryTimetable: boolean;
  onLoadLatest: () => void;
}

type ConfirmKind = "EMPTY" | "UNPAINTED" | "CONFLICT" | null;

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/** 안 칠한 열들을 '11월 9일 – 11일 중 3일' / '월·수요일'처럼 한 줄로 적는다. */
const describeColumns = (keys: string[], labels: string[]) => {
  if (keys.length === 0) return "";
  if (!isDateKey(keys[0])) return `${labels.join("·")}요일`;
  const first = parseDateKey(keys[0]);
  const last = parseDateKey(keys[keys.length - 1]);
  const head = `${first.getMonth() + 1}월 ${first.getDate()}일`;
  if (keys.length === 1) return `${head} (${WEEKDAY_LABELS[first.getDay()]})`;
  const tail =
    first.getMonth() === last.getMonth()
      ? `${last.getDate()}일`
      : `${last.getMonth() + 1}월 ${last.getDate()}일`;
  return keys.length === 2
    ? `${head}, ${tail}`
    : `${head} – ${tail} 중 ${keys.length}일`;
};

function PollInputForm({
  poll,
  submission,
  overlayItems,
  hasPrimaryTimetable,
  onLoadLatest,
}: PollInputFormProps) {
  const pollId = poll.pollId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const joinSource: PollJoinSource =
    searchParams.get("src") === "CHAT_CARD" ? "CHAT_CARD" : "LINK";

  const shape = useMemo(() => getPollGridShape(poll), [poll]);
  const gridRef = useRef<HTMLDivElement>(null);

  // 칠한 칸 = 되는 시간. 처음엔 빈 상태로 시작한다(미리 칠해 두면 확인 없이 등록돼 부풀려진다).
  const [painted, setPainted] = useState<boolean[]>(() =>
    rangesToCells(shape, submission?.available ?? []),
  );
  const [isDirty, setIsDirty] = useState(false);
  // 꾹 눌러 끌기 안내는 한 번 칠해 보면 지우기 안내로 바꾼다. 이미 낸 적 있으면 처음부터 바꿔 둔다.
  const [hasPaintedOnce, setHasPaintedOnce] = useState(() =>
    painted.some(Boolean),
  );
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const [isClosedLocally, setIsClosedLocally] = useState(false);
  // 덮어쓰기를 고르면 최신 submissionRevision으로 바꿔 끼운다(FR-117).
  const [baseRevision, setBaseRevision] = useState<number | null>(
    submission?.submissionRevision ?? null,
  );
  const attemptRef = useRef<{ id: string; payload: string } | null>(null);

  const { data: revision } = usePollRevision(pollId, {
    intervalMs: POLL_INTERVAL.INPUT,
  });
  const submitMutation = useSubmitPoll(pollId);
  const leaveConfirm = useLeaveConfirm(isDirty && !submitMutation.isPending);

  const isClosed = isClosedLocally || revision?.status === "CLOSED";

  /** 대표 시간표 수업이 덮는 칸. '수업 빼고 다 칠하기'에서 비워 둔다. */
  const classCells = useMemo(
    () =>
      overlayBlockedCells(
        shape,
        overlayItems,
        new Set(overlayItems.map((item) => item.id)),
      ),
    [shape, overlayItems],
  );
  const hasClasses = overlayItems.length > 0;
  const paintedCount = countCells(painted);

  /** 하나도 안 칠한 열 index. 등록할 때 한 번만 알려 준다. */
  const unpaintedColumns = useMemo(
    () =>
      shape.columns
        .map((_column, column) => column)
        .filter((column) => {
          for (let row = 0; row < shape.rowCount; row += 1) {
            if (painted[cellIndex(shape, column, row)]) return false;
          }
          return true;
        }),
    [shape, painted],
  );

  const updatePainted = (next: boolean[]) => {
    setPainted(next);
    setIsDirty(true);
    if (next.some(Boolean)) setHasPaintedOnce(true);
  };

  /** 되돌리기 알림을 띄우며 칠한 칸을 한 번에 바꾼다. */
  const replaceWithUndo = (next: boolean[], message: string) => {
    const before = painted;
    updatePainted(next);
    showToast(message, {
      action: { text: "되돌리기", onClick: () => setPainted(before) },
    });
  };

  const handleFillAll = () => {
    // 이미 칠한 칸은 그대로 두고 합친다. 수업 칸은 비워 둔다.
    replaceWithUndo(
      painted.map((on, index) => on || !classCells[index]),
      hasClasses ? "수업 빼고 다 칠했어요" : "다 칠했어요",
    );
  };

  const handleReset = () => {
    replaceWithUndo(createEmptyCells(shape), "모두 지웠어요");
  };

  const buildRequest = (base: number | null): SubmitPollRequest => {
    const request: Omit<SubmitPollRequest, "clientSubmissionId"> = {
      baseSubmissionRevision: base,
      via: "SUBMIT",
      available: cellsToRanges(shape, painted),
      // 수업을 따로 넣지 않는다. 칠하지 않은 칸이 곧 안 되는 시간이다.
      importedCourseOfferingIds: [],
      ...(base === null ? { joinSource } : {}),
    };
    // 같은 내용의 재시도(네트워크 실패)는 같은 멱등 키를, 내용이 바뀌면 새 키를 쓴다(FR-116).
    const payload = JSON.stringify(request);
    if (attemptRef.current?.payload !== payload) {
      attemptRef.current = { id: createSubmissionId(), payload };
    }
    return { ...request, clientSubmissionId: attemptRef.current.id };
  };

  const submit = (base: number | null = baseRevision) => {
    if (submitMutation.isPending || isClosed) return;
    setConfirm(null);
    const request = buildRequest(base);

    submitMutation.mutate(request, {
      onSuccess: (response) => {
        attemptRef.current = null;
        if (response.isFirstSubmission) {
          mixpanelTrack.pollJoin({
            pollId,
            joinSource,
            isCreator: poll.isHost,
          });
        }
        mixpanelTrack.pollSubmit({
          pollId,
          availableCount: paintedCount,
          importedCount: 0,
          via: "SUBMIT",
          isUpdate: !response.isFirstSubmission,
        });
        // 응답을 받은 뒤에만 등록 완료로 표시한다(낙관적 표시 금지).
        showToast("일정을 등록했어요");
        leaveConfirm.allowLeave();
        navigate(
          response.resultVersion != null
            ? ROUTES.SCHEDULE_POLL.RESULT(pollId)
            : ROUTES.SCHEDULE_POLL.STATUS(pollId),
          { replace: true },
        );
      },
      onError: (error) => {
        const code = getPollErrorCode(error);
        // 서버가 코드로 거절했으면 그 시도는 끝난 것이다. 다음 등록은 새 멱등 키로 보낸다.
        if (code) attemptRef.current = null;

        switch (code) {
          case "POLL_CLOSED":
            // 입력 내용은 그대로 두고 잠근다.
            setIsClosedLocally(true);
            showToast("종료된 시간 맞추기예요");
            return;
          case "SUBMISSION_CONFLICT":
            setConfirm("CONFLICT");
            return;
          case "BLOCKED":
            showToast(getPollErrorMessage(error));
            leaveConfirm.allowLeave();
            navigate(-1);
            return;
          case "POLL_FULL":
            showToast("인원이 가득 차서 등록할 수 없어요");
            return;
          default:
            showToast(getPollErrorMessage(error, "등록하지 못했어요"), {
              action: {
                text: "다시 시도",
                onClick: () => submitRef.current(),
              },
            });
        }
      },
    });
  };

  // 토스트의 '다시 시도'는 실패한 뒤 고친 내용으로 보내야 하므로 항상 최신 submit을 부른다.
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  const handleSubmitClick = () => {
    if (paintedCount === 0) {
      setConfirm("EMPTY");
      return;
    }
    if (unpaintedColumns.length > 0) {
      setConfirm("UNPAINTED");
      return;
    }
    submit();
  };

  /** [칠하러 가기]: 안 칠한 첫 날짜가 보이게 그리드를 밀어 준다. */
  const handleGoPaint = () => {
    setConfirm(null);
    const target = gridRef.current?.querySelector<HTMLElement>(
      `[data-poll-column="${unpaintedColumns[0]}"]`,
    );
    target?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  /** 다른 기기에서 먼저 등록한 내용을 불러온다. 부모가 폼을 새로 만든다. */
  const handleLoadLatest = () => {
    setConfirm(null);
    onLoadLatest();
  };

  /** 지금 입력한 내용으로 덮어쓴다. 최신 등록본 번호를 받아 그 위에 다시 등록한다. */
  const handleOverwrite = async () => {
    setConfirm(null);
    try {
      const latest = await getMyPollSubmission(pollId);
      const latestRevision = latest?.submissionRevision ?? null;
      setBaseRevision(latestRevision);
      submit(latestRevision);
    } catch {
      showToast("최신 내용을 확인하지 못했어요. 잠시 후 다시 시도해 주세요");
      void refetchPollRevision(queryClient, pollId);
    }
  };

  const isLocked = isClosed || submitMutation.isPending;
  const unpaintedText = describeColumns(
    unpaintedColumns.map((column) => shape.columns[column].key),
    unpaintedColumns.map((column) => shape.columns[column].label),
  );

  return (
    <PollPage>
      <PollBody $gap={12}>
        {isClosed && (
          <ClosedBanner role="status">
            종료된 시간 맞추기예요. 입력한 내용은 등록되지 않아요.
          </ClosedBanner>
        )}

        {!hasPrimaryTimetable && (
          <ImportBanner
            type="button"
            onClick={() => navigate(ROUTES.TIMETABLE.IMPORT_HUB)}
          >
            <span>시간표를 불러오면 수업이 회색으로 표시돼요</span>
            <ImportAction>불러오기</ImportAction>
          </ImportBanner>
        )}

        <GuideHeader>
          <TitleRow>
            <GuideTitle>되는 시간을 칠해 주세요</GuideTitle>
            <Legend>
              <LegendItem>
                <Swatch
                  $color="var(--interactive-primary)"
                  style={{ opacity: POLL_BLOCK_OPACITY }}
                />
                돼요
              </LegendItem>
              {hasClasses && (
                <LegendItem>
                  <Swatch $color="var(--bg-disabled)" />
                  수업
                </LegendItem>
              )}
            </Legend>
          </TitleRow>
          <TitleRow>
            <GuideDescription>
              {hasPaintedOnce
                ? "칠한 칸에서 끌면 지워져요"
                : "꾹 누른 채 끌면 칠해져요"}
            </GuideDescription>
            <ResetButton
              type="button"
              disabled={isLocked || paintedCount === 0}
              onClick={handleReset}
            >
              <ResetIcon aria-hidden>↻</ResetIcon>
              초기화
            </ResetButton>
          </TitleRow>
        </GuideHeader>

        <div ref={gridRef}>
          <PollPaintGrid
            shape={shape}
            painted={painted}
            overlayItems={overlayItems}
            disabled={isLocked}
            onPaintedChange={updatePainted}
          />
        </div>
        <GestureHint>
          {formatDuration(poll.durationMode, poll.durationMin)} 연속으로 비는
          시간을 찾아요
        </GestureHint>
      </PollBody>

      <PollBottomBar>
        <PollSecondaryButton
          type="button"
          disabled={isLocked}
          onClick={handleFillAll}
        >
          {hasClasses ? "수업 빼고 다 칠하기" : "다 칠하기"}
        </PollSecondaryButton>
        <PollPrimaryButton
          type="button"
          disabled={isLocked}
          onClick={handleSubmitClick}
        >
          {submitMutation.isPending
            ? "등록하는 중…"
            : submission
              ? "다시 등록하기"
              : "등록하기"}
        </PollPrimaryButton>
      </PollBottomBar>

      <Modal
        isOpen={confirm === "EMPTY"}
        onClose={() => setConfirm(null)}
        title="칠한 시간이 없어요"
        description="이대로 등록하면 모든 시간이 안 되는 시간으로 들어가요."
        secondaryButton={{ text: "다시 입력", onClick: () => setConfirm(null) }}
        primaryButton={{ text: "그대로 등록", onClick: () => submit() }}
      />
      <Modal
        isOpen={confirm === "UNPAINTED"}
        onClose={() => setConfirm(null)}
        title={`${unpaintedText}을 아직 안 칠했어요`}
        description="그대로 등록하면 그날은 안 되는 시간으로 들어가요."
        secondaryButton={{ text: "그대로 등록", onClick: () => submit() }}
        primaryButton={{ text: "칠하러 가기", onClick: handleGoPaint }}
      />
      <Modal
        isOpen={confirm === "CONFLICT"}
        onClose={() => setConfirm(null)}
        title="다른 기기에서 수정된 내용이 있어요"
        description="최신 내용을 불러오면 지금 입력한 내용은 사라져요."
        closeOnOverlayClick={false}
        secondaryButton={{ text: "최신본 불러오기", onClick: handleLoadLatest }}
        primaryButton={{ text: "내 것으로 덮어쓰기", onClick: handleOverwrite }}
      />
      <Modal
        isOpen={leaveConfirm.isOpen}
        onClose={leaveConfirm.stay}
        title="입력한 내용이 사라져요"
        description="등록하지 않고 나가면 지금 입력한 내용은 저장되지 않아요."
        closeOnBack={false}
        secondaryButton={{ text: "계속 입력", onClick: leaveConfirm.stay }}
        primaryButton={{
          text: "나가기",
          variant: "danger",
          onClick: leaveConfirm.leave,
        }}
      />
    </PollPage>
  );
}

const ClosedBanner = styled.div`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border-warn-subtle);
  background: var(--bg-warn);
  color: var(--text-warn);
  ${typography.label2}
`;

const ImportBanner = styled.button`
  ${buttonReset}
  width: 100%;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-radius: 12px;
  background: var(--bg-brand);
  color: var(--text-secondary);
  text-align: left;
  ${typography.label3}
`;

const ImportAction = styled.span`
  flex-shrink: 0;
  color: var(--text-brand);
  ${typography.label3}
  font-weight: 700;
`;

const GuideHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 4px 0;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const GuideTitle = styled.h2`
  margin: 0;
  color: var(--text-primary);
  ${typography.heading2}
`;

const GuideDescription = styled.p`
  margin: 0;
  min-width: 0;
  color: var(--text-secondary);
  ${typography.caption1}
`;

const Legend = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  ${typography.caption1}
`;

const Swatch = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const ResetButton = styled.button`
  ${buttonReset}
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--text-brand);
  ${typography.label3}

  &:disabled {
    color: var(--text-disabled);
  }
`;

const ResetIcon = styled.span`
  font-size: 14px;
  line-height: 1;
`;

const GestureHint = styled.p`
  margin: 0;
  padding: 0 4px;
  color: var(--text-tertiary);
  ${typography.caption1}
`;
