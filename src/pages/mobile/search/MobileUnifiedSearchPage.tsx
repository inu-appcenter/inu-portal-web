import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { IoCloseCircle, IoChevronForward, IoCalendarOutline, IoCallOutline, IoMailOutline, IoThumbsUpOutline, IoBookmarkOutline } from "react-icons/io5";

import { getUnifiedSearch } from "@/apis/search";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";
import HighlightText from "@/components/common/HighlightText";
import EmptyState from "@/components/common/EmptyState";
import Ripple from "@/components/common/Ripple";
import Skeleton from "@/components/common/Skeleton";
import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import { SearchTab, UnifiedSearchResponse } from "@/types/search";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
  MOBILE_PAGE_GUTTER,
} from "@/styles/responsive";

const RECENT_SEARCHES_STORAGE_KEY = "intip_recent_unified_searches";
const MAX_RECENT_SEARCHES = 10;
const MIN_QUERY_LENGTH = 2;

export default function MobileUnifiedSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const queryParam = searchParams.get("q")?.trim() ?? "";
  const tabParam = (searchParams.get("tab") as SearchTab) || "ALL";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [inputValue, setInputValue] = useState(queryParam);
  const [recentKeywords, setRecentKeywords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleBack = useCallback(() => {
    if (window.history.state && typeof window.history.state.idx === "number" && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [navigate]);

  useHeader({
    title: "통합 검색",
    hasback: true,
    onBack: handleBack,
    pageBgColor: "var(--bg-subtle, #f8f9fb)",
  });

  useEffect(() => {
    setInputValue(queryParam);
  }, [queryParam]);

  const canSearch = queryParam.length >= MIN_QUERY_LENGTH;

  // React Query를 통한 통합 검색 API 호출
  const { data, isLoading, isError } = useQuery<UnifiedSearchResponse>({
    queryKey: ["unifiedSearch", queryParam, tabParam, pageParam],
    queryFn: async () => {
      const res = await getUnifiedSearch(queryParam, tabParam, pageParam, tabParam === "ALL" ? 3 : 20);
      return res.data;
    },
    enabled: canSearch,
    staleTime: 1000 * 60 * 3,
  });

  const saveRecentKeyword = (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setRecentKeywords((prev) => {
      const next = [trimmed, ...prev.filter((k) => k !== trimmed)].slice(
        0,
        MAX_RECENT_SEARCHES,
      );
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage quota exceeded or disabled
      }
      return next;
    });
  };

  const removeRecentKeyword = (keyword: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentKeywords((prev) => {
      const next = prev.filter((k) => k !== keyword);
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const clearAllRecentKeywords = () => {
    setRecentKeywords([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleSearchSubmit = (targetKeyword?: string) => {
    const kw = (targetKeyword ?? inputValue).trim();
    if (kw.length < MIN_QUERY_LENGTH) {
      alert(`검색어를 ${MIN_QUERY_LENGTH}글자 이상 입력해 주세요.`);
      return;
    }
    saveRecentKeyword(kw);
    navigate(
      `${ROUTES.UNIFIED_SEARCH}?q=${encodeURIComponent(kw)}&tab=${tabParam}`,
      { replace: true },
    );
  };

  const handleTabChange = (selectedTab: string) => {
    navigate(
      `${ROUTES.UNIFIED_SEARCH}?q=${encodeURIComponent(queryParam)}&tab=${selectedTab}`,
      { replace: true },
    );
  };

  // 카테고리 탭 리스트 구성
  const categories = useMemo(() => {
    const totalCount = data?.totalCount;
    const noticesCount = data?.notices?.totalCount;
    const deptNoticesCount = data?.departmentNotices?.totalCount;
    const postsCount = data?.posts?.totalCount;
    const schedulesCount = data?.schedules?.totalCount;
    const directoryCount = data?.directory?.totalCount;
    const coursesCount = data?.courses?.totalCount;
    const clubsCount = data?.clubs?.totalCount;

    return [
      { label: "전체", value: "ALL", count: totalCount },
      { label: "학교 공지", value: "NOTICE", count: noticesCount },
      { label: "학과 공지", value: "DEPT_NOTICE", count: deptNoticesCount },
      { label: "게시글", value: "POST", count: postsCount },
      { label: "학사일정", value: "SCHEDULE", count: schedulesCount },
      { label: "전화번호부", value: "DIRECTORY", count: directoryCount },
      { label: "개설 강의", value: "COURSE", count: coursesCount },
      { label: "동아리", value: "CLUB", count: clubsCount },
    ];
  }, [data]);

  return (
    <PageWrapper>
      <SearchHeaderContainer>
        <SearchBarWrapper>
          <MobilePillSearchBar
            value={inputValue}
            onChange={setInputValue}
            onSubmit={() => handleSearchSubmit()}
            placeholder="공지, 게시글, 일정, 교수님, 강의 검색"
            autoFocus={!queryParam}
          />
        </SearchBarWrapper>
      </SearchHeaderContainer>

      {/* 검색어가 있는 경우 탭 표시 */}
      {canSearch && (
        <TabContainer>
          <CategorySelectorNew
            categories={categories}
            selectedCategory={tabParam}
            queryParam="tab"
            onSelectCategory={handleTabChange}
          />
        </TabContainer>
      )}

      <ContentArea>
        {/* 검색어가 없을 때: 최근 검색어 안내 */}
        {!canSearch && (
          <RecentSearchSection>
            <RecentHeader>
              <RecentTitle>최근 검색어</RecentTitle>
              {recentKeywords.length > 0 && (
                <ClearAllButton onClick={clearAllRecentKeywords}>
                  모두 지우기
                </ClearAllButton>
              )}
            </RecentHeader>

            {recentKeywords.length > 0 ? (
              <RecentKeywordsList>
                {recentKeywords.map((keyword) => (
                  <RecentKeywordChip
                    key={keyword}
                    onClick={() => {
                      setInputValue(keyword);
                      handleSearchSubmit(keyword);
                    }}
                  >
                    <Ripple />
                    <span>{keyword}</span>
                    <button
                      type="button"
                      aria-label="삭제"
                      onClick={(e) => removeRecentKeyword(keyword, e)}
                    >
                      <IoCloseCircle size={16} color="#9CA3AF" />
                    </button>
                  </RecentKeywordChip>
                ))}
              </RecentKeywordsList>
            ) : (
              <EmptyState padding="48px 0">최근 검색어가 없습니다.</EmptyState>
            )}
          </RecentSearchSection>
        )}

        {/* 로딩 스켈레톤 */}
        {canSearch && isLoading && (
          <SkeletonContainer>
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </SkeletonContainer>
        )}

        {/* 에러 상태 */}
        {canSearch && !isLoading && isError && (
          <EmptyState padding="48px 0">
            검색 결과를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </EmptyState>
        )}

        {/* 검색 결과 표시 */}
        {canSearch && !isLoading && data && (
          <>
            {data.totalCount === 0 ? (
              <EmptyResultWrapper>
                <EmptyState padding="60px 0">
                  <div>
                    <strong>'{queryParam}'</strong>에 대한 검색 결과가 없습니다.
                    <SubEmptyGuide>
                      단어의 철자가 정확한지 확인하시거나, 다른 검색어로 검색해 보세요.
                    </SubEmptyGuide>
                  </div>
                </EmptyState>
              </EmptyResultWrapper>
            ) : (
              <ResultsContainer>
                {/* 1. 학교 공지사항 */}
                {(tabParam === "ALL" || tabParam === "NOTICE") &&
                  data.notices &&
                  data.notices.items.length > 0 && (
                    <SectionCard>
                      <SectionHeader>
                        <SectionTitleGroup>
                          <SectionTitle>학교 공지사항</SectionTitle>
                          <SectionCountBadge>{data.notices.totalCount}</SectionCountBadge>
                        </SectionTitleGroup>
                        {tabParam === "ALL" && data.notices.totalCount > 3 && (
                          <MoreButton onClick={() => handleTabChange("NOTICE")}>
                            더보기 <IoChevronForward size={14} />
                          </MoreButton>
                        )}
                      </SectionHeader>
                      <ItemList>
                        {data.notices.items.map((item) => (
                          <ResultItem
                            key={`notice-${item.id}`}
                            onClick={() => {
                              if (item.url) window.open(item.url, "_blank");
                              else navigate(ROUTES.BOARD.NOTICE_DETAIL(item.id));
                            }}
                          >
                            <Ripple />
                            <ItemMeta>
                              {item.category && <CategoryTag>{item.category}</CategoryTag>}
                              {item.writer && <MetaText>{item.writer}</MetaText>}
                              {item.createDate && <MetaText>{item.createDate}</MetaText>}
                            </ItemMeta>
                            <ItemTitle>
                              <HighlightText text={item.title} />
                            </ItemTitle>
                            {item.snippet && (
                              <ItemSnippet>
                                <HighlightText text={item.snippet} />
                              </ItemSnippet>
                            )}
                          </ResultItem>
                        ))}
                      </ItemList>
                    </SectionCard>
                  )}

                {/* 2. 학과 공지사항 */}
                {(tabParam === "ALL" || tabParam === "DEPT_NOTICE") &&
                  data.departmentNotices &&
                  data.departmentNotices.items.length > 0 && (
                    <SectionCard>
                      <SectionHeader>
                        <SectionTitleGroup>
                          <SectionTitle>학과 공지사항</SectionTitle>
                          <SectionCountBadge>
                            {data.departmentNotices.totalCount}
                          </SectionCountBadge>
                        </SectionTitleGroup>
                        {tabParam === "ALL" &&
                          data.departmentNotices.totalCount > 3 && (
                            <MoreButton onClick={() => handleTabChange("DEPT_NOTICE")}>
                              더보기 <IoChevronForward size={14} />
                            </MoreButton>
                          )}
                      </SectionHeader>
                      <ItemList>
                        {data.departmentNotices.items.map((item) => (
                          <ResultItem
                            key={`dept-notice-${item.id}`}
                            onClick={() => {
                              if (item.url) window.open(item.url, "_blank");
                            }}
                          >
                            <Ripple />
                            <ItemMeta>
                              {item.departmentName && (
                                <CategoryTag>{item.departmentName}</CategoryTag>
                              )}
                              {item.createDate && <MetaText>{item.createDate}</MetaText>}
                            </ItemMeta>
                            <ItemTitle>
                              <HighlightText text={item.title} />
                            </ItemTitle>
                            {item.snippet && (
                              <ItemSnippet>
                                <HighlightText text={item.snippet} />
                              </ItemSnippet>
                            )}
                          </ResultItem>
                        ))}
                      </ItemList>
                    </SectionCard>
                  )}

                {/* 3. 커뮤니티 게시글 */}
                {(tabParam === "ALL" || tabParam === "POST") &&
                  data.posts &&
                  data.posts.items.length > 0 && (
                    <SectionCard>
                      <SectionHeader>
                        <SectionTitleGroup>
                          <SectionTitle>게시글</SectionTitle>
                          <SectionCountBadge>{data.posts.totalCount}</SectionCountBadge>
                        </SectionTitleGroup>
                        {tabParam === "ALL" && data.posts.totalCount > 3 && (
                          <MoreButton onClick={() => handleTabChange("POST")}>
                            더보기 <IoChevronForward size={14} />
                          </MoreButton>
                        )}
                      </SectionHeader>
                      <ItemList>
                        {data.posts.items.map((item) => (
                          <ResultItem
                            key={`post-${item.id}`}
                            onClick={() => navigate(ROUTES.BOARD.TIPS_DETAIL(item.id))}
                          >
                            <Ripple />
                            <ItemMeta>
                              {item.category && <CategoryTag>{item.category}</CategoryTag>}
                              {item.writer && <MetaText>{item.writer}</MetaText>}
                              {item.createDate && <MetaText>{item.createDate}</MetaText>}
                            </ItemMeta>
                            <ItemTitle>
                              <HighlightText text={item.title} />
                            </ItemTitle>
                            {item.snippet && (
                              <ItemSnippet>
                                <HighlightText text={item.snippet} />
                              </ItemSnippet>
                            )}
                            <PostCounters>
                              <PostCountItem>
                                <IoThumbsUpOutline size={13} /> {item.good ?? 0}
                              </PostCountItem>
                              <PostCountItem>
                                <IoBookmarkOutline size={13} /> {item.scrap ?? 0}
                              </PostCountItem>
                            </PostCounters>
                          </ResultItem>
                        ))}
                      </ItemList>
                    </SectionCard>
                  )}

                {/* 4. 학사일정 */}
                {(tabParam === "ALL" || tabParam === "SCHEDULE") &&
                  data.schedules &&
                  data.schedules.items.length > 0 && (
                    <SectionCard>
                      <SectionHeader>
                        <SectionTitleGroup>
                          <SectionTitle>학사일정</SectionTitle>
                          <SectionCountBadge>{data.schedules.totalCount}</SectionCountBadge>
                        </SectionTitleGroup>
                        {tabParam === "ALL" && data.schedules.totalCount > 3 && (
                          <MoreButton onClick={() => handleTabChange("SCHEDULE")}>
                            더보기 <IoChevronForward size={14} />
                          </MoreButton>
                        )}
                      </SectionHeader>
                      <ItemList>
                        {data.schedules.items.map((item) => (
                          <ResultItem
                            key={`schedule-${item.id}`}
                            onClick={() => navigate(ROUTES.BOARD.CALENDAR)}
                          >
                            <Ripple />
                            <ScheduleRow>
                              <ScheduleIconWrapper>
                                <IoCalendarOutline size={18} color="#2563EB" />
                              </ScheduleIconWrapper>
                              <div>
                                <ItemTitle>
                                  <HighlightText text={item.content} />
                                </ItemTitle>
                                <MetaText>
                                  {item.startDate} {item.endDate && item.endDate !== item.startDate ? `~ ${item.endDate}` : ""}
                                </MetaText>
                              </div>
                            </ScheduleRow>
                          </ResultItem>
                        ))}
                      </ItemList>
                    </SectionCard>
                  )}

                {/* 5. 교내 전화번호부 */}
                {(tabParam === "ALL" || tabParam === "DIRECTORY") &&
                  data.directory &&
                  data.directory.items.length > 0 && (
                    <SectionCard>
                      <SectionHeader>
                        <SectionTitleGroup>
                          <SectionTitle>교내 전화번호부</SectionTitle>
                          <SectionCountBadge>{data.directory.totalCount}</SectionCountBadge>
                        </SectionTitleGroup>
                        {tabParam === "ALL" && data.directory.totalCount > 3 && (
                          <MoreButton onClick={() => handleTabChange("DIRECTORY")}>
                            더보기 <IoChevronForward size={14} />
                          </MoreButton>
                        )}
                      </SectionHeader>
                      <ItemList>
                        {data.directory.items.map((item) => (
                          <ResultItem key={`dir-${item.id}`}>
                            <Ripple />
                            <DirectoryHeader>
                              <DirectoryName>
                                <HighlightText text={item.name} />
                              </DirectoryName>
                              {item.position && <PositionBadge>{item.position}</PositionBadge>}
                            </DirectoryHeader>
                            <MetaText>
                              <HighlightText text={item.affiliation} />
                              {item.detailAffiliation ? ` · ${item.detailAffiliation}` : ""}
                            </MetaText>
                            {item.duties && (
                              <ItemSnippet>
                                담당업무: <HighlightText text={item.duties} />
                              </ItemSnippet>
                            )}
                            <DirectoryContactRow>
                              {item.phoneNumber && (
                                <ContactLink href={`tel:${item.phoneNumber}`}>
                                  <IoCallOutline size={13} /> {item.phoneNumber}
                                </ContactLink>
                              )}
                              {item.email && (
                                <ContactLink href={`mailto:${item.email}`}>
                                  <IoMailOutline size={13} /> {item.email}
                                </ContactLink>
                              )}
                            </DirectoryContactRow>
                          </ResultItem>
                        ))}
                      </ItemList>
                    </SectionCard>
                  )}

                {/* 6. 개설 강의 */}
                {(tabParam === "ALL" || tabParam === "COURSE") &&
                  data.courses &&
                  data.courses.items.length > 0 && (
                    <SectionCard>
                      <SectionHeader>
                        <SectionTitleGroup>
                          <SectionTitle>개설 강의</SectionTitle>
                          <SectionCountBadge>{data.courses.totalCount}</SectionCountBadge>
                        </SectionTitleGroup>
                        {tabParam === "ALL" && data.courses.totalCount > 3 && (
                          <MoreButton onClick={() => handleTabChange("COURSE")}>
                            더보기 <IoChevronForward size={14} />
                          </MoreButton>
                        )}
                      </SectionHeader>
                      <ItemList>
                        {data.courses.items.map((item) => (
                          <ResultItem key={`course-${item.id}`}>
                            <Ripple />
                            <ItemMeta>
                              {item.subjectNumber && (
                                <CategoryTag>{item.subjectNumber}</CategoryTag>
                              )}
                              {item.isuName && <MetaText>{item.isuName}</MetaText>}
                              {item.credit && <MetaText>{item.credit}학점</MetaText>}
                            </ItemMeta>
                            <ItemTitle>
                              <HighlightText text={item.title} />
                            </ItemTitle>
                            {item.professor && (
                              <MetaText>
                                교수: <HighlightText text={item.professor} />
                              </MetaText>
                            )}
                          </ResultItem>
                        ))}
                      </ItemList>
                    </SectionCard>
                  )}

                {/* 7. 교내 동아리 */}
                {(tabParam === "ALL" || tabParam === "CLUB") &&
                  data.clubs &&
                  data.clubs.items.length > 0 && (
                    <SectionCard>
                      <SectionHeader>
                        <SectionTitleGroup>
                          <SectionTitle>교내 동아리</SectionTitle>
                          <SectionCountBadge>{data.clubs.totalCount}</SectionCountBadge>
                        </SectionTitleGroup>
                        {tabParam === "ALL" && data.clubs.totalCount > 3 && (
                          <MoreButton onClick={() => handleTabChange("CLUB")}>
                            더보기 <IoChevronForward size={14} />
                          </MoreButton>
                        )}
                      </SectionHeader>
                      <ItemList>
                        {data.clubs.items.map((item) => (
                          <ResultItem
                            key={`club-${item.id}`}
                            onClick={() => navigate(ROUTES.BOARD.CLUB)}
                          >
                            <Ripple />
                            <ItemMeta>
                              {item.category && <CategoryTag>{item.category}</CategoryTag>}
                            </ItemMeta>
                            <ItemTitle>
                              <HighlightText text={item.name} />
                            </ItemTitle>
                            {item.snippet && (
                              <ItemSnippet>
                                <HighlightText text={item.snippet} />
                              </ItemSnippet>
                            )}
                          </ResultItem>
                        ))}
                      </ItemList>
                    </SectionCard>
                  )}
              </ResultsContainer>
            )}
          </>
        )}
      </ContentArea>
    </PageWrapper>
  );
}

// Styled Components
const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-subtle, #f8f9fb);
  padding-bottom: 60px;
`;

const SearchHeaderContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 8px ${MOBILE_PAGE_GUTTER} 12px;

  ${DESKTOP_MEDIA} {
    max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
    margin: 0 auto;
    padding: 12px 0 12px;
  }
`;

const SearchBarWrapper = styled.div`
  width: 100%;
`;

const TabContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0 ${MOBILE_PAGE_GUTTER} 12px;

  ${DESKTOP_MEDIA} {
    max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
    margin: 0 auto;
    padding: 0 0 12px;
  }
`;

const ContentArea = styled.div`
  padding: 16px ${MOBILE_PAGE_GUTTER};

  ${DESKTOP_MEDIA} {
    max-width: ${DESKTOP_CONTENT_MAX_WIDTH};
    margin: 0 auto;
    padding: 24px 0;
  }
`;

const RecentSearchSection = styled.div`
  padding: 8px 0;
`;

const RecentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const RecentTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
`;

const ClearAllButton = styled.button`
  font-size: 13px;
  color: #94A3B8;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;

  &:hover {
    color: #64748B;
  }
`;

const RecentKeywordsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const RecentKeywordChip = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  overflow: hidden;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }
`;

const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
`;

const EmptyResultWrapper = styled.div`
  text-align: center;
`;

const SubEmptyGuide = styled.p`
  margin-top: 8px;
  font-size: 13px;
  color: #94A3B8;
  font-weight: 400;
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionCard = styled.div`
  background-color: #ffffff;
  border-radius: 14px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px 10px 16px;
  border-bottom: 1px solid #F1F5F9;
`;

const SectionTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
`;

const SectionCountBadge = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #2563EB;
  background-color: #EFF6FF;
  padding: 2px 7px;
  border-radius: 999px;
`;

const MoreButton = styled.button`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  color: #64748B;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    color: #1E293B;
  }
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ResultItem = styled.div`
  position: relative;
  padding: 14px 16px;
  border-bottom: 1px solid #F8FAFC;
  cursor: pointer;
  overflow: hidden;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #F8FAFC;
  }
`;

const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
`;

const CategoryTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #2563EB;
  background-color: #EFF6FF;
  padding: 2px 6px;
  border-radius: 4px;
`;

const MetaText = styled.span`
  font-size: 12px;
  color: #94A3B8;
`;

const ItemTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 4px 0;
  line-height: 1.4;
`;

const ItemSnippet = styled.p`
  font-size: 13px;
  color: #64748B;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PostCounters = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const PostCountItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94A3B8;
`;

const ScheduleRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const ScheduleIconWrapper = styled.div`
  background-color: #EFF6FF;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DirectoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
`;

const DirectoryName = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
`;

const PositionBadge = styled.span`
  font-size: 11px;
  color: #64748B;
  background-color: #F1F5F9;
  padding: 2px 6px;
  border-radius: 4px;
`;

const DirectoryContactRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 6px;
`;

const ContactLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #2563EB;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
