import { useState, type MouseEvent, type ReactNode } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import Icon from "@/components/common/Icon";
import { ROUTES } from "@/constants/routes";
import {
  POLL_INTERVAL,
  useAddPollToTimetable,
  usePollDetail,
  usePollLatestResult,
  usePollResultVersion,
  usePollRevision,
} from "@/hooks/useSchedulePoll";
import type { ChatMessage } from "@/types/chat";
import type {
  PollCandidate,
  PollColumn,
  PollDay,
  PollInviteExtraData,
  PollResultExtraData,
} from "@/types/schedulePolls";
import {
  POLL_DAY_LABEL,
  formatColumnName,
  formatDeadline,
  isDateKey,
  parseDateKey,
} from "@/utils/schedulePoll";
import {
  getPollErrorCode,
  getPollErrorMessage,
} from "@/utils/schedulePollError";
import {
  isPollAddedToTimetable,
  markPollAddedToTimetable,
} from "@/utils/schedulePollStorage";
import { mixpanelTrack } from "@/utils/mixpanel";
import { showToast } from "@/utils/toast";

// 시간 맞추기 채팅 카드 (PRD FR-071·072·114, Figma 채팅 / 채팅 화면).
// 메시지의 extraData에는 ID만 들어 있고 본문은 조회 API로 그린다. 그래서 이름이 바뀌어도
// 최신 표시명이 보이고, 진행 카드의 후보는 리비전 폴링으로 계속 갱신된다.

type PollCardMessage = Pick<ChatMessage, "messageType" | "extraData" | "content">;

const parseExtraData = <T extends { pollId: number }>(
  extraData: string | null | undefined,
): T | null => {
  if (!extraData) return null;
  try {
    const parsed = JSON.parse(extraData) as T;
    return typeof parsed?.pollId === "number" ? parsed : null;
  } catch {
    return null;
  }
};

interface SchedulePollCardProps {
  message: PollCardMessage;
}

/** 메시지 타입에 맞는 카드를 그린다. extraData를 읽지 못하면 구버전 대비 문구(content)를 보여 준다. */
export default function SchedulePollCard({ message }: SchedulePollCardProps) {
  if (message.messageType === "SCHEDULE_POLL_RESULT") {
    const data = parseExtraData<PollResultExtraData>(message.extraData);
    if (data && typeof data.resultVersion === "number") {
      return <PollResultCard data={data} fallbackText={message.content} />;
    }
  } else {
    const data = parseExtraData<PollInviteExtraData>(message.extraData);
    if (data) return <PollInviteCard pollId={data.pollId} />;
  }
  return (
    <CardContainer>
      <BodyText>{message.content}</BodyText>
    </CardContainer>
  );
}

/** 카드가 화면에 보일 때만 30초 주기로 리비전을 확인한다. 같은 조율의 카드는 쿼리 하나를 나눠 쓴다. */
const useCardPoll = (pollId: number) => {
  const { ref, inView } = useInView({ threshold: 0 });
  // 한 번이라도 보였던 카드는 내용을 유지하고, 폴링만 보일 때로 제한한다.
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  if (inView && !hasBeenVisible) setHasBeenVisible(true);

  const pollQuery = usePollDetail(pollId, { enabled: hasBeenVisible });
  const { data: revision } = usePollRevision(pollId, {
    intervalMs: POLL_INTERVAL.CHAT_CARD,
    enabled: inView,
  });
  const poll = pollQuery.data;

  const state = {
    hasBeenVisible,
    poll,
    isLoading: pollQuery.isLoading || !hasBeenVisible,
    isError: pollQuery.isError,
    status: revision?.status ?? poll?.status,
    myStatus: revision ? revision.myStatus : poll?.myStatus,
    latestVersion: revision ? revision.resultVersion : poll?.resultVersion,
    participantCount: revision?.participantCount ?? poll?.participantCount ?? 0,
    deadlineAt: revision ? revision.deadlineAt : (poll?.deadlineAt ?? null),
  };
  // ref와 값을 한 객체에 담으면 값 읽기까지 ref 접근으로 취급되어 나눠서 돌려준다.
  return [ref, state] as const;
};

