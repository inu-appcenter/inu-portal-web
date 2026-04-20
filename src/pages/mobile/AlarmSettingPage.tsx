import styled from "styled-components";
import { useEffect, useMemo, useState, useCallback } from "react";
import RegisteredKeywordItem from "../../components/desktop/notice/RegisteredKeywordItem.tsx";
import { Keyword } from "@/types/notices";
import {
  createKeyword,
  deleteKeyword,
  getKeywords,
  getKeywordsNotice,
  subscribeDepartment,
  subscribeKeywordsNotice,
} from "@/apis/notices";
import useUserStore from "../../stores/useUserStore.ts";
import findTitleOrCode from "../../utils/findTitleOrCode.ts";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew.tsx";
import { useLocation } from "react-router-dom";
import { NoticeRecommendKeywords } from "@/resources/strings/NoticeRecommendKeywords";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Divider from "@/components/common/Divider";
import React from "react";
import Switch from "@/components/common/Switch";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { getSchoolNoticeCategories } from "@/apis/categories";
import { SOFT_CHIP_SHADOW } from "@/styles/shadows";

import Skeleton from "@/components/common/Skeleton";

const ALARM_TABS = [
  { label: "학교 공지 알리미", value: "school" },
  { label: "학과 공지 알리미", value: "dept" },
];

export default function AlarmSettingPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentTab = params.get("tab") || "school";

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={ALARM_TABS}
        selectedCategory={currentTab}
        queryParam="tab"
      />
    ),
    [currentTab],
  );

  useHeader({
    title: "공지 알리미 설정",
    subHeader: subHeader,
    floatingSubHeader: true,
  });

  return (
    <AlarmSettingPageWrapper>
      {currentTab === "school" ? (
        <MobileSchoolAlarmSetting />
      ) : (
        <MobileDeptAlarmSetting />
      )}
    </AlarmSettingPageWrapper>
  );
}

/**
 * 학교 공지 알리미 설정 컴포넌트
 */
