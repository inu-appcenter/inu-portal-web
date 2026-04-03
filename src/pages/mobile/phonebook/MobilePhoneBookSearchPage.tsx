import { Fragment, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Copy,
} from "lucide-react";
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
import PhonebookSectionSelector, {
  PhonebookSectionKey,
} from "@/pages/mobile/phonebook/PhonebookSectionSelector";
import {
  MIN_PHONEBOOK_QUERY_LENGTH,
  PHONEBOOK_MIN_QUERY_MESSAGE,
  PEOPLE_CATEGORY_OPTIONS,
  getCategoryLabel,
  getCategoryValue,
  normalizeExternalUrl,
} from "@/pages/mobile/phonebook/phonebookConfig";
import { CollegeOfficeContact, DirectoryEntry } from "@/types/directory";
import {
  DESKTOP_CONTENT_MAX_WIDTH,
  DESKTOP_MEDIA,
  MOBILE_PAGE_GUTTER,
} from "@/styles/responsive";

const DEFAULT_SECTION: PhonebookSectionKey = "people";
const URL_SPLIT_PATTERN =
  /((?:https?:\/\/|www\.)[^\s]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)/gi;
const URL_MATCH_PATTERN =
  /^((?:https?:\/\/|www\.)[^\s]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)$/i;

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

function splitTrailingPunctuation(value: string) {
  const match = value.match(/^(.*?)([),.!?;:]*)$/);

  if (!match) {
    return { core: value, suffix: "" };
  }

  return {
    core: match[1],
    suffix: match[2] ?? "",
  };
}

const LinkedMultilineText = ({ text }: { text: string }) => {
  const parts = text.split(URL_SPLIT_PATTERN);

  return (
    <RichTextValue>
      {parts.map((part, index) => {
        if (!part) {
          return null;
        }

        const { core, suffix } = splitTrailingPunctuation(part);
        const isUrlLike = URL_MATCH_PATTERN.test(core) && !core.includes("@");

        if (!isUrlLike) {
          return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
        }

        return (
          <Fragment key={`${core}-${index}`}>
            <a
              href={normalizeExternalUrl(core)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {core}
            </a>
            {suffix}
          </Fragment>
        );
      })}
    </RichTextValue>
  );
};

async function copyText(value: string) {
  if (!value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
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
    const nextParams = new URLSearchParams(location.search);
    const nextQuery = inputValue.trim();

    if (nextQuery.length < MIN_PHONEBOOK_QUERY_LENGTH) {
      window.alert(PHONEBOOK_MIN_QUERY_MESSAGE);
      return;
    }

    nextParams.set("query", nextQuery);

    nextParams.delete("section");

    navigate(`${ROUTES.PHONEBOOK.SEARCH}?${nextParams.toString()}`, {
      replace: true,
    });
  };

  const handleSectionSelect = (section: PhonebookSectionKey) => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set("section", section);

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

  const subHeader = useMemo(
    () => (
      <PhonebookSectionSelector
        selectedSection={selectedSection}
        sections={[
          { key: "people", label: "교직원·교수", count: peopleTotal },
          { key: "office", label: "학과사무실", count: officeTotal },
        ]}
        onSelect={handleSectionSelect}
      />
    ),
    [officeTotal, peopleTotal, selectedSection],
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
        <TitleContentArea title="교직원·교수">
          <SectionInner>
            <CategorySelectorPadding>
              <CategorySelectorNew
                categories={PEOPLE_CATEGORY_OPTIONS.map(({ label }) => label)}
                selectedCategory={selectedCategoryLabel}
              />
            </CategorySelectorPadding>

            {!canSearch ? (
              <EmptyState>{PHONEBOOK_MIN_QUERY_MESSAGE}</EmptyState>
            ) : peopleQuery.isLoading ? (
              <CardList>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Box key={`people-skeleton-${index}`}>
                    <SkeletonCard>
                      <div className="chip" />
                      <div className="title" />
                      <div className="line" />
                      <div className="line short" />
                    </SkeletonCard>
                  </Box>
                ))}
              </CardList>
            ) : peopleQuery.isError ? (
              <EmptyState>
                교직원·교수 검색 결과를 불러오는 중 오류가 발생했어요.
              </EmptyState>
            ) : peopleEntries.length === 0 ? (
              <EmptyState>
                조건에 맞는 교직원·교수 검색 결과가 없어요.
              </EmptyState>
            ) : (
              <>
                <CardList>
                  {peopleEntries.map((entry) => (
                    <Box key={`directory-entry-${entry.id}`}>
                      <PersonResultCard entry={entry} />
                    </Box>
                  ))}
                </CardList>
                {peopleQuery.hasNextPage && (
                  <LoadMoreButton
                    type="button"
                    onClick={() => void peopleQuery.fetchNextPage()}
                    disabled={peopleQuery.isFetchingNextPage}
                  >
                    {peopleQuery.isFetchingNextPage
                      ? "교직원·교수 검색 결과를 더 불러오는 중..."
                      : "교직원·교수 검색 결과 더보기"}
                  </LoadMoreButton>
                )}
              </>
            )}
          </SectionInner>
        </TitleContentArea>
      </SectionWrapper>

      <SectionWrapper id="section-office">
        <TitleContentArea title="학과사무실">
          <SectionInner>
            {!canSearch ? (
              <EmptyState>{PHONEBOOK_MIN_QUERY_MESSAGE}</EmptyState>
            ) : officeQuery.isLoading ? (
              <CardList>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Box key={`office-skeleton-${index}`}>
                    <SkeletonCard>
                      <div className="chip" />
                      <div className="title" />
                      <div className="line" />
                      <div className="line short" />
                    </SkeletonCard>
                  </Box>
                ))}
              </CardList>
            ) : officeQuery.isError ? (
              <EmptyState>
                학과사무실 검색 결과를 불러오는 중 오류가 발생했어요.
              </EmptyState>
            ) : officeEntries.length === 0 ? (
              <EmptyState>
                조건에 맞는 학과사무실 검색 결과가 없어요.
              </EmptyState>
            ) : (
              <>
                <CardList>
                  {officeEntries.map((entry) => (
                    <Box key={`college-office-${entry.id}`}>
                      <OfficeResultCard entry={entry} />
                    </Box>
                  ))}
                </CardList>
                {officeQuery.hasNextPage && (
                  <LoadMoreButton
                    type="button"
                    onClick={() => void officeQuery.fetchNextPage()}
                    disabled={officeQuery.isFetchingNextPage}
                  >
                    {officeQuery.isFetchingNextPage
                      ? "학과사무실 검색 결과를 더 불러오는 중..."
                      : "학과사무실 검색 결과 더보기"}
                  </LoadMoreButton>
                )}
              </>
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
          placeholder="이름, 소속, 학과명, 위치, 전화번호를 검색해보세요"
        />
      </FloatingSearchBar>
    </PageWrapper>
  );
};

