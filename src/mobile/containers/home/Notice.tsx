import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/scrollbar";

import { Scrollbar } from "swiper/modules";

import { useEffect, useState } from "react";
import { getNotices } from "apis/notices";
import { Notice } from "types/notices";
import SortDropBox from "mobile/components/notice/Sort";
import useMobileNavigate from "hooks/useMobileNavigate";
// import SortNotice from '../../components/notice/SortNotice';

export default function NoticeForm() {
  const [sort, setSort] = useState("date");
  const [notices, setNotices] = useState<Notice[]>([]);
  const mobileNavigate = useMobileNavigate();

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
        <h1 onClick={() => mobileNavigate(`/home/tips?type=notice`)}>Notice</h1>
        <SortDropBox sort={sort} setSort={setSort} />
        {/* <SortNotice sort={sort} setNotices={setNotices}/> */}
      </NoticeTitleWrapper>

      <Swiper
        slidesPerView={2}
        scrollbar={{
          hide: false,
        }}
        modules={[Scrollbar]}
        className="mySwiper"
      >
        {notices.map((notice, index) => (
          <SwiperSlide key={index}>
            <div
              className="notice-wrapper"
              onClick={() => window.open("https://" + notice.url, "_blank")}
            >
              <h1>{notice.category}</h1>
              <p className="title">{notice.title}</p>
              <p className="createdate">{notice.createDate}</p>
            </div>
            {/* <div key={index} className='item item-1' onClick={() => window.open('https://' + notice.url, '_blank')}>
                    <span className='card-1'>
                    <div className='notice-category'>
                        <div className='category-text'>{notice.category}</div>
                        <div className='category-underbar'></div>
                    </div>
                    </span>
                    <div className='notice-title'>{notice.title}</div>
                    <div className='notice-date'>{notice.createDate}</div>
                </div> */}
          </SwiperSlide>
        ))}
        {/* <SwiperSlide>Slide1</SwiperSlide>
            <SwiperSlide>Slide 2</SwiperSlide>
            <SwiperSlide>Slide 3</SwiperSlide>
            <SwiperSlide>Slide 4</SwiperSlide>
            <SwiperSlide>Slide 5</SwiperSlide>
            <SwiperSlide>Slide 6</SwiperSlide>
            <SwiperSlide>Slide 7</SwiperSlide>
            <SwiperSlide>Slide 8</SwiperSlide>
            <SwiperSlide>Slide 9</SwiperSlide> */}
      </Swiper>
    </NoticeFormWrapper>
  );
}

const NoticeFormWrapper = styled.div`
  margin-top: 20px;
  .swiper {
    width: 100%;
    height: 200px;
    .notice-wrapper {
      border: 3px solid #9cafe2;
      border-radius: 6px;
      width: 120px;
      height: 120px;
      padding: 10px 15px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      h1 {
        font-family: Inter;
        font-size: 10px;
        font-weight: 500;
        color: #0e4d9d;
        margin-bottom: 0;
      }
      .title {
        flex: 1;
        font-family: Inter;
        font-size: 10px;
        font-weight: 600;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .createdate {
        font-family: Inter;
        font-size: 15px;
        font-weight: 700;
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
    margin-bottom: 12px;
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
    font-weight: 500;
  }
  p {
    font-family: Inter;
    font-size: 12px;
  }
`;