function MobileSchoolAlarmSetting() {
  const [categories, setCategories] = useState<string[]>([]);
  const [subscribedCategories, setSubscribedCategories] = useState<string[]>(
    [],
  );
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedCategoryForKeyword, setSelectedCategoryForKeyword] =
    useState("전체");
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchoolData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catRes, subRes, keyRes] = await Promise.all([
        getSchoolNoticeCategories(),
        getKeywordsNotice(),
        getKeywords(),
      ]);
      setCategories(catRes.data);
      setSubscribedCategories(subRes.data.map((k) => k.category || ""));
      setKeywords(
        keyRes.data.filter(
          (k) => k.type === "SCHOOL_NOTICE" && k.keyword !== null,
        ),
      );
    } catch (error) {
      console.error("학교 공지 알리미 데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchoolData();
  }, [fetchSchoolData]);

  //구독 카테고리 목록 갱신
  const refreshSubscribedCategories = useCallback(async () => {
    try {
      const subRes = await getKeywordsNotice();
      setSubscribedCategories(subRes.data.map((k) => k.category || ""));
    } catch (error) {
      console.error("구독 카테고리 목록 갱신 실패:", error);
    }
  }, []);

  //키워드 목록 갱신
  const refreshKeywords = useCallback(async () => {
    try {
      const keyRes = await getKeywords();
      setKeywords(
        keyRes.data.filter(
          (k) => k.type === "SCHOOL_NOTICE" && k.keyword !== null,
        ),
      );
    } catch (error) {
      console.error("키워드 목록 갱신 실패:", error);
    }
  }, []);

  const handleToggleCategory = async (category: string) => {
    const isSubscribed = subscribedCategories.includes(category);

    if (!isSubscribed) {
      if (
        !window.confirm(
          `${category} 전체 새 글 알림을 켤까요?\n${category} 카테고리 이외에 등록된 키워드는 삭제됩니다!`,
        )
      ) {
        return;
      }
    }

    const nextCategories = isSubscribed
      ? subscribedCategories.filter((c) => c !== category)
      : [...subscribedCategories, category];

    try {
      await subscribeKeywordsNotice(nextCategories);
      setSubscribedCategories(nextCategories);
      refreshKeywords();
    } catch (error) {
      console.error("학교 공지 카테고리 구독 실패:", error);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    try {
      const categoryParam =
        selectedCategoryForKeyword === "전체"
          ? undefined
          : selectedCategoryForKeyword;
      await createKeyword(newKeyword, undefined, categoryParam);
      setNewKeyword("");
      const keyRes = await getKeywords();
      setKeywords(
        keyRes.data.filter(
          (k) => k.type === "SCHOOL_NOTICE" && k.keyword !== null,
        ),
      );

      refreshSubscribedCategories();
    } catch (error) {
      console.error("학교 공지 키워드 등록 실패:", error);
    }
  };

  // 엔터 키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleAddKeyword();
    }
  };

  const handleDeleteKeyword = async (keywordId: number) => {
    if (!window.confirm("키워드를 삭제할까요?")) return;
    try {
      await deleteKeyword(keywordId);
      setKeywords((prev) => prev.filter((k) => k.keywordId !== keywordId));
    } catch (error) {
      console.error("학교 공지 키워드 삭제 실패:", error);
    }
  };

  return (
    <>
      <KeyWordSettingWrapper>
        <TitleContentArea
          description={
            <>
              학교 공지 알리미를 설정해보세요.
              <br />새 글이 올라오면 횃불이가 푸시알림으로 알려드려요.
            </>
          }
        />

        <TitleContentArea
          title={"학교 공지 모두 알림 받기"}
          description={
            "선택한 카테고리의 모든 공지사항 새 글 알림을 받을 수 있어요."
          }
        >
          <Box>
            <ChipContainer>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton
                      key={`cat-skeleton-${i}`}
                      variant="tag"
                      width={60}
                      height={32}
                      style={{ borderRadius: "100px" }}
                    />
                  ))
                : categories.map((cat) => (
                    <SelectableChip
                      key={cat}
                      $selected={subscribedCategories.includes(cat)}
                      onClick={() => handleToggleCategory(cat)}
                    >
                      {cat}
                    </SelectableChip>
                  ))}
            </ChipContainer>
          </Box>
        </TitleContentArea>

        <TitleContentArea
          title={"키워드로 알림 받기"}
          description={
            <>
              특정 카테고리에 키워드 알림을 설정할 수 있어요.
              <br />
              해당 카테고리 전체 알림은 해제됩니다.
            </>
          }
        >
          <Box>
            <Wrapper>
              <HorizontalScrollWrapper>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton
                      key={`select-skeleton-${i}`}
                      variant="tag"
                      width={60}
                      height={32}
                      style={{ borderRadius: "100px" }}
                    />
                  ))
                ) : (
                  <>
                    <SelectableChip
                      $selected={selectedCategoryForKeyword === "전체"}
                      onClick={() => setSelectedCategoryForKeyword("전체")}
                    >
                      전체
                    </SelectableChip>
                    {categories.map((cat) => (
                      <SelectableChip
                        key={`select-${cat}`}
                        $selected={selectedCategoryForKeyword === cat}
                        onClick={() => setSelectedCategoryForKeyword(cat)}
                      >
                        {cat}
                      </SelectableChip>
                    ))}
                  </>
                )}
              </HorizontalScrollWrapper>
              <InputWrapper>
                <StyledInput
                  placeholder={"알림 받을 키워드를 입력해주세요."}
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={handleKeyDown} // 엔터 감지
                />
                <TextButton
                  disabled={!newKeyword.trim()}
                  onClick={handleAddKeyword}
                >
                  등록
                </TextButton>
              </InputWrapper>
            </Wrapper>
          </Box>
        </TitleContentArea>

        {(isLoading || keywords.length > 0) && (
          <TitleContentArea title={"등록된 키워드 목록"}>
            <Box>
              <ListWrapper>
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <React.Fragment key={`key-skeleton-${i}`}>
                        <Skeleton
                          variant="text"
                          width="100%"
                          height={20}
                          style={{ margin: "4px 0" }}
                        />
                        {i < 2 && <Divider margin={"16px 0"} />}
                      </React.Fragment>
                    ))
                  : keywords.map((item, index) => (
                      <React.Fragment key={item.keywordId}>
                        <RegisteredKeywordItem
                          keyword={`${item.keyword}${item.category ? ` (${item.category})` : " (전체)"}`}
                          onDelete={() => handleDeleteKeyword(item.keywordId)}
                        />
                        {index < keywords.length - 1 && (
                          <Divider margin={"16px 0"} />
                        )}
                      </React.Fragment>
                    ))}
              </ListWrapper>
            </Box>
          </TitleContentArea>
        )}
      </KeyWordSettingWrapper>
    </>
  );
}

