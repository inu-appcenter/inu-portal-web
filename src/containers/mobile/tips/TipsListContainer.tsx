import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import styled from "styled-components";
import TipsCard from "@/components/mobile/tips/TipsCard";
import { getPostsMobile } from "@/apis/posts";
import { getDepartmentNotices, getNotices } from "@/apis/notices";
import { getSearch } from "@/apis/search";
import { getCouncilNoticesList } from "@/apis/councilNotices";
import { Post } from "@/types/posts";
import { Notice } from "@/types/notices";
import { CouncilNotice } from "@/types/councilNotices";
import { getAlerts } from "@/apis/members";
import { Notification } from "@/types/members";
import MoreFeaturesBox from "../../../components/desktop/common/MoreFeaturesBox.tsx";
import findTitleOrCode from "../../../utils/findTitleOrCode.ts";
import Box from "@/components/common/Box";
import Divider from "@/components/common/Divider";
import { Fragment } from "react";
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";
import PostItem from "@/components/mobile/notice/PostItem";

interface TipsListContainerProps {
  viewMode: "grid" | "list";
  docType: string;
  dept?: string;
  category: string;
  query: string;
}

interface FetchState {
  lastPostId: number | undefined;
  page: number;
}

export default function TipsListContainer({
  viewMode,
  docType,
  dept,
  category,
  query,
}: TipsListContainerProps) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [deptNotices, setDeptNotices] = useState<Notice[]>([]);
  const [councilNotices, setCouncilNotices] = useState<CouncilNotice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>({
    lastPostId: undefined,
    page: 1,
  });
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  // const { isAppUrl } = useAppStateStore()

  // 초기화
  useEffect(() => {
    const scrollableDiv = document.getElementById("scrollableDiv");
    if (scrollableDiv) {
      scrollableDiv.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }

    setFetchState({
      lastPostId: undefined,
      page: 1,
    });
    setHasMore(true);
    setPosts([]);
    setNotices([]);
    setDeptNotices([]);
    setCouncilNotices([]);
    setIsInitialLoad(false);

    // 초기 로딩 때 2페이지까지 불러오기
    const loadInitialPages = async () => {
      await fetchData(undefined, 1); // 1페이지
      if (docType === "NOTICE") await fetchData(fetchState.lastPostId, 2); // 2페이지
    };

    loadInitialPages();
  }, [query, docType, setPosts, setNotices, setCouncilNotices, category, dept]);

  // 첫 번째 로드 후 추가 데이터를 불러오도록 설정
  useEffect(() => {
    if (isInitialLoad) {
      if (docType === "TIPS") {
        if (fetchState.lastPostId !== undefined) {
          setIsInitialLoad(false);
          fetchData(fetchState.lastPostId, fetchState.page);
        }
      } else {
        if (fetchState.page !== 1) {
          setIsInitialLoad(false);
          fetchData(fetchState.lastPostId, fetchState.page);
        }
      }
    }
  }, [fetchState]);

  const [isLoading, setIsLoading] = useState(false);
  const fetchData = async (lastPostId: number | undefined, page: number) => {
    setIsLoading(true); // 로딩 시작
    try {
      if (docType === "TIPS") {
        const response = await getPostsMobile(lastPostId, category);
        const newPosts: Post[] = response.data;
        if (newPosts && newPosts.length > 0) {
          setPosts((prev) => [...prev, ...newPosts]);
          // lastPostId 및 페이지 수 업데이트
          const lpi = Number(newPosts[newPosts.length - 1]?.id);
          setFetchState((prev) => ({
            ...prev,
            lastPostId: Number.isNaN(lpi) ? undefined : lpi,
          }));
        } else {
          setHasMore(false);
        }
      } else if (docType === "NOTICE") {
        const response = await getNotices(category, "date", page);
        const newNotices: Notice[] = response.data.contents;
        if (newNotices && newNotices.length > 0) {
          setNotices((prev) => [...prev, ...newNotices]);
          // lastPostId 및 페이지 수 업데이트
          setFetchState((prev) => ({
            ...prev,
            page: prev.page + 1,
          }));
        } else {
          setHasMore(false);
        }
      } else if (docType === "DEPT_NOTICE") {
        if (!dept) {
          return;
        }
        const deptCode = findTitleOrCode(dept);
        if (!deptCode) {
          return;
        }

        const response = await getDepartmentNotices(deptCode, "date", page);

        console.log(response);
        const newNotices: Notice[] = response.data.contents;
        if (newNotices && newNotices.length > 0) {
          setDeptNotices((prev) => [...prev, ...newNotices]);
          // lastPostId 및 페이지 수 업데이트
          setFetchState((prev) => ({
            ...prev,
            page: prev.page + 1,
          }));
        } else {
          setHasMore(false);
        }
      } else if (docType === "SEARCH" && query) {
        const response = await getSearch(query, "date", page);
        const newPosts: Post[] = response.data.contents;
        if (newPosts && newPosts.length > 0) {
          setPosts((prev) => [...prev, ...newPosts]);
          // lastPostId 및 페이지 수 업데이트
          setFetchState((prev) => ({
            ...prev,
            page: prev.page + 1,
          }));
        } else {
          setHasMore(false);
        }
      } else if (docType === "COUNCILNOTICE") {
        const response = await getCouncilNoticesList("date", fetchState.page);
        const newCouncilNotices: CouncilNotice[] = response.data.contents;
        if (newCouncilNotices && newCouncilNotices.length > 0) {
          setCouncilNotices((prev) => [...prev, ...newCouncilNotices]);
          // lastPostId 및 페이지 수 업데이트
          setFetchState((prev) => ({
            ...prev,
            page: prev.page + 1,
          }));
        } else {
          setHasMore(false);
        }
      } else if (docType === "ALERT") {
        const response = await getAlerts(fetchState.page);
        const newNotifications: Notification[] = response.data.contents;
        console.log(fetchState.page);
        console.log(response);

        if (newNotifications && newNotifications.length > 0) {
          setNotifications((prev) => [...prev, ...newNotifications]);
          // 페이지 수 업데이트
          setFetchState((prev) => ({
            ...prev,
            page: prev.page + 1,
          }));
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("게시글/공지 가져오기 실패", error);
      setHasMore(false);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  const handleNext = () => {
    if (!isInitialLoad && hasMore) {
      fetchData(fetchState.lastPostId, fetchState.page);
    }
  };

  return (
    <TipsListContainerWrapper
      id="scrollableDiv"
      // $docType={docType}
      // $isAppUrl={isAppUrl}
    >
      <InfiniteScroll
        key={docType}
        dataLength={
          docType === "NOTICE"
            ? notices.length
            : docType === "DEPT_NOTICE"
              ? deptNotices.length
              : docType === "COUNCILNOTICE"
                ? councilNotices.length
                : docType === "NOTIFICATION"
                  ? notifications.length
                  : posts.length
        }
        next={handleNext}
        hasMore={hasMore}
        loader={
          isLoading ? <h4 style={{ textAlign: "center" }}>Loading...</h4> : null
        }
        endMessage={
          <h4 style={{ textAlign: "center" }}>더 이상 게시물이 없습니다.</h4>
        }
      >
        <TipsCardWrapper $viewMode={viewMode}>
          {(docType === "TIPS" || docType === "SEARCH") &&
          viewMode === "list" ? (
            posts.length > 0 && (
              <Box>
                {posts.map((p, i) => (
                  <Fragment key={p.id}>
                    <div
                      onClick={() => navigate(ROUTES.BOARD.TIPS_DETAIL(p.id))}
                      style={{ cursor: "pointer" }}
                    >
                      <PostItem
                        title={p.title}
                        category={p.category}
                        date={p.createDate}
                        writer={p.writer}
                      />
                    </div>
                    {i < posts.length - 1 && <Divider margin={"16px 0"} />}
                  </Fragment>
                ))}
              </Box>
            )
          ) : (
            posts.map((p, i) => (
              <TipsCard key={i} post={p} viewMode={viewMode} docType={docType} />
            ))
          )}

          {notices.map((n, i) => (
            <TipsCard
              key={i}
              notice={n}
              viewMode={viewMode}
              docType={docType}
            />
          ))}
          {councilNotices.map((cn, i) => (
            <TipsCard
              key={i}
              councilNotice={cn}
              viewMode={viewMode}
              docType={docType}
            />
          ))}
          {deptNotices.map((dn, i) => (
            <TipsCard
              key={i}
              deptNotice={dn}
              viewMode={viewMode}
              docType={docType}
            />
          ))}
          {notifications.map((n, i) => (
            <TipsCard
              key={i}
              notification={n}
              viewMode={viewMode}
              docType={docType}
            />
          ))}
        </TipsCardWrapper>
      </InfiniteScroll>
      {docType === "ALERT" && (
        <MoreFeaturesBox
          title={"푸시알림이 오지 않나요?"}
          content={
            "핸드폰 설정에서 INTIP 앱의 알림 권한이 허용으로 되어있는지 확인해주세요!"
          }
        />
      )}
      {docType === "DEPT_NOTICE" && (
        <MoreFeaturesBox
          title={"학과를 변경하고 싶으신가요?"}
          content={"마이페이지 -> 프로필 수정에서 학과 정보를 수정해보세요!"}
        />
      )}
    </TipsListContainerWrapper>
  );
}

const TipsListContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  overflow-y: auto; // 스크롤 허용
`;

const TipsCardWrapper = styled.div<{ $viewMode: "grid" | "list" }>`
  display: ${({ $viewMode }) => ($viewMode === "grid" ? "grid" : "flex")};
  flex-direction: ${({ $viewMode }) =>
    $viewMode === "list" ? "column" : "unset"};
  gap: 8px;
  width: 100%;
  grid-template-columns: ${({ $viewMode }) =>
    $viewMode === "grid" ? "repeat(auto-fit, minmax(160px, 1fr))" : "unset"};
  box-sizing: border-box;
`;
