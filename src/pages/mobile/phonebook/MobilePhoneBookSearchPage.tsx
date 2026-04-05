import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronRight, Phone } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import {
  searchCollegeOfficeContacts,
  searchDirectoryEntries,
} from "@/apis/directory";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";
import { ROUTES } from "@/constants/routes";
import { useHeader } from "@/context/HeaderContext";
import {
  getPhonebookDetailPath,
  savePhonebookDetailState,
} from "@/pages/mobile/phonebook/phonebookDetailState";
import {
  MIN_PHONEBOOK_QUERY_LENGTH,
  PEOPLE_CATEGORY_OPTIONS,
  getCategoryLabel,
  getCategoryValue,
} from "@/pages/mobile/phonebook/phonebookConfig";
import { CollegeOfficeContact, DirectoryEntry } from "@/types/directory";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
  MOBILE_PAGE_GUTTER,
} from "@/styles/responsive";
import Divider from "@/components/common/Divider";

type PhonebookSectionKey = "people" | "office";

const DEFAULT_SECTION: PhonebookSectionKey = "people";
const MIN_QUERY_MESSAGE = "검색어를 2글자 이상 입력해 주세요.";
const PEOPLE_SECTION_TITLE = "교직원/교수";
const OFFICE_SECTION_TITLE = "학과/부서";
const SEARCH_PLACEHOLDER = "이름, 소속, 학과명, 위치, 전화번호를 검색해보세요";

function scrollToResultTop(behavior: ScrollBehavior = "auto") {
  const scrollContainer = document.getElementById("app-scroll-view");

  if (scrollContainer) {
    scrollContainer.scrollTo({ top: 0, behavior });
    return;
  }

  window.scrollTo({ top: 0, behavior });
}

function getSection(section: string | null): PhonebookSectionKey {
  if (section === "office") {
    return "office";
  }

  return DEFAULT_SECTION;
}

function joinDistinctText(
  values: Array<string | null | undefined>,
  separator: string,
) {
  const uniqueValues = values.reduce<string[]>((accumulator, value) => {
    const trimmedValue = value?.trim();

    if (!trimmedValue || accumulator.includes(trimmedValue)) {
      return accumulator;
    }

    accumulator.push(trimmedValue);
    return accumulator;
  }, []);

  return uniqueValues.join(separator);
}

const MobilePhoneBookSearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const explicitSection = searchParams.get("section");
  const committedQuery = searchParams.get("query")?.trim() ?? "";
  const selectedCategoryLabel = getCategoryLabel(searchParams.get("category"));
  const selectedCategoryValue = getCategoryValue(searchParams.get("category"));
  const selectedSection = getSection(explicitSection);
  const [inputValue, setInputValue] = useState(committedQuery);
  const canSearch = committedQuery.length >= MIN_PHONEBOOK_QUERY_LENGTH;

  useEffect(() => {
    setInputValue(committedQuery);
  }, [committedQuery]);

  const handleSearchSubmit = () => {
    const nextQuery = inputValue.trim();

    if (nextQuery.length < MIN_PHONEBOOK_QUERY_LENGTH) {
      window.alert(MIN_QUERY_MESSAGE);
      return;
    }

    const nextParams = new URLSearchParams(location.search);
    nextParams.set("query", nextQuery);
    nextParams.delete("section");

    navigate(`${ROUTES.PHONEBOOK.SEARCH}?${nextParams.toString()}`, {
      replace: true,
    });
  };

  const peopleQuery = useInfiniteQuery({
    queryKey: [
      "directory-search",
      selectedCategoryValue ?? "ALL",
      committedQuery,
    ],
    enabled: canSearch,
    queryFn: ({ pageParam = 1 }) =>
      searchDirectoryEntries(selectedCategoryValue, committedQuery, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage.data.pages;
      const currentPage = allPages.length;

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  const officeQuery = useInfiniteQuery({
    queryKey: ["college-office-search", committedQuery],
    enabled: canSearch,
    queryFn: ({ pageParam = 1 }) =>
      searchCollegeOfficeContacts(committedQuery, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage.data.pages;
      const currentPage = allPages.length;

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  const peopleEntries = useMemo(
    () => peopleQuery.data?.pages.flatMap((page) => page.data.contents) ?? [],
    [peopleQuery.data],
  );

  const officeEntries = useMemo(
    () => officeQuery.data?.pages.flatMap((page) => page.data.contents) ?? [],
    [officeQuery.data],
  );

  const peopleTotal = peopleQuery.data?.pages[0]?.data.total ?? 0;
  const officeTotal = officeQuery.data?.pages[0]?.data.total ?? 0;

  const handleOpenPersonDetail = (entry: DirectoryEntry) => {
    savePhonebookDetailState({ kind: "person", entry });
    navigate(getPhonebookDetailPath("person", entry.id), {
      state: { kind: "person", entry },
    });
  };

  const handleOpenOfficeDetail = (entry: CollegeOfficeContact) => {
    savePhonebookDetailState({ kind: "office", entry });
    navigate(getPhonebookDetailPath("office", entry.id), {
      state: { kind: "office", entry },
    });
  };

  const sectionCategories = useMemo(
    () => [
      { label: `${PEOPLE_SECTION_TITLE} ${peopleTotal}`, value: "people" },
      { label: `${OFFICE_SECTION_TITLE} ${officeTotal}`, value: "office" },
    ],
    [officeTotal, peopleTotal],
  );

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={sectionCategories}
        selectedCategory={selectedSection}
        queryParam="section"
        paramsToReset={[]}
      />
    ),
    [sectionCategories, selectedSection],
  );

  useHeader({
    title: "검색 결과",
    hasback: true,
    subHeader,
    floatingSubHeader: true,
  });

  useEffect(() => {
    scrollToResultTop("auto");
  }, [committedQuery, selectedCategoryLabel]);

  useEffect(() => {
    if (!explicitSection) {
      return;
    }

    const targetId =
      explicitSection === "office" ? "section-office" : "section-people";
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
      return;
    }

    const timer = window.setTimeout(() => {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [explicitSection, officeEntries.length, peopleEntries.length]);

  return (
    <PageWrapper>
      <SectionWrapper id="section-people">
        <TitleContentArea title={PEOPLE_SECTION_TITLE}>
          <SectionInner>
            <CategorySelectorPadding>
              <CategorySelectorNew
                categories={PEOPLE_CATEGORY_OPTIONS.map(({ label }) => label)}
                selectedCategory={selectedCategoryLabel}
              />
            </CategorySelectorPadding>

            {!canSearch ? (
              <EmptyState>{MIN_QUERY_MESSAGE}</EmptyState>
            ) : peopleQuery.isLoading ? (
              <CardList>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Box key={`people-skeleton-${index}`}>
                    <SkeletonCard>
                      <div className="icon" />
                      <div className="content">
                        <div className="title" />
                        <div className="line" />
                        <div className="line short" />
                      </div>
                    </SkeletonCard>
                  </Box>
                ))}
              </CardList>
            ) : peopleQuery.isError ? (
              <EmptyState>
                검색 결과를 불러오는 중 오류가 발생했어요.
              </EmptyState>
            ) : peopleEntries.length === 0 ? (
              <EmptyState>조건에 맞는 검색 결과가 없어요.</EmptyState>
            ) : (
              <Box>
                <CardList>
                  {peopleEntries.map((entry, index) => (
                    <>
                      <PersonResultCard
                        entry={entry}
                        onClick={() => handleOpenPersonDetail(entry)}
                      />
                      {index < peopleEntries.length - 1 && (
                        <DividerWrapper>
                          <Divider />
                        </DividerWrapper>
                      )}
                    </>
                  ))}
                </CardList>
                {peopleQuery.hasNextPage && (
                  <LoadMoreButton
                    type="button"
                    onClick={() => void peopleQuery.fetchNextPage()}
                    disabled={peopleQuery.isFetchingNextPage}
                  >
                    {peopleQuery.isFetchingNextPage
                      ? "검색 결과를 불러오는 중..."
                      : "검색 결과 더 보기"}
                  </LoadMoreButton>
                )}
              </Box>
            )}
          </SectionInner>
        </TitleContentArea>
      </SectionWrapper>

      <SectionWrapper id="section-office">
        <TitleContentArea title={OFFICE_SECTION_TITLE}>
          <SectionInner>
            {!canSearch ? (
              <EmptyState>{MIN_QUERY_MESSAGE}</EmptyState>
            ) : officeQuery.isLoading ? (
              <CardList>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Box key={`office-skeleton-${index}`}>
                    <SkeletonCard>
                      <div className="icon" />
                      <div className="content">
                        <div className="title" />
                        <div className="line" />
                        <div className="line short" />
                      </div>
                    </SkeletonCard>
                  </Box>
                ))}
              </CardList>
            ) : officeQuery.isError ? (
              <EmptyState>
                검색 결과를 불러오는 중 오류가 발생했어요.
              </EmptyState>
            ) : officeEntries.length === 0 ? (
              <EmptyState>조건에 맞는 검색 결과가 없어요.</EmptyState>
            ) : (
              <Box>
                <CardList>
                  {officeEntries.map((entry, index) => (
                    <>
                      <OfficeResultCard
                        entry={entry}
                        onClick={() => handleOpenOfficeDetail(entry)}
                        key={`college-office-${entry.id}`}
                      />
                      {index < officeEntries.length - 1 && (
                        <DividerWrapper>
                          <Divider />
                        </DividerWrapper>
                      )}
                    </>
                  ))}
                </CardList>
                {officeQuery.hasNextPage && (
                  <LoadMoreButton
                    type="button"
                    onClick={() => void officeQuery.fetchNextPage()}
                    disabled={officeQuery.isFetchingNextPage}
                  >
                    {officeQuery.isFetchingNextPage
                      ? "검색 결과를 불러오는 중..."
                      : "검색 결과 더 보기"}
                  </LoadMoreButton>
                )}
              </Box>
            )}
          </SectionInner>
        </TitleContentArea>
      </SectionWrapper>

      <SearchSpacer />

      <FloatingSearchBar>
        <MobilePillSearchBar
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSearchSubmit}
          placeholder={SEARCH_PLACEHOLDER}
        />
      </FloatingSearchBar>
    </PageWrapper>
  );
};