/** 좁은 카드용 열 이름. 정기는 '수', 일회성은 '10/12(월)'. */
const shortColumnName = (key: string) => {
  if (!isDateKey(key)) return POLL_DAY_LABEL[key as PollDay] ?? key;
  const date = parseDateKey(key);
  return `${date.getMonth() + 1}/${date.getDate()}(${"일월화수목금토"[date.getDay()]})`;
};

const stop = (handler: () => void) => (event: MouseEvent) => {
  event.stopPropagation();
  handler();
};

/** 참여 요청·진행 카드. 등록한 참여자에게는 상위 3개 후보를 실시간으로 보여 준다. */
function PollInviteCard({ pollId }: { pollId: number }) {
  const navigate = useNavigate();
  const [containerRef, card] = useCardPoll(pollId);
  const isParticipant = card.myStatus === "SUBMITTED";
  const isClosed = card.status === "CLOSED";
  const hasResult = card.latestVersion != null;

  // 후보는 등록한 참여자만 볼 수 있다. 아직 등록하지 않은 사람에게는 인원과 마감만 보인다.
  const { data: result } = usePollLatestResult(pollId, {
    enabled: card.hasBeenVisible && isParticipant && hasResult,
  });

  const goTo = (path: string) => stop(() => navigate(path));
  let footer: { label: string; onClick?: (event: MouseEvent) => void };
  if (isClosed) {
    footer =
      isParticipant && hasResult
        ? { label: "최종 결과 보기", onClick: goTo(ROUTES.SCHEDULE_POLL.RESULT(pollId)) }
        : { label: "종료된 시간 맞추기예요" };
  } else if (!isParticipant) {
    footer = {
      label: "가능한 시간 입력하러 가기",
      onClick: goTo(`${ROUTES.SCHEDULE_POLL.INPUT(pollId)}?src=CHAT_CARD`),
    };
  } else {
    footer = hasResult
      ? { label: "결과 보러 가기", onClick: goTo(ROUTES.SCHEDULE_POLL.RESULT(pollId)) }
      : { label: "참여 현황 보기", onClick: goTo(ROUTES.SCHEDULE_POLL.STATUS(pollId)) };
  }

  return (
    <CardContainer ref={containerRef} onClick={footer.onClick}>
      <CardHeader>
        <Icon name="calendar-add" size={24} />
        <HeaderTitle>
          {result?.candidates.length ? "만나기 좋은 시간 추천" : "시간 맞추기"}
        </HeaderTitle>
      </CardHeader>

      {card.isLoading ? (
        <BodyText>불러오는 중이에요</BodyText>
      ) : !card.poll ? (
        <BodyText>시간 맞추기를 불러오지 못했어요</BodyText>
      ) : (
        <>
          <PollTitle>{card.poll.title}</PollTitle>
          {result && result.candidates.length > 0 ? (
            <TimeList>
              {result.candidates.map((candidate, index) => (
                <CandidateItem
                  key={candidate.rank}
                  candidate={candidate}
                  isTop={index === 0}
                />
              ))}
            </TimeList>
          ) : (
            <BodyText>
              {card.participantCount}명 참여 중
              {card.deadlineAt && ` · 마감 ${formatDeadline(card.deadlineAt)}`}
            </BodyText>
          )}
        </>
      )}

      <FooterButton as={footer.onClick ? "button" : "div"} $muted={!footer.onClick}>
        <span>{footer.label}</span>
        {footer.onClick && <Icon name="chevron-right" size={16} />}
      </FooterButton>
    </CardContainer>
  );
}

const CandidateItem = ({
  candidate,
  isTop,
}: {
  candidate: PollCandidate;
  isTop: boolean;
}) => (
  <TimeItem>
    <TimeInfoGroup>
      <DayText>{shortColumnName(candidate.key)}</DayText>
      <TimeText>
        {candidate.start} ~ {candidate.end}
      </TimeText>
    </TimeInfoGroup>
    <CountBadge $isTop={isTop}>{candidate.availableCount}명</CountBadge>
  </TimeItem>
);

