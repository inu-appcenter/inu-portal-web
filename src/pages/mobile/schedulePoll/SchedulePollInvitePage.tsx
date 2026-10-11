import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import { usePollDetail } from "@/hooks/useSchedulePoll";
import SendTargetPicker from "@/components/mobile/schedulePoll/SendTargetPicker";
import {
  PollBody,
  PollBottomBar,
  PollNotice,
  PollPage,
  PollPrimaryButton,
} from "@/components/mobile/schedulePoll/PollUi";
import { resolvePollLink } from "@/utils/schedulePoll";
import { getPollErrorMessage } from "@/utils/schedulePollError";
import { showToast } from "@/utils/toast";

/**
 * 참여자 초대 (PRD 5-2 개설자 3단계). 조건 설정 바로 다음 화면이다.
 * 미리 참여자를 고르는 화면이 아니라 링크·카드를 보내는 화면이라, 건너뛰어도 조율은 유지되고
 * 참여 현황의 '초대하기'로 언제든 다시 열 수 있다. 보내거나 건너뛰면 내 일정 입력으로 간다.
 */
export default function SchedulePollInvitePage() {
  const { pollId: pollIdParam = "" } = useParams<{ pollId: string }>();
  const pollId = Number(pollIdParam);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // 채팅방에서 시작했으면 그 방을 미리 골라 '보내기' 한 번으로 초대가 끝나게 한다.
  const [preselectedRoomIds] = useState(() => {
    const roomId = Number(searchParams.get("roomId"));
    return roomId ? [roomId] : [];
  });

  const { data: poll, isLoading, error, refetch } = usePollDetail(pollId);

  useHeader({ title: "참여자 초대", hasback: true });

  const goToInput = () =>
    navigate(ROUTES.SCHEDULE_POLL.INPUT(pollId), { replace: true });

  if (isLoading) {
    return (
      <PollPage>
        <PollNotice title="시간 맞추기를 불러오는 중이에요" />
      </PollPage>
    );
  }

  if (!poll) {
    return (
      <PollPage>
        <PollNotice
          title={getPollErrorMessage(error, "시간 맞추기를 불러오지 못했어요")}
        >
          <PollPrimaryButton type="button" onClick={() => refetch()}>
            다시 시도
          </PollPrimaryButton>
        </PollNotice>
      </PollPage>
    );
  }

  return (
    <PollPage>
      <PollBody>
        <SendTargetPicker
          pollId={pollId}
          linkUrl={resolvePollLink(poll.linkUrl)}
          shareText={`[INTIP] ${poll.title} — 가능한 시간을 알려 주세요`}
          kind="INVITE"
          preselectedRoomIds={preselectedRoomIds}
          onSent={(response) => {
            showToast(`${response.results.length}곳에 참여 요청을 보냈어요`);
            goToInput();
          }}
          onSkip={goToInput}
          renderFooter={(buttons) => <PollBottomBar>{buttons}</PollBottomBar>}
        />
      </PollBody>
    </PollPage>
  );
}