/**
 * 학과 공지 알리미 설정 컴포넌트 (기존 로직 보정)
 */
function MobileDeptAlarmSetting() {
  const { userInfo } = useUserStore();
  const location = useLocation();

  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [allAlarm, setAllAlarm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const newParams = new URLSearchParams(location.search);
    setKeyword(newParams.get("category") || "");
  }, [location.search]);

  useEffect(() => {
    fetchKeywords();
  }, []);

  useEffect(() => {
    // 학과 전체 알림은 keyword가 null이고 type이 DEPARTMENT인 경우
    setAllAlarm(
      keywords.some((k) => k.type === "DEPARTMENT" && k.keyword === null),
    );
  }, [keywords]);

  const registeredKeywords = useMemo(
    () =>
      keywords.filter(
        (item): item is Keyword & { keyword: string } =>
          item.type === "DEPARTMENT" && item.keyword !== null,
      ),
    [keywords],
  );

  const fetchKeywords = async () => {
    setIsLoading(true);
    try {
      const res = await getKeywords();
      setKeywords(res.data);
    } catch (error) {
      console.error("키워드 목록 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeyword = async () => {
    if (!keyword || allAlarm) return;

    try {
      await createKeyword(keyword, findTitleOrCode(userInfo.department));
      setKeyword("");
      fetchKeywords();
    } catch (error) {
      console.error("키워드 등록 실패:", error);
    }
  };

  // 엔터 키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleAddKeyword();
    }
  };

  const handleDeleteKeyword = async (keywordId: number) => {
    if (!window.confirm("키워드를 삭제할까요?")) {
      return;
    }

    try {
      await deleteKeyword(keywordId);
      fetchKeywords();
    } catch (error) {
      console.error("키워드 삭제 실패:", error);
    }
  };

  const handleToggleAllAlarm = async (checked: boolean) => {
    try {
      if (checked) {
        if (
          !window.confirm(
            "전체 알림을 켤까요?\n기존에 등록한 키워드는 삭제됩니다!",
          )
        ) {
          return;
        }
        // 학과 전체 알림 구독
        await subscribeDepartment([findTitleOrCode(userInfo.department)]);
      } else {
        // 빈 배열 전달로 전체 알림 해제
        await subscribeDepartment([]);
      }

      setAllAlarm(checked);
      fetchKeywords();
    } catch (error) {
      console.error("전체 공지 알림 설정 실패:", error);
    }
  };

  return (
    <>
      <KeyWordSettingWrapper>
        <TitleContentArea
          description={
            <>
              학과 공지 알리미를 설정해보세요.
              <br />새 글이 올라오면 횃불이가 푸시알림으로 알려드려요.
            </>
          }
        />
      </KeyWordSettingWrapper>
      <Box
        style={{
          // 토글 상태에 따른 스타일 분기
          background: allAlarm
            ? "linear-gradient(135deg, #e0eaff 0%, #f0f4ff 100%)"
            : "#f2f2f2", // 무채색 배경
          margin: "0 var(--page-inline)",
          boxShadow: allAlarm
            ? "0 8px 24px rgba(94, 146, 240, 0.15)"
            : "0 8px 24px rgba(0, 0, 0, 0.05)", // 그림자 명도 낮춤
          border: allAlarm
            ? "1px solid rgba(255, 255, 255, 0.5)"
            : "1px solid #e0e0e0", // 테두리 강조
        }}
      >
        <AllAlarmCheckBoxWrapper
          onClick={() => handleToggleAllAlarm(!allAlarm)}
        >
          <div>
            <div className="first-line">학과 공지 모두 알림 받기</div>
            <div className="second-line">
              {isLoading ? (
                <Skeleton width={200} height={14} />
              ) : allAlarm ? (
                <>
                  {
                    keywords.find(
                      (k) => k.type === "DEPARTMENT" && k.keyword === null,
                    )?.department
                  }
                  의 모든 공지사항 푸시알림을 받고 있어요.
                </>
              ) : (
                <>키워드에 상관 없이 모든 새 글 알림을 받을 수 있어요.</>
              )}
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Switch checked={allAlarm} onCheckedChange={handleToggleAllAlarm} />
          </div>
        </AllAlarmCheckBoxWrapper>
      </Box>

      <KeyWordSettingWrapper>
        <TitleContentArea
          title={"키워드로 알림 받기"}
          description={
            allAlarm
              ? "전체 공지 알림이 켜져 있어 키워드 알림 설정을 사용할 수 없어요."
              : undefined
          }
        >
          <Box>
            <Wrapper>
              <InputWrapper>
                <StyledInput
                  placeholder={
                    allAlarm
                      ? "전체 공지 알림 사용 중에는 키워드를 등록할 수 없어요."
                      : "알림 받을 키워드를 입력해주세요."
                  }
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={handleKeyDown} // 엔터 감지
                  disabled={allAlarm}
                />
                <TextButton
                  disabled={!keyword || allAlarm}
                  onClick={handleAddKeyword}
                >
                  등록
                </TextButton>
              </InputWrapper>

              <CategorySelectorDisabledWrapper $disabled={allAlarm}>
                <CategorySelectorNew categories={NoticeRecommendKeywords} />
              </CategorySelectorDisabledWrapper>
            </Wrapper>
          </Box>
        </TitleContentArea>

        {(isLoading || registeredKeywords.length > 0) && (
          <TitleContentArea title={"등록된 키워드 목록"}>
            <Box>
              <ListWrapper>
                {isLoading
                  ? Array.from({ length: 2 }).map((_, i) => (
                      <React.Fragment key={`key-skeleton-${i}`}>
                        <Skeleton
                          variant="text"
                          width="100%"
                          height={20}
                          style={{ margin: "4px 0" }}
                        />
                        {i < 1 && <Divider margin={"16px 0"} />}
                      </React.Fragment>
                    ))
                  : registeredKeywords.map((item, index) => (
                      <React.Fragment key={item.keywordId}>
                        <RegisteredKeywordItem
                          keyword={item.keyword}
                          onDelete={() => handleDeleteKeyword(item.keywordId)}
                        />
                        {index < registeredKeywords.length - 1 && (
                          <Divider margin={"16px 0"} />
                        )}
                      </React.Fragment>
                    ))}
              </ListWrapper>
            </Box>
          </TitleContentArea>
        )}
      </KeyWordSettingWrapper>
    </>
  );
}

