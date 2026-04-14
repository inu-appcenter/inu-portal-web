import styled from "styled-components";
import Calendar from "@/components/mobile/calendar/Calendar";
import { useHeader } from "@/context/HeaderContext";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import { Bell } from "lucide-react";
import FloatingActionButton from "@/components/common/FloatingActionButton";
import useUserStore from "@/stores/useUserStore";
import MoreFeaturesBox from "@/components/desktop/common/MoreFeaturesBox";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export default function MobileCalendarPage() {
  const { userInfo } = useUserStore();
  const navigate = useNavigate(); // 라우터 인스턴스

  useHeader({
    title: "학사일정",
  });

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
      <Calendar />

      <FloatingActionButton
        text="일정 알림 받기"
        icon={<Bell size={18} color="white" />}
        onClick={() => alert("Daily Brief 설정 구현 예정입니다.")}
      />

      {!userInfo.department && (
        <MoreFeaturesBox
          title="내 학과 정보를 아직 설정하지 않으셨나요?"
          content="마이페이지에서 설정하기"
          onClick={() => navigate(ROUTES.MYPAGE.ROOT)}
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
