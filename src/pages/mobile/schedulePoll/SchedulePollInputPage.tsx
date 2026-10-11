import { useMemo, useRef, useState } from "react";
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
  pollKeys,
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
import {
  WizardCheckbox,
  WizardToggle,
} from "@/components/mobile/timetable/wizard/ui";
import { buttonReset } from "@/components/mobile/timetable/wizard/ui/tokens";
import PollPaintGrid, {
  type PollPaintMode,
} from "@/components/mobile/schedulePoll/PollPaintGrid";
import {
  PollBody,
  PollBottomBar,
  PollCard,
  PollNotice,
  PollPage,
  PollPrimaryButton,
  PollSecondaryButton,
} from "@/components/mobile/schedulePoll/PollUi";
import type {
  PollDetail,
  PollJoinSource,
  PollSubmission,
  PollSubmitVia,
  SubmitPollRequest,
} from "@/types/schedulePolls";
import {
  buildOverlayItems,
  cellsToRanges,
  countCells,
  formatDeadline,
  formatDuration,
  fullRangeCells,
  getPollGridShape,
  overlayBlockedCells,
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

  return (
    <PollInputForm
      // 다른 기기의 최신본을 불러오면 입력 상태를 처음부터 다시 만든다.
      key={submission?.submissionRevision ?? 0}
      poll={poll}
      submission={submission}
      overlayItems={overlayItems}
      hasPrimaryTimetable={primaryTimeTable != null}
    />
  );
}

interface PollInputFormProps {
  poll: PollDetail;
  submission: PollSubmission | null;
  overlayItems: PollOverlayItem[];
  hasPrimaryTimetable: boolean;
}

type ConfirmKind = "EMPTY" | "ANYTIME" | "CONFLICT" | null;

