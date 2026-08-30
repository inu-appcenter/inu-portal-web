import styled, { keyframes } from "styled-components";
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Switch from "@/components/common/Switch";
import Divider from "@/components/common/Divider";
import Skeleton from "@/components/common/Skeleton";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import SwipeChevronGuides from "@/components/mobile/common/SwipeChevronGuides";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import RegisteredKeywordItem from "@/components/desktop/notice/RegisteredKeywordItem";
import { SOFT_CHIP_SHADOW } from "@/styles/shadows";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER, DESKTOP_READING_WIDTH } from "@/styles/responsive";
import { mixpanelTrack, trackPageView, trackEvent } from "@/utils/mixpanel";
import { resetScrollToTop } from "@/utils/scroll";
import {
  DailyBriefSettings,
  ScheduleScope,
} from "@/types/dailyBrief";
import { Keyword } from "@/types/notices";
import {
  getDailyBriefSettings,
  getLocalDailyBriefSettings,
  updateDailyBriefSettings,
} from "@/apis/dailyBrief";
import {
  createKeyword,
  deleteKeyword,
  getKeywords,
  getKeywordsNotice,
  subscribeSchoolDepartment,
  subscribeKeywordsNotice,
} from "@/apis/notices";
import { getSchoolNoticeCategories } from "@/apis/categories";
import { NoticeRecommendKeywords } from "@/resources/strings/NoticeRecommendKeywords";
import { ChevronRight, Loader2, Check, Bell } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export const DAILY_BRIEF_TABS = [
  { label: "시간표", value: "timetable" },
  { label: "학사일정", value: "schedule" },
  { label: "학교 공지", value: "school" },
  { label: "학과 공지", value: "dept" },
];

const PRE_ALERT_PRESETS = [
  { label: "5분 전", value: 5 },
  { label: "10분 전", value: 10 },
  { label: "15분 전", value: 15 },
  { label: "20분 전", value: 20 },
  { label: "30분 전", value: 30 },
  { label: "45분 전", value: 45 },
  { label: "1시간 전", value: 60 },
];

const BASE_TIME_PRESETS = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "12:00",
  "18:00",
  "20:00",
  "22:00",
];

const SCHEDULE_SCOPE_OPTIONS: { label: string; value: ScheduleScope; desc: string }[] = [
  {
    label: "학교 + 학과 모두",
    value: "ALL",
    desc: "학교 전체 학사일정과 내 학과 일정을 모두 받아볼 수 있어요.",
  },
  {
    label: "학교 일정만",
    value: "SCHOOL_ONLY",
    desc: "수강신청, 시험, 등록금 등 학교 공식 학사일정만 받아볼 수 있어요.",
  },
  {
    label: "내 학과 일정만",
    value: "DEPT_ONLY",
    desc: "내 학과 공지사항에 등록된 학과 일정만 받아볼 수 있어요.",
  },
];

