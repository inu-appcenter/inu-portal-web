import styled from "styled-components";
import WeatherForm from "mobile/containers/home/Weather";
// import SerachForm from "mobile/containers/home/SerachForm";
import CategoryForm from "mobile/containers/home/Category";
import TipForm from "mobile/containers/home/Tips";
import AiForm from "mobile/containers/home/Ai";
import NoticeForm from "mobile/containers/home/Notice";
import AppcenterLogo from "resources/assets/appcenter-logo.svg";
import { ReactSVG } from "react-svg";
import X_Vector from "../../resources/assets/mobile-mypage/X-Vector.svg";
import Banner from "components/banner/Banner.tsx";
import 배너이미지 from "resources/assets/banner/intip설문조사.png";
import { useEffect, useRef, useState } from "react";

export default function MobileHomePage() {
  const isBannerOn = true; //배너 온오프 - on:true off:false
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

  const sliderRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const totalSlides = 1;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let autoSlideTimer: NodeJS.Timeout;

    // 💡 초기 mount 이후 약간의 지연을 주고 시작
    const startAutoSlide = () => {
      autoSlideTimer = setInterval(() => {
        if (!slider) return;
        indexRef.current = (indexRef.current + 1) % totalSlides;
        slider.scrollTo({
          left: slider.clientWidth * indexRef.current,
          behavior: "smooth",
        });
        setCurrentIndex(indexRef.current); // ← 상태 업데이트
      }, 4000);
    };

    // 💡 DOM 렌더링이 완료된 후 300ms 이후 슬라이드 시작
    const delayTimer = setTimeout(startAutoSlide, 300);

    const handleManualScroll = () => {
      if (!slider) return;
      const newIndex = Math.round(slider.scrollLeft / slider.clientWidth);
      indexRef.current = newIndex;
      setCurrentIndex(newIndex); // ← 상태 업데이트
    };

    slider.addEventListener("scroll", handleManualScroll);

    return () => {
      clearInterval(autoSlideTimer);
      clearTimeout(delayTimer);
      slider.removeEventListener("scroll", handleManualScroll);
    };
  }, []);

  return (
    <MobileHomePageWrapper>
      {show && isBannerOn && (
        <ModalBackGround>
          <Modal>
            <div className="close" onClick={handleCloseModal}>
              <span>일주일동안 안 보기</span>
              <img src={X_Vector} alt="X" />
            </div>
            <Banner
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

      <FullWidthSlider ref={sliderRef}>
        <FullWidthSlide>
          <WeatherForm />
        </FullWidthSlide>

        <IndicatorWrapper>
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <Dot key={idx} active={idx === currentIndex} />
          ))}
        </IndicatorWrapper>
      </FullWidthSlider>

      <ContainerWrapper>
        {/*<SerachForm />*/}
        <CategoryForm />
        <AiForm />
        <TipForm />
        <NoticeForm />
      </ContainerWrapper>
      <AppcenterLogoWrapper>
        <ReactSVG src={AppcenterLogo} />
      </AppcenterLogoWrapper>
    </MobileHomePageWrapper>
  );
}

const MobileHomePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  //margin-top: 170px;
  width: 100%;
  position: relative;

  .asdf {
  }
`;

const ContainerWrapper = styled.div`
  margin: 0 24px;
  //margin-top: 14px;
`;

const AppcenterLogoWrapper = styled.div`
  background: linear-gradient(to bottom, white, rgb(170, 201, 238));
  padding: 24px 0;
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

const FullWidthSlider = styled.div`
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  width: 100%;
  position: relative; /* ← 플로팅을 위한 설정 */
  -ms-overflow-style: none; /* IE */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Chrome */
  }
`;

const FullWidthSlide = styled.div`
  flex: 0 0 100%;
  scroll-snap-align: start;
  width: 100%;
  height: 100%; // WeatherForm 높이와 동일
  box-sizing: border-box;
`;

const IndicatorWrapper = styled.div`
  position: absolute;
  bottom: 12px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 6px;
  pointer-events: none; /* 인디케이터가 클릭 차단 안 되도록 */
`;

const Dot = styled.div<{ active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ active }) => (active ? "#555" : "#ccc")};
  transition: background-color 0.3s ease;
`;
