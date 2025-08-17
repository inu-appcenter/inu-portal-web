import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/scrollbar";

import { Scrollbar, Autoplay } from "swiper/modules";

import { useEffect, useState } from "react";
import { getNotices } from "apis/notices";
import { Notice } from "types/notices";
import SortDropBox from "mobile/components/notice/Sort";
// import useMobileNavigate from "hooks/useMobileNavigate";
// import SortNotice from '../../components/notice/SortNotice';

export default function NoticeForm() {
  const [sort, setSort] = useState("view");
  const [notices, setNotices] = useState<Notice[]>([]);
  // const mobileNavigate = useMobileNavigate();

  const fetchNotices = async (sort: string) => {
    try {
      const response = await getNotices("전체", sort, 1);
      setNotices(response.data.contents);
    } catch (error) {
      console.error("모든 공지사항 가져오기 실패", error);
    }
  };

  useEffect(() => {
    fetchNotices(sort);
  }, [sort]);

  return (
    <NoticeFormWrapper>
      <NoticeTitleWrapper>
        {/*<h1 onClick={() => mobileNavigate(`/home/tips?type=notice`)}>*/}
        {/*  /!*학교 공지사항*!/*/}
        {/*</h1>*/}
        <SortDropBox sort={sort} setSort={setSort} />
        {/* <SortNotice sort={sort} setNotices={setNotices}/> */}
      </NoticeTitleWrapper>

      <Swiper
        modules={[Scrollbar, Autoplay]}
        breakpoints={{
          320: { slidesPerView: 2 }, // 화면 320px 이상일 때 슬라이드 1개
          480: { slidesPerView: 2 }, // 화면 480px 이상일 때 슬라이드 2개
          768: { slidesPerView: 3 }, // 화면 768px 이상일 때 슬라이드 3개
          1024: { slidesPerView: 4 }, // 화면 1024px 이상일 때 슬라이드 4개
        }}
        slidesPerGroup={2} // <- 한 번에 2칸 이동
        autoplay={{
          delay: 3000, // 3초마다 자동 이동
          disableOnInteraction: false, // 사용자가 조작해도 자동재생 유지
        }}
        scrollbar={{
          hide: false,
        }}
        className="mySwiper"
      >
        {notices.map((notice, index) => (
          <SwiperSlide key={index}>
            <div
              className="notice-wrapper"
              onClick={() => window.open("https://" + notice.url, "_blank")}
            >
              <h1>{notice.category}</h1>
              <div className="title">{notice.title}</div>
              <p className="createdate">{notice.createDate}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </NoticeFormWrapper>
  );
}

const NoticeFormWrapper = styled.div`
  //margin-top: 20px;
  width: 100%; // 부모 너비 꽉 채움
  //max-width: 500px; // 필요하면 최대 너비 제한

  .swiper {
    width: 100%; // Swiper도 부모 너비에 맞춤
    height: 180px;

    .swiper-slide {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
    .notice-wrapper {
      border: 3px solid #9cafe2;
      border-radius: 6px;
      box-sizing: border-box;
      width: 160px;
      height: 148px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      h1 {
        font-size: 14px;
        font-weight: 600;
        color: #0e4d9d;
        margin: 0;
        //margin: 0 0 4px 0;
      }
      .title {
        font-size: 14px;
        font-weight: 400;
        text-align: left;

        display: -webkit-box; /* box layout 사용 */
        -webkit-line-clamp: 3; /* 최대 3줄 */
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;

        /* 높이를 3줄에 맞게 최소 높이 지정 */
        line-height: 1.2em; /* 줄간격 */
        min-height: calc(1.2em * 3); /* 3줄 높이 확보 */
      }

      .createdate {
        font-size: 14px;
        font-weight: 600;
        color: #7aa7e5;
        margin: 0;
      }
    }
  }

  .swiper-slide {
    text-align: center;
    font-size: 18px;
    background: #fff;

    /* Center slide text vertically */
    display: flex;
    justify-content: center;
    align-items: center;
    //margin-bottom: 12px;
  }

  .swiper-slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .swiper-horizontal > .swiper-scrollbar,
  .swiper-scrollbar.swiper-scrollbar-horizontal {
    bottom: var(--swiper-scrollbar-bottom, 15px);
  }
`;

const NoticeTitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  h1 {
    font-size: 18px;
    font-weight: 600;
  }
  p {
    font-size: 12px;
  }
  margin-bottom: 8px;
`;
