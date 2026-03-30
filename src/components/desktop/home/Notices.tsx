import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  ALL_NOTICE_CATEGORY,
  getNoticeListQueryKey,
  getNotices,
  NOTICE_LIST_STALE_TIME,
} from "@/apis/notices";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Swiper as SwiperClass } from "swiper";
import 횃불Logo from "@/resources/assets/notice/횃불-logo.svg";
import 횃불Flag from "@/resources/assets/notice/횃불-flag.svg";

export default function Notices() {
  const navigate = useNavigate();
  const swiperRef = useRef<SwiperClass | null>(null);

  const { data } = useQuery({
    queryKey: getNoticeListQueryKey(ALL_NOTICE_CATEGORY, "date", 1),
    queryFn: () => getNotices(ALL_NOTICE_CATEGORY, "date", 1),
    staleTime: NOTICE_LIST_STALE_TIME,
  });

  const notices = data?.data.contents ?? [];

  const handlePrevSlide = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNextSlide = () => {
    swiperRef.current?.slideNext();
  };

  return (
    <StyledNotices>
      <Title onClick={() => navigate("/posts?type=notice")}>📌 NOTICE</Title>
      <NoticesContainer>
        <AllNoticesCard onClick={() => navigate("/posts?type=notice")}>
          <span>
            <h1>인천대</h1>
            <img src={횃불Logo} alt="" />
          </span>
          <div>
            <h1>공지사항</h1>
          </div>
        </AllNoticesCard>

        <Swiper
          spaceBetween={0}
          slidesPerView={4}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {notices.map((notice) => (
            <SwiperSlide key={notice.id}>
              <NoticeCard onClick={() => window.open("https://" + notice.url)}>
                <span className="category">{notice.category}</span>
                <div className="title">{notice.title}</div>
                <div className="createDate">{notice.createDate}</div>
              </NoticeCard>
            </SwiperSlide>
          ))}
        </Swiper>
      </NoticesContainer>
      <FlagImage src={횃불Flag} alt="" />
      <Buttons>
        <button onClick={handlePrevSlide}>← 이전</button>
        <button onClick={handleNextSlide}>다음 →</button>
      </Buttons>
    </StyledNotices>
  );
}

const StyledNotices = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Title = styled.button`
  padding: 0;
  background-color: transparent;
  border: none;
  font-size: 28px;
  font-weight: 700;
  color: #0e4d9d;
`;

const NoticesContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  .swiper {
    width: calc(100% - 240px);
  }

  .swiper-wrapper {
    margin: 12px 0;
  }
`;

const NoticeCard = styled.button`
  width: 220px;
  height: 180px;
  border: 3px solid rgba(156, 175, 226, 1);
  border-radius: 12px;
  padding: 20px;
  background-color: transparent;
  transition: transform 0.2s;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &:hover {
    transform: translateY(-8px);
  }

  .category {
    font-size: 16px;
    font-weight: 500;
    color: #0e4d9d;
    padding-bottom: 2px;
    border-bottom: 2px solid #7aa7e5;
  }

  .title {
    width: 100%;
    text-align: start;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    min-height: calc(1.4em * 2);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: normal;
    word-break: normal;
    overflow-wrap: anywhere;
  }

  .createDate {
    font-size: 28px;
    font-weight: 700;
    color: #7aa7e5;
    align-self: center;
  }
`;

const AllNoticesCard = styled(NoticeCard)`
  margin: 12px 54px 12px 0;
  justify-content: center;
  gap: 16px;
  span {
    display: flex;
    align-items: center;
    gap: 16px;
    h1 {
      font-size: 30px;
      font-weight: 500;
      color: #0e4d9d;
      margin: 0;
      padding-bottom: 2px;
      border-bottom: 2px solid #7aa7e5;
    }
  }
  div {
    h1 {
      font-size: 30px;
      font-weight: 700;
      color: #0e4d9d;
      margin: 0;
    }
  }
`;

const FlagImage = styled.img`
  align-self: center;
`;

const Buttons = styled.div`
  width: 100%;
  display: flex;
  border-top: 4px solid #9cafe2;
  button {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 24px;
    height: 80px;
    background-color: transparent;
    border: none;
  }
`;
