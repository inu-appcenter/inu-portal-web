import styled, { keyframes } from "styled-components";
import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import Switch from "@/components/common/Switch";
import Divider from "@/components/common/Divider";
import { SOFT_CHIP_SHADOW } from "@/styles/shadows";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER, DESKTOP_READING_WIDTH } from "@/styles/responsive";
import { trackPageView, trackEvent } from "@/utils/mixpanel";
import {
  DailyBriefSettings,
  ScheduleScope,
} from "@/types/dailyBrief";
import {
  getDailyBriefSettings,
  getLocalDailyBriefSettings,
  updateDailyBriefSettings,
} from "@/apis/dailyBrief";
import { ChevronRight, Loader2, Check } from "lucide-react";
import { ROUTES } from "@/constants/routes";

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
  const [searchParams] = useSearchParams();
  const targetTab = searchParams.get("tab");
  const { userInfo } = useUserStore();

  const [settings, setSettings] = useState<DailyBriefSettings>(
    getLocalDailyBriefSettings,
  );

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

  useHeader({
    title: "Daily Brief 설정",
    hasback: true,
    rightArea: headerRightIndicator,
    rightAreaNotCircle: true,
  });

  useEffect(() => {
    trackPageView("Daily Brief 설정");

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

  // tab 쿼리 파라미터가 있는 경우 해당 섹션으로 부드럽게 스크롤
  useEffect(() => {
    if (targetTab === "schedule") {
      const el = document.getElementById("section-schedule");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else if (targetTab === "timetable") {
      const el = document.getElementById("section-timetable");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [targetTab]);

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
        {/* 1. 시간표 알림 섹션 */}
        <div id="section-timetable" style={{ width: "100%" }}>
          <TitleContentArea
            title="시간표 알림"
            description="내 대표 시간표의 강의 시작 전 알림 및 당일 강의 목록 브리핑을 설정할 수 있어요."
          >
            <Box style={{ width: "100%", padding: 0 }}>
              {/* 전체 시간표 알림 토글 */}
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
        </div>

        {/* 2. 학사일정 알림 섹션 */}
        <div id="section-schedule" style={{ width: "100%" }}>
          <TitleContentArea
            title="학사일정 알림"
            description="학교 공식 학사일정 및 학과 공지사항에 등록된 일정을 브리핑으로 받아볼 수 있어요."
          >
            <Box style={{ width: "100%", padding: 0 }}>
              {/* 전체 학사일정 알림 토글 */}
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
        </div>
      </ContentContainer>
    </PageWrapper>
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

  @media ${DESKTOP_MEDIA} {
    width: min(100%, ${DESKTOP_READING_WIDTH});
    margin: 0 auto;
  }
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