const AlarmSettingPageWrapper = styled.div`
  --page-inline: ${MOBILE_PAGE_GUTTER};
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  padding: 16px 0;
  //min-height: 100svh;

  @media ${DESKTOP_MEDIA} {
    --page-inline: 0px;
  }
`;

const AllAlarmCheckBoxWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  gap: 16px;
  word-break: keep-all;

  .first-line {
    color: #1a1a1a;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .second-line {
    color: #666;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const KeyWordSettingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 var(--page-inline);
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  padding: 14px 16px;
  padding-right: 60px;
  box-sizing: border-box;
  background-color: #f8f9fa;

  color: #333;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #5e92f0;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(94, 146, 240, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
    font-weight: 500;
  }

  &:disabled {
    background-color: #f1f3f5;
    color: #adb5bd;
    cursor: not-allowed;
    border-color: #e9ecef;
    box-shadow: none;
  }
`;

const TextButton = styled.button<{ disabled?: boolean }>`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);

  border: none;
  background: none;
  cursor: pointer;

  font-size: 15px;
  font-weight: 700;
  color: ${(props) => (props.disabled ? "#ced4da" : "#5e92f0")};
  transition: color 0.2s ease;

  &:disabled {
    cursor: not-allowed;
  }
`;

const CategorySelectorDisabledWrapper = styled.div<{ $disabled: boolean }>`
  ${({ $disabled }) =>
    $disabled &&
    `
      pointer-events: none;
      opacity: 0.45;
      user-select: none;
      filter: grayscale(0.15);
    `}
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SelectableChip = styled.div<{ $selected: boolean }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: fit-content;
  border-radius: 100px;
  padding: 8px 14px;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 500;
  background: ${({ $selected }) => ($selected ? "#5E92F0" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#F4F4F4" : "#666")};
  box-shadow: ${SOFT_CHIP_SHADOW};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
`;

const HorizontalScrollWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    display: none;
  }
`;
