import styled from "styled-components";
// import SerachForm from "mobile/containers/home/SerachForm";
import CategoryForm from "mobile/containers/home/Category";
import TipForm from "mobile/containers/home/Tips";
import AiForm from "mobile/containers/home/Ai";
import NoticeForm from "mobile/containers/home/Notice";
import AppcenterLogo from "resources/assets/appcenter-logo.svg";
import { ReactSVG } from "react-svg";
import X_Vector from "../../resources/assets/mobile-mypage/X-Vector.svg";
import PopupNotice from "components/banner/PopupNotice.tsx";
import 배너이미지 from "resources/assets/banner/intip설문조사.png";
import { useEffect, useState } from "react";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import ThreeWeekCalendar from "../components/calendar/ThreeWeekCalendar.tsx";
import MobileHeader from "../containers/common/MobileHeader.tsx";
import MobileNav from "../containers/common/MobileNav.tsx";
import Banner from "../containers/home/Banner.tsx";
import TopPopupNotification from "components/common/TopPopupNotification";

export default function MobileHomePage() {
  const isBannerOn = false; //배너 온오프 - on:true off:false
  const [show, setShow] = useState(false); //배너 모달창 열림 여부

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

  const handleCloseModal = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    localStorage.setItem("hideModalDate", nextWeek.toISOString());
    setShow(false);
  };

  // 알림에 표시할 데이터의 타입 (예시)
  interface NotificationData {
    title: string;
    message: string;
  }
  const [notification, setNotification] = useState<NotificationData | null>(
    null,
  );

  // useEffect(() => {
  //   setNotification({
  //     title: "서비스 점검 안내",
  //     message: `12월 26일(금) 18시부터 12월 29일(월) 08시까지 정보전산원 시스템 점검으로 인해 서비스 이용이 어렵습니다. 이용에 불편을 드려 죄송합니다.`,
  //   });
  // }, []);

  // 3. 알림이 닫힐 때 호출될 함수 (onClose prop으로 전달)
  const handleCloseNotification = () => {
    // 1. UI에서 즉시 숨김
    setNotification(null);
  };

  return (
    <MobileHomePageWrapper>
      <MobileHeader showAlarm={true} />
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

      {/* 4. state에 notification 데이터가 있을 때만 렌더링 */}
      {notification && (
        <TopPopupNotification
          title={notification.title}
          message={notification.message}
          onClose={handleCloseNotification}
          duration={10000}
        />
      )}

      <Banner />

      <ContainerWrapper>
        {/*<SerachForm />*/}
        <CategoryForm />
        <AiForm />
        {/*<NoticeForm />*/}
        <TitleContentArea
          title={"학교 공지사항"}
          children={<NoticeForm />}
          link={"/m/home/notice"}
        />
        <TitleContentArea
          title={"TIPS 인기글"}
          children={<TipForm />}
          link={"/m/home/tips"}
        />
        <TitleContentArea
          title={"학사일정"}
          children={<ThreeWeekCalendar />}
          link={"/m/home/calendar"}
        />
        {/*<TipForm />*/}
      </ContainerWrapper>

      <AppcenterLogoWrapper>
        <ReactSVG src={AppcenterLogo} />
      </AppcenterLogoWrapper>
      <MobileNav />
    </MobileHomePageWrapper>
  );
}

const MobileHomePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
`;

const ContainerWrapper = styled.div`
  padding: 24px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  //margin-top: 14px;
`;

const AppcenterLogoWrapper = styled.div`
  background: linear-gradient(to bottom, white, rgb(170, 201, 238));
  padding: 24px 0;
  //margin-top: 12px;
  box-sizing: border-box;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: 32px;
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
