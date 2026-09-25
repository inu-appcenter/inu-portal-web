import styled from "styled-components";
import Calendar from "@/components/mobile/calendar/Calendar";
import { useHeader } from "@/context/HeaderContext";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Icon from "@/components/common/Icon";
import FloatingActionButton from "@/components/common/FloatingActionButton";
import useUserStore from "@/stores/useUserStore";
import MoreFeaturesBox from "@/components/desktop/common/MoreFeaturesBox";
import { useEffect, useMemo } from "react";
import { trackPageView, mixpanelTrack } from "@/utils/mixpanel";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export default function MobileCalendarPage() {
  const { userInfo } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const targetDateStr =
    searchParams.get("date") ||
    (location.state as { date?: string } | null)?.date;

  const baseDate = useMemo(() => {
    if (targetDateStr) {
      // YYYY-MM-DD 또는 ISO 문자열 파싱
      const dateParts = targetDateStr.split("T")[0].split("-").map(Number);
      if (dateParts.length >= 3 && !dateParts.some(isNaN)) {
        const parsed = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
      const fallback = new Date(targetDateStr);
      if (!isNaN(fallback.getTime())) {
        return fallback;
      }
    }
    return new Date();
  }, [targetDateStr]);

  useEffect(() => {
    trackPageView("학사일정");
  }, []);

  useHeader({
    title: "학사일정",
    hasback: true,
    showSearch: true,
    searchPath: `${ROUTES.UNIFIED_SEARCH}?tab=SCHEDULE`,
  });

  const handleNotificationClick = () => {
    mixpanelTrack.calendarNotificationClicked();
    navigate(`${ROUTES.MYPAGE.DAILY_BRIEF}?tab=schedule`);
  };

  const handleMypageNavigation = () => {
    mixpanelTrack.featureClicked("Mypage via Calendar", "Calendar Page");
    navigate(ROUTES.MYPAGE.ROOT);
  };

  return (
    <MobileCalendarPageWrapper>
      <TitleContentArea
        description={
          <>
            학교 학사{" "}
            {userInfo.department ? `일정과 ${userInfo.department} ` : ""} 일정을
            확인해 보세요. 학과 일정은 <strong>횃불이 AI</strong>가 각 학과
            공지사항을 읽어서 생성됩니다.
            {userInfo.department ? (
              <>
                {" "}
                중요한 내용은 직접 확인하세요.
                <br />각 날짜를 클릭해서 <strong>횃불이 AI</strong> 요약을
                확인해보세요!
              </>
            ) : (
              <>
                <br />
                아직 학과 설정을 안 하셨네요! 마이페이지에서 학과 정보를
                등록하면 내 학과 일정을 확인할 수 있어요.
              </>
            )}
          </>
        }
      />
      <Calendar baseDate={baseDate} />

      <FloatingActionButton
        text="일정 알림 받기"
        icon={<Icon name="bell" size={16} color="white" />}
        onClick={handleNotificationClick}
      />

      {!userInfo.department && (
        <MoreFeaturesBox
          title="내 학과 정보를 아직 설정하지 않으셨나요?"
          content="마이페이지에서 설정하기"
          onClick={handleMypageNavigation}
        />
      )}
    </MobileCalendarPageWrapper>
  );
}

const MobileCalendarPageWrapper = styled.div`
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 ${MOBILE_PAGE_GUTTER};
  padding-bottom: 60px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    min-height: calc(100vh - 220px);
    justify-content: center;
    padding-left: 0;
    padding-right: 0;
  }
`;
