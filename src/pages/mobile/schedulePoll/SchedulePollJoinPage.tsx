import { useEffect, useRef } from "react";
import styled from "styled-components";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/common/Icon";
import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import { usePollJoinPreview } from "@/hooks/useSchedulePoll";
import { buildLoginRedirect } from "@/hooks/usePollAuth";
import useUserStore from "@/stores/useUserStore";
import {
  PollNotice,
  PollPage,
  PollPrimaryButton,
  PollSecondaryButton,
} from "@/components/mobile/schedulePoll/PollUi";
import { formatDeadline } from "@/utils/schedulePoll";
import { getPollErrorCode } from "@/utils/schedulePollError";
import { mixpanelTrack } from "@/utils/mixpanel";
import { setPendingReturnPath } from "@/utils/pendingReturnPath";
import { typography } from "@/styles/typography";

/**
 * 참여 링크 진입 (`/schedule-polls/join/{token}`, FR-021·FR-022).
 *
 * 링크를 여는 것만으로는 참여자가 되지 않는다. 미리보기로 입장 가능 여부만 확인하고,
 * 로그인한 사람은 바로 내 일정 입력으로 보낸다. 비로그인이면 로그인 후 이 화면으로 돌아온다.
 * 종료됐거나 인원이 가득 찼으면 입력 전에 안내한다(이미 참여자인 사람은 그대로 들어간다).
 */
