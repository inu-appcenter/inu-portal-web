import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import WeatherForm from "./Weather.tsx";
import 유니돔배너 from "../../../resources/assets/banner/유니돔배너.svg";
import 인팁배너1 from "../../../resources/assets/banner/인팁배너1.png";
import styled from "styled-components";

const Banner = () => {
  return (
    <BannerWrapper>
      <Swiper
        pagination
        modules={[Pagination, Autoplay]}
        autoplay={{
          delay: 4000, //자동 슬라이드 초
          disableOnInteraction: false, // 사용자가 조작해도 자동재생 유지
        }}
        className="mySwiper"
      >
        <SwiperSlide>
          <div
            style={{
              width: "100%",
              height: "100%",
            }}
            onClick={() => {
              window.open(
                "https://weather.naver.com/today/11185106",
                "_blank",
                "noopener,noreferrer",
              );
            }}
          >
            <WeatherForm />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <img
            className="banner-svg"
            src={유니돔배너}
            onClick={() => {
              window.open(
                "https://unidorm.inuappcenter.kr",
                "_blank",
                "noopener,noreferrer",
              );
            }}
          />
        </SwiperSlide>
        <SwiperSlide>
          <img className="banner-img" src={인팁배너1} />
        </SwiperSlide>
      </Swiper>
    </BannerWrapper>
  );
};

export default Banner;

const BannerWrapper = styled.div`
  background: #f0f6ff;

  .banner-svg {
    width: 100%;
    max-width: 500px;

    height: 100%;
    object-fit: cover;
    cursor: pointer;
  }

  .banner-img {
    width: 100%;
    max-width: 500px;
    height: 100%;
    //object-fit: cover;
    cursor: pointer;
  }

  .swiper {
    width: 100%;
    height: 250px;
    position: relative;
    //padding-bottom: 15px;
  }

  .swiper-slide {
    display: flex;
    flex-direction: column;
    align-items: center;
    //background: #fff;
    font-size: 18px;
    text-align: center;
  }

  //.swiper-pagination {
  //  bottom: -4px !important;
  //}

  .swiper-button-next,
  .swiper-button-prev {
    color: #4071b9;
  }

  .swiper-button-next {
    right: 10px;
  }

  .swiper-button-prev {
    left: 10px;
  }

  .swiper-button-prev:after,
  .swiper-button-next:after {
    font-size: 15px;
  }
`;