export default MobilePhoneBookSearchPage;

const PersonResultCard = ({ entry }: { entry: DirectoryEntry }) => {
  const title = entry.name?.trim() || entry.position || entry.detailAffiliation;
  const subtitle = entry.name?.trim()
    ? [entry.position, entry.detailAffiliation || entry.affiliation]
        .filter(Boolean)
        .join(" · ")
    : entry.affiliation;

  return (
    <CardContent>
      <ChipRow>
        <InfoChip>{entry.categoryName}</InfoChip>
        {(entry.detailAffiliation || entry.affiliation) && (
          <MutedChip>{entry.detailAffiliation || entry.affiliation}</MutedChip>
        )}
      </ChipRow>

      <HeaderBlock>
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
      </HeaderBlock>

      <InfoList>
        <InfoRow>
          <span className="label">소속</span>
          <span className="value">{entry.affiliation}</span>
        </InfoRow>
        {entry.duties && (
          <InfoRow>
            <span className="label">담당업무</span>
            <LinkedMultilineText text={entry.duties} />
          </InfoRow>
        )}
        {entry.phoneNumber && (
          <InfoRow>
            <span className="label">전화번호</span>
            <InlineValueGroup>
              <ValueLink href={`tel:${entry.phoneNumber}`}>
                {entry.phoneNumber}
              </ValueLink>
              <CopyIconButton
                type="button"
                aria-label="전화번호 복사"
                onClick={() => void copyText(entry.phoneNumber ?? "")}
              >
                <Copy size={14} />
              </CopyIconButton>
            </InlineValueGroup>
          </InfoRow>
        )}
        {entry.email && (
          <InfoRow>
            <span className="label">이메일</span>
            <InlineValueGroup>
              <ValueLink href={`mailto:${entry.email}`}>{entry.email}</ValueLink>
              <CopyIconButton
                type="button"
                aria-label="이메일 복사"
                onClick={() => void copyText(entry.email ?? "")}
              >
                <Copy size={14} />
              </CopyIconButton>
            </InlineValueGroup>
          </InfoRow>
        )}
        {entry.profileUrl && (
          <InfoRow>
            <span className="label">프로필</span>
            <InlineValueGroup>
              <ValueLink
                href={normalizeExternalUrl(entry.profileUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                상세 페이지
              </ValueLink>
              <CopyIconButton
                type="button"
                aria-label="프로필 링크 복사"
                onClick={() => void copyText(entry.profileUrl ?? "")}
              >
                <Copy size={14} />
              </CopyIconButton>
            </InlineValueGroup>
          </InfoRow>
        )}
      </InfoList>
    </CardContent>
  );
};

const OfficeResultCard = ({ entry }: { entry: CollegeOfficeContact }) => {
  return (
    <CardContent>
      <ChipRow>
        <InfoChip>{entry.collegeName}</InfoChip>
        {entry.collegeLocationSummary && (
          <MutedChip>{entry.collegeLocationSummary}</MutedChip>
        )}
      </ChipRow>

      <HeaderBlock>
        <CardTitle>{entry.departmentName}</CardTitle>
        {entry.officeLocation && (
          <CardSubtitle>{entry.officeLocation}</CardSubtitle>
        )}
      </HeaderBlock>

      <InfoList>
        {entry.officeLocation && (
          <InfoRow>
            <span className="label">위치</span>
            <InlineValueGroup>
              <span className="value">{entry.officeLocation}</span>
              <CopyIconButton
                type="button"
                aria-label="위치 복사"
                onClick={() => void copyText(entry.officeLocation ?? "")}
              >
                <Copy size={14} />
              </CopyIconButton>
            </InlineValueGroup>
          </InfoRow>
        )}
        {entry.homepageUrl && (
          <InfoRow>
            <span className="label">홈페이지</span>
            <InlineValueGroup>
              <ValueLink
                href={normalizeExternalUrl(entry.homepageUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {entry.homepageUrl}
              </ValueLink>
              <CopyIconButton
                type="button"
                aria-label="홈페이지 주소 복사"
                onClick={() => void copyText(entry.homepageUrl ?? "")}
              >
                <Copy size={14} />
              </CopyIconButton>
            </InlineValueGroup>
          </InfoRow>
        )}
        {entry.officePhoneNumber && (
          <InfoRow>
            <span className="label">전화번호</span>
            <InlineValueGroup>
              <ValueLink href={`tel:${entry.officePhoneNumber}`}>
                {entry.officePhoneNumber}
              </ValueLink>
              <CopyIconButton
                type="button"
                aria-label="전화번호 복사"
                onClick={() => void copyText(entry.officePhoneNumber ?? "")}
              >
                <Copy size={14} />
              </CopyIconButton>
            </InlineValueGroup>
          </InfoRow>
        )}
      </InfoList>
    </CardContent>
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
  gap: 12px;

  @media ${DESKTOP_MEDIA} {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const InfoChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef4ff;
  color: #3468c0;
  font-size: 12px;
  font-weight: 700;
`;

const MutedChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #f4f6fb;
  color: #667085;
  font-size: 12px;
  font-weight: 600;
`;

const HeaderBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: #111827;
  line-height: 1.35;
  word-break: keep-all;
`;

const CardSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #667085;
  word-break: keep-all;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RichTextValue = styled.div`
  font-size: 14px;
  color: #1f2937;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;

  a {
    color: #2f5fb3;
    text-decoration: none;
  }
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 10px;
  align-items: flex-start;

  .label {
    font-size: 13px;
    font-weight: 700;
    color: #8a94a6;
  }

  .value {
    font-size: 14px;
    color: #1f2937;
    line-height: 1.5;
    word-break: break-word;
    min-width: 0;
  }

  .multiline {
    white-space: pre-line;
  }
`;

const InlineValueGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-width: 0;
`;

const ValueLink = styled.a`
  display: inline-flex;
  align-items: center;
  color: #2f5fb3;
  text-decoration: none;
  font-size: 14px;
  line-height: 1.5;
  min-width: 0;
  word-break: break-word;
`;

const CopyIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  padding: 0;
  background: #f6f8fc;
  color: #2f5fb3;
  cursor: pointer;
  flex-shrink: 0;
  align-self: center;
`;

const SkeletonCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

  div {
    border-radius: 999px;
    background: linear-gradient(90deg, #eef2f8 0%, #f7f9fc 50%, #eef2f8 100%);
    background-size: 200% 100%;
    animation: pulse 1.4s ease-in-out infinite;
  }

  .chip {
    width: 92px;
    height: 28px;
  }

  .title {
    width: 68%;
    height: 24px;
    border-radius: 12px;
  }

  .line {
    width: 100%;
    height: 16px;
    border-radius: 10px;
  }

  .short {
    width: 72%;
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
