import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import TipsCard from '../../components/tips/TipsCard';
import { getFoldersPosts } from '../../../utils/API/Folders';
import { getMembersScraps } from '../../../utils/API/Members';
import { searchScrap, searchFolder } from '../../../utils/API/Search';
import SaveSearchForm from '../../components/save/SaveSearchForm';

interface ScrapContentsProps {
  folder: { id: number; name: string } | null;
  token: string;
}

export default function ScrapContents({ folder, token }: ScrapContentsProps) {
  const [posts, setPosts] = useState<(Post | { page: number })[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // 데이터 가져오기 함수
  const fetchData = useCallback(async (pageToLoad: number, searchQuery = '') => {
    if (!folder) return;
    setLoading(true);
    try {
      let response;
      if (folder.id === 0) {  // '전체' 폴더
        response = searchQuery
          ? await searchScrap(token, searchQuery, 'date', pageToLoad)
          : await getMembersScraps(token, 'date', pageToLoad);
      } else {
        response = searchQuery
          ? await searchFolder(token, folder.id, searchQuery, 'date', pageToLoad)
          : await getFoldersPosts(token, folder.id, 'date', pageToLoad);
      }
      if (response.status === 200) {
        const newPosts = response.body.data.posts;
        setPosts((prev) => pageToLoad === 1 ? [{ page: pageToLoad }, ...newPosts] : [...prev, { page: pageToLoad }, ...newPosts]);
        setTotalPages(response.body.data.pages);
        setTotal(response.body.data.total);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }, [folder, token]);

  // 데이터 더 가져오기 함수
  const loadMoreData = useCallback(async () => {
    if (page <= totalPages) {
      await fetchData(page, query);
      setPage((prev) => prev + 1);
    }
  }, [fetchData, page, totalPages, query]);

  useEffect(() => {
    if (folder) {
      setPage(1);
      fetchData(1, query);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  }, [folder, fetchData, query]);

  // 스크롤 핸들러
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
        loadMoreData();
      }
    }
  };

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
              <TipsCardWrapper $viewMode="list">
                {pagePosts.map((p, i) => (
                  <TipsCard key={`post-${index}-${i}`} post={p as Post} docType='TIPS' viewMode="list" />
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
          <TipsCardWrapper $viewMode="list">
            {pagePosts.map((p, i) => (
              <TipsCard key={`post-${currentPage}-${i}`} post={p as Post} docType='TIPS' viewMode="list"/>
            ))}
          </TipsCardWrapper>
        </PageGroup>
      );
    }

    return groupedPosts;
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPage(1);
    fetchData(1, searchQuery);
  };

  const handleResetSearch = () => {
    setQuery('');
    setPage(1);
    fetchData(1);
  };

  return (
    <ScrapContentsContainerWrapper>
      <SaveSearchForm onSearch={handleSearch} />
      <ScrapHeader>
        <div className='AllScraps'>All Scraps</div>
        <div className='total'>{total}</div>
        {query && <ResetButton onClick={handleResetSearch}>검색 초기화 ↺</ResetButton>}
      </ScrapHeader>
      <Wrapper>
        <ScrapContentsWrapper ref={containerRef}>
          {renderPosts()}
          {loading && <Loader>Loading...</Loader>}
          {!loading && page > totalPages && <EndMarker>End of Content</EndMarker>}
        </ScrapContentsWrapper>
      </Wrapper>
    </ScrapContentsContainerWrapper>
  );
}

const ScrapContentsContainerWrapper = styled.div`
  height: 100%;
  width: calc(100% - 32px);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ScrapHeader = styled.div`
  font-size: 15px;
  font-weight: 600;
  display: flex;
  height: 16px;
  width: 100%;
  align-items: center;
  gap: 8px;
  .AllScraps {
    color: #969696;
  }
  .total {
    color: #0E4D9D;
  }
`;

const ResetButton = styled.div`
  font-size: 12px;
  color: #0E4D9D;
`;

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const ScrapContentsWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100svh - 72px - 64px - 16px - 32px - 42px - 49px - 16px); // 100% 로 하면 안먹혀서 header, nav, gap, ScrapFolders, SearchForm, ScrapHeader 크기 직접 빼주기
  overflow-y: auto;
`;

const PageGroup = styled.div`
  margin-bottom: 16px;
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
