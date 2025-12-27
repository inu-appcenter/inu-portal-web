import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { getNotices } from "@/apis/notices";
import { Notice } from "@/types/notices";
import SortDropBox from "@/components/mobile/notice/Sort";
import Box from "@/components/common/Box";
import PostItem from "@/components/mobile/notice/PostItem";
import Divider from "@/components/common/Divider";
import Skeleton from "@/components/common/Skeleton";

const NoticeSkeletonItem = () => {
  return (
    <SkeletonContainer>
      <Skeleton width={50} height={14} />

      <Skeleton width="90%" height={14} />

      <WriterDateWrapper>
        <Skeleton width={80} height={14} />
        <Skeleton width={80} height={14} />
      </WriterDateWrapper>
    </SkeletonContainer>
  );
};

export default function NoticeForm() {
  const [sort, setSort] = useState("date");
  const [notices, setNotices] = useState<Notice[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const swiperRef = useRef<any>(null);

  const fetchNotices = async (sort: string) => {
    setIsLoading(true);
    try {
      const response = await getNotices("전체", sort, 1);
      setNotices(response.data.contents);
      if (swiperRef.current) swiperRef.current.slideTo(0);
      setIsLoading(false);
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

        {isLoading //스켈레톤 로딩
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={`skeleton-${index}`}>
                <NoticeSkeletonItem />
                {/* 마지막 아이템이 아니면 Divider 표시 */}
                {index !== 2 && <Divider />}
              </div>
            ))
          : notices.slice(0, 3).map((notice, index) => (
              <div key={notice.id || index}>
                <PostItem
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

// --- Styled Components ---

const NoticeFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  //gap: 16px;
  width: 100%;
`;

const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
  box-sizing: border-box;
`;

const WriterDateWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
`;