export default function MobileDailyBriefSettingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentTab = params.get("tab") || "timetable";

  const { userInfo } = useUserStore();

  const [settings, setSettings] = useState<DailyBriefSettings>(
    getLocalDailyBriefSettings,
  );

  const [swiperRef, setSwiperRef] = useState<SwiperClass | null>(null);
  const [hasSwiped, setHasSwiped] = useState(() => {
    return localStorage.getItem("has_swiped_daily_brief") === "true";
  });

  const currentIndex = useMemo(() => {
    const idx = DAILY_BRIEF_TABS.findIndex((t) => t.value === currentTab);
    return idx === -1 ? 0 : idx;
  }, [currentTab]);

  useEffect(() => {
    if (swiperRef && swiperRef.activeIndex !== currentIndex) {
      swiperRef.slideTo(currentIndex);
    }
  }, [currentIndex, swiperRef]);

  const handleSlideChange = (s: SwiperClass) => {
    const nextTab = DAILY_BRIEF_TABS[s.activeIndex]?.value;

    if (!hasSwiped) {
      setHasSwiped(true);
      localStorage.setItem("has_swiped_daily_brief", "true");
    }

    resetScrollToTop();

    if (nextTab && nextTab !== currentTab) {
      const nextParams = new URLSearchParams(location.search);
      nextParams.set("tab", nextTab);
      navigate(`${location.pathname}?${nextParams.toString()}`, { replace: true });
    }
  };

  // 저장 상태: 'idle' | 'saving' | 'saved'
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const savedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 직접 설정 UI 토글 상태
  const [isCustomPreAlertOpen, setIsCustomPreAlertOpen] = useState(false);
  const [customPreAlertInput, setCustomPreAlertInput] = useState<string>("");
  const [isCustomTtTimeOpen, setIsCustomTtTimeOpen] = useState(false);
  const [isCustomSchedTimeOpen, setIsCustomSchedTimeOpen] = useState(false);

  // 헤더 우측 저장 상태 인디케이터
  const headerRightIndicator = useMemo(() => {
    if (saveStatus === "saving") {
      return (
        <HeaderStatusBadge>
          <SpinIcon>
            <Loader2 size={13} color="#5E92F0" />
          </SpinIcon>
          <span>저장 중...</span>
        </HeaderStatusBadge>
      );
    }
    if (saveStatus === "saved") {
      return (
        <HeaderStatusBadge $saved>
          <Check size={13} color="#34C759" />
          <span>저장됨</span>
        </HeaderStatusBadge>
      );
    }
    return null;
  }, [saveStatus]);

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={DAILY_BRIEF_TABS}
        selectedCategory={currentTab}
        queryParam="tab"
      />
    ),
    [currentTab],
  );

  useHeader({
    title: "Daily Brief 설정",
    hasback: true,
    subHeader: subHeader,
    floatingSubHeader: true,
    rightArea: headerRightIndicator,
    rightAreaNotCircle: true,
  });

  useEffect(() => {
    trackPageView(`Daily Brief 설정 - ${currentTab}`);
    mixpanelTrack.noticeSettingTabSwitched(currentTab);
  }, [currentTab]);

  useEffect(() => {
    let isMounted = true;
    void getDailyBriefSettings().then((res) => {
      if (isMounted && res.data) {
        setSettings(res.data);
      }
    });

    return () => {
      isMounted = false;
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  const handleUpdate = async (patch: Partial<DailyBriefSettings>) => {
    const prevSettings = settings;
    const nextSettings = { ...settings, ...patch };
    // 1. 즉시 UI 선반영 (Optimistic Update)
    setSettings(nextSettings);
    setSaveStatus("saving");

    if (savedTimerRef.current) {
      clearTimeout(savedTimerRef.current);
    }

    try {
      // 2. 서버에 비동기 저장 요청
      await updateDailyBriefSettings(nextSettings);
      // 3. 저장 완료 피드백 표시
      setSaveStatus("saved");
      savedTimerRef.current = setTimeout(() => {
        setSaveStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Daily Brief 설정 저장 실패:", error);
      setSaveStatus("idle");
      alert("설정을 저장하지 못했어요. 네트워크 상태를 확인한 후 다시 시도해 주세요.");
      // 4. 실패 시 이전 설정 상태로 롤백
      setSettings(prevSettings);
    }
  };

  const handlePreAlertMinutesChange = (minutes: number) => {
    setIsCustomPreAlertOpen(false);
    handleUpdate({ timetablePreAlertMinutes: minutes });
    trackEvent("[Daily Brief] 수업 전 알림 시간 변경", { minutes });
  };

  const handleCustomPreAlertSubmit = () => {
    const parsed = parseInt(customPreAlertInput, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 180) {
      alert("알림 시간은 1분에서 180분 사이로 입력해 주세요.");
      return;
    }
    handleUpdate({ timetablePreAlertMinutes: parsed });
    setIsCustomPreAlertOpen(false);
    setCustomPreAlertInput("");
    trackEvent("[Daily Brief] 수업 전 알림 직접 설정", { minutes: parsed });
  };

  const handleScheduleScopeChange = (scope: ScheduleScope) => {
    if (scope === "DEPT_ONLY" && !userInfo.department) {
      if (
        window.confirm(
          "학과 정보가 아직 설정되지 않았어요. 마이페이지에서 학과를 설정할까요?",
        )
      ) {
        navigate(ROUTES.MYPAGE.PROFILE);
        return;
      }
    }
    handleUpdate({ scheduleScope: scope });
    trackEvent("[Daily Brief] 학사일정 범위 변경", { scope });
  };

  const isPreAlertInPresets = PRE_ALERT_PRESETS.some(
    (p) => p.value === settings.timetablePreAlertMinutes,
  );

  return (
    <PageWrapper>
      <ContentContainer>
        <Swiper
          onSwiper={setSwiperRef}
          initialSlide={currentIndex}
          onSlideChange={handleSlideChange}
          speed={320}
          autoHeight={true}
          observer={true}
          observeParents={true}
          style={{ width: "100%" }}
        >
          {/* 슬라이드 1: 시간표 알림 */}
          <SwiperSlide style={{ height: "auto" }}>
            <SlideInnerWrapper>
              <TitleContentArea
                title="시간표 알림"
                description="내 대표 시간표의 강의 시작 전 알림 및 당일 강의 목록 브리핑을 설정할 수 있어요."
              >
                <Box style={{ width: "100%", padding: 0 }}>
                  <SettingRow>
                    <RowContent>
                      <RowTitle>시간표 알림 받기</RowTitle>
                      <RowDescription>
                        강의 시작 전 알림 및 당일 강의 목록 알림을 받아볼 수 있어요.
                      </RowDescription>
                    </RowContent>
                    <SwitchContainer>
                      <Switch
                        checked={settings.timetableAlertEnabled}
                        onCheckedChange={(checked) => {
                          handleUpdate({ timetableAlertEnabled: checked });
                          trackEvent("[Daily Brief] 시간표 알림 토글", { enabled: checked });
                        }}
                      />
                    </SwitchContainer>
                  </SettingRow>

                  {settings.timetableAlertEnabled && (
                    <>
                      <Divider margin="0" />

                      {/* 수업 시작 전 알림 */}
                      <SubOptionBox>
                        <SubOptionHeader>
                          <SubOptionTextWrapper>
                            <SubOptionTitle>수업 시작 전 알림</SubOptionTitle>
                            <SubOptionDesc>
                              강의가 시작되기 전에 푸시 알림으로 미리 받아볼 수 있어요.
                            </SubOptionDesc>
                          </SubOptionTextWrapper>
                          <Switch
                            checked={settings.timetablePreAlertEnabled}
                            onCheckedChange={(checked) => {
                              handleUpdate({ timetablePreAlertEnabled: checked });
                              trackEvent("[Daily Brief] 수업 전 알림 토글", { enabled: checked });
                            }}
                          />
                        </SubOptionHeader>

                        {settings.timetablePreAlertEnabled && (
                          <>
                            <ChipGroup>
                              {PRE_ALERT_PRESETS.map((opt) => (
                                <SelectableChip
                                  key={opt.value}
                                  $selected={!isCustomPreAlertOpen && settings.timetablePreAlertMinutes === opt.value}
                                  onClick={() => handlePreAlertMinutesChange(opt.value)}
                                >
                                  {opt.label}
                                </SelectableChip>
                              ))}
                              <SelectableChip
                                $selected={isCustomPreAlertOpen || !isPreAlertInPresets}
                                onClick={() => {
                                  setIsCustomPreAlertOpen(true);
                                  setCustomPreAlertInput(String(settings.timetablePreAlertMinutes));
                                }}
                              >
                                {!isPreAlertInPresets ? `${settings.timetablePreAlertMinutes}분 전 (직접 설정)` : "직접 설정"}
                              </SelectableChip>
                            </ChipGroup>

                            {isCustomPreAlertOpen && (
                              <CustomInputRow>
                                <StyledNumberInput
                                  type="number"
                                  min={1}
                                  max={180}
                                  placeholder="분 입력 (예: 25)"
                                  value={customPreAlertInput}
                                  onChange={(e) => setCustomPreAlertInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCustomPreAlertSubmit();
                                  }}
                                />
                                <InputUnitLabel>분 전</InputUnitLabel>
                                <ApplyButton onClick={handleCustomPreAlertSubmit}>적용</ApplyButton>
                                <CancelButton onClick={() => setIsCustomPreAlertOpen(false)}>취소</CancelButton>
                              </CustomInputRow>
                            )}
                          </>
                        )}
                      </SubOptionBox>

                      <Divider margin="0" />

                      {/* 당일 강의 목록 브리핑 */}
                      <SubOptionBox>
                        <SubOptionHeader>
                          <SubOptionTextWrapper>
                            <SubOptionTitle>당일 강의 목록 브리핑</SubOptionTitle>
                            <SubOptionDesc>
                              지정한 시간에 오늘 수강할 강의 목록을 한 번에 정리해서 받아볼 수 있어요.
                            </SubOptionDesc>
                          </SubOptionTextWrapper>
                          <Switch
                            checked={settings.timetableDailyBriefEnabled}
                            onCheckedChange={(checked) => {
                              handleUpdate({ timetableDailyBriefEnabled: checked });
                              trackEvent("[Daily Brief] 당일 강의 목록 알림 토글", { enabled: checked });
                            }}
                          />
                        </SubOptionHeader>

                        {settings.timetableDailyBriefEnabled && (
                          <TimeOptionContainer>
                            <TimeSelectRow>
                              <TimeSelectLabel>알림 수신 시간</TimeSelectLabel>
                              <StyledSelect
                                value={isCustomTtTimeOpen || !BASE_TIME_PRESETS.includes(settings.timetableDailyBriefTime) ? "CUSTOM" : settings.timetableDailyBriefTime}
                                onChange={(e) => {
                                  if (e.target.value === "CUSTOM") {
                                    setIsCustomTtTimeOpen(true);
                                    return;
                                  }
                                  setIsCustomTtTimeOpen(false);
                                  handleUpdate({ timetableDailyBriefTime: e.target.value });
                                  trackEvent("[Daily Brief] 강의 목록 수신 시간 변경", {
                                    time: e.target.value,
                                  });
                                }}
                              >
                                {BASE_TIME_PRESETS.map((time) => (
                                  <option key={`tt-${time}`} value={time}>
                                    {time}
                                  </option>
                                ))}
                                {!BASE_TIME_PRESETS.includes(settings.timetableDailyBriefTime) && (
                                  <option value="CUSTOM">
                                    {settings.timetableDailyBriefTime} (직접 설정)
                                  </option>
                                )}
                                {BASE_TIME_PRESETS.includes(settings.timetableDailyBriefTime) && (
                                  <option value="CUSTOM">직접 설정...</option>
                                )}
                              </StyledSelect>
                            </TimeSelectRow>

                            {(isCustomTtTimeOpen || !BASE_TIME_PRESETS.includes(settings.timetableDailyBriefTime)) && (
                              <CustomTimePickerRow>
                                <TimePickerLabel>시간 직접 지정:</TimePickerLabel>
                                <StyledTimeInput
                                  type="time"
                                  value={settings.timetableDailyBriefTime}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleUpdate({ timetableDailyBriefTime: e.target.value });
                                      trackEvent("[Daily Brief] 강의 목록 시간 직접 입력", {
                                        time: e.target.value,
                                      });
                                    }
                                  }}
                                />
                              </CustomTimePickerRow>
                            )}
                          </TimeOptionContainer>
                        )}
                      </SubOptionBox>
                    </>
                  )}
                </Box>
              </TitleContentArea>

              <RightActionRow>
                <SmallLinkButton
                  onClick={() => {
                    mixpanelTrack.mypageMenuClicked("Daily Brief - 시간표 바로가기");
                    navigate(ROUTES.TIMETABLE.ROOT);
                  }}
                >
                  <span>시간표로 이동</span>
                  <ChevronRight size={13} />
                </SmallLinkButton>
              </RightActionRow>

              {/* 시간표 알림 예시 */}
              <PreviewSectionWrapper>
                <PreviewSectionLabel>알림 예시</PreviewSectionLabel>
                <NotificationPreviewList>
                  <PushNotificationPreviewCard
                    title={`${(settings.timetablePreAlertMinutes || 10) >= 60 && (settings.timetablePreAlertMinutes || 10) % 60 === 0 ? `${(settings.timetablePreAlertMinutes || 10) / 60}시간` : (settings.timetablePreAlertMinutes || 10) >= 60 ? `${Math.floor((settings.timetablePreAlertMinutes || 10) / 60)}시간 ${(settings.timetablePreAlertMinutes || 10) % 60}분` : `${settings.timetablePreAlertMinutes || 10}분`} 후 수업이 시작돼요.`}
                    body="운영체제 (10:00~11:50, 7호관 301호)"
                  />
                  <PushNotificationPreviewCard
                    title="[Daily Brief] 오늘 예정된 강의가 3개 있어요 📚"
                    body={`1. 운영체제 (10:00~11:50, 7호관 301호)\n2. 알고리즘 (13:00~14:50, 7호관 204호)\n3. 데이터베이스 (15:00~16:50, 7호관 301호)`}
                  />
                </NotificationPreviewList>
              </PreviewSectionWrapper>
            </SlideInnerWrapper>
          </SwiperSlide>

          {/* 슬라이드 2: 학사일정 알림 */}
          <SwiperSlide style={{ height: "auto" }}>
            <SlideInnerWrapper>
              <TitleContentArea
                title="학사일정 알림"
                description="학교 공식 학사일정 및 학과 공지사항에 등록된 일정을 브리핑으로 받아볼 수 있어요."
              >
                <Box style={{ width: "100%", padding: 0 }}>
                  <SettingRow>
                    <RowContent>
                      <RowTitle>학사일정 브리핑 받기</RowTitle>
                      <RowDescription>
                        오늘에 해당하는 학사 및 학과 일정을 지정된 시간에 묶어서 받아볼 수 있어요.
                      </RowDescription>
                    </RowContent>
                    <SwitchContainer>
                      <Switch
                        checked={settings.scheduleAlertEnabled}
                        onCheckedChange={(checked) => {
                          handleUpdate({ scheduleAlertEnabled: checked });
                          trackEvent("[Daily Brief] 학사일정 알림 토글", { enabled: checked });
                        }}
                      />
                    </SwitchContainer>
                  </SettingRow>

                  {settings.scheduleAlertEnabled && (
                    <>
                      <Divider margin="0" />

                      {/* 학사일정 브리핑 시간 */}
                      <SubOptionBox>
                        <TimeOptionContainer>
                          <TimeSelectRow>
                            <SubOptionTextWrapper>
                              <SubOptionTitle>브리핑 수신 시간</SubOptionTitle>
                              <SubOptionDesc>
                                매일 해당 시각에 오늘의 일정이 있을 때만 알림을 받아볼 수 있어요.
                              </SubOptionDesc>
                            </SubOptionTextWrapper>
                            <StyledSelect
                              value={isCustomSchedTimeOpen || !BASE_TIME_PRESETS.includes(settings.scheduleDailyBriefTime) ? "CUSTOM" : settings.scheduleDailyBriefTime}
                              onChange={(e) => {
                                if (e.target.value === "CUSTOM") {
                                  setIsCustomSchedTimeOpen(true);
                                  return;
                                }
                                setIsCustomSchedTimeOpen(false);
                                handleUpdate({ scheduleDailyBriefTime: e.target.value });
                                trackEvent("[Daily Brief] 학사일정 수신 시간 변경", {
                                  time: e.target.value,
                                });
                              }}
                            >
                              {BASE_TIME_PRESETS.map((time) => (
                                <option key={`sched-${time}`} value={time}>
                                  {time}
                                </option>
                              ))}
                              {!BASE_TIME_PRESETS.includes(settings.scheduleDailyBriefTime) && (
                                <option value="CUSTOM">
                                  {settings.scheduleDailyBriefTime} (직접 설정)
                                </option>
                              )}
                              {BASE_TIME_PRESETS.includes(settings.scheduleDailyBriefTime) && (
                                <option value="CUSTOM">직접 설정...</option>
                              )}
                            </StyledSelect>
                          </TimeSelectRow>

                          {(isCustomSchedTimeOpen || !BASE_TIME_PRESETS.includes(settings.scheduleDailyBriefTime)) && (
                            <CustomTimePickerRow>
                              <TimePickerLabel>시간 직접 지정:</TimePickerLabel>
                              <StyledTimeInput
                                type="time"
                                value={settings.scheduleDailyBriefTime}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleUpdate({ scheduleDailyBriefTime: e.target.value });
                                    trackEvent("[Daily Brief] 학사일정 시간 직접 입력", {
                                      time: e.target.value,
                                    });
                                  }
                                }}
                              />
                            </CustomTimePickerRow>
                          )}
                        </TimeOptionContainer>
                      </SubOptionBox>

                      <Divider margin="0" />

                      {/* 알림 수신 대상 범위 */}
                      <SubOptionBox>
                        <SubOptionTextWrapper style={{ marginBottom: "12px" }}>
                          <SubOptionTitle>알림 수신 대상 범위</SubOptionTitle>
                          <SubOptionDesc>
                            받고 싶은 일정의 종류를 선택할 수 있어요.
                          </SubOptionDesc>
                        </SubOptionTextWrapper>

                        <ScopeOptionList>
                          {SCHEDULE_SCOPE_OPTIONS.map((opt) => (
                            <ScopeOptionCard
                              key={opt.value}
                              $selected={settings.scheduleScope === opt.value}
                              onClick={() => handleScheduleScopeChange(opt.value)}
                            >
                              <RadioCircle $selected={settings.scheduleScope === opt.value} />
                              <ScopeTextWrapper>
                                <ScopeLabel $selected={settings.scheduleScope === opt.value}>
                                  {opt.label}
                                </ScopeLabel>
                                <ScopeDesc>{opt.desc}</ScopeDesc>
                              </ScopeTextWrapper>
                            </ScopeOptionCard>
                          ))}
                        </ScopeOptionList>

                        {!userInfo.department && (
                          <DeptWarningRow onClick={() => navigate(ROUTES.MYPAGE.PROFILE)}>
                            <DeptWarningText>
                              학과 정보가 미등록 상태예요. 학과를 설정하면 학과 일정 알림을 받아볼 수 있어요.
                            </DeptWarningText>
                            <ChevronRight size={16} color="#8E8E93" />
                          </DeptWarningRow>
                        )}
                      </SubOptionBox>
                    </>
                  )}
                </Box>
              </TitleContentArea>

              <RightActionRow>
                <SmallLinkButton
                  onClick={() => {
                    mixpanelTrack.mypageMenuClicked("Daily Brief - 학사일정 바로가기");
                    navigate(ROUTES.BOARD.CALENDAR);
                  }}
                >
                  <span>학사일정으로 이동</span>
                  <ChevronRight size={13} />
                </SmallLinkButton>
              </RightActionRow>

              {/* 학사일정 알림 예시 */}
              <PreviewSectionWrapper>
                <PreviewSectionLabel>알림 예시</PreviewSectionLabel>
                <NotificationPreviewList>
                  <PushNotificationPreviewCard
                    title="[Daily Brief] 오늘의 학사일정을 확인하세요 🗓️"
                    body={`• [학교] 2026학년도 2학기 수강신청 변경 기간\n• [${userInfo.department || "컴퓨터공학부"}] 2학기 졸업작품 중간 발표회`}
                  />
                </NotificationPreviewList>
              </PreviewSectionWrapper>
            </SlideInnerWrapper>
          </SwiperSlide>

          {/* 슬라이드 3: 학교 공지 알리미 */}
          <SwiperSlide style={{ height: "auto" }}>
            <SlideInnerWrapper>
              <MobileSchoolAlarmSetting location="Daily Brief Page" />
            </SlideInnerWrapper>
          </SwiperSlide>

          {/* 슬라이드 4: 학과 공지 알리미 */}
          <SwiperSlide style={{ height: "auto" }}>
            <SlideInnerWrapper>
              <MobileDeptAlarmSetting location="Daily Brief Page" />
            </SlideInnerWrapper>
          </SwiperSlide>
        </Swiper>

        <SwipeChevronGuides
          hasSwiped={hasSwiped}
          currentIndex={currentIndex}
          totalSlides={DAILY_BRIEF_TABS.length}
        />
      </ContentContainer>
    </PageWrapper>
  );
}

