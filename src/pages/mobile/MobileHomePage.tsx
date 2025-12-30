import { ROUTES } from "@/constants/routes";
import styled from "styled-components";
import CategoryForm from "@/containers/mobile/home/Category";
import NoticeForm from "@/containers/mobile/home/Notice";
import AppcenterLogo from "@/resources/assets/appcenter-logo.webp";
import X_Vector from "../../resources/assets/mobile-mypage/X-Vector.svg";
import PopupNotice from "@/components/desktop/banner/PopupNotice.tsx";
import 배너이미지 from "@/resources/assets/banner/intip설문조사.png";
import { useEffect, useState } from "react";
import TitleContentArea from "../../components/desktop/common/TitleContentArea.tsx";
import Banner from "../../containers/mobile/home/Banner.tsx";
import TipsWidget from "@/components/mobile/tips/TipsWidget";
import HomeChipGroup from "@/components/mobile/home/HomeChipGroup";
import { useHeader } from "@/context/HeaderContext";
import Calendar from "@/components/mobile/calendar/Calendar";
import YoutubeWidget from "@/components/mobile/home/YoutubeWidget";

const CHANNEL_ID = "UCqOO8FqoVW6Y87jLnqhdflA";

export default function MobileHomePage() {
  const isBannerOn = false; //배너 온오프 - on:true off:false
  const [show, setShow] = useState(false); //배너 모달창 열림 여부

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

  const handleCloseModal = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    localStorage.setItem("hideModalDate", nextWeek.toISOString());
    setShow(false);
  };

  return (
    <MobileHomePageWrapper>
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
      <Banner />

      <ContainerWrapper>
        {/*<SerachForm />*/}
        <CategoryForm />
        <HomeChipGroup />
        {/*<NoticeForm />*/}
        <TitleContentArea
          title={"학교 공지사항"}
          children={<NoticeForm />}
          link={ROUTES.BOARD.NOTICE}
        />
        <TitleContentArea
          title={"TIPS 알아보기"}
          children={<TipsWidget />}
          link={ROUTES.BOARD.TIPS}
        />
        <TitleContentArea
          title={"학사일정"}
          children={<Calendar mode={"weekly"} />}
          link={ROUTES.BOARD.CALENDAR}
        />
        <TitleContentArea
          title={"인천대학교 YouTube"}
          externalLink={`https://www.youtube.com/channel/${CHANNEL_ID}`}
        >
          <YoutubeWidget />
        </TitleContentArea>
        {/*<TipForm />*/}
      </ContainerWrapper>

      <AppcenterLogoWrapper>
        <img
          src={AppcenterLogo}
          alt={"appcenterLogo"}
          onClick={() => {
            window.open("https://home.inuappcenter.kr");
          }}
        />
      </AppcenterLogoWrapper>
    </MobileHomePageWrapper>
  );
}

const MobileHomePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;

  padding: 0 16px;
  box-sizing: border-box;
`;

const ContainerWrapper = styled.div`
  padding: 24px 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  //margin-top: 14px;
`;

const AppcenterLogoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 50%;
    height: auto;
    max-width: 200px;
    min-width: 150px;
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