export default MobilePhoneBookSearchPage;

interface SearchResultCardProps {
  onClick: () => void;
}

const PersonResultCard = ({
  entry,
  onClick,
}: SearchResultCardProps & { entry: DirectoryEntry }) => {
  const name = entry.name?.trim();
  const title =
    name || entry.position || entry.detailAffiliation || entry.affiliation;
  const affiliation = joinDistinctText(
    [entry.affiliation, entry.detailAffiliation],
    " ",
  );
  const subtitle = name
    ? joinDistinctText([entry.position, affiliation], " · ")
    : affiliation;
  const phone =
    entry.phoneNumber?.trim() || entry.email?.trim() || "연락처 정보 없음";

  return (
    <SearchResultButton type="button" onClick={onClick}>
      <ResultIconCircle aria-hidden="true">
        <Phone size={16} strokeWidth={2.4} />
      </ResultIconCircle>

      <ResultBody>
        <ResultTitle>{title}</ResultTitle>
        {subtitle && <ResultSubtitle>{subtitle}</ResultSubtitle>}
        <ResultPhone>{phone}</ResultPhone>
      </ResultBody>

      <ResultArrow aria-hidden="true">
        <ChevronRight size={18} strokeWidth={2.4} />
      </ResultArrow>
    </SearchResultButton>
  );
};