/**
 * 학교 공지 알리미 컴포넌트
 */
export function MobileSchoolAlarmSetting({
  location = "Daily Brief Page",
}: {
  location?: string;
}) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [subscribedCategories, setSubscribedCategories] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedCategoryForKeyword, setSelectedCategoryForKeyword] = useState("전체");
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

  const handleToggleCategory = async (category: string) => {
    const isSubscribed = subscribedCategories.includes(category);
    const nextCategories = isSubscribed
      ? subscribedCategories.filter((c) => c !== category)
      : [...subscribedCategories, category];

    try {
      await subscribeKeywordsNotice(nextCategories);
      setSubscribedCategories(nextCategories);
      mixpanelTrack.noticeCategoryToggled(category, !isSubscribed, location);
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
      mixpanelTrack.noticeKeywordAdded(
        "School",
        newKeyword,
        selectedCategoryForKeyword,
        location,
      );
      setNewKeyword("");
      const keyRes = await getKeywords();
      setKeywords(
        keyRes.data.filter(
          (k) => k.type === "SCHOOL_NOTICE" && k.keyword !== null,
        ),
      );
    } catch (error) {
      console.error("학교 공지 키워드 등록 실패:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleAddKeyword();
    }
  };

  const handleDeleteKeyword = async (keywordId: number) => {
    const targetKeyword = keywords.find((k) => k.keywordId === keywordId);
    if (!window.confirm("키워드를 삭제할까요?")) return;
    try {
      await deleteKeyword(keywordId);
      if (targetKeyword) {
        mixpanelTrack.noticeKeywordDeleted(
          "School",
          targetKeyword.keyword || "",
          targetKeyword.category || "전체",
          location,
        );
      }
      setKeywords((prev) => prev.filter((k) => k.keywordId !== keywordId));
    } catch (error) {
      console.error("학교 공지 키워드 삭제 실패:", error);
    }
  };

  return (
    <KeyWordSettingWrapper>
      <TitleContentArea
        description="학교 공지 알리미를 설정해보세요. 새 글이 올라오면 푸시알림으로 받아볼 수 있어요."
      />

      <TitleContentArea
        title="학교 공지 모두 알림 받기"
        description={
          subscribedCategories.length > 0
            ? `${subscribedCategories.length}개 카테고리에서 전체 새 글 알림을 받고 있어요.`
            : "원하는 카테고리의 모든 새 글 알림을 설정해보세요."
        }
      >
        <Box style={{ padding: "16px 20px" }}>
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
        title="키워드로 알림 받기"
        description="원하는 카테고리에 키워드 알림을 설정해보세요."
      >
        <Box style={{ padding: "16px 20px" }}>
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
                placeholder="알림 받을 키워드를 입력해주세요."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
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
        <TitleContentArea
          description={`${keywords.length}개 키워드로 알림을 받고 있어요.`}
        >
          <Box style={{ padding: "16px 20px" }}>
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
                    {i < 2 && <Divider margin="16px 0" />}
                  </React.Fragment>
                ))
                : keywords.map((item, index) => (
                  <React.Fragment key={item.keywordId}>
                    <RegisteredKeywordItem
                      keyword={`${item.keyword}${item.category ? ` (${item.category})` : " (전체)"}`}
                      onDelete={() => handleDeleteKeyword(item.keywordId)}
                    />
                    {index < keywords.length - 1 && (
                      <Divider margin="16px 0" />
                    )}
                  </React.Fragment>
                ))}
            </ListWrapper>
          </Box>
        </TitleContentArea>
      )}

      <RightActionRow>
        <SmallLinkButton
          onClick={() => {
            mixpanelTrack.mypageMenuClicked("Daily Brief - 학교 공지 바로가기");
            navigate(ROUTES.BOARD.NOTICE);
          }}
        >
          <span>학교 공지사항으로 이동</span>
          <ChevronRight size={13} />
        </SmallLinkButton>
      </RightActionRow>

      {/* 학교 공지 알림 예시 */}
      <PreviewSectionWrapper>
        <PreviewSectionLabel>알림 예시</PreviewSectionLabel>
        <NotificationPreviewList>
          <PushNotificationPreviewCard
            title="[학사-장학금] 새로운 공지사항이에요."
            body="2026학년도 2학기 성적우수 및 맞춤형 장학금 신청 안내"
          />
          <PushNotificationPreviewCard
            title="[학사] 새로운 공지사항이에요."
            body="2026학년도 2학기 전공 심화 및 부·복수전공 이수 신청 안내"
          />
        </NotificationPreviewList>
      </PreviewSectionWrapper>
    </KeyWordSettingWrapper>
  );
}

