import styled from "styled-components";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import Box from "@/components/common/Box";
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
import { Bell, Calendar, Clock, BookOpen, AlertCircle } from "lucide-react";
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
    desc: "학교 전체 학사일정과 내 학과(AI 추출 포함) 일정을 모두 받아봅니다.",
  },
  {
    label: "학교 일정만",
    value: "SCHOOL_ONLY",
    desc: "수강신청, 시험, 등록금 등 학교 공식 학사일정만 받아봅니다.",
  },
  {
    label: "내 학과 일정만",
    value: "DEPT_ONLY",
    desc: "AI가 분석한 내 학과 공지사항 기반 일정만 받아봅니다.",
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

  // 특정 설정 항목 변경 및 즉시 저장
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
        {/* 상단 소개 카드 */}
        <IntroCard>
          <IntroHeader>
            <IntroIconWrapper>
              <Bell size={22} color="#0061FF" />
            </IntroIconWrapper>
            <div>
              <IntroTitle>하루를 시작하는 Daily Brief</IntroTitle>
              <IntroSubtitle>
                놓치기 쉬운 강의 시간과 중요 학사일정을 지정한 시간에 맞춤 브리핑해 드려요.
              </IntroSubtitle>
            </div>
          </IntroHeader>
        </IntroCard>

        {/* 1. 시간표 알림 섹션 */}
        <SectionContainer id="section-timetable">
          <SectionTitleWrapper>
            <BookOpen size={20} color="#0061FF" />
            <SectionTitle>시간표 알림</SectionTitle>
          </SectionTitleWrapper>
          <SectionSubtitle>
            내 대표 시간표의 강의 시작 전 알림 및 당일 강의 목록 브리핑을 설정합니다.
          </SectionSubtitle>

          <Box style={{ padding: "0" }}>
            {/* 전체 시간표 알림 토글 */}
            <SettingRow>
              <RowContent>
                <RowTitle>시간표 알림 사용</RowTitle>
                <RowDescription>
                  강의 시작 전 알림 및 당일 강의 요약 브리핑을 수신합니다.
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
                    <div>
                      <SubOptionTitle>수업 시작 전 알림</SubOptionTitle>
                      <SubOptionDesc>
                        강의가 시작되기 전에 푸시 알림으로 미리 알려드려요.
                      </SubOptionDesc>
                    </div>
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

                {/* 당일 강의 목록 묶음 알림 */}
                <SubOptionBox>
                  <SubOptionHeader>
                    <div>
                      <SubOptionTitle>당일 강의 목록 브리핑</SubOptionTitle>
                      <SubOptionDesc>
                        매일 지정한 시간에 그날 수강할 강의 목록을 한 번에 정리해서 알려드려요.
                      </SubOptionDesc>
                    </div>
                    <Switch
                      checked={settings.timetableDailyBriefEnabled}
                      onCheckedChange={(checked) => {
                        handleUpdate({ timetableDailyBriefEnabled: checked });
                        trackEvent("[Daily Brief] 당일 강의 목록 알림 토글", { enabled: checked });
                      }}
                    />
                  </SubOptionHeader>

                  {settings.timetableDailyBriefEnabled && (
                    <TimeSelectContainer>
                      <TimeSelectLabel>
                        <Clock size={16} color="#666" />
                        <span>알림 수신 시간</span>
                      </TimeSelectLabel>
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
                    </TimeSelectContainer>
                  )}
                </SubOptionBox>
              </>
            )}
          </Box>
        </SectionContainer>

        {/* 2. 학사일정 알림 섹션 */}
        <SectionContainer id="section-schedule">
          <SectionTitleWrapper>
            <Calendar size={20} color="#0061FF" />
            <SectionTitle>학사일정 알림</SectionTitle>
          </SectionTitleWrapper>
          <SectionSubtitle>
            학교 학사일정 및 AI가 학과 공지사항을 분석해 등록한 학과 일정을 브리핑합니다.
          </SectionSubtitle>

          <Box style={{ padding: "0" }}>
            {/* 전체 학사일정 알림 토글 */}
            <SettingRow>
              <RowContent>
                <RowTitle>학사일정 브리핑 사용</RowTitle>
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
                  <TimeSelectContainer style={{ marginTop: 0 }}>
                    <TimeSelectLabel>
                      <Clock size={16} color="#666" />
                      <div>
                        <SubOptionTitle style={{ margin: 0 }}>브리핑 수신 시간</SubOptionTitle>
                        <SubOptionDesc style={{ margin: "2px 0 0" }}>
                          매일 해당 시각에 오늘의 일정이 있을 때만 알림이 발송됩니다.
                        </SubOptionDesc>
                      </div>
                    </TimeSelectLabel>
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
                  </TimeSelectContainer>
                </SubOptionBox>

                <Divider margin="0" />

                {/* 알림 수신 대상 범위 */}
                <SubOptionBox>
                  <SubOptionTitle>알림 수신 대상 범위</SubOptionTitle>
                  <SubOptionDesc style={{ marginBottom: "12px" }}>
                    받고 싶은 일정의 종류를 선택하세요.
                  </SubOptionDesc>

                  <ScopeOptionList>
                    {SCHEDULE_SCOPE_OPTIONS.map((opt) => (
                      <ScopeOptionCard
                        key={opt.value}
                        $selected={settings.scheduleScope === opt.value}
                        onClick={() => handleScheduleScopeChange(opt.value)}
                      >
                        <RadioCircle $selected={settings.scheduleScope === opt.value} />
                        <ScopeTextWrapper>
                          <ScopeLabel>{opt.label}</ScopeLabel>
                          <ScopeDesc>{opt.desc}</ScopeDesc>
                        </ScopeTextWrapper>
                      </ScopeOptionCard>
                    ))}
                  </ScopeOptionList>

                  {!userInfo.department && (
                    <DeptWarningBox onClick={() => navigate(ROUTES.MYPAGE.PROFILE)}>
                      <AlertCircle size={18} color="#FF9500" />
                      <span>
                        아직 학과 정보가 등록되지 않았어요. <strong>마이페이지</strong>에서 학과를 등록하면 AI 학과 일정 알림을 받을 수 있어요!
                      </span>
                    </DeptWarningBox>
                  )}
                </SubOptionBox>
              </>
            )}
          </Box>
        </SectionContainer>
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

