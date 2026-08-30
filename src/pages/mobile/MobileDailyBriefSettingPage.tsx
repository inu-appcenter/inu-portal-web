import styled from "styled-components";
import { useEffect, useState } from "react";
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
  TimetablePreAlertOffset,
} from "@/types/dailyBrief";
import {
  getDailyBriefSettings,
  getLocalDailyBriefSettings,
  updateDailyBriefSettings,
} from "@/apis/dailyBrief";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const PRE_ALERT_OPTIONS: { label: string; value: TimetablePreAlertOffset }[] = [
  { label: "10분 전", value: 10 },
  { label: "20분 전", value: 20 },
  { label: "30분 전", value: 30 },
  { label: "1시간 전", value: 60 },
];

const TIME_OPTIONS = [
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
    desc: "학교 전체 학사일정과 내 학과 일정을 모두 받아봅니다.",
  },
  {
    label: "학교 일정만",
    value: "SCHOOL_ONLY",
    desc: "수강신청, 시험, 등록금 등 학교 공식 학사일정만 받아봅니다.",
  },
  {
    label: "내 학과 일정만",
    value: "DEPT_ONLY",
    desc: "내 학과 공지사항에 등록된 학과 일정만 받아봅니다.",
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

  useHeader({
    title: "Daily Brief 설정",
    hasback: true,
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
    const nextSettings = { ...settings, ...patch };
    setSettings(nextSettings);

    try {
      await updateDailyBriefSettings(nextSettings);
    } catch (error) {
      console.error("Daily Brief 설정 저장 실패:", error);
    }
  };

  const handlePreAlertMinutesChange = (minutes: TimetablePreAlertOffset) => {
    handleUpdate({ timetablePreAlertMinutes: minutes });
    trackEvent("[Daily Brief] 수업 전 알림 시간 변경", { minutes });
  };

  const handleScheduleScopeChange = (scope: ScheduleScope) => {
    if (scope === "DEPT_ONLY" && !userInfo.department) {
      if (
        window.confirm(
          "학과 정보가 아직 설정되지 않았습니다. 마이페이지에서 학과를 설정하시겠어요?",
        )
      ) {
        navigate(ROUTES.MYPAGE.PROFILE);
        return;
      }
    }
    handleUpdate({ scheduleScope: scope });
    trackEvent("[Daily Brief] 학사일정 범위 변경", { scope });
  };

  return (
    <PageWrapper>
      <ContentContainer>
        {/* 1. 시간표 알림 섹션 */}
        <div id="section-timetable" style={{ width: "100%" }}>
          <TitleContentArea
            title="시간표 알림"
            description="내 대표 시간표의 강의 시작 전 알림 및 당일 강의 목록 브리핑을 설정합니다."
          >
            <Box style={{ width: "100%", padding: 0 }}>
              {/* 전체 시간표 알림 토글 */}
              <SettingRow>
                <RowContent>
                  <RowTitle>시간표 알림 받기</RowTitle>
                  <RowDescription>
                    강의 시작 전 알림 및 당일 강의 목록 알림을 수신합니다.
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
                          강의가 시작되기 전에 푸시 알림으로 미리 알려드려요.
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
                      <ChipGroup>
                        {PRE_ALERT_OPTIONS.map((opt) => (
                          <SelectableChip
                            key={opt.value}
                            $selected={settings.timetablePreAlertMinutes === opt.value}
                            onClick={() => handlePreAlertMinutesChange(opt.value)}
                          >
                            {opt.label}
                          </SelectableChip>
                        ))}
                      </ChipGroup>
                    )}
                  </SubOptionBox>

                  <Divider margin="0" />

                  {/* 당일 강의 목록 브리핑 */}
                  <SubOptionBox>
                    <SubOptionHeader>
                      <SubOptionTextWrapper>
                        <SubOptionTitle>당일 강의 목록 브리핑</SubOptionTitle>
                        <SubOptionDesc>
                          지정한 시간에 오늘 수강할 강의 목록을 한 번에 정리해서 알려드려요.
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
                      <TimeSelectRow>
                        <TimeSelectLabel>알림 수신 시간</TimeSelectLabel>
                        <StyledSelect
                          value={settings.timetableDailyBriefTime}
                          onChange={(e) => {
                            handleUpdate({ timetableDailyBriefTime: e.target.value });
                            trackEvent("[Daily Brief] 강의 목록 수신 시간 변경", {
                              time: e.target.value,
                            });
                          }}
                        >
                          {TIME_OPTIONS.map((time) => (
                            <option key={`tt-${time}`} value={time}>
                              {time}
                            </option>
                          ))}
                        </StyledSelect>
                      </TimeSelectRow>
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
            description="학교 공식 학사일정 및 학과 공지사항에 등록된 일정을 브리핑합니다."
          >
            <Box style={{ width: "100%", padding: 0 }}>
              {/* 전체 학사일정 알림 토글 */}
              <SettingRow>
                <RowContent>
                  <RowTitle>학사일정 브리핑 받기</RowTitle>
                  <RowDescription>
                    오늘에 해당하는 학사 및 학과 일정을 지정된 시간에 묶어서 수신합니다.
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
                    <TimeSelectRow>
                      <SubOptionTextWrapper>
                        <SubOptionTitle>브리핑 수신 시간</SubOptionTitle>
                        <SubOptionDesc>
                          매일 해당 시각에 오늘의 일정이 있을 때만 알림이 발송됩니다.
                        </SubOptionDesc>
                      </SubOptionTextWrapper>
                      <StyledSelect
                        value={settings.scheduleDailyBriefTime}
                        onChange={(e) => {
                          handleUpdate({ scheduleDailyBriefTime: e.target.value });
                          trackEvent("[Daily Brief] 학사일정 수신 시간 변경", {
                            time: e.target.value,
                          });
                        }}
                      >
                        {TIME_OPTIONS.map((time) => (
                          <option key={`sched-${time}`} value={time}>
                            {time}
                          </option>
                        ))}
                      </StyledSelect>
                    </TimeSelectRow>
                  </SubOptionBox>

                  <Divider margin="0" />

                  {/* 알림 수신 대상 범위 */}
                  <SubOptionBox>
                    <SubOptionTextWrapper style={{ marginBottom: "12px" }}>
                      <SubOptionTitle>알림 수신 대상 범위</SubOptionTitle>
                      <SubOptionDesc>
                        받고 싶은 일정의 종류를 선택하세요.
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
                          학과 정보가 미등록 상태입니다. 학과를 설정하면 학과 일정 알림을 받을 수 있어요.
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
