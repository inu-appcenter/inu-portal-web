import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Armchair,
  CalendarClock,
  CalendarDays,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import BottomSheet from "@/components/common/BottomSheet";
import CapsuleButton from "@/components/common/CapsuleButton";
import { checkPortalAccountLinked } from "@/apis/mobileAgentBridge";
import { ROUTES } from "@/constants/routes";
import { useFirstTimePromotion } from "@/hooks/useFirstTimePromotion";
import { PROMOTIONS } from "@/utils/promotion/registry";
import { SEEN_PROMOTIONS } from "@/utils/promotion/seenStorage";

/** 포털·도서관 정보를 앱이 대신 불러오는 기능이 처음 들어간 앱 버전 */
const PORTAL_AUTO_SYNC_MIN_APP_VERSION = "3.0.14";

const HIGHLIGHTS = [
  {
    icon: Armchair,
    title: "도서관 좌석·스터디룸",
    desc: "빈자리를 바로 확인하고 앱에서 예약까지 끝내요",
  },
  {
    icon: CalendarClock,
    title: "이러닝 과제 마감",
    desc: "마감이 다가오는 과제를 모아서 놓치지 않게 알려드려요",
  },
  {
    icon: GraduationCap,
    title: "수강 과목·성적",
    desc: "이번 학기 수강 과목과 성적을 알아서 불러와요",
  },
  {
    icon: CalendarDays,
    title: "포털 시간표",
    desc: "포털에 있는 시간표를 그대로 가져와 내 시간표로 만들어요",
  },
] as const;

interface PortalAutoSyncSheetProps {
  /** 지금 이 안내를 띄워도 되는 상황인지(로그인 여부, 홈 화면 여부 등) */
  enabled?: boolean;
}

/**
 * 앱 3.0.14부터 들어간 "포털·도서관 정보 자동 불러오기"를 처음 한 번만 소개하는 시트.
 *
 * 내부적으로는 앱이 학교 사이트에 대신 로그인해 정보를 가져오지만, 사용자에게는
 * 방식보다 "학교 사이트에 안 들어가도 된다"는 결과가 중요하므로 문구도 그쪽에 맞췄다.
 */
export default function PortalAutoSyncSheet({
  enabled = true,
}: PortalAutoSyncSheetProps) {
  const navigate = useNavigate();

  const [isLinked, setIsLinked] = useState(false);

  const { isVisible, dismiss, accept } = useFirstTimePromotion(
    PROMOTIONS.PORTAL_AUTO_SYNC,
    SEEN_PROMOTIONS.PORTAL_AUTO_SYNC_INTRO,
    { enabled, minAppVersion: PORTAL_AUTO_SYNC_MIN_APP_VERSION },
  );

  useEffect(() => {
    if (!isVisible) return;

    let cancelled = false;
    void checkPortalAccountLinked().then((linked) => {
      if (!cancelled) setIsLinked(linked);
    });
    return () => {
      cancelled = true;
    };
  }, [isVisible]);

  const handlePrimary = () => {
    if (isLinked) {
      accept("Open Library");
      navigate(ROUTES.SERVICES.LIBRARY);
      return;
    }
    accept("Link Portal Account");
    navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT);
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
            학교 사이트, 이제
            <br />
            일일이 안 들어가도 돼요
          </Title>
          <Subtitle>
            포털 계정을 한 번만 연결하면 필요한 정보를 인팁이 자동으로
            불러와 드려요.
          </Subtitle>
        </Heading>

        <Highlights>
          {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
            <HighlightItem key={title}>
              <IconBadge>
                <Icon size={20} aria-hidden />
              </IconBadge>
              <HighlightText>
                <HighlightTitle>{title}</HighlightTitle>
                <HighlightDescription>{desc}</HighlightDescription>
              </HighlightText>
            </HighlightItem>
          ))}
        </Highlights>

        <Reassurance>
          <ShieldCheck size={16} aria-hidden />
          <span>계정 정보는 인팁 서버로 보내지 않고, 내 휴대폰에만 안전하게 보관해요</span>
        </Reassurance>

        <Footer>
          <CapsuleButton variant="primary" fullWidth onClick={handlePrimary}>
            {isLinked ? "도서관 바로 가기" : "포털 계정 연결하기"}
          </CapsuleButton>
          <LaterButton type="button" onClick={dismiss}>
            나중에 할게요
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

const Highlights = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const HighlightItem = styled.li`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const IconBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--bg-brand);
  color: var(--text-brand);
`;

const HighlightText = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const HighlightTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
`;

const HighlightDescription = styled.span`
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-tertiary);
  word-break: keep-all;
`;

const Reassurance = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--bg-muted);
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-secondary);
  word-break: keep-all;

  svg {
    flex-shrink: 0;
    color: var(--text-brand);
  }
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
