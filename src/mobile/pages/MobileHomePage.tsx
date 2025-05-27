import styled from "styled-components";
import WeatherForm from "mobile/containers/home/Weather";
import SerachForm from "mobile/containers/home/SerachForm";
import CategoryForm from "mobile/containers/home/Category";
import TipForm from "mobile/containers/home/Tips";
import AiForm from "mobile/containers/home/Ai";
import NoticeForm from "mobile/containers/home/Notice";
import AppcenterLogo from "resources/assets/appcenter-logo.svg";
import { ReactSVG } from "react-svg";
import X_Vector from "../../resources/assets/mobile-mypage/X-Vector.svg";
import Banner from "components/banner/Banner.tsx";
import 쿠러미 from "resources/assets/banner/쿠러미.jpg";
import { useEffect, useState } from "react";

export default function MobileHomePage() {
  const [show, setShow] = useState(false); //모달창 열림 여부

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const hideDate = localStorage.getItem("hideModalDate");
    if (hideDate !== today) {
      setShow(true);
    }
  }, []);

  const handleCloseModal = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("hideModalDate", today);
    setShow(false);
  };

  return (
    <MobileHomePageWrapper>
      {show && (
        <ModalBackGround>
          <Modal>
            <div className="close" onClick={handleCloseModal}>
              <span>오늘 하루 안 보기</span>
              <img src={X_Vector} alt="X" />
            </div>
            {/* <AiIntroText /> */}
            <Banner
              title={"쿠러미 베타 출시!"}
              imgsrc={쿠러미}
              content={
                <>
                  앱센터에서 주변 식당 쿠폰을 모은 앱이 곧 출시돼요.
                  <br />
                  지금 바로 먼저{" "}
                  <a href={"https://www.currumi.shop/10"}>사용해 보세요</a>!
                </>
              }
            />
          </Modal>
        </ModalBackGround>
      )}
      <WeatherForm />
      <ContainerWrapper>
        <SerachForm />
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
  margin-top: 170px;
  width: 100%;
  position: relative;

  .asdf {
  }
`;

const ContainerWrapper = styled.div`
  margin: 0 24px;
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
  height: 80%;
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
