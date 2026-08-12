import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { X } from "lucide-react";

import {
  APP_STORE_URL,
  INSTALL_BANNER_HEIGHT,
  readBannerDismissed,
  shouldShowInstallBanner,
  writeBannerDismissed,
} from "@/utils/appInstallBanner";
import { getAppEnvironmentStatus } from "@/utils/getMobilePlatform";
import { mixpanelTrack } from "@/utils/mixpanel";

const PROMO_NAME = "App Install Banner";
const PROMO_LOCATION = "Deep Link Top Banner";

/**
 * 앱 미설치 iOS 사용자용 상단 설치 유도 배너.
 *
 * 딥링크(Universal Links)를 눌렀는데 앱이 없으면 그대로 모바일 웹이 열린다. 이때
 * Safari는 `index.html`의 `apple-itunes-app` 메타로 네이티브 Smart App Banner가
 * 뜨지만, 카카오톡·인스타 인앱 브라우저나 iOS 크롬에서는 아무것도 뜨지 않는다.
 * 이 컴포넌트가 그 구멍을 메운다(노출 조건은 `utils/appInstallBanner.ts`).
 *
 * 레이아웃: 배너가 떠 있는 동안 `--native-safe-area-inset-top`에 배너 높이를 더한다.
 * 모바일 헤더가 이미 그 변수 기준으로 자리를 잡으므로(`MobileHeader`), 배너를 위해
 * 각 화면을 따로 손볼 필요가 없다.
 */
export default function AppInstallBanner() {
  const location = useLocation();
  const [dismissed, setDismissed] = useState(readBannerDismissed);

  const visible = shouldShowInstallBanner({
    userAgent: typeof navigator === "undefined" ? "" : navigator.userAgent,
    appStatus: getAppEnvironmentStatus(),
    pathname: location.pathname,
    dismissed,
  });

  useEffect(() => {
    if (!visible) return;

    const root = document.documentElement;
    root.style.setProperty(
      "--native-safe-area-inset-top",
      `calc(env(safe-area-inset-top, 0px) + ${INSTALL_BANNER_HEIGHT}px)`,
    );
    // 인라인 값을 지우면 CommonStyles의 `:root` 정의로 되돌아간다.
    return () => {
      root.style.removeProperty("--native-safe-area-inset-top");
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    mixpanelTrack.promotionImpression(PROMO_NAME, PROMO_LOCATION);
  }, [visible]);

  if (!visible) return null;

  const handleOpen = () => {
    mixpanelTrack.promotionClicked(PROMO_NAME, "Open Button", PROMO_LOCATION);
    // `window.open`은 카카오톡 등 인앱 브라우저에서 팝업으로 막히는 경우가 있다.
    // 같은 창에서 이동하면 iOS가 App Store 앱을 띄우고, 사용자가 돌아오면 보던
    // 페이지가 그대로 남아 있다.
    window.location.href = APP_STORE_URL;
  };

  const handleDismiss = () => {
    mixpanelTrack.promotionClicked(
      PROMO_NAME,
      "Dismiss Button",
      PROMO_LOCATION,
    );
    writeBannerDismissed();
    setDismissed(true);
  };

  return createPortal(
    <Banner>
      <DismissButton type="button" onClick={handleDismiss} aria-label="배너 닫기">
        <X size={18} />
      </DismissButton>
      <AppIcon src="/icon.svg" alt="" aria-hidden />
      <TextGroup>
        <Title>INTIP 앱으로 보기</Title>
        <Subtitle>앱에서 더 빠르게, 알림까지 받아보세요</Subtitle>
      </TextGroup>
      <OpenButton type="button" onClick={handleOpen}>
        열기
      </OpenButton>
    </Banner>,
    document.body,
  );
}

const Banner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 10px;
  height: calc(env(safe-area-inset-top, 0px) + ${INSTALL_BANNER_HEIGHT}px);
  padding: env(safe-area-inset-top, 0px) 12px 0;
  box-sizing: border-box;
  background: #ffffff;
  border-bottom: 1px solid #e5e9f0;
`;

const DismissButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: #8b95a1;
`;

const AppIcon = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;

const Title = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #17325c;
  line-height: 1.3;
`;

const Subtitle = styled.span`
  font-size: 12px;
  color: #6b7684;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OpenButton = styled.button`
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 999px;
  background: #2563eb;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
`;
