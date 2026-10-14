import { useState } from "react";
import styled from "styled-components";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "@/components/common/Modal";
import Skeleton from "@/components/common/Skeleton";
import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import {
  POLL_INTERVAL,
  usePollDetail,
  usePollLatestResult,
  usePollParticipants,
  usePollRevision,
  useUpdatePoll,
} from "@/hooks/useSchedulePoll";
import { usePollNoticeToasts } from "@/hooks/usePollNoticeToasts";
import { buildLoginRedirect, usePollLoggedIn } from "@/hooks/usePollAuth";
import { buttonReset } from "@/components/mobile/timetable/wizard/ui/tokens";
import SendTargetSheet from "@/components/mobile/schedulePoll/SendTargetSheet";
import {
  PollBadge,
  PollBody,
  PollBottomBar,
  PollCard,
  PollNotice,
  PollPage,
  PollPrimaryButton,
  PollSecondaryButton,
} from "@/components/mobile/schedulePoll/PollUi";
import {
  formatColumnName,
  formatDeadline,
  formatShareResultMessage,
  resolvePollLink,
  toDateKey,
  toOffsetIsoString,
} from "@/utils/schedulePoll";
import {
  getPollErrorCode,
  getPollErrorMessage,
} from "@/utils/schedulePollError";
import { showToast } from "@/utils/toast";
import { DEFAULT_PROFILE_IMAGE_ID } from "@/utils/userInfo";
import { typography } from "@/styles/typography";

const DEFAULT_AVATAR = `https://portal.inuappcenter.kr/images/profile/${DEFAULT_PROFILE_IMAGE_ID}`;

const formatSubmittedAt = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")} 등록`;
};