const IntroCard = styled.div`
  background: linear-gradient(135deg, #eef5ff 0%, #f4f8ff 100%);
  border: 1px solid #d4e5ff;
  border-radius: 16px;
  padding: 18px 20px;
  box-sizing: border-box;
`;

const IntroHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

const IntroIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: ${SOFT_CHIP_SHADOW};
  flex-shrink: 0;
`;

const IntroTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #1c1c1e;
  margin-bottom: 4px;
`;

const IntroSubtitle = styled.div`
  font-size: 13px;
  color: #4a5568;
  line-height: 1.45;
  word-break: keep-all;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1c1c1e;
  margin: 0;
`;

const SectionSubtitle = styled.p`
  font-size: 13px;
  color: #8e8e93;
  margin: 0 0 4px 0;
  line-height: 1.4;
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  width: 100%;
  box-sizing: border-box;
  background-color: #ffffff;
  border-radius: 12px;
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
  padding: 18px 20px;
  background-color: #fafbfc;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SubOptionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const SubOptionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
`;

const SubOptionDesc = styled.div`
  font-size: 12.5px;
  color: #8e8e93;
  line-height: 1.35;
  margin-top: 2px;
`;

const ChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
`;

const SelectableChip = styled.button<{ $selected: boolean }>`
  border: 1px solid ${({ $selected }) => ($selected ? "#0061FF" : "#e2e8f0")};
  border-radius: 100px;
  padding: 8px 16px;
  background-color: ${({ $selected }) => ($selected ? "#0061FF" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#ffffff" : "#4a5568")};
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${SOFT_CHIP_SHADOW};
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const TimeSelectContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  gap: 12px;
`;

const TimeSelectLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
`;

const StyledSelect = styled.select`
  appearance: none;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 8px 32px 8px 14px;
  font-size: 14px;
  font-weight: 600;
  color: #1c1c1e;
  cursor: pointer;
  outline: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  box-shadow: ${SOFT_CHIP_SHADOW};

  &:focus {
    border-color: #0061FF;
  }
`;

const ScopeOptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ScopeOptionCard = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid ${({ $selected }) => ($selected ? "#0061FF" : "#e2e8f0")};
  background-color: ${({ $selected }) => ($selected ? "#f0f6ff" : "#ffffff")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    background-color: #edf2f7;
  }
`;

const RadioCircle = styled.div<{ $selected: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${({ $selected }) => ($selected ? "#0061FF" : "#cbd5e0")};
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
    background-color: #0061FF;
    display: ${({ $selected }) => ($selected ? "block" : "none")};
  }
`;

const ScopeTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ScopeLabel = styled.div`
  font-size: 14.5px;
  font-weight: 600;
  color: #1c1c1e;
`;

const ScopeDesc = styled.div`
  font-size: 12px;
  color: #718096;
  line-height: 1.35;
`;

const DeptWarningBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background-color: #fff9eb;
  border: 1px solid #ffe8b3;
  border-radius: 8px;
  font-size: 12.5px;
  color: #b7791f;
  line-height: 1.4;
  margin-top: 8px;
  cursor: pointer;
`;
