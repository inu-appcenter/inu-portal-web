import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { getNotices } from "@/apis/notices";
import { Notice } from "@/types/notices";
import SortDropBox from "@/components/mobile/notice/Sort";
import Box from "@/components/common/Box";
import NoticeItem from "@/components/mobile/notice/NoticeItem";
import Divider from "@/components/common/Divider";

export default function NoticeForm() {
  const [sort, setSort] = useState("date");
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
        <SortDropBox sort={sort} setSort={setSort} />
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
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;