const toLocalInputValue = (iso: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${toDateKey(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const isPast = (date: Date) => date.getTime() <= Date.now();

type HostDialog = "DEADLINE" | "CLOSE" | null;

/**
 * 참여 현황 (Figma D. 참여 현황).
 * 등록한 사람만 참여자다. 미입력·진행률 개념이 없어 시안의 진행률 바와 '미입력' 배지는 그리지 않는다(FR-040).
 */
export default function SchedulePollStatusPage() {
  const { pollId: pollIdParam = "" } = useParams<{ pollId: string }>();
  const pollId = Number(pollIdParam);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = usePollLoggedIn();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [hostDialog, setHostDialog] = useState<HostDialog>(null);
  const [deadlineInput, setDeadlineInput] = useState("");

  const pollQuery = usePollDetail(isLoggedIn ? pollId : null);
  const { data: revision } = usePollRevision(isLoggedIn ? pollId : null, {
    intervalMs: POLL_INTERVAL.STATUS,
  });
  const participantsQuery = usePollParticipants(isLoggedIn ? pollId : null);
  const poll = pollQuery.data;

  const status = revision?.status ?? poll?.status;
  const myStatus = revision ? revision.myStatus : poll?.myStatus;
  const resultVersion = revision ? revision.resultVersion : poll?.resultVersion;
  const deadlineAt = revision ? revision.deadlineAt : (poll?.deadlineAt ?? null);
  const isClosed = status === "CLOSED";
  const isParticipant = myStatus === "SUBMITTED";
  const hasResult = resultVersion != null;

  // 히트맵·후보는 등록한 참여자에게만 보인다(PRD 4-1 공개 범위).
  const resultQuery = usePollLatestResult(pollId, {
    enabled: isLoggedIn && isParticipant && hasResult,
  });
  const updateMutation = useUpdatePoll(pollId);

  usePollNoticeToasts(pollId, revision);
  useHeader({ title: poll?.title ?? "시간 맞추기", hasback: true });

  if (!isLoggedIn) {
    return (
      <Navigate
        replace
        to={buildLoginRedirect(ROUTES.LOGIN, location.pathname)}
      />
    );
  }

  if (pollQuery.isLoading) {
    return (
      <PollPage>
        <PollBody>
          <Skeleton variant="card" height={46} />
          <Skeleton variant="card" height={216} />
        </PollBody>
      </PollPage>
    );
  }

  if (!poll) {
    return (
      <PollPage>
        <PollNotice
          title={getPollErrorMessage(
            pollQuery.error,
            "시간 맞추기를 불러오지 못했어요",
          )}
        >
          {getPollErrorCode(pollQuery.error) === null && (
            <PollPrimaryButton type="button" onClick={() => pollQuery.refetch()}>
              다시 시도
            </PollPrimaryButton>
          )}
        </PollNotice>
      </PollPage>
    );
  }

  const participants = participantsQuery.data?.participants ?? [];
  const participantCount =
    revision?.participantCount ??
    participantsQuery.data?.participantCount ??
    poll.participantCount;
  const result = resultQuery.data;
  const needsMorePeople = participantCount < 2;

  const handleHostError = (error: unknown, fallback: string) => {
    // NOT_HOST·POLL_CLOSED면 리비전을 다시 받아 권한 UI와 상태가 맞춰진다(FR-118).
    showToast(
      getPollErrorCode(error) === "POLL_CLOSED"
        ? "이미 마감되었어요"
        : getPollErrorMessage(error, fallback),
    );
    setHostDialog(null);
  };

  const handleSaveDeadline = (clear: boolean) => {
    if (updateMutation.isPending) return;
    if (!clear) {
      if (!deadlineInput) return;
      if (isPast(new Date(deadlineInput))) {
        showToast("응답 마감은 지금보다 뒤여야 해요");
        return;
      }
    }
    updateMutation.mutate(
      {
        deadlineAt: clear ? null : toOffsetIsoString(new Date(deadlineInput)),
      },
      {
        onSuccess: () => {
          showToast(clear ? "응답 마감을 해제했어요" : "응답 마감을 바꿨어요");
          setHostDialog(null);
        },
        onError: (error) => handleHostError(error, "마감을 바꾸지 못했어요"),
      },
    );
  };

  const handleClose = () => {
    if (updateMutation.isPending) return;
    updateMutation.mutate(
      { close: true },
      {
        onSuccess: () => {
          showToast("시간 맞추기를 종료했어요");
          setHostDialog(null);
        },
        onError: (error) => handleHostError(error, "종료하지 못했어요"),
      },
    );
  };

  const goToInput = () => navigate(ROUTES.SCHEDULE_POLL.INPUT(pollId));
  const goToResult = () => navigate(ROUTES.SCHEDULE_POLL.RESULT(pollId));

  return (
    <PollPage>
      <PollBody $gap={24}>
        <Summary>
          <SummaryRow>
            <Headline>
              <strong>{participantCount}</strong>명 참여
              <HeadlineSub> · 최대 {poll.maxParticipants}명</HeadlineSub>
            </Headline>
            {!isClosed && (
              <InviteButton
                type="button"
                $emphasized={needsMorePeople}
                onClick={() => setIsInviteOpen(true)}
              >
                초대하기
              </InviteButton>
            )}
          </SummaryRow>
          <MetaRow>
            {isClosed ? (
              <PollBadge $tone="neutral">종료됨</PollBadge>
            ) : (
              <span>
                {deadlineAt
                  ? `응답 마감 ${formatDeadline(deadlineAt)}`
                  : "응답 마감 없음"}
              </span>
            )}
          </MetaRow>
        </Summary>

        {needsMorePeople && !isClosed && (
          <InviteCard>
            <InviteTitle>
              {participantCount === 0
                ? "아직 등록한 사람이 없어요"
                : "한 명만 더 모이면 결과가 나와요"}
            </InviteTitle>
            <InviteDescription>
              링크나 채팅방으로 초대해 보세요. 2명 이상 모이면 겹치는 시간을 바로
              계산해요.
            </InviteDescription>
          </InviteCard>
        )}

        {participantsQuery.isLoading ? (
          <Skeleton variant="card" height={144} />
        ) : participants.length > 0 ? (
          <ParticipantList>
            {participants.map((participant) => (
              <ParticipantRow key={participant.memberId}>
                <Avatar src={DEFAULT_AVATAR} alt="" />
                <ParticipantText>
                  <ParticipantName>{participant.displayName}</ParticipantName>
                  {/* 이름을 정하지 않은 사람은 표시 이름이 곧 가려진 학번이라 두 번 보여 주지 않는다. */}
                  {participant.maskedStudentId !== participant.displayName && (
                    <ParticipantCaption>
                      {participant.maskedStudentId}
                    </ParticipantCaption>
                  )}
                </ParticipantText>
                {participant.isHost ? (
                  <PollBadge $tone="brand">개설자</PollBadge>
                ) : (
                  <SubmittedAt>
                    {formatSubmittedAt(participant.submittedAt)}
                  </SubmittedAt>
                )}
              </ParticipantRow>
            ))}
          </ParticipantList>
        ) : null}

        {isParticipant && result && (
          <Section>
            <SectionHeader>
              <SectionTitle>
                {isClosed ? "최종 결과" : "지금까지 겹치는 시간"}
              </SectionTitle>
              <PollBadge>{result.participants.length}명 기준</PollBadge>
            </SectionHeader>
            {!isClosed && (
              <SectionHint>
                새로 등록하거나 수정하면 결과가 바뀔 수 있어요
              </SectionHint>
            )}
            {result.candidates.length > 0 ? (
              result.candidates.map((candidate) => (
                <CandidateRow key={candidate.rank}>
                  <CandidateDay>
                    {formatColumnName(
                      result.columns.find((c) => c.key === candidate.key),
                      candidate.key,
                    )}
                  </CandidateDay>
                  <CandidateTime>
                    {candidate.start} ~ {candidate.end}
                  </CandidateTime>
                  <PollBadge $tone={candidate.allAvailable ? "brand" : "neutral"}>
                    {candidate.availableCount}/{result.participants.length}명
                  </PollBadge>
                </CandidateRow>
              ))
            ) : (
              <SectionHint>아직 겹치는 시간이 없어요</SectionHint>
            )}
          </Section>
        )}

        {poll.isHost && !isClosed && (
          <HostActions>
            <HostButton
              type="button"
              onClick={() => {
                setDeadlineInput(toLocalInputValue(deadlineAt));
                setHostDialog("DEADLINE");
              }}
            >
              마감 변경
            </HostButton>
            <HostButton
              type="button"
              $danger
              onClick={() => setHostDialog("CLOSE")}
            >
              시간 맞추기 종료
            </HostButton>
          </HostActions>
        )}
      </PollBody>

      <PollBottomBar
        caption={
          !isClosed && isParticipant && !hasResult
            ? "2명 이상 모이면 결과를 볼 수 있어요"
            : undefined
        }
      >
        {isClosed ? (
          <PollPrimaryButton
            type="button"
            disabled={!isParticipant || !hasResult}
            onClick={goToResult}
          >
            {isParticipant && hasResult ? "최종 결과 보기" : "종료된 시간 맞추기예요"}
          </PollPrimaryButton>
        ) : !isParticipant ? (
          <PollPrimaryButton type="button" onClick={goToInput}>
            내 일정 입력하기
          </PollPrimaryButton>
        ) : (
          <>
            <PollSecondaryButton type="button" onClick={goToInput}>
              내 일정 수정
            </PollSecondaryButton>
            {hasResult ? (
              <PollPrimaryButton type="button" onClick={goToResult}>
                결과 보기
              </PollPrimaryButton>
            ) : (
              <PollPrimaryButton
                type="button"
                onClick={() => setIsInviteOpen(true)}
              >
                초대하기
              </PollPrimaryButton>
            )}
          </>
        )}
      </PollBottomBar>

      <SendTargetSheet
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        title="참여자 초대"
        pollId={pollId}
        linkUrl={resolvePollLink(poll.linkUrl)}
        shareText={`[INTIP] ${poll.title} — 가능한 시간을 알려 주세요`}
        kind="INVITE"
        onSent={(response) => {
          showToast(formatShareResultMessage(response.results, "참여 요청"));
          setIsInviteOpen(false);
        }}
      />

      <Modal
        isOpen={hostDialog === "DEADLINE"}
        onClose={() => setHostDialog(null)}
        title="응답 마감 변경"
        description="마감 시각이 되면 그때까지 모인 사람 기준으로 결과가 확정돼요."
        secondaryButton={
          deadlineAt
            ? {
                text: "마감 해제",
                disabled: updateMutation.isPending,
                onClick: () => handleSaveDeadline(true),
              }
            : { text: "취소", onClick: () => setHostDialog(null) }
        }
        primaryButton={{
          text: "저장",
          disabled: !deadlineInput,
          loading: updateMutation.isPending,
          onClick: () => handleSaveDeadline(false),
        }}
      >
        <DeadlineInput
          type="datetime-local"
          aria-label="응답 마감 시각"
          value={deadlineInput}
          onChange={(event) => setDeadlineInput(event.target.value)}
        />
      </Modal>

      <Modal
        isOpen={hostDialog === "CLOSE"}
        onClose={() => setHostDialog(null)}
        title="시간 맞추기를 종료할까요?"
        description={
          hasResult
            ? "지금 결과가 최종 결과로 확정되고, 더 이상 등록하거나 수정할 수 없어요."
            : "참여자가 2명 미만이라 결과 없이 종료돼요. 종료하면 되돌릴 수 없어요."
        }
        secondaryButton={{ text: "취소", onClick: () => setHostDialog(null) }}
        primaryButton={{
          text: "종료하기",
          variant: "danger",
          loading: updateMutation.isPending,
          onClick: handleClose,
        }}
      />
    </PollPage>
  );
}

const Summary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Headline = styled.h2`
  margin: 0;
  color: var(--text-primary);
  ${typography.title2}

  strong {
    margin-right: 2px;
    color: var(--text-brand);
    font-weight: inherit;
  }
`;

const HeadlineSub = styled.span`
  color: var(--text-tertiary);
  ${typography.label2}
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-tertiary);
  ${typography.caption1}
`;

const InviteButton = styled.button<{ $emphasized: boolean }>`
  ${buttonReset}
  flex-shrink: 0;
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid
    ${({ $emphasized }) =>
      $emphasized ? "var(--border-brand)" : "var(--border-default)"};
  background: ${({ $emphasized }) =>
    $emphasized ? "var(--interactive-primary)" : "var(--bg-base)"};
  color: ${({ $emphasized }) =>
    $emphasized ? "var(--text-inverse)" : "var(--text-secondary)"};
  ${typography.label2}
`;

const InviteCard = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-radius: 16px;
  border: 1px solid var(--border-brand-subtle);
  background: var(--bg-brand);
`;

const InviteTitle = styled.span`
  color: var(--text-brand);
  ${typography.heading2}
`;

const InviteDescription = styled.span`
  color: var(--text-secondary);
  ${typography.caption1}
`;

const ParticipantList = styled(PollCard)`
  border-radius: 20px;
  overflow: hidden;
`;

const ParticipantRow = styled.div`
  min-height: 72px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 16px;

  & + & {
    border-top: 1px solid var(--border-default);
  }
`;

const Avatar = styled.img`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-brand);
`;

const ParticipantText = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const ParticipantName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
  ${typography.heading2}
`;

const ParticipantCaption = styled.span`
  color: var(--text-tertiary);
  ${typography.caption1}
`;

const SubmittedAt = styled.span`
  flex-shrink: 0;
  color: var(--text-tertiary);
  ${typography.caption1}
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionHeader = styled.div`
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: var(--text-primary);
  ${typography.heading3}
  line-height: 1.6;
`;

const SectionHint = styled.p`
  margin: 0;
  padding: 0 8px;
  color: var(--text-warn);
  ${typography.caption1}
`;

const CandidateRow = styled(PollCard)`
  height: 52px;
  padding: 0 12px 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CandidateDay = styled.span`
  flex-shrink: 0;
  min-width: 52px;
  color: var(--text-primary);
  ${typography.heading3}
`;

const CandidateTime = styled.span`
  flex: 1 0 0;
  min-width: 0;
  color: var(--text-secondary);
  ${typography.label2}
`;

const HostActions = styled.div`
  display: flex;
  gap: 8px;
`;

const HostButton = styled.button<{ $danger?: boolean }>`
  ${buttonReset}
  flex: 1 0 0;
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
  color: ${({ $danger }) =>
    $danger ? "var(--text-error)" : "var(--text-secondary)"};
  ${typography.label2}
`;

const DeadlineInput = styled.input`
  width: 100%;
  height: 50px;
  box-sizing: border-box;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
  color: var(--text-primary);
  /* iOS는 16px 미만 입력에 포커스하면 화면을 확대한다 */
  font-size: 16px;
`;