function PollInputForm({
  poll,
  submission,
  overlayItems,
  hasPrimaryTimetable,
}: PollInputFormProps) {
  const pollId = poll.pollId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const joinSource: PollJoinSource =
    searchParams.get("src") === "CHAT_CARD" ? "CHAT_CARD" : "LINK";

  const shape = useMemo(() => getPollGridShape(poll), [poll]);

  // 데이터는 '가능 칸 집합' 하나다. 모드는 붓과 표시만 바꾼다(FR-032).
  const [mode, setMode] = useState<PollPaintMode>("AVAILABLE");
  const [painted, setPainted] = useState<boolean[]>(() =>
    rangesToCells(shape, submission?.available ?? []),
  );
  const [includedItemIds, setIncludedItemIds] = useState<Set<string>>(
    () =>
      new Set(
        overlayItems
          .filter(
            (item) =>
              item.courseOfferingId != null &&
              submission?.importedCourseOfferingIds.includes(
                item.courseOfferingId,
              ),
          )
          .map((item) => item.id),
      ),
  );
  // 시간표 오버레이는 자동으로 켠다(PRD 7장 "입력 부담 최소화").
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
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
  const participantCount = revision?.participantCount ?? poll.participantCount;
  const deadlineAt = revision ? revision.deadlineAt : poll.deadlineAt;

  const blocked = useMemo(
    () => overlayBlockedCells(shape, overlayItems, includedItemIds),
    [shape, overlayItems, includedItemIds],
  );

  /** 지금 화면 상태가 뜻하는 가능 칸. 포함한 수업은 모드와 무관하게 뺀다. */
  const availableCells = useMemo(
    () =>
      painted.map(
        (on, index) => (mode === "AVAILABLE" ? on : !on) && !blocked[index],
      ),
    [painted, mode, blocked],
  );

  const handleToggleMode = (toUnavailable: boolean) => {
    const nextMode: PollPaintMode = toUnavailable ? "UNAVAILABLE" : "AVAILABLE";
    // 이미 칠한 내용이 있으면 가능 칸 집합은 그대로 두고 표시만 뒤집는다.
    // 아무것도 안 칠했으면 '안 되는 시간만 칠하기'(나머지는 전부 가능)로 바로 쓸 수 있게 빈 채로 둔다.
    if (painted.some(Boolean)) {
      setPainted((prev) => prev.map((on, index) => !on && !blocked[index]));
    }
    setMode(nextMode);
    setIsDirty(true);
    mixpanelTrack.pollModeToggle(pollId, nextMode);
  };

  const handleToggleItem = (itemId: string) => {
    const willInclude = !includedItemIds.has(itemId);
    setIncludedItemIds((prev) => {
      const next = new Set(prev);
      if (willInclude) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
    if (willInclude) {
      // 수업 칸은 불가능으로 고정되므로 그 위에 칠해 둔 내용은 지운다.
      const item = overlayItems.find((candidate) => candidate.id === itemId);
      const itemCells = item
        ? overlayBlockedCells(shape, [item], new Set([itemId]))
        : [];
      setPainted((prev) => prev.map((on, index) => on && !itemCells[index]));
    }
    setIsDirty(true);
    mixpanelTrack.pollOverlayToggleCourse(pollId, willInclude);
  };

  const handleResetItems = () => {
    setIncludedItemIds(new Set());
    setIsDirty(true);
  };

  const buildRequest = (
    via: PollSubmitVia,
    base: number | null,
  ): SubmitPollRequest => {
    const isAnytime = via === "ANYTIME";
    const request: Omit<SubmitPollRequest, "clientSubmissionId"> = {
      baseSubmissionRevision: base,
      via,
      available: cellsToRanges(
        shape,
        isAnytime ? fullRangeCells(shape) : availableCells,
      ),
      // 수업 시간은 available에서 이미 뺐다. ID는 다시 들어왔을 때 오버레이를 그리는 용도다.
      importedCourseOfferingIds: isAnytime
        ? []
        : overlayItems
            .filter(
              (item) =>
                includedItemIds.has(item.id) && item.courseOfferingId != null,
            )
            .map((item) => item.courseOfferingId as number),
      ...(base === null ? { joinSource } : {}),
    };
    // 같은 내용의 재시도(네트워크 실패)는 같은 멱등 키를, 내용이 바뀌면 새 키를 쓴다(FR-116).
    const payload = JSON.stringify(request);
    if (attemptRef.current?.payload !== payload) {
      attemptRef.current = { id: createSubmissionId(), payload };
    }
    return { ...request, clientSubmissionId: attemptRef.current.id };
  };

  const submit = (via: PollSubmitVia, base: number | null = baseRevision) => {
    if (submitMutation.isPending || isClosed) return;
    setConfirm(null);
    const request = buildRequest(via, base);

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
          availableCount: request.available.length
            ? countCells(rangesToCells(shape, request.available))
            : 0,
          importedCount: request.importedCourseOfferingIds?.length ?? 0,
          via,
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
              action: { text: "다시 시도", onClick: () => submit(via, base) },
            });
        }
      },
    });
  };

  const handleSubmitClick = () => {
    if (countCells(availableCells) === 0) {
      setConfirm("EMPTY");
      return;
    }
    submit("SUBMIT");
  };

  const handleAnytimeClick = () => {
    if (includedItemIds.size > 0) {
      setConfirm("ANYTIME");
      return;
    }
    submit("ANYTIME");
  };

  /** 다른 기기에서 먼저 등록한 내용을 불러온다. 부모가 key로 폼을 새로 만든다. */
  const handleLoadLatest = () => {
    setConfirm(null);
    void queryClient.invalidateQueries({ queryKey: pollKeys.mySubmission(pollId) });
  };

  /** 지금 입력한 내용으로 덮어쓴다. 최신 등록본 번호를 받아 그 위에 다시 등록한다. */
  const handleOverwrite = async () => {
    setConfirm(null);
    try {
      const latest = await getMyPollSubmission(pollId);
      const latestRevision = latest?.submissionRevision ?? null;
      setBaseRevision(latestRevision);
      submit("SUBMIT", latestRevision);
    } catch {
      showToast("최신 내용을 확인하지 못했어요. 잠시 후 다시 시도해 주세요");
      void refetchPollRevision(queryClient, pollId);
    }
  };

  const isLocked = isClosed || submitMutation.isPending;

  return (
    <PollPage>
      <PollBody>
        <MetaLine>
          <span>
            {participantCount}명 참여 · 최대 {poll.maxParticipants}명
          </span>
          {deadlineAt && <span>마감 {formatDeadline(deadlineAt)}</span>}
        </MetaLine>

        {isClosed && (
          <ClosedBanner role="status">
            종료된 시간 맞추기예요. 입력한 내용은 등록되지 않아요.
          </ClosedBanner>
        )}

        {hasPrimaryTimetable ? (
          <OverlayCard
            as="button"
            type="button"
            role="checkbox"
            aria-checked={isOverlayVisible}
            onClick={() => setIsOverlayVisible((prev) => !prev)}
          >
            <CardText>
              <CardTitle>내 시간표 표시</CardTitle>
              <CardDescription>
                수업을 누르면 그 시간은 불가능으로 들어가요
              </CardDescription>
            </CardText>
            <WizardCheckbox checked={isOverlayVisible} />
          </OverlayCard>
        ) : (
          <OverlayCard
            as="button"
            type="button"
            onClick={() => navigate(ROUTES.TIMETABLE.IMPORT_HUB)}
          >
            <CardText>
              <CardTitle>시간표 불러오기</CardTitle>
              <CardDescription>
                시간표를 불러오면 수업을 한 번 눌러 불가능 시간으로 넣을 수 있어요
              </CardDescription>
            </CardText>
            <CardAction>불러오기</CardAction>
          </OverlayCard>
        )}

        <ModeHint>
          <ModeText>
            <ModeTitle id="poll-mode-label">
              {mode === "AVAILABLE"
                ? "되는 시간을 칠해 주세요"
                : "안 되는 시간을 칠해 주세요"}
            </ModeTitle>
            <ModeDescription>
              {formatDuration(poll.durationMode, poll.durationMin)} 연속으로 비는
              시간을 찾아요
            </ModeDescription>
          </ModeText>
          <ModeToggle>
            <span>안 되는 시간 칠하기</span>
            <WizardToggle
              checked={mode === "UNAVAILABLE"}
              onCheckedChange={handleToggleMode}
              disabled={isLocked}
              aria-label="안 되는 시간 칠하기 모드"
            />
          </ModeToggle>
        </ModeHint>

        <GridSection>
          <PollPaintGrid
            shape={shape}
            painted={painted}
            mode={mode}
            blocked={blocked}
            overlayItems={isOverlayVisible ? overlayItems : []}
            includedItemIds={includedItemIds}
            disabled={isLocked}
            onPaintedChange={(next) => {
              setPainted(next);
              setIsDirty(true);
            }}
            onToggleItem={handleToggleItem}
          />
          {/* 범례는 항상 보여 준다(모드 혼동 방지) */}
          <Legend>
            <LegendItem>
              <Swatch $color="var(--bg-disabled)" />
              불러온 수업
            </LegendItem>
            <LegendItem>
              <Swatch
                $color={mode === "AVAILABLE" ? "var(--blue-200)" : "var(--red-80)"}
              />
              직접 칠한 시간({mode === "AVAILABLE" ? "가능" : "불가능"})
            </LegendItem>
            {includedItemIds.size > 0 && (
              <ResetButton
                type="button"
                disabled={isLocked}
                onClick={handleResetItems}
              >
                수업 초기화
              </ResetButton>
            )}
          </Legend>
          <GestureHint>
            칸을 누르거나, 길게 누른 뒤 끌어서 한 번에 칠할 수 있어요
          </GestureHint>
        </GridSection>
      </PollBody>

      <PollBottomBar>
        <PollSecondaryButton
          type="button"
          disabled={isLocked}
          onClick={handleAnytimeClick}
        >
          언제든 괜찮아요
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
        title="가능한 시간이 없어요"
        description="이대로 등록하면 모든 시간이 불가능으로 들어가요."
        secondaryButton={{ text: "다시 입력", onClick: () => setConfirm(null) }}
        primaryButton={{ text: "그대로 등록", onClick: () => submit("SUBMIT") }}
      />
      <Modal
        isOpen={confirm === "ANYTIME"}
        onClose={() => setConfirm(null)}
        title="언제든 괜찮아요로 등록할까요?"
        description="불러온 수업 시간까지 포함해 범위 전체를 가능으로 등록해요."
        secondaryButton={{ text: "취소", onClick: () => setConfirm(null) }}
        primaryButton={{ text: "전체 가능으로 등록", onClick: () => submit("ANYTIME") }}
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

const MetaLine = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 0 4px;
  color: var(--text-tertiary);
  ${typography.caption1}
`;

const ClosedBanner = styled.div`
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border-warn-subtle);
  background: var(--bg-warn);
  color: var(--text-warn);
  ${typography.label2}
