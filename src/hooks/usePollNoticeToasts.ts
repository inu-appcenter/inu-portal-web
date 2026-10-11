import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { usePollChangeNotice } from "@/hooks/useSchedulePoll";
import type { PollRevision } from "@/types/schedulePolls";
import { showToast } from "@/utils/toast";

/**
 * 폴링으로 감지한 상태 변화를 토스트로 알린다(FR-115).
 * 결과 화면에서는 이미 결과를 보고 있으므로 '결과 보기' 버튼을 붙이지 않는다.
 */
export const usePollNoticeToasts = (
  pollId: number,
  revision: PollRevision | undefined,
  options?: { onResultPage?: boolean },
) => {
  const navigate = useNavigate();
  const onResultPage = options?.onResultPage ?? false;

  usePollChangeNotice(pollId, revision, (change) => {
    const goToResult = onResultPage
      ? undefined
      : {
          action: {
            text: "결과 보기",
            onClick: () => navigate(ROUTES.SCHEDULE_POLL.RESULT(pollId)),
          },
        };

    switch (change.type) {
      case "RESULT_READY":
        showToast("결과가 나왔어요", goToResult);
        return;
      case "JOINED": {
        const who = change.displayName ? `${change.displayName}님이` : "새 참여자가";
        showToast(
          change.hasResult
            ? `${who} 들어와 결과가 바뀌었어요`
            : `${who} 참여했어요`,
        );
        return;
      }
      case "CLOSED":
        showToast(
          change.hasResult
            ? "마감되어 결과가 확정됐어요"
            : "시간 맞추기가 종료됐어요",
          change.hasResult ? goToResult : undefined,
        );
    }
  });
};
