import { ROUTES } from "@/constants/routes";
import styled from "styled-components";
import CategoryForm from "@/containers/mobile/home/Category";
import NoticeForm from "@/containers/mobile/home/Notice";
import AppcenterLogo from "@/resources/assets/appcenter-logo.webp";
import { useEffect, useRef, useState } from "react";
import TitleContentArea from "../../components/desktop/common/TitleContentArea.tsx";
import Banner from "../../containers/mobile/home/Banner.tsx";
import TipsWidget from "@/components/mobile/tips/TipsWidget";
import HomeChipGroup from "@/components/mobile/home/HomeChipGroup";
import { useHeader } from "@/context/HeaderContext";
import Calendar from "@/components/mobile/calendar/Calendar";
import YoutubeWidget from "@/components/mobile/home/YoutubeWidget";
import InstallPromotionBottomSheet from "@/components/mobile/home/InstallPromotionBottomSheet";
import LoginPromotionBottomSheet from "@/components/mobile/home/LoginPromotionBottomSheet";
import useUserStore from "@/stores/useUserStore";
import { getMobilePlatform } from "@/utils/getMobilePlatform";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
  MOBILE_PAGE_GUTTER,
} from "@/styles/responsive";
import TopPopupNotification from "@/components/common/TopPopupNotification";
import { mixpanelTrack } from "@/utils/mixpanel";
import InfoBottomSheet from "@/components/mobile/portal/InfoBottomSheet";
import { MobileSchoolAlarmSetting } from "@/pages/mobile/AlarmSettingPage";
import BottomButtonGroup from "@/components/common/BottomButtonGroup";
import { useNavigate } from "react-router-dom";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const CHANNEL_ID = "UCqOO8FqoVW6Y87jLnqhdflA";
const PROMO_PROBABILITY = 0.05;
const PROMO_STORAGE_KEY = "promoLastShownDate";
const NOTICE_ALARM_PROMO_KEY = "noticeAlarmPromotionOpened";

function getStoredAccessToken() {
  const storedTokenInfo = localStorage.getItem("tokenInfo");

  if (!storedTokenInfo) {
    return "";
  }

  try {
    const parsedTokenInfo = JSON.parse(storedTokenInfo) as {
      accessToken?: string;
    };

    return parsedTokenInfo.accessToken ?? "";
  } catch (error) {
    console.error("tokenInfo 파싱 실패", error);
    return "";
  }
}