/**
 * 학과 공지 알리미 컴포넌트
 */
export function MobileDeptAlarmSetting({
  location = "Daily Brief Page",
}: {
  location?: string;
}) {
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const locationPath = useLocation();

  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [allAlarm, setAllAlarm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const newParams = new URLSearchParams(locationPath.search);
    setKeyword(newParams.get("category") || "");
  }, [locationPath.search]);

  useEffect(() => {
    fetchKeywords();
  }, []);

  useEffect(() => {
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
    if (!keyword) return;

    try {
      await createKeyword(keyword, userInfo.departmentCode);
      mixpanelTrack.noticeKeywordAdded(
        "Department",
        keyword,
        userInfo.department,
        location,
      );
      setKeyword("");
      fetchKeywords();
    } catch (error) {
      console.error("키워드 등록 실패:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleAddKeyword();
    }
  };

  const handleDeleteKeyword = async (keywordId: number) => {
    const targetKeyword = keywords.find((k) => k.keywordId === keywordId);
    if (!window.confirm("키워드를 삭제할까요?")) {
      return;
    }

    try {
      await deleteKeyword(keywordId);
      if (targetKeyword) {
        mixpanelTrack.noticeKeywordDeleted(
          "Department",
          targetKeyword.keyword || "",
          userInfo.department,
          location,
        );
      }
      fetchKeywords();
    } catch (error) {
      console.error("키워드 삭제 실패:", error);
    }
  };

  const handleToggleAllAlarm = async (checked: boolean) => {
    try {
      if (checked) {
        await subscribeSchoolDepartment([userInfo.departmentCode]);
        fetchKeywords();
      } else {
        await subscribeSchoolDepartment([]);
      }

      setAllAlarm(checked);
      mixpanelTrack.noticeAllToggled(userInfo.department, checked, location);
    } catch (error) {
      console.error("전체 공지 알림 설정 실패:", error);
    }
  };

  return (
    <KeyWordSettingWrapper>
      <TitleContentArea
        description="학과 공지 알리미를 설정해보세요. 새 글이 올라오면 푸시알림으로 받아볼 수 있어요."
      />

      <Box
        style={{
          background: allAlarm
            ? "linear-gradient(135deg, #e0eaff 0%, #f0f4ff 100%)"
            : "#ffffff",
          boxShadow: allAlarm
            ? "0 8px 24px rgba(94, 146, 240, 0.15)"
            : SOFT_CHIP_SHADOW,
          border: allAlarm
            ? "1px solid rgba(94, 146, 240, 0.3)"
            : "1px solid #e9ecef",
          padding: "18px 20px",
          borderRadius: "12px",
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
                <>키워드에 상관 없이 모든 새 글 알림을 받아보세요.</>
              )}
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Switch checked={allAlarm} onCheckedChange={handleToggleAllAlarm} />
          </div>
        </AllAlarmCheckBoxWrapper>
      </Box>

      <TitleContentArea title="키워드로 알림 받기">
        <Box style={{ padding: "16px 20px" }}>
          <Wrapper>
            <InputWrapper>
              <StyledInput
                placeholder="알림 받을 키워드를 입력해주세요."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <TextButton disabled={!keyword} onClick={handleAddKeyword}>
                등록
              </TextButton>
            </InputWrapper>

            <CategorySelectorNew categories={NoticeRecommendKeywords} />
          </Wrapper>
        </Box>
      </TitleContentArea>

      {(isLoading || registeredKeywords.length > 0) && (
        <TitleContentArea
          description={`${registeredKeywords.length}개 키워드로 알림을 받고 있어요.`}
        >
          <Box style={{ padding: "16px 20px" }}>
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
                    {i < 1 && <Divider margin="16px 0" />}
                  </React.Fragment>
                ))
                : registeredKeywords.map((item, index) => (
                  <React.Fragment key={item.keywordId}>
                    <RegisteredKeywordItem
                      keyword={item.keyword}
                      onDelete={() => handleDeleteKeyword(item.keywordId)}
                    />
                    {index < registeredKeywords.length - 1 && (
                      <Divider margin="16px 0" />
                    )}
                  </React.Fragment>
                ))}
            </ListWrapper>
          </Box>
        </TitleContentArea>
      )}

      <RightActionRow>
        <SmallLinkButton
          onClick={() => {
            mixpanelTrack.mypageMenuClicked("Daily Brief - 학과 공지 바로가기");
            navigate(ROUTES.BOARD.DEPT_NOTICE);
          }}
        >
          <span>학과 공지사항으로 이동</span>
          <ChevronRight size={13} />
        </SmallLinkButton>
      </RightActionRow>

      {/* 학과 공지 알림 예시 */}
      <PreviewSectionWrapper>
        <PreviewSectionLabel>알림 예시</PreviewSectionLabel>
        <NotificationPreviewList>
          <PushNotificationPreviewCard
            title={`[${userInfo.department || "컴퓨터공학부"}-졸업] 새로운 공지사항이에요.`}
            body={`2026학년도 2학기 졸업작품 중간 발표회 일정 안내\n[횃불이 AI] 일정 1개를 캘린더에서 확인해보세요.`}
          />
          <PushNotificationPreviewCard
            title={`[${userInfo.department || "컴퓨터공학부"}] 새로운 공지사항이에요.`}
            body="2026-2학기 학과 세미나 및 특강 참여 신청 안내"
          />
        </NotificationPreviewList>
      </PreviewSectionWrapper>
    </KeyWordSettingWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 16px ${MOBILE_PAGE_GUTTER} 60px;
  box-sizing: border-box;