interface PollResultCardProps {
  data: PollResultExtraData;
  /** 결과를 볼 수 없는 사람(등록하지 않은 사람)에게 보여 줄 문구 */
  fallbackText: string;
}

/** 결과 카드. 공유한 시점의 버전·후보로 고정되고, 새 버전이 생기면 '이전 결과'로 표시한다. */
function PollResultCard({ data, fallbackText }: PollResultCardProps) {
  const { pollId, resultVersion, candidateRank } = data;
  const navigate = useNavigate();
  const [containerRef, card] = useCardPoll(pollId);
  const isParticipant = card.myStatus === "SUBMITTED";

  const resultQuery = usePollResultVersion(pollId, resultVersion, {
    enabled: card.hasBeenVisible && isParticipant,
  });
  const addMutation = useAddPollToTimetable(pollId);
  const [isAdded, setIsAdded] = useState(() =>
    isPollAddedToTimetable(pollId, resultVersion),
  );
  // 일회성 약속은 날짜 일정이 지원될 때까지 추가 버튼을 숨긴다(PRD 10장).
  const [isUnsupported, setIsUnsupported] = useState(false);

  const result = resultQuery.data;
  const candidate =
    result?.candidates.find((c) => c.rank === candidateRank) ??
    result?.candidates[0];
  const column: PollColumn | undefined = result?.columns.find(
    (c) => c.key === candidate?.key,
  );
  const isStale =
    card.latestVersion != null && card.latestVersion > resultVersion;
  const isFinal = card.status === "CLOSED" && !isStale;
  const canAdd =
    isParticipant &&
    Boolean(candidate) &&
    card.poll?.isRecurring === true &&
    !isStale &&
    !isUnsupported;

  const handleAdd = () => {
    if (addMutation.isPending || isAdded) return;
    addMutation.mutate(
      { version: resultVersion, candidateRank },
      {
        onSuccess: (response) => {
          markPollAddedToTimetable(pollId, resultVersion);
          setIsAdded(true);
          mixpanelTrack.pollAddToTimetable(pollId, resultVersion);
          showToast(
            response.alreadyAdded
              ? "이미 내 시간표에 추가한 일정이에요"
              : "내 시간표에 추가했어요",
          );
        },
        onError: (error) => {
          if (getPollErrorCode(error) === "ONE_TIME_NOT_SUPPORTED") {
            setIsUnsupported(true);
          }
          showToast(getPollErrorMessage(error, "시간표에 추가하지 못했어요"));
        },
      },
    );
  };

  let body: ReactNode;
  if (card.isLoading || (isParticipant && resultQuery.isLoading)) {
    body = <BodyText>불러오는 중이에요</BodyText>;
  } else if (!result || !candidate) {
    // 등록하지 않은 사람은 히트맵·후보를 볼 수 없다. 메시지 문구만 보여 준다.
    body = <BodyText>{fallbackText}</BodyText>;
  } else {
    body = (
      <WhenRow>
        <WhenText>
          <strong>{formatColumnName(column, candidate.key)}</strong>
          {candidate.start} ~ {candidate.end}
        </WhenText>
        <CountBadge $isTop={false}>
          {candidate.availableCount}/{result.participants.length}명
        </CountBadge>
      </WhenRow>
    );
  }

  return (
    <CardContainer ref={containerRef}>
      <ResultHeader>
        <ResultLabel>
          {isFinal ? "회의 시간이 확정됐어요" : "회의 시간이 정해졌어요"}
        </ResultLabel>
        {isStale && <StaleBadge>이전 결과</StaleBadge>}
      </ResultHeader>
      {card.poll && <ResultTitle>{card.poll.title}</ResultTitle>}
      {body}
      {result && (
        <BodyText>
          {result.participants.length}명 기준
          {isStale && " · 이후에 결과가 바뀌었어요"}
        </BodyText>
      )}

      {isStale && isParticipant ? (
        <FooterButton
          as="button"
          $muted={false}
          onClick={stop(() => navigate(ROUTES.SCHEDULE_POLL.RESULT(pollId)))}
        >
          <span>최신 결과 보기</span>
          <Icon name="chevron-right" size={16} />
        </FooterButton>
      ) : canAdd ? (
        <AddButton
          type="button"
          disabled={isAdded || addMutation.isPending}
          onClick={stop(handleAdd)}
        >
          {isAdded
            ? "추가됨"
            : addMutation.isPending
              ? "추가하는 중…"
              : "내 시간표에 추가"}
        </AddButton>
      ) : !isParticipant && card.status !== "CLOSED" && !card.isLoading ? (
        <FooterButton
          as="button"
          $muted={false}
          onClick={stop(() =>
            navigate(`${ROUTES.SCHEDULE_POLL.INPUT(pollId)}?src=CHAT_CARD`),
          )}
        >
          <span>가능한 시간 입력하러 가기</span>
          <Icon name="chevron-right" size={16} />
        </FooterButton>
      ) : null}
    </CardContainer>
  );
}

