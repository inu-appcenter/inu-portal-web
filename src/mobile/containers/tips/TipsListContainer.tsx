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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMoreData = useCallback(async () => {
    if (page > totalPages) {
      return;
    }

    setLoading(true);
    try {
      if (docType === 'TIPS') {
        const response = await getPosts(category, 'date', page.toString());
        if (response.status === 200) {
          setPosts((prev) => [...prev, ...response.body.data.posts]);
          setTotalPages(response.body.data.pages);
        }
      } else if (docType === 'NOTICE') {
        const response = await getNotices(category, 'date', page.toString());
        if (response.status === 200) {
          setPosts((prev) => [...prev, ...response.body.data.notices]);
          setTotalPages(response.body.data.pages);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
    setPage((prev) => prev + 1);
  }, [category, page, totalPages]);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setTotalPages(1);
  }, [category]);

  useEffect(() => {
    loadMoreData();
  }, [loadMoreData]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && page <= totalPages) {
        loadMoreData();
      }
    }, options);

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading, loadMoreData, page, totalPages]);

  return (
    <TipsListContainerWrapper>
      <TipsCardWrapper $viewMode={viewMode}>
        {posts.map((post) => (
          <TipsCard key={post.id} post={post} viewMode={viewMode} />
        ))}
        <Loader ref={loaderRef}>
          {loading ? 'Loading more items...' : page > totalPages ? 'End of List' : ''}
        </Loader>
      </TipsCardWrapper>
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

const TipsCardWrapper = styled.div<{ $viewMode: 'grid' | 'list' }>`
  display: ${({ $viewMode }) => ($viewMode === 'grid' ? 'grid' : 'flex')};
  flex-direction: ${({ $viewMode }) => ($viewMode === 'list' ? 'column' : 'unset')};
  gap: 8px;
  width: 100%;
  grid-template-columns: ${({ $viewMode }) => ($viewMode === 'grid' ? 'repeat(2, 1fr)' : 'unset')};
`;

const Loader = styled.div`
  width: 100%;
  height: 50px;
  text-align: center;
`;
