import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import TipsCard from '../../components/tips/TipsCard';
import { getFoldersPosts, deleteFoldersPosts } from '../../../utils/API/Folders';
import { getMembersScraps } from '../../../utils/API/Members';
import { searchScrap, searchFolder } from '../../../utils/API/Search';
import { handlePostScrap } from '../../../utils/API/Posts';
import SaveSearchForm from '../../components/save/SaveSearchForm';
import editButton from '../../../resource/assets/mobile/save/editButton.svg';
import FolderListDropDowns from '../../../component/mypage/Scrap/FolderListDropDowns';
import DeleteConfirmModal from '../../components/save/DeleteConfirmModal';
import Trash from '../../../resource/assets/mobile/save/Trash.svg';

interface ScrapContentsProps {
  folders: Folder[]
  folder: Folder | null;
  token: string;
  handleManageFoldersClick: () => void;
}

export default function ScrapContents({ folders, folder, token, handleManageFoldersClick }: ScrapContentsProps) {
  const [posts, setPosts] = useState<(Post | { page: number })[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  const fetchInitialData = useCallback(async (searchQuery = '') => {
    setIsEditing(false);
    setSelectedPosts([]);
    if (!folder) return;
    setLoading(true);
    try {
      let responsePage1;
      let responsePage2;

      if (folder.id === 0) {  // '전체' 폴더
        responsePage1 = searchQuery
          ? await searchScrap(token, searchQuery, 'date', 1)
          : await getMembersScraps(token, 'date', 1);
        responsePage2 = searchQuery
          ? await searchScrap(token, searchQuery, 'date', 2)
          : await getMembersScraps(token, 'date', 2);
      } else {
        responsePage1 = searchQuery
          ? await searchFolder(token, folder.id, searchQuery, 'date', 1)
          : await getFoldersPosts(token, folder.id, 'date', 1);
        responsePage2 = searchQuery
          ? await searchFolder(token, folder.id, searchQuery, 'date', 2)
          : await getFoldersPosts(token, folder.id, 'date', 2);
      }
      if (responsePage1?.status === 200 && responsePage2?.status === 200) {
        const newPostsPage1 = responsePage1.body.data.posts;
        const newPostsPage2 = responsePage2.body.data.posts;
        setPosts([{ page: 1 }, ...newPostsPage1, { page: 2 }, ...newPostsPage2]);
        setTotalPages(responsePage1.body.data.pages);
        setTotal(responsePage1.body.data.total);
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
      setPage(3); // 초기 로드 시 두 페이지를 로드하기 때문에 페이지 번호를 3으로 설정합니다.
      fetchInitialData(query);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  }, [folder, fetchInitialData, query]);

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

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setSelectedPosts([]);
    setIsDropdownVisible(false);
  };

  const handlePostSelect = (postId: number) => {
    setSelectedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleShowDropDown = () => {
    if (selectedPosts.length === 0) {
      alert('선택된 게시물이 없습니다.');
      return;
    }
    setIsDropdownVisible(true);
  };

  const handleAddPosts = () => {
    setIsDropdownVisible(false);
    setIsEditing(false);
    setSelectedPosts([]);
  };

  const handleRemovePosts = () => {
    if (!folder) return;
    if (selectedPosts.length === 0) {
      alert('선택된 게시물이 없습니다.');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmRemovePosts = async () => {
    if (!folder) return;
    try {
      for (const postId of selectedPosts) {
        if (folder.id === 0) {
          await handlePostScrap(token, postId.toString());
        } else {
          await deleteFoldersPosts(token, postId, folder.id.toString());
        }
      }
      fetchInitialData(query);
      setIsEditing(false);
      setSelectedPosts([]);
    } catch (error) {
      console.error('Error removing posts:', error);
    }
    setShowConfirmModal(false);
  };

  const cancelRemovePosts = () => {
    setShowConfirmModal(false);
  };

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
                  <PostWrapper key={`post-${index}-${i}`} onClick={() => handlePostSelect(Number((p as Post).id))}>
                    {isEditing && (
                      <CheckBox checked={selectedPosts.includes(Number((p as Post).id))} />
                    )}
                    <TipsCard
                      post={p as Post}
                      docType='TIPS'
                      viewMode="list"
                      isEditing={isEditing}
                    />
                    <DeleteButton>
                      <img src={Trash} />
                    </DeleteButton>
                  </PostWrapper>
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
              <PostWrapper key={`post-${currentPage}-${i}`} onClick={() => handlePostSelect(Number((p as Post).id))}>
                {isEditing && (
                  <CheckBox checked={selectedPosts.includes(Number((p as Post).id))} />
                )}
                <TipsCard
                  post={p as Post}
                  docType='TIPS'
                  viewMode="list"
                  isEditing={isEditing}
                />
              </PostWrapper>
            ))}
          </TipsCardWrapper>
        </PageGroup>
      );
    }

    return groupedPosts;
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPage(3); // 초기 로드 시 두 페이지를 로드하기 때문에 페이지 번호를 3으로 설정합니다.
    fetchInitialData(searchQuery);
  };

  const handleResetSearch = () => {
    setQuery('');
    setPage(3); // 초기 로드 시 두 페이지를 로드하기 때문에 페이지 번호를 3으로 설정합니다.
    fetchInitialData();
  };

  return (
    <ScrapContentsContainerWrapper>
      <SaveSearchForm onSearch={handleSearch} />
      <ScrapHeader>
        <div className='AllScrapsWrapper'>
          <div className='AllScraps'>All Scraps</div>
          <div className='total'>{total}</div>
        </div>
        {query && <ResetButton onClick={handleResetSearch}>검색 초기화 ↺</ResetButton>}
        {isEditing ? (
          <EditingButtons>
            <Button onClick={handleShowDropDown}>담기</Button>
            <Button onClick={handleRemovePosts}>삭제</Button>
            <Button onClick={() => setIsEditing(false)}>취소</Button>
          </EditingButtons>
        ) : (
          <div className='editWrapper' onClick={handleEditToggle}>
            <img src={editButton} />
            <div className='edit'>편집</div>
          </div>
        )}
      </ScrapHeader>
      <Wrapper>
        <ScrapContentsWrapper ref={containerRef}>
          {isDropdownVisible && (
            <DropdownWrapper>
              <FolderListDropDowns
                folders={folders}
                postIds={selectedPosts}
                token={token}
                handleCreateListClick={() => handleManageFoldersClick()}
                handleAddPosts={() => handleAddPosts()}
                onClose={() => setIsDropdownVisible(false)}
              />
            </DropdownWrapper>
          )}
          {renderPosts()}
          {loading && <Loader>Loading...</Loader>}
          {!loading && page > totalPages && <EndMarker>End of Content</EndMarker>}
        </ScrapContentsWrapper>
      </Wrapper>
      {showConfirmModal && (
        <DeleteConfirmModal
          onConfirm={confirmRemovePosts}
          onCancel={cancelRemovePosts}
        />
      )}
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
  width: calc(100% - 16px);
  padding-right: 16px;
  align-items: center;
  justify-content: space-between;
  .AllScrapsWrapper {
    display: flex;
    align-items: center;
    height: 16px;
    gap: 8px;
    .AllScraps {
      color: #969696;
    }
    .total {
      color: #0E4D9D;
    }
  }
  .editWrapper {
    display: flex;
    align-items: center;
    height: 16px;
    gap: 10px;
    .edit {
      font-size: 14px;
      font-weight: 400;
      color: #4071B9;
    }
  }
`;

const ResetButton = styled.div`
  font-size: 12px;
  color: #0E4D9D;
`;

const Wrapper = styled.div`
  position: relative;
  left: -16px;
  display: flex;
  width: 100svw;
  height: 100%;
`;

const ScrapContentsWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100svh - 72px - 64px - 16px - 32px - 42px - 49px - 16px); // 100% 로 하면 안먹혀서 header, nav, gap, ScrapFolders, SearchForm, ScrapHeader 크기 직접 빼주기
  overflow-y: auto;
  position: relative;
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

const PostWrapper = styled.div`
  position: relative;
  width: calc(100%-32px);
  padding-left: 16px;
  display: flex;
  flex-direction: row;
  overflow-x: scroll;
  /* 스크롤바 숨기기 */
  scrollbar-width: none;  // Firefox용
  -ms-overflow-style: none;  // IE 및 Edge용

  &::-webkit-scrollbar {
    display: none;  // WebKit 기반 브라우저(Chrome, Safari)용
  }
`;

const CheckBox = styled.div<{ checked: boolean }>`
  position: absolute;
  top: 8px;
  right: calc(5% + 4px);
  width: 16px;
  height: 16px;
  border: 1px solid #4071B9;
  border-radius: 50%;
  background-color: #fff;
  z-index: 1;
  
  ${({ checked }) =>
    checked &&
    `
      &::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #6F84E2;
      }
    `}
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

const EditingButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.div`
  color: #4071B9;
  font-family: Roboto;
  font-size: 14px;
  font-weight: 400;
`;

const DropdownWrapper = styled.div`
  position: absolute;
  top: -30px;
  right: calc(207px + 4%);
  z-index: 1000;
`;

const DeleteButton = styled.div`
  position: absolute;
  top: 0;
  right: -30px;
  width: 51px;
  height: 97px;
  border-radius: 10px;
  background: linear-gradient(148.85deg, #D5E7FD 10.65%, #AABAFE 89.35%);
  border: 1px solid #7AA7E5;
  z-index: 10;
  transform: translateX(50%);
  
  display: flex;
  align-items: center;
  justify-content: center;
`;