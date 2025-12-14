import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { getNotices } from "@/apis/notices";
import { Notice } from "@/types/notices";
import SortDropBox from "@/components/mobile/notice/Sort";
import Box from "@/components/common/Box";
import NoticeItem from "@/components/mobile/notice/NoticeItem";
import Divider from "@/components/common/Divider";

export default function NoticeForm() {
  const [sort, setSort] = useState("view");
  const [notices, setNotices] = useState<Notice[]>([]);
  const swiperRef = useRef<any>(null); // Swiper 참조

  const fetchNotices = async (sort: string) => {
    try {
      const response = await getNotices("전체", sort, 1);
      setNotices(response.data.contents);
      // 데이터를 불러온 뒤 Swiper를 처음으로 이동
      if (swiperRef.current) swiperRef.current.slideTo(0);
    } catch (error) {
      console.error("모든 공지사항 가져오기 실패", error);
    }
  };

  useEffect(() => {
    fetchNotices(sort);
  }, [sort]);

  return (
    <Box>
      <NoticeFormWrapper>
        <NoticeTitleWrapper>
          <SortDropBox sort={sort} setSort={setSort} />
        </NoticeTitleWrapper>
        {notices.slice(0, 3).map((notice, index) => (
          <div key={index}>
            <NoticeItem
              title={notice.title}
              category={notice.category}
              date={notice.createDate}
              writer={notice.writer}
            />
            {index !== 2 && <Divider />}
          </div>
        ))}
      </NoticeFormWrapper>
    </Box>
  );
}

const NoticeFormWrapper = styled.div`
  width: 100%; // 부모 너비 꽉 채움

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
    //margin-bottom: 18px;
  }

  .swiper-slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .swiper-horizontal > .swiper-scrollbar,
  .swiper-scrollbar.swiper-scrollbar-horizontal {
    bottom: 16px !important; /* 직접 위치 지정 */
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
