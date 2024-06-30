import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import TipsCard from '../../components/tips/TipsCard';
import { getPosts } from '../../../utils/API/Posts';
import { getNotices } from '../../../utils/API/Notices';

interface TipsListContainerProps {
  viewMode: 'grid' | 'list';
  docType: string;
  category: string;
}

export default function TipsListContainer({ viewMode, docType, category }: TipsListContainerProps) {
  const [posts, setPosts] = useState<(Post | { page: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // 데이터 가져오기 함수
  const fetchData = useCallback(async (pageToLoad: number) => {
    setLoading(true);
    try {
      if (docType === 'TIPS') {
        const response = await getPosts(category, 'date', pageToLoad.toString());
        if (response.status === 200) {
          const newPosts = response.body.data.posts;
          setPosts((prev) => pageToLoad === 1 ? [{ page: pageToLoad }, ...newPosts] : [...prev, { page: pageToLoad }, ...newPosts]);
          setTotalPages(response.body.data.pages);
        }
      } else if (docType === 'NOTICE') {
        const response = await getNotices(category, 'date', pageToLoad.toString());
        if (response.status === 200) {
          const newNotices = response.body.data.notices;
          setPosts((prev) => pageToLoad === 1 ? [{ page: pageToLoad }, ...newNotices] : [...prev, { page: pageToLoad }, ...newNotices]);
          setTotalPages(response.body.data.pages);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }, [category, docType]);

  // 데이터 더 가져오기 함수
  const loadMoreData = useCallback(async () => {
    if (page <= totalPages) {
      await fetchData(page);
      setPage((prev) => prev + 1);
    }
  }, [fetchData, page, totalPages]);

  // 카테고리 변경 시 데이터 리셋 및 첫 페이지 로드
  useEffect(() => {
    setPage(1);
    fetchData(1);
    // 스크롤 맨 위로 올리기
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [category, fetchData]);

  // 스크롤 핸들러
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
        loadMoreData();
      }
    }
  };

  // 스크롤 이벤트 리스너 추가 및 제거
  useEffect(() => {
    const currentRef = containerRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // 페이지별로 그룹화된 데이터를 렌더링
  const renderPosts = () => {
    const groupedPosts: JSX.Element[] = [];
    let currentPage = 1;
    let pagePosts: (Post | { page: number })[] = [];

    posts.forEach((post, index) => {
      if ('page' in post) {
        if (pagePosts.length > 0) {
          groupedPosts.push(
            <PageGroup key={`page-${currentPage}`}>
              <PageMarker>Page {currentPage}</PageMarker>
              <TipsCardWrapper $viewMode={viewMode}>
                {pagePosts.map((p, i) => (
                  <TipsCard key={`post-${index}-${i}`} post={p as Post} viewMode={viewMode} docType={docType} />
                ))}
              </TipsCardWrapper>
            </PageGroup>
          );
          pagePosts = [];
        }
        currentPage = post.page;
      } else {
        pagePosts.push(post);
      }
    });

    if (pagePosts.length > 0) {
      groupedPosts.push(
        <PageGroup key={`page-${currentPage}`}>
          <PageMarker>Page {currentPage}</PageMarker>
          <TipsCardWrapper $viewMode={viewMode}>
            {pagePosts.map((p, i) => (
              <TipsCard key={`post-${currentPage}-${i}`} post={p as Post} viewMode={viewMode} docType={docType}/>
            ))}
          </TipsCardWrapper>
        </PageGroup>
      );
    }

    return groupedPosts;
  };

  return (
    <TipsListContainerWrapper ref={containerRef}>
      {renderPosts()}
      {loading && <Loader>Loading...</Loader>}
      {!loading && page > totalPages && <EndMarker>End of Content</EndMarker>}
    </TipsListContainerWrapper>
  );
}

const TipsListContainerWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100svh - 72px - 64px - 16px - 32px); // 100% 로 하면 안먹혀서 header, nav, padding, TitleCategorySelectorWrapper 크기 직접 빼주기
  overflow-y: auto;
`;

const PageGroup = styled.div`

`;

const TipsCardWrapper = styled.div<{ $viewMode: 'grid' | 'list' }>`
  display: ${({ $viewMode }) => ($viewMode === 'grid' ? 'grid' : 'flex')};
  flex-direction: ${({ $viewMode }) => ($viewMode === 'list' ? 'column' : 'unset')};
  gap: 8px;
  width: 100%;
  grid-template-columns: ${({ $viewMode }) => ($viewMode === 'grid' ? 'repeat(2, 1fr)' : 'unset')};
`;

const Loader = styled.div`
  width: 100%;
  padding: 4px 0;
  text-align: center;
  font-weight: bold;
`;

const PageMarker = styled.div`
  width: 100%;
  text-align: center;
  font-weight: bold;
  padding: 4px 0;
`;

const EndMarker = styled.div`
  width: 100%;
  text-align: center;
  font-weight: bold;
  padding: 4px 0;
`;