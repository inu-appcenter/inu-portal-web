import { ROUTES } from "@/constants/routes";
import styled from "styled-components";
import CategoryForm from "@/containers/mobile/home/Category";
import NoticeForm from "@/containers/mobile/home/Notice";
import AppcenterLogo from "@/resources/assets/appcenter-logo.webp";
import X_Vector from "../../resources/assets/mobile-mypage/X-Vector.svg";
import PopupNotice from "@/components/desktop/banner/PopupNotice.tsx";
import 배너이미지 from "@/resources/assets/banner/intip설문조사.png";
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

const CHANNEL_ID = "UCqOO8FqoVW6Y87jLnqhdflA";
const PROMO_PROBABILITY = 0.05;
const PROMO_STORAGE_KEY = "promoLastShownDate";

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
    console.error("Failed to parse stored tokenInfo", error);
    return "";
  }
}

export default function MobileHomePage() {
  const { tokenInfo } = useUserStore();
  const isBannerOn = false; // 배너 온오프 - on:true off:false
  const [show, setShow] = useState(false); // 배너 모달창 열림 여부
  const [showLoginPromo, setShowLoginPromo] = useState(false);
  const [showInstallPromo, setShowInstallPromo] = useState(false);
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
  const hasEvaluatedPromoRef = useRef(false);

  if (new URLSearchParams(window.location.search).get("errorTest") === "1") {
    throw new Error("에러바운더리 UI 확인용");
  }

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
      }
      return;
    }

    if (isMobileBrowser) {
      setShowInstallPromo(true);
    }
  }, [tokenInfo.accessToken]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA);
    const updateLayoutMode = (event: MediaQueryList | MediaQueryListEvent) => {
      setIsDesktopLayout(event.matches);
    };

    updateLayoutMode(mediaQuery);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateLayoutMode);
      return () => mediaQuery.removeEventListener("change", updateLayoutMode);
    }

    mediaQuery.addListener(updateLayoutMode);
    return () => mediaQuery.removeListener(updateLayoutMode);
  }, []);

  const handleCloseModal = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    localStorage.setItem("hideModalDate", nextWeek.toISOString());
    setShow(false);
  };

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
    setNotification(null);
  };

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
    <Section>
      <TitleContentArea
        title={"학사일정"}
        children={<Calendar mode={"weekly"} />}
        link={ROUTES.BOARD.CALENDAR}
      />
    </Section>
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
      {show && isBannerOn && (
        <ModalBackGround>
          <Modal>
            <div className="close" onClick={handleCloseModal}>
              <span>일주일동안 안 보기</span>
              <img src={X_Vector} alt="X" />
            </div>
            <PopupNotice
              title={"📣 INTIP 사용 경험을 들려주세요!\n"}
              imgsrc={배너이미지}
              content={
                <>
                  자유롭게 의견을 남겨주세요!
                  <br />
                  30초만 시간 내어 작성해주시면 더 좋은 서비스를 준비하는 데 큰
                  도움이 됩니다
                  <br />
                  <a href={"https://forms.gle/DHk5zsAF8Ko3SN38A"}>
                    설문 조사 바로가기
                  </a>
                </>
              }
            />
          </Modal>
        </ModalBackGround>
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

// 역할: 컨텐츠가 안전 영역(Safe Area) 내에 배치되도록 함 (기존 MediumPaddingWrapper 대체)
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

// 역할: 수직 리듬(Vertical Rhythm) 관리 (기존 ContainerWrapper 대체)
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

const ModalBackGround = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  inset: 0 0 0 0;
  z-index: 9999;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  padding: 32px 20px;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  height: fit-content;
  max-height: 80%;
  background: #9cafe2;
  color: #333366;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;

  .close {
    align-self: flex-end;
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #ffffff;
    color: #555;
    font-size: 14px;
    font-weight: 500;
    border-radius: 20px;
    padding: 6px 12px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f0f0f0;
    }

    img {
      width: 12px;
      height: 12px;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