`;

const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;

  .swiper-autoheight {
    transition: height 0ms !important;
  }

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_READING_WIDTH});
    margin: 0 auto;
  }
`;

const SlideInnerWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  width: 100%;
  box-sizing: border-box;
  background-color: #ffffff;
`;

const RowContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  padding-right: 16px;
`;

const RowTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1e;
`;

const RowDescription = styled.div`
  font-size: 13px;
  color: #8e8e93;
  line-height: 1.4;
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const SubOptionBox = styled.div`
  width: 100%;
  padding: 18px 20px;
  background-color: #fafbfc;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SubOptionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
`;

const SubOptionTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const SubOptionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
`;

const SubOptionDesc = styled.div`
  font-size: 12.5px;
  color: #8e8e93;
  line-height: 1.4;
`;

const ChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 8px;
  margin-top: 4px;
`;

const SelectableChip = styled.button<{ $selected: boolean }>`
  border-radius: 100px;
  padding: 8px 16px;
  font-size: 13.5px;
  font-weight: 500;
  background: ${({ $selected }) => ($selected ? "#5E92F0" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#F4F4F4" : "#666")};
  box-shadow: ${SOFT_CHIP_SHADOW};
  border: 1px solid ${({ $selected }) => ($selected ? "#5E92F0" : "#e9ecef")};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.97);
  }
`;

const CustomInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  width: 100%;
  box-sizing: border-box;
`;

const StyledNumberInput = styled.input`
  width: 120px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  background-color: #fff;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #5e92f0;
  }
`;

const InputUnitLabel = styled.span`
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
`;

const ApplyButton = styled.button`
  border: none;
  background-color: #5e92f0;
  color: #fff;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #4b7fd9;
  }
`;

const CancelButton = styled.button`
  border: 1px solid #e0e0e0;
  background-color: #fff;
  color: #666;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
`;

const TimeOptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`;

const TimeSelectRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
`;

const TimeSelectLabel = styled.div`
  font-size: 14.5px;
  color: #2c3e50;
  font-weight: 600;
`;

const CustomTimePickerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
  padding-top: 4px;
  box-sizing: border-box;
`;

const TimePickerLabel = styled.span`
  font-size: 13px;
  color: #666;
  font-weight: 500;
`;

const StyledTimeInput = styled.input`
  border-radius: 8px;
  border: 1px solid #5e92f0;
  padding: 7px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  background-color: #fff;
  outline: none;
  cursor: pointer;
  box-shadow: ${SOFT_CHIP_SHADOW};

  &:focus {
    border-color: #5e92f0;
    box-shadow: 0 0 0 2px rgba(94, 146, 240, 0.2);
  }
`;