const OfficeResultCard = ({
  entry,
  onClick,
}: SearchResultCardProps & { entry: CollegeOfficeContact }) => {
  const subtitle = joinDistinctText(
    [entry.collegeName, entry.officeLocation || entry.collegeLocationSummary],
    " · ",
  );
  const phone =
    entry.officePhoneNumber?.trim() ||
    entry.homepageUrl?.trim() ||
    "연락처 정보 없음";

  return (
    <SearchResultButton type="button" onClick={onClick}>
      <ResultIconCircle aria-hidden="true">
        <Phone size={22} strokeWidth={2.4} />
      </ResultIconCircle>

      <ResultBody>
        <ResultTitle>{entry.departmentName}</ResultTitle>
        {subtitle && <ResultSubtitle>{subtitle}</ResultSubtitle>}
        <ResultPhone>{phone}</ResultPhone>
      </ResultBody>

      <ResultArrow aria-hidden="true">
        <ChevronRight size={18} strokeWidth={2.4} />
      </ResultArrow>
    </SearchResultButton>
  );
};

const PageWrapper = styled.div`
  width: 100%;
  padding: 12px ${MOBILE_PAGE_GUTTER} 28px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_CONTENT_MAX_WIDTH});
    margin: 0 auto;
    padding: 16px 0 36px;
  }
`;

const SectionWrapper = styled.div`
  scroll-margin-top: 150px;
`;

const SectionInner = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CategorySelectorPadding = styled.div`
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  //gap: 12px;
  width: 100%;

  //padding: 20px;

  @media ${DESKTOP_MEDIA} {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
`;

/* DividerWrapper 추가: 모바일에서만 보이도록 설정 */
const DividerWrapper = styled.div`
  @media ${DESKTOP_MEDIA} {
    display: none; /* PC 레이아웃에서는 Divider 제거 */
  }
`;

const SearchResultButton = styled.button`
  //width: calc(100% + 40px);
  //margin: -20px;
  width: 100%;
  //padding: 0 20px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  //gap: 8px;
  border: none;
  border-radius: 20px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.18s ease;

  @media (hover: hover) {
    &:hover {
      background: #f8fbff;
    }
  }
`;

const ResultIconCircle = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #c9ced8;
  color: #fff;
  flex-shrink: 0;
`;

const ResultBody = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  //gap: 4px;
`;

const ResultTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: #2456ad;
  line-height: 1.35;
  word-break: keep-all;
`;

const ResultSubtitle = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: #1f2937;
  word-break: keep-all;
`;

const ResultPhone = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  color: #111827;
  word-break: break-word;
`;

const ResultArrow = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #98a2b3;
`;

const SkeletonCard = styled.div`
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  width: 100%;

  div {
    border-radius: 999px;
    background: linear-gradient(90deg, #eef2f8 0%, #f7f9fc 50%, #eef2f8 100%);
    background-size: 200% 100%;
    animation: pulse 1.4s ease-in-out infinite;
  }

  .icon {
    width: 56px;
    height: 56px;
  }

  .content {
    background: transparent;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .title {
    width: 64%;
    height: 24px;
    border-radius: 12px;
  }

  .line {
    width: 100%;
    height: 16px;
    border-radius: 10px;
  }

  .short {
    width: 74%;
  }

  @keyframes pulse {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }
`;

const LoadMoreButton = styled.button`
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 14px 16px;
  background: #eef4ff;
  color: #2f5fb3;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  margin-top: 20px;

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

const EmptyState = styled.div`
  font-size: 14px;
  color: #888;
  text-align: center;
  padding: 24px 0;
`;

const SearchSpacer = styled.div`
  height: 88px;
`;

const FloatingSearchBar = styled.div`
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  z-index: 120;

  @media ${DESKTOP_MEDIA} {
    width: min(calc(100% - 48px), ${DESKTOP_CONTENT_MAX_WIDTH});
  }
`;
