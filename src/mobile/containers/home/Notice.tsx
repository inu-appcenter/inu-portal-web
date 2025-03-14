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
  const [sort, setSort] = useState("view");
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
  margin-top: 20px;
  .swiper {
    width: 100%;
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
      align-items: flex-start;
      h1 {
        font-size: 12px;
        font-weight: 500;
        color: #0e4d9d;
        margin: 0 0 4px 0;
      }
      .title {
        flex: 1;
        font-size: 10px;
        font-weight: 500;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .createdate {
        font-size: 15px;
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
    font-size: 12px;
  }
`;
