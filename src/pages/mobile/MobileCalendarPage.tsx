import styled from "styled-components";
import Calendar from "@/components/mobile/calendar/Calendar";
import { useHeader } from "@/context/HeaderContext";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import { Bell } from "lucide-react";
import FloatingActionButton from "@/components/common/FloatingActionButton";
import useUserStore from "@/stores/useUserStore";

export default function MobileCalendarPage() {
  const { userInfo } = useUserStore();

  // 헤더 설정 주입
  useHeader({
    title: "학사일정",
  });

  return (
    <MobileCalendarPageWrapper>
      <TitleContentArea
        description={`학교 학사 ${userInfo.department ? `일정과 ${userInfo.department} ` : ""} 일정을 확인해 보세요. 학과 일정은 횃불이 AI가 각 학과 공지사항을 읽어서 생성되며, 정확하지 않을 수 있습니다. 중요한 내용은 공지사항을 직접 확인하세요.`}
      />
      <Calendar />
      <FloatingActionButton
        text="일정 알림 받기"
        icon={<Bell size={18} color="white" />}
        onClick={() => alert("Daily Brief 설정 구현 예정입니다.")}
      />
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
    //padding-top: clamp(32px, 5vh, 64px);
    //padding-bottom: clamp(72px, 10vh, 120px);
  }
`;