export default function MobileHomePage() {
  const { tokenInfo } = useUserStore();
  const navigate = useNavigate();
  const isBannerOn = false; // 배너 온오프 - on:true off:false

  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarEntry = useIntersectionObserver(calendarRef, {
    threshold: 0.5,
  });

  useEffect(() => {
    if (calendarEntry?.isIntersecting) {
      mixpanelTrack.widgetImpression("Academic Calendar", "Home");
    }
  }, [calendarEntry?.isIntersecting]);

  const [show, setShow] = useState(false); // 배너 모달창 열림 여부
  const [showLoginPromo, setShowLoginPromo] = useState(false);
  const [showInstallPromo, setShowInstallPromo] = useState(false);
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
  const hasEvaluatedPromoRef = useRef(false);
  const isLoggedIn =
    Boolean(tokenInfo.accessToken) || Boolean(getStoredAccessToken());

  const [isManuallyClosed, setIsManuallyClosed] = useState(false);
  const isOpenNoticeAlarmPromotion =
    isLoggedIn &&
    !localStorage.getItem(NOTICE_ALARM_PROMO_KEY) &&
    !isManuallyClosed;

  const closeNoticeAlarmPromotion = () => {
    setIsManuallyClosed(true);
    localStorage.setItem(NOTICE_ALARM_PROMO_KEY, "true");
  };

  const handleCloseNoticeAlarmPromotion = () => {
    mixpanelTrack.promotionClicked(
      "Notice Alarm Promotion",
      "Close",
      "Home Bottom Sheet",
    );
    closeNoticeAlarmPromotion();
  };

  const handleNavigateToNoticeAlarm = () => {
    mixpanelTrack.promotionClicked(
      "Notice Alarm Promotion",
      "Move to Notice Alarm Setting",
      "Home Bottom Sheet",
    );
    closeNoticeAlarmPromotion();
    navigate(ROUTES.BOARD.DEPT_SETTING);
  };

  if (new URLSearchParams(window.location.search).get("errorTest") === "1") {
    throw new Error("에러바운더리 UI 확인용");
  }

  // 데스크톱 레이아웃 감지
  useEffect(() => {
    const handleResize = () => {
      setIsDesktopLayout(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 헤더 설정 주입
  useHeader({
    showAlarm: true,
  });

  useEffect(() => {
    const today = new Date();
    const hideDateStr = localStorage.getItem("hideModalDate");
    if (hideDateStr) {
      const hideDate = new Date(hideDateStr);
      // 오늘 날짜가 저장된 hideDate보다 이후이면 모달을 보이게 함
      if (today > hideDate) {
        setShow(true);
      }
    } else {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (hasEvaluatedPromoRef.current) {
      return;
    }
    hasEvaluatedPromoRef.current = true;

    const today = new Date().toDateString();
    const lastShownDate = localStorage.getItem(PROMO_STORAGE_KEY);

    if (lastShownDate === today) {
      return;
    }

    localStorage.setItem(PROMO_STORAGE_KEY, today);

    if (Math.random() >= PROMO_PROBABILITY) {
      return;
    }

    const platform = getMobilePlatform();
    const isInstalledApp =
      platform === "ios_webview" || platform === "android_webview";
    const isMobileBrowser =
      platform === "ios_browser" || platform === "android_browser";
    const isLoggedIn =
      Boolean(tokenInfo.accessToken) || Boolean(getStoredAccessToken());

    if (isInstalledApp) {
      if (!isLoggedIn) {
        setShowLoginPromo(true);
        mixpanelTrack.promotionImpression(
          "Login Promotion",
          "Home Bottom Sheet",
        );
      }
      return;
    }

    if (isMobileBrowser) {
      setShowInstallPromo(true);
      mixpanelTrack.promotionImpression(
        "Install Promotion",
        "Home Bottom Sheet",
      );
    }
  }, [tokenInfo.accessToken]);

  useEffect(() => {
    // 공지 팝업 노출 추적
    if (show && isBannerOn) {
      mixpanelTrack.promotionImpression("Survey Popup", "Home Popup");
    }
  }, [show, isBannerOn]);

  useEffect(() => {
    // 학교 공지 알리미 프로모션 노출 추적
    if (isOpenNoticeAlarmPromotion) {
      mixpanelTrack.promotionImpression(
        "Notice Alarm Promotion",
        "Home Bottom Sheet",
      );
    }
  }, [isOpenNoticeAlarmPromotion]);

  interface NotificationData {
    title: string;
    message: string;
  }

  const isBeforeDeadline = () => {
    const now = new Date();
    const deadline = new Date("2026-03-27T19:00:00"); // 필요하면 연도 수정
    return now < deadline;
  };

  const [notification, setNotification] = useState<NotificationData | null>(
    isBeforeDeadline()
      ? {
          title: "서비스 점검 예정 안내",
          message:
            "3월 27일(금) 17시 30분부터 19시까지 서버 점검이 예정되어 있습니다. 해당 기간동안 인입런 기능을 제외한 기능의 사용이 불가능합니다. 이용에 참고 부탁드립니다.",
        }
      : null,
  );

  const handleCloseNotification = () => {
    mixpanelTrack.promotionClicked(
      "Maintenance Notice",
      "Close Button",
      "Home Top Popup",
    );
    setNotification(null);
  };

  useEffect(() => {
    // 점검 안내 노출 추적
    if (notification) {
      mixpanelTrack.promotionImpression("Maintenance Notice", "Home Top Popup");
    }
  }, [notification]);

  const noticeSection = (
    <Section>
      <TitleContentArea
        title={"학교 공지사항"}
        children={<NoticeForm />}
        link={ROUTES.BOARD.NOTICE}
      />
    </Section>
  );

  const tipsSection = (
    <Section>
      <TitleContentArea
        title={"TIPS 알아보기"}
        children={<TipsWidget />}
        link={ROUTES.BOARD.TIPS}
      />
    </Section>
  );

  const youtubeSection = (
    <Section>
      <TitleContentArea
        title={"인천대학교 YouTube"}
        externalLink={`https://www.youtube.com/channel/${CHANNEL_ID}`}
      >
        <YoutubeWidget />
      </TitleContentArea>
    </Section>
  );

  const calendarSection = (
    <div ref={calendarRef}>
      <Section>
        <TitleContentArea
          title={"학사일정"}
          children={<Calendar mode={"weekly"} />}
          link={ROUTES.BOARD.CALENDAR}
        />
      </Section>
    </div>
  );

  return (
    <MobileHomePageWrapper>
      {notification && (
        <TopPopupNotification
          title={notification.title}
          message={notification.message}
          onClose={handleCloseNotification}
          duration={10000}
        />
      )}

      {/* 상단 배너 영역 */}
      <Section>
        <Banner />
        <CategoryFormSection>
          <CategoryForm />
          <HomeChipGroup />
        </CategoryFormSection>
      </Section>

      {/* 메인 피드 영역 */}
      <FeedLayout>
        {isDesktopLayout ? (
          <DesktopWidgetColumns>
            <DesktopWidgetColumn>
              {noticeSection}
              {youtubeSection}
            </DesktopWidgetColumn>
            <DesktopWidgetColumn>
              {tipsSection}
              {calendarSection}
            </DesktopWidgetColumn>
          </DesktopWidgetColumns>
        ) : (
          <>
            {noticeSection}
            {tipsSection}
            {youtubeSection}
            {calendarSection}
          </>
        )}
      </FeedLayout>

      <AppcenterLogoWrapper>
        <img
          src={AppcenterLogo}
          alt={"appcenterLogo"}
          onClick={() => {
            mixpanelTrack.featureClicked("Appcenter Website", "Home Bottom");
            window.open("https://home.inuappcenter.kr");
          }}
        />
      </AppcenterLogoWrapper>

      <LoginPromotionBottomSheet
        open={showLoginPromo}
        onDismiss={() => setShowLoginPromo(false)}
      />
      <InstallPromotionBottomSheet
        open={showInstallPromo}
        onDismiss={() => setShowInstallPromo(false)}
      />

      <InfoBottomSheet
        open={isOpenNoticeAlarmPromotion}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseNoticeAlarmPromotion();
          }
        }}
        title="신규 기능: 학교 공지 알리미"
      >
        <MobileSchoolAlarmSetting location="Home Bottom Sheet" />
        <BottomButtonGroup
          leftButton={{
            label: "닫기",
            onClick: handleCloseNoticeAlarmPromotion,
            backgroundColor: "#f3f4f6",
            textColor: "#6b7280",
          }}
          rightButton={{
            label: "공지 알리미로 이동",
            onClick: handleNavigateToNoticeAlarm,
            backgroundColor: "#5E92F0",
            textColor: "#F4F4F4",
            flex: 2,
          }}
          gap="12px"
        />
      </InfoBottomSheet>
    </MobileHomePageWrapper>
  );
}

const MobileHomePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
    margin: 0 auto;
    padding-bottom: 120px;
  }
`;

const Section = styled.section`
  padding: 0 ${MOBILE_PAGE_GUTTER};
  box-sizing: border-box;
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 24px;

  @media ${DESKTOP_MEDIA} {
    padding: 0;
  }
`;

const CategoryFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeedLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 0;
  width: 100%;

  @media ${DESKTOP_MEDIA} {
    gap: 24px;
  }
`;

const DesktopWidgetColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 24px;
  align-items: start;
  width: 100%;
`;

const DesktopWidgetColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;
const AppcenterLogoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 40px;

  img {
    width: 50%;
    height: auto;
    max-width: 200px;
    min-width: 150px;
    cursor: pointer;
  }

  @media ${DESKTOP_MEDIA} {
    padding-top: 16px;

    img {
      width: 220px;
      max-width: 220px;
    }
  }
`;