export default function SchedulePollJoinPage() {
  const { token = "" } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useUserStore((state) =>
    Boolean(state.tokenInfo.accessToken),
  );
  const hasTrackedRef = useRef(false);

  const { data: preview, isLoading, error, refetch } = usePollJoinPreview(
    token,
    isLoggedIn,
  );

  useHeader({ title: "시간 맞추기", hasback: true, backPath: ROUTES.HOME });

  useEffect(() => {
    if (!preview || hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    mixpanelTrack.pollLinkOpen({
      pollId: preview.pollId,
      loggedIn: isLoggedIn,
      // 대표 시간표 보유 여부는 입력 화면에서 불러온 뒤에야 알 수 있다.
      hasTimetable: null,
    });
  }, [preview, isLoggedIn]);

  // 비로그인으로 들어왔으면 가입·프로필 설정까지 마친 뒤에도 이 링크로 돌아오게 기억해 둔다.
  // 로그인해 돌아온 직후에는 지우지 않는다. 학과 미등록이면 곧바로 프로필 설정으로 보내지고,
  // 저장한 뒤 이 경로로 돌아와야 한다. 쓸 일이 없어진 경로는 RootLayout이 지운다.
  useEffect(() => {
    if (!isLoggedIn) setPendingReturnPath(location.pathname);
  }, [isLoggedIn, location.pathname]);

  if (isLoading) {
    return (
      <PollPage>
        <PollNotice title="링크를 확인하는 중이에요" />
      </PollPage>
    );
  }

  if (!preview) {
    const notFound =
      getPollErrorCode(error) === "POLL_NOT_FOUND" ||
      (error as { response?: { status?: number } } | null)?.response?.status ===
        404;
    return (
      <PollPage>
        <PollNotice
          title={
            notFound
              ? "찾을 수 없는 시간 맞추기예요"
              : "링크를 확인하지 못했어요"
          }
          description={
            notFound
              ? "링크가 잘못됐을 수 있어요. 보낸 사람에게 다시 받아 주세요."
              : "잠시 후 다시 시도해 주세요."
          }
        >
          {!notFound && (
            <PollPrimaryButton type="button" onClick={() => refetch()}>
              다시 시도
            </PollPrimaryButton>
          )}
          <PollSecondaryButton
            type="button"
            onClick={() => navigate(ROUTES.HOME)}
          >
            홈으로
          </PollSecondaryButton>
        </PollNotice>
      </PollPage>
    );
  }

  const isParticipant = preview.myStatus === "SUBMITTED";

  if (!preview.canEnter) {
    if (preview.blockReason === "CLOSED") {
      // 종료된 조율은 결과만 보여 준다. 결과는 참여자였던 사람만 볼 수 있다.
      if (isParticipant) {
        return (
          <Navigate replace to={ROUTES.SCHEDULE_POLL.RESULT(preview.pollId)} />
        );
      }
      return (
        <PollPage>
          <PollNotice
            title="종료된 시간 맞추기예요"
            description={`'${preview.title}'은 이미 끝났어요.`}
          >
            <PollSecondaryButton
              type="button"
              onClick={() => navigate(ROUTES.HOME)}
            >
              홈으로
            </PollSecondaryButton>
          </PollNotice>
        </PollPage>
      );
    }
    return (
      <PollPage>
        <PollNotice
          title={
            preview.blockReason === "FULL"
              ? "인원이 가득 찼어요"
              : "이 시간 맞추기에 참여할 수 없어요"
          }
          description={
            preview.blockReason === "FULL"
              ? `최대 ${preview.maxParticipants}명까지 참여할 수 있어요.`
              : undefined
          }
        >
          <PollSecondaryButton
            type="button"
            onClick={() => navigate(ROUTES.HOME)}
          >
            홈으로
          </PollSecondaryButton>
        </PollNotice>
      </PollPage>
    );
  }

  // 로그인한 사람은 랜딩 없이 바로 입력 화면으로 보낸다(FR-021).
  if (isLoggedIn) {
    return (
      <Navigate
        replace
        to={`${ROUTES.SCHEDULE_POLL.INPUT(preview.pollId)}?src=LINK`}
      />
    );
  }

  // 비로그인 랜딩(FR-022): 시간표 불러오기의 가치를 먼저 보여 주고 로그인으로 보낸다.
  return (
    <PollPage>
      <Landing>
        <IconCircle>
          <Icon name="calendar-add" size={28} />
        </IconCircle>
        <Inviter>{preview.creatorDisplayName}님이 시간을 맞추자고 해요</Inviter>
        <Title>{preview.title}</Title>
        <Meta>
          {preview.participantCount}명 참여 중
          {preview.deadlineAt && ` · 마감 ${formatDeadline(preview.deadlineAt)}`}
        </Meta>

        <Benefits>
          <Benefit>
            <Icon name="timetable" size={20} />
            <span>인팁 시간표를 불러와 수업을 한 번 누르면 불가능 시간이 돼요</span>
          </Benefit>
          <Benefit>
            <Icon name="users-group" size={20} />
            <span>등록하면 모두가 되는 시간을 바로 볼 수 있어요</span>
          </Benefit>
        </Benefits>

        <Actions>
          <PollPrimaryButton
            type="button"
            onClick={() =>
              navigate(
                buildLoginRedirect(
                  ROUTES.LOGIN,
                  `${location.pathname}${location.search}`,
                ),
              )
            }
          >
            로그인하고 참여하기
          </PollPrimaryButton>
        </Actions>
        <Caption>인천대학교 포털 계정으로 바로 로그인할 수 있어요</Caption>
      </Landing>
    </PollPage>
  );
}

const Landing = styled.div`
  flex: 1;
  padding: 56px 24px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
`;

const IconCircle = styled.div`
  width: 64px;
  height: 64px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-brand);
  color: var(--text-brand);
`;

const Inviter = styled.p`
  margin: 0;
  color: var(--text-secondary);
  ${typography.label2}
`;

const Title = styled.h2`
  margin: 0;
  color: var(--text-primary);
  word-break: keep-all;
  ${typography.title1}
`;

const Meta = styled.p`
  margin: 0;
  color: var(--text-tertiary);
  ${typography.caption1}
`;

const Benefits = styled.ul`
  width: 100%;
  max-width: 360px;
  margin: 24px 0 0;
  padding: 16px;
  box-sizing: border-box;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: 16px;
  border: 1px solid var(--border-default);
  background: var(--bg-base);
  text-align: left;
`;

const Benefit = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--text-brand);

  span {
    color: var(--text-secondary);
    ${typography.label2}
  }
`;

const Actions = styled.div`
  width: 100%;
  max-width: 360px;
  margin-top: 24px;
  display: flex;
`;

const Caption = styled.p`
  margin: 0;
  color: var(--text-tertiary);
  ${typography.caption1}
`;