`;

const OverlayCard = styled(PollCard)`
  ${buttonReset}
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
`;

const CardText = styled.span`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardTitle = styled.span`
  color: var(--text-secondary);
  ${typography.heading3}
  line-height: 1.6;
`;

const CardDescription = styled.span`
  color: var(--text-tertiary);
  ${typography.caption1}
`;

const CardAction = styled.span`
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--bg-brand);
  color: var(--text-brand);
  ${typography.label3}
`;

const ModeHint = styled.div`
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const ModeText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ModeTitle = styled.span`
  color: var(--text-primary);
  ${typography.heading2}
`;

const ModeDescription = styled.span`
  color: var(--text-tertiary);
  ${typography.caption1}
`;

const ModeToggle = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  color: var(--text-tertiary);
  ${typography.caption1}
`;

const GridSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  ${typography.label3}
`;

const Swatch = styled.span<{ $color: string }>`
  width: 14px;
  height: 10px;
  border-radius: 3px;
  background: ${({ $color }) => $color};
`;

const ResetButton = styled.button`
  ${buttonReset}
  margin-left: auto;
  color: var(--text-brand);
  ${typography.label3}

  &:disabled {
    color: var(--text-disabled);
  }
`;

const GestureHint = styled.p`
  margin: 0;
  color: var(--text-tertiary);
  ${typography.caption1}
`;
