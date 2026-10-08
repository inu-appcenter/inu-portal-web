import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import BottomSheet from "@/components/common/BottomSheet";
import CapsuleButton from "@/components/common/CapsuleButton";
import { ROUTES } from "@/constants/routes";
import { useFirstTimePromotion } from "@/hooks/useFirstTimePromotion";
import {
  liveActivityIslandOngoing,
  liveActivityNowbarOngoing,
} from "@/resources/assets/illustrations/features";
import { isIOSUserAgent } from "@/utils/appInstallBanner";
import { PROMOTIONS } from "@/utils/promotion/registry";
import { SEEN_PROMOTIONS } from "@/utils/promotion/seenStorage";

/** 실시간 수업 카드(iOS Live Activity / 안드로이드 진행 중 알림)가 처음 들어간 앱 버전 */
const LIVE_ACTIVITY_MIN_APP_VERSION = "3.0.14";

/** 설정 화면의 "실시간 시간표" 루틴 id (MobileAgentReminderSetting 참고) */
const NOWBAR_ROUTINE_ID = "system-timetable-nowbar";

interface LiveActivitySheetProps {
  /** 지금 이 안내를 띄워도 되는 상황인지(로그인 여부, 홈 화면 여부 등) */
  enabled?: boolean;
}

/**
 * 수업 시작 전부터 끝날 때까지 잠금화면에 실시간 수업 카드를 띄워 주는 기능을
 * 앱 3.0.14+ 사용자에게 처음 한 번 소개하는 시트.
 *
 * 기능은 기본으로 켜져 있어서 사용자가 할 일은 없다. 다만 iOS는 첫 카드가 뜰 때
 * "실시간 현황을 허용하겠습니까?" 시스템 팝업이 나오고, 여기서 무심코 "허용 안 함"을
 * 누르면 설정 앱까지 가야 되돌릴 수 있다. 그래서 무엇이 뜰지 미리 보여주고
 * "허용"을 눌러 달라고 안내하는 데 초점을 맞췄다.
 */
export default function LiveActivitySheet({
  enabled = true,
}: LiveActivitySheetProps) {
  const navigate = useNavigate();
  const isIOS = isIOSUserAgent(
    typeof navigator === "undefined" ? "" : navigator.userAgent,
  );

  const { isVisible, dismiss, accept } = useFirstTimePromotion(
    PROMOTIONS.LIVE_ACTIVITY,
    SEEN_PROMOTIONS.LIVE_ACTIVITY_INTRO,
    { enabled, minAppVersion: LIVE_ACTIVITY_MIN_APP_VERSION },
  );

  const placeText = isIOS ? "잠금화면과 다이내믹 아일랜드" : "잠금화면과 상단 알림바";

  const handleConfirm = () => {
    accept("Confirm");
  };

  const handleOpenSettings = () => {
    accept("Open Settings");
    navigate(ROUTES.DAILY_BRIEF.ROUTINE_DETAIL(NOWBAR_ROUTINE_ID));
  };

  return (
    <BottomSheet
      open={isVisible}
      onOpenChange={(open) => {
        if (!open) {
          dismiss();
        }
      }}
    >
      <Content>
        <Heading>
          <NewBadge>NEW</NewBadge>
          <Title>
            다음 수업,
            <br />
            폰만 켜면 바로 보여요
          </Title>
          <Subtitle>
            수업 시작 15분 전부터 끝날 때까지 강의실과 남은 시간을 {placeText}에
            띄워 드려요.
          </Subtitle>
        </Heading>

        {/* 무엇이 뜰지 미리 봐야 허용 팝업에서 망설이지 않는다. */}
        {isIOS ? (
          <PreviewImage
            src={liveActivityIslandOngoing}
            alt="다이내믹 아일랜드에 컴퓨터네트워크 수업이 46분 25초 남았다고 표시된 예시"
            $aspectRatio="1125 / 412"
          />
        ) : (
          <PreviewImage
            src={liveActivityNowbarOngoing}
            alt="상단 알림바에 컴퓨터네트워크 수업이 45분 남았다고 표시된 예시"
            $aspectRatio="1006 / 304"
          />
        )}

        <Points>
          <Point>
            <PointNumber>1</PointNumber>
            <PointText>
              따로 설정할 건 없어요. 시간표에 넣어둔 수업이면 알아서 떠요.
            </PointText>
          </Point>
          {isIOS && (
            <Point>
              <PointNumber>2</PointNumber>
              <PointText>
                처음 한 번 <Quote>‘실시간 현황을 허용하겠습니까?’</Quote>라고
                물어보면 <Strong>허용</Strong>을 눌러 주세요.
              </PointText>
            </Point>
          )}
          <Point>
            <PointNumber>{isIOS ? 3 : 2}</PointNumber>
            <PointText>
              띄우는 시간을 바꾸거나 끄고 싶으면 설정에서 언제든 바꿀 수 있어요.
            </PointText>
          </Point>
        </Points>

        <Footer>
          <CapsuleButton variant="primary" fullWidth onClick={handleConfirm}>
            좋아요
          </CapsuleButton>
          <LaterButton type="button" onClick={handleOpenSettings}>
            시간 설정 바꾸기
          </LaterButton>
        </Footer>
      </Content>
    </BottomSheet>
  );
}

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 20px 8px;
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;

const NewBadge = styled.span`
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--bg-brand);
  color: var(--text-brand);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--text-primary);
  word-break: keep-all;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-tertiary);
  word-break: keep-all;
`;

const PreviewImage = styled.img<{ $aspectRatio: string }>`
  display: block;
  width: 100%;
  max-width: 360px;
  height: auto;
  margin: 0 auto;
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio};
`;

const Points = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Point = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const PointNumber = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  border-radius: 50%;
  background: var(--bg-brand);
  color: var(--text-brand);
  font-size: 12px;
  font-weight: 700;
`;

const PointText = styled.span`
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
  word-break: keep-all;
`;

const Quote = styled.span`
  color: var(--text-primary);
`;

const Strong = styled.strong`
  font-weight: 700;
  color: var(--text-brand);
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
`;

const LaterButton = styled.button`
  padding: 10px 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-tertiary);
  cursor: pointer;
`;
