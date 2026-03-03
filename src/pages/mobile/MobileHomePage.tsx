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
import LoginPromotionBottomSheet from "@/components/mobile/home/LoginPromotionBottomSheet";
import useUserStore from "@/stores/useUserStore";

const CHANNEL_ID = "UCqOO8FqoVW6Y87jLnqhdflA";

export default function MobileHomePage() {
  const { userInfo } = useUserStore();
  const isBannerOn = false; // 배너 온오프 - on:true off:false
  const [show, setShow] = useState(false); // 배너 모달창 열림 여부
  const [showLoginPromo, setShowLoginPromo] = useState(false);

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

  // 확률적으로 로그인 유도 바텀시트 노출
  useEffect(() => {
    if (!userInfo.id) {
      const probability = 0.3;
      if (Math.random() < probability) {
        setShowLoginPromo(true);
      }
    }
  }, [userInfo.id]);

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

      {/* 상단 배너 영역 */}
      <Section>
        <Banner />
      </Section>

      {/* 메인 피드 영역 */}
      <FeedLayout>
        <Section>
          <CategoryForm />
        </Section>

        <Section>
          <HomeChipGroup />
        </Section>

        {/* 모든 TitleContentArea를 Section으로 감싸서 패딩 통일 */}
        <Section>
          <TitleContentArea
            title={"학교 공지사항"}
            children={<NoticeForm />}
            link={ROUTES.BOARD.NOTICE}
          />
        </Section>

        <Section>
          <TitleContentArea
            title={"TIPS 알아보기"}
            children={<TipsWidget />}
            link={ROUTES.BOARD.TIPS}
          />
        </Section>

        <Section>
          <TitleContentArea
            title={"학사일정"}
            children={<Calendar mode={"weekly"} />}
            link={ROUTES.BOARD.CALENDAR}
          />
        </Section>

        <Section>
          <TitleContentArea
            title={"인천대학교 YouTube"}
            externalLink={`https://www.youtube.com/channel/${CHANNEL_ID}`}
          >
            <YoutubeWidget />
          </TitleContentArea>
        </Section>
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
    </MobileHomePageWrapper>
  );
}

const MobileHomePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  box-sizing: border-box;
`;

// 역할: 컨텐츠가 안전 영역(Safe Area) 내에 배치되도록 함 (기존 MediumPaddingWrapper 대체)
const Section = styled.section`
  padding: 0 16px;
  box-sizing: border-box;
  width: 100%;
`;

// 역할: 수직 리듬(Vertical Rhythm) 관리 (기존 ContainerWrapper 대체)
const FeedLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 24px 0;
  width: 100%;
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
