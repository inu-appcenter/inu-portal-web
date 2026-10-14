import { useState } from "react";
import styled from "styled-components";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Skeleton from "@/components/common/Skeleton";
import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import { useMyPolls } from "@/hooks/useSchedulePoll";
import { buildLoginRedirect, usePollLoggedIn } from "@/hooks/usePollAuth";
import { buttonReset } from "@/components/mobile/timetable/wizard/ui/tokens";
import {
  PollBadge,
  PollBody,
  PollBottomBar,
  PollCard,
  PollPage,
  PollPrimaryButton,
} from "@/components/mobile/schedulePoll/PollUi";
import type { MyPollFilter, MyPollListItem } from "@/types/schedulePolls";
import { formatDeadline } from "@/utils/schedulePoll";
import { typography } from "@/styles/typography";

const FILTERS: { id: MyPollFilter; label: string }[] = [
  { id: "ACTIVE", label: "진행 중" },
  { id: "CLOSED", label: "종료" },
];

const describe = (poll: MyPollListItem) => {
  if (poll.status === "CLOSED") return "종료됨";
  if (poll.myStatus !== "SUBMITTED") return "내 일정을 아직 등록하지 않았어요";
  if (poll.status === "RESULT_READY") return "결과가 나왔어요";
  return "참여자를 기다리는 중이에요";
};

/**
 * 시간 맞추기 홈(독립 진입점). 내가 만들었거나 등록한 조율을 다시 찾고, 새로 시작한다.
 * 목록 API(`GET /api/schedule-polls/my`)는 PRD에 없던 것을 API 명세에서 추가 제안한 것이다.
 */
export default function SchedulePollListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = usePollLoggedIn();
  const [filter, setFilter] = useState<MyPollFilter>("ACTIVE");
  const { data, isLoading, isError, refetch } = useMyPolls(filter, isLoggedIn);

  useHeader({ title: "시간 맞추기", hasback: true });

  if (!isLoggedIn) {
    return (
      <Navigate replace to={buildLoginRedirect(ROUTES.LOGIN, location.pathname)} />
    );
  }

  const polls = data?.content ?? [];

  return (
    <PollPage>
      <PollBody>
        <Intro>
          <IntroTitle>링크 하나로 모두가 되는 시간을 찾아요</IntroTitle>
          <IntroDescription>
            인팁 시간표를 불러와 수업을 한 번 누르면 불가능 시간이 돼요. 친구가
            아니어도 링크로 최대 10명까지 참여할 수 있어요.
          </IntroDescription>
        </Intro>

        <Tabs role="tablist">
          {FILTERS.map((item) => (
            <Tab
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              $active={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </Tab>
          ))}
        </Tabs>

        {isLoading ? (
          <>
            <Skeleton variant="card" height={76} />
            <Skeleton variant="card" height={76} />
          </>
        ) : isError ? (
          <Empty>
            목록을 불러오지 못했어요
            <RetryButton type="button" onClick={() => refetch()}>
              다시 시도
            </RetryButton>
          </Empty>
        ) : polls.length === 0 ? (
          <Empty>
            {filter === "ACTIVE"
              ? "진행 중인 시간 맞추기가 없어요"
              : "종료된 시간 맞추기가 없어요"}
          </Empty>
        ) : (
          polls.map((poll) => (
            <PollRow
              key={poll.pollId}
              as="button"
              type="button"
              onClick={() => navigate(ROUTES.SCHEDULE_POLL.STATUS(poll.pollId))}
            >
              <RowText>
                <RowTitle>{poll.title}</RowTitle>
                <RowCaption>
                  {describe(poll)}
                  {poll.status !== "CLOSED" &&
                    poll.deadlineAt &&
                    ` · 마감 ${formatDeadline(poll.deadlineAt)}`}
                </RowCaption>
              </RowText>
              {poll.isHost && <PollBadge $tone="brand">개설자</PollBadge>}
              <PollBadge>{poll.participantCount}명</PollBadge>
            </PollRow>
          ))
        )}
      </PollBody>

      <PollBottomBar>
        <PollPrimaryButton
          type="button"
          onClick={() => navigate(ROUTES.SCHEDULE_POLL.NEW)}
        >
          새 시간 맞추기
        </PollPrimaryButton>
      </PollBottomBar>
    </PollPage>
  );
}

const Intro = styled.div`
  padding: 0 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const IntroTitle = styled.h2`
  margin: 0;
  color: var(--text-primary);
  word-break: keep-all;
  ${typography.title2}
`;

const IntroDescription = styled.p`
  margin: 0;
  color: var(--text-tertiary);
  word-break: keep-all;
  ${typography.caption1}
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
`;

const Tab = styled.button<{ $active: boolean }>`
  ${buttonReset}
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid
    ${({ $active }) => ($active ? "var(--border-brand)" : "var(--border-default)")};
  background: ${({ $active }) =>
    $active ? "var(--interactive-primary)" : "var(--bg-base)"};
  color: ${({ $active }) =>
    $active ? "var(--text-inverse)" : "var(--text-secondary)"};
  ${typography.label2}
`;

const PollRow = styled(PollCard)`
  ${buttonReset}
  min-height: 76px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
`;

const RowText = styled.span`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const RowTitle = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
  ${typography.heading2}
`;

const RowCaption = styled.span`
  color: var(--text-tertiary);
  ${typography.caption1}
`;

const Empty = styled.div`
  padding: 56px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-tertiary);
  text-align: center;
  ${typography.label2}
`;

const RetryButton = styled.button`
  ${buttonReset}
  color: var(--text-brand);
  ${typography.label2}
`;