// 카드 틀과 후보 행은 공강 공유 카드(TimetableShareCard)와 같은 시안을 따른다.
const CardContainer = styled.div`
  width: 248px;
  max-width: 100%;
  box-sizing: border-box;
  margin-top: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 20px;
  border: 1px solid var(--border-brand-subtle);
  background: var(--bg-base);
  box-shadow: 0px 2px 8px 0px rgba(0, 97, 255, 0.07);
  text-align: left;
  user-select: none;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-brand);
`;

const HeaderTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-brand);
`;

const PollTitle = styled.span`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary);
  word-break: break-all;
`;

const BodyText = styled.span`
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-tertiary);
  word-break: break-all;
`;

const TimeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TimeItem = styled.div`
  padding: 4px 4px 4px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  box-sizing: border-box;
  border-radius: 12px;
  border: 0.667px solid var(--border-default);
  background: var(--bg-subtle);
`;

const TimeInfoGroup = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DayText = styled.span`
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-secondary);
`;

const TimeText = styled.span`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-secondary);
  white-space: nowrap;
`;

const CountBadge = styled.span<{ $isTop: boolean }>`
  flex-shrink: 0;
  padding: 4px 8px;
  border-radius: 999px;
  border: ${({ $isTop }) =>
    $isTop ? "none" : "1px solid var(--border-brand-subtle)"};
  background: ${({ $isTop }) =>
    $isTop ? "var(--interactive-primary)" : "var(--bg-brand)"};
  color: ${({ $isTop }) =>
    $isTop ? "var(--text-inverse)" : "var(--text-brand)"};
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
`;

const FooterButton = styled.div<{ $muted: boolean }>`
  width: 100%;
  margin: 0;
  padding: 8px 8px 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  border: none;
  border-radius: 12px;
  background: ${({ $muted }) =>
    $muted ? "var(--bg-muted)" : "var(--interactive-primary)"};
  color: ${({ $muted }) =>
    $muted ? "var(--text-tertiary)" : "var(--text-inverse)"};
  cursor: ${({ $muted }) => ($muted ? "default" : "pointer")};
  font: inherit;

  span {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const ResultLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--text-brand);
`;

const StaleBadge = styled.span`
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--bg-warn);
  color: var(--text-warn);
  font-size: 11px;
  line-height: 16px;
`;

const ResultTitle = styled.span`
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text-primary);
  word-break: break-all;
`;

const WhenRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const WhenText = styled.span`
  min-width: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-secondary);

  strong {
    margin-right: 8px;
    font-weight: 600;
    color: var(--text-primary);
  }
`;

const AddButton = styled.button`
  width: 100%;
  height: 40px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 12px;
  background: var(--interactive-primary);
  color: var(--text-inverse);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    background: var(--interactive-primary-disabled);
    color: var(--text-disabled);
    cursor: default;
  }
`;