const StyledSelect = styled.select`
  appearance: none;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px 32px 8px 14px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  outline: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
  box-shadow: ${SOFT_CHIP_SHADOW};
  flex-shrink: 0;

  &:focus {
    border-color: #5E92F0;
  }
`;

const ScopeOptionList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
`;

const ScopeOptionCard = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid ${({ $selected }) => ($selected ? "#5E92F0" : "#e9ecef")};
  background-color: ${({ $selected }) => ($selected ? "#f4f8ff" : "#ffffff")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    background-color: #eef5ff;
  }
`;

const RadioCircle = styled.div<{ $selected: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${({ $selected }) => ($selected ? "#5E92F0" : "#cbd5e0")};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  flex-shrink: 0;

  &::after {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #5E92F0;
    display: ${({ $selected }) => ($selected ? "block" : "none")};
  }
`;

const ScopeTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const ScopeLabel = styled.div<{ $selected: boolean }>`
  font-size: 14.5px;
  font-weight: 600;
  color: ${({ $selected }) => ($selected ? "#5E92F0" : "#1c1c1e")};
`;

const ScopeDesc = styled.div`
  font-size: 12px;
  color: #718096;
  line-height: 1.35;
`;

const DeptWarningRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-top: 4px;
  cursor: pointer;

  &:active {
    background-color: #f1f3f5;
  }
`;

const DeptWarningText = styled.span`
  font-size: 12.5px;
  color: #666;
  line-height: 1.4;
  flex: 1;
  padding-right: 8px;
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${rotate} 1s linear infinite;
`;

const HeaderStatusBadge = styled.div<{ $saved?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 100px;
  background-color: ${({ $saved }) => ($saved ? "#e8f9ee" : "#edf4ff")};
  color: ${({ $saved }) => ($saved ? "#2b8a3e" : "#5e92f0")};
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;
`;

const KeyWordSettingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
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

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
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
    font-size: 17px;
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

/**
 * 우측 하단 소형 바로가기 링크 버튼
 */
const RightActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: -12px;
  margin-bottom: 2px;
`;

const SmallLinkButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  background: none;
  border: none;
  color: #5e92f0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    background-color: rgba(94, 146, 240, 0.08);
  }

  &:active {
    background-color: rgba(94, 146, 240, 0.15);
  }
`;

/**
 * 모바일 OS 푸시 알림 배너 프리뷰 컴포넌트 (그림자 제거, 실제 알림 양식)
 */
export function PushNotificationPreviewCard({
  title,
  body,
  time = "지금",
}: {
  title: string;
  body: string;
  time?: string;
}) {
  return (
    <OsNotificationBanner>
      <OsHeader>
        <OsAppIconWrapper>
          <Bell size={10} color="#ffffff" />
        </OsAppIconWrapper>
        <OsAppName>INTIP</OsAppName>
        <OsTimeText>{time}</OsTimeText>
      </OsHeader>
      <OsTitle>{title}</OsTitle>
      <OsBody>{body}</OsBody>
    </OsNotificationBanner>
  );
}

const PreviewSectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const PreviewSectionLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #8e8e93;
  margin-left: 2px;
`;

const NotificationPreviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const OsNotificationBanner = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e9ecef;
  gap: 3px;
`;

const OsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin-bottom: 2px;
`;

const OsAppIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: #5e92f0;
  flex-shrink: 0;
`;

const OsAppName = styled.span`
  font-size: 11.5px;
  font-weight: 600;
  color: #4b5563;
  flex: 1;
  letter-spacing: -0.2px;
`;

const OsTimeText = styled.span`
  font-size: 11px;
  color: #9ca3af;
`;

const OsTitle = styled.div`
  font-size: 13.5px;
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
  letter-spacing: -0.2px;
`;

const OsBody = styled.div`
  font-size: 12.5px;
  color: #374151;
  line-height: 1.45;
  white-space: pre-line;
  letter-spacing: -0.1px;
`;
