import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  ExternalLink,
  Phone,
  Calendar,
  Clock,
  LogIn,
  Bell,
  Sliders,
  Layers,
  GraduationCap,
  BookOpen,
  KeyRound,
  Users,
} from "lucide-react";
import {
  FALLBACK_SKY_CONDITION_SLUG,
  PM_GRADE_ILLUSTRATIONS,
  PM_GRADE_SLUGS,
  SKY_CONDITION_SLUGS,
  SKY_ILLUSTRATIONS,
  WEATHER_BACKGROUND,
  type PmGradeName,
  type SkyConditionName,
} from "@/resources/assets/illustrations/weather";
import { ROUTES } from "@/constants/routes";
import { UiComponent } from "@/apis/agent";
import SwipeBusWidget from "@/containers/mobile/home/SwipeBusWidget";
import SwipeMenuWidget from "@/containers/mobile/home/SwipeMenuWidget";
import TodayTimetableWidget from "@/components/mobile/home/TodayTimetableWidget";
import SchoolNoticeItem from "@/components/mobile/notice/SchoolNoticeItem";
import EventItem from "@/components/mobile/calendar/EventItem";

interface Props {
  component?: UiComponent | null;
  components?: UiComponent[] | null;
  onNavigate?: () => void;
}

export const AgentGenerativeCards: React.FC<Props> = ({
  component,
  components,
  onNavigate,
}) => {
  const list =
    components && components.length > 0
      ? components
      : component
        ? [component]
        : [];

  const [activeIndex, setActiveIndex] = React.useState(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, offsetWidth } = carouselRef.current;
    if (offsetWidth > 0) {
      const idx = Math.round(scrollLeft / (offsetWidth * 0.88));
      setActiveIndex(Math.min(idx, list.length - 1));
    }
  };

  if (list.length === 0) return null;

  if (list.length === 1) {
    return <SingleCardItem component={list[0]} onNavigate={onNavigate} />;
  }

  return (
    <CarouselWrapper>
      <CarouselContainer ref={carouselRef} onScroll={handleScroll}>
        {list.map((c, i) => (
          <CarouselSlide key={i}>
            <SingleCardItem component={c} onNavigate={onNavigate} />
          </CarouselSlide>
        ))}
      </CarouselContainer>
      <CarouselDots>
        {list.map((_, i) => (
          <CarouselDot key={i} $active={activeIndex === i} />
        ))}
      </CarouselDots>
    </CarouselWrapper>
  );
};

export const SingleCardItem: React.FC<{
  component: UiComponent;
  onNavigate?: () => void;
}> = ({ component, onNavigate }) => {
  const navigate = useNavigate();

  const handleLinkClick = (url: string) => {
    if (!url) return;

    // 1. 도서관 스마트 허브 바로가기 처리
    if (url === "/library" || url === ROUTES.SERVICES.LIBRARY) {
      if (onNavigate) onNavigate();
      navigate(ROUTES.SERVICES.LIBRARY);
      return;
    }

    // 2. LMS 스마트 허브 바로가기 처리
    if (url === "/lms" || url === ROUTES.SERVICES.LMS) {
      if (onNavigate) onNavigate();
      navigate(ROUTES.SERVICES.LMS);
      return;
    }

    // 3. 계정 연동 모달 바로가기 이벤트 처리
    if (url === "openLmsAccountModal" || url === "/lms-account") {
      if (onNavigate) onNavigate();
      window.dispatchEvent(new CustomEvent("openLmsAccountModal"));
      return;
    }
    if (url === "openLibraryAccountModal" || url === "/library-account") {
      if (onNavigate) onNavigate();
      window.dispatchEvent(new CustomEvent("openLibraryAccountModal"));
      return;
    }
    if (url === "openPortalAccountModal" || url === "/portal-account" || url === "/academic" || url.startsWith("/academic")) {
      if (onNavigate) onNavigate();
      window.dispatchEvent(new CustomEvent("openPortalAccountModal"));
      return;
    }

    // 4. my-page 오타 보정 -> /mypage
    let resolvedUrl = url;
    if (resolvedUrl === "/my-page" || resolvedUrl.startsWith("/my-page")) {
      resolvedUrl = resolvedUrl.replace("/my-page", "/mypage");
    }

    // 5. /mobile/daily-brief 오타 보정 -> /mypage/notification/daily-brief
    if (resolvedUrl.startsWith("/mobile/daily-brief")) {
      resolvedUrl = resolvedUrl.replace("/mobile/daily-brief", "/mypage/notification/daily-brief");
    }

    if (onNavigate) onNavigate();
    if (resolvedUrl.startsWith("http://") || resolvedUrl.startsWith("https://")) {
      window.open(resolvedUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(resolvedUrl);
    }
  };

  // 1. 공식 INTIP 컴포넌트 직접 재사용 (버스, 학식, 시간표)
  if (component.type === "BUS") {
    if (component.data?.mode === "HISTORY") {
      return <BusHistoryCard data={component.data} onNavigate={onNavigate} />;
    }
    return (
      <WidgetCardWrapper>
        <SwipeBusWidget
          initialStopName={component.data?.tabName || component.data?.stopName}
          initialType={component.data?.category}
        />
      </WidgetCardWrapper>
    );
  }

  if (component.type === "CAFETERIA") {
    return (
      <WidgetCardWrapper>
        <SwipeMenuWidget
          initialCafeteria={component.data?.cafeteria || component.data?.name}
        />
      </WidgetCardWrapper>
    );
  }

  if (component.type === "TIMETABLE") {
    return (
      <WidgetCardWrapper>
        <TodayTimetableWidget
          customTitle={component.data?.todayDateText}
          customStatusText={component.data?.statusText}
          customClasses={component.data?.todayClasses}
          onClick={() => {
            if (onNavigate) onNavigate();
            navigate(ROUTES.TIMETABLE.ROOT);
          }}
        />
      </WidgetCardWrapper>
    );
  }

  const renderContent = () => {
    switch (component.type) {
      case "WEATHER":
        return <WeatherCard data={component.data} />;
      case "NOTICE_LIST":
        return (
          <NoticeListCard
            data={component.data}
            onItemClick={(item) => {
              if (onNavigate) onNavigate();
              if (item.isDepartment) {
                if (item.department) {
                  navigate(ROUTES.BOARD.DEPT_NOTICE_DETAIL(item.department));
                } else {
                  navigate(ROUTES.BOARD.DEPT_NOTICE);
                }
              } else if (item.id) {
                navigate(ROUTES.BOARD.NOTICE_DETAIL(item.id));
              } else if (item.url) {
                window.open(item.url, "_blank", "noopener,noreferrer");
              } else {
                navigate(ROUTES.BOARD.NOTICE);
              }
            }}
          />
        );
      case "TIMETABLE_GAP":
        return <TimeTableGapCard data={component.data} />;
      case "SCHEDULE":
        return (
          <ScheduleCard
            data={component.data}
            onClick={() => {
              if (onNavigate) onNavigate();
              navigate(ROUTES.BOARD.CALENDAR);
            }}
          />
        );
      case "DIRECTORY":
        return <DirectoryCard data={component.data} onNavigate={onNavigate} />;
      case "AUTH_REQUIRED":
        return (
          <AuthRequiredCard
            onLoginClick={() => {
              if (onNavigate) onNavigate();
              navigate(ROUTES.LOGIN);
            }}
          />
        );
      case "KEYWORD_CONFIRM":
        return <KeywordConfirmCard data={component.data} />;
      case "SETTING_RESULT":
        return <SettingResultCard data={component.data} />;
      case "REMINDER_SETTING_RESULT":
        return <ReminderSettingResultCard data={component.data} onNavigate={onNavigate} />;
      case "MY_SETTINGS":
        return <MySettingsCard data={component.data} />;
      case "DYNAMIC_DATA":
        return <DynamicDataCard data={component.data} onNavigate={onNavigate} />;
      case "ACADEMIC_INFO":
        return <AcademicInfoCard data={component.data} onNavigate={onNavigate} />;
      case "PORTAL_AUTH_REQUIRED":
        return <PortalAuthRequiredCard data={component.data} onNavigate={onNavigate} />;
      case "LIBRARY_ROOMS":
        return <LibraryRoomsCard data={component.data} onNavigate={onNavigate} />;
      case "LIBRARY_STUDY_ROOMS":
        return <LibraryStudyRoomsCard data={component.data} onNavigate={onNavigate} />;
      case "LIBRARY_AUTH_REQUIRED":
        return <LibraryAuthRequiredCard data={component.data} onNavigate={onNavigate} />;
      case "LMS_ASSIGNMENTS":
        return <LmsAssignmentsCard data={component.data} onNavigate={onNavigate} />;
      case "LMS_AUTH_REQUIRED":
      case "LMS_ACTION":
        return <LmsAuthRequiredCard data={component.data} onNavigate={onNavigate} />;
      case "CAMPUS_WATCH_RESULT":
        return <CampusWatchResultCard data={component.data} onNavigate={onNavigate} />;
      case "CAMPUS_WATCH_LIST":
        return <CampusWatchListCard data={component.data} onNavigate={onNavigate} />;
      default:
        return null;
    }
  };

  return (
    <CardContainer>
      {renderContent()}
      {component.link && (
        <CardFooterButton
          type="button"
          onClick={() => handleLinkClick(component.link!.route)}
        >
          <span>{component.link.label}</span>
          <ExternalLink size={14} />
        </CardFooterButton>
      )}
    </CardContainer>
  );
};

/* --- 1. Weather Card --- */
const WeatherCard: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;

  const skyName = (data.sky in SKY_CONDITION_SLUGS ? data.sky : "맑음") as SkyConditionName;
  const slug = SKY_CONDITION_SLUGS[skyName] ?? FALLBACK_SKY_CONDITION_SLUG;
  const illustration = SKY_ILLUSTRATIONS[slug];
  const isNight = data.day === "night" || data.day === "밤";
  const image = isNight ? illustration?.night : illustration?.day;

  const pmSlug = PM_GRADE_SLUGS[data.pm10Grade as PmGradeName];
  const pm10GradeImage = pmSlug ? PM_GRADE_ILLUSTRATIONS[pmSlug] : undefined;

  const temp = (data.temperature || "").replace(/[°℃]/g, "").trim();

  return (
    <WeatherBox>
      <WeatherBg src={WEATHER_BACKGROUND} alt="" />
      <WeatherInner>
        {image && <WeatherIconImg src={image} alt={data.sky || ""} />}
        <WeatherDetails>
          <WeatherDegreeRow>
            <WeatherDegree>{temp || "-"}</WeatherDegree>
            <WeatherDegreeUnit>°C</WeatherDegreeUnit>
          </WeatherDegreeRow>
          <WeatherStatusRow>
            {pm10GradeImage && <PmIcon src={pm10GradeImage} alt="" />}
            <span>미세먼지 {data.pm10Grade || "-"}</span>
          </WeatherStatusRow>
          <WeatherLocation>연수구 송도동</WeatherLocation>
        </WeatherDetails>
      </WeatherInner>
    </WeatherBox>
  );
};

/* --- 2. Notice List Card --- */
const NoticeListCard: React.FC<{
  data: any;
  onItemClick: (item: any) => void;
}> = ({ data, onItemClick }) => {
  const notices: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.contents)
      ? data.contents
      : [];

  if (notices.length === 0) {
    return <EmptyMessage>조회된 공지사항이 없습니다.</EmptyMessage>;
  }

  return (
    <NoticeListBox>
      {notices.slice(0, 3).map((item, idx) => (
        <SchoolNoticeItem
          key={item.id ?? idx}
          category={item.category || item.subCategory || "공지"}
          title={item.title}
          date={item.createDate || item.date || ""}
          writer={item.writer || ""}
          onClick={() => onItemClick(item)}
        />
      ))}
    </NoticeListBox>
  );
};

/* --- 6. Schedule Card --- */
const ScheduleCard: React.FC<{
  data: any;
  onClick?: () => void;
}> = ({ data, onClick }) => {
  const schedules: any[] = Array.isArray(data) ? data : [];

  return (
    <ScheduleBox onClick={onClick} style={{ cursor: "pointer" }}>
      <CardHeader>
        <Calendar size={16} color="#0061ff" />
        <CardTitle>학사 및 학과 일정</CardTitle>
      </CardHeader>
      {schedules.length === 0 ? (
        <EmptyMessage>예정된 일정이 없습니다.</EmptyMessage>
      ) : (
        <ScheduleList>
          {schedules.slice(0, 4).map((s, idx) => {
            const isDept = s.type === "dept" || Boolean(s.aiGenerated) || Boolean(s.department);
            const eventItemProps: any = {
              id: s.id ?? idx,
              title: s.title || "",
              start: s.start || s.startDate || "",
              end: s.end || s.endDate || s.start || "",
              type: isDept ? "dept" : "school",
              department: s.department || null,
              description: s.description || null,
              aiGenerated: Boolean(s.aiGenerated),
              sourceNoticeId: s.sourceNoticeId || null,
              sourceNoticeTitle: s.sourceNoticeTitle || null,
              url: s.url || null,
            };
            return <EventItem key={eventItemProps.id} {...eventItemProps} />;
          })}
        </ScheduleList>
      )}
    </ScheduleBox>
  );
};

/* --- 6-1. Bus History Card --- */
const BusHistoryCard: React.FC<{
  data: any;
  onNavigate?: () => void;
}> = ({ data, onNavigate }) => {
  const navigate = useNavigate();
  if (!data) return null;

  const records: any[] = Array.isArray(data.historyRecords) ? data.historyRecords : [];
  const avgMin = data.averageIntervalMinutes || 0;
  const targetDate = data.targetDate || "";
  const tabName = data.tabName || data.stopName || "인천대 버스";

  const handleGoBus = () => {
    if (onNavigate) onNavigate();
    const cat = data.category ? encodeURIComponent(data.category) : "go-school";
    const tab = data.tabName ? encodeURIComponent(data.tabName) : "";
    navigate(`/bus/info?type=${cat}&category=${tab}`);
  };

  return (
    <BusHistoryBox onClick={handleGoBus} style={{ cursor: "pointer" }}>
      <CardHeader>
        <Clock size={16} color="#0061ff" />
        <CardTitle>[{tabName}] 과거 버스 시간표 / 배차</CardTitle>
      </CardHeader>

      {avgMin > 0 && (
        <BusAvgBadge>
          <span>동일 요일 최근 4주 평균 배차:</span>
          <strong>약 {avgMin}분</strong>
        </BusAvgBadge>
      )}

      {targetDate && <BusHistoryDateText>기준 일자: {targetDate}</BusHistoryDateText>}

      {records.length === 0 ? (
        <EmptyMessage>해당 일자 버스 정차 이력이 없습니다.</EmptyMessage>
      ) : (
        <BusRecordList>
          {records.slice(0, 4).map((r, idx) => (
            <BusRecordItem key={idx}>
              <BusRouteBadge>{r.routeNo}번</BusRouteBadge>
              <BusPlateText>{r.busNumPlate || ""}</BusPlateText>
              <BusTimeText>{r.time} 정차</BusTimeText>
            </BusRecordItem>
          ))}
        </BusRecordList>
      )}

      <CardFooterLink>
        <span>인입런 버스 정보 바로가기</span>
        <ExternalLink size={13} />
      </CardFooterLink>
    </BusHistoryBox>
  );
};

/* --- 7. Directory Card --- */
const DirectoryCard: React.FC<{
  data: any;
  onNavigate?: () => void;
}> = ({ data, onNavigate }) => {
  const contacts: any[] = Array.isArray(data) ? data : (data?.contacts || []);
  const navigate = useNavigate();

  return (
    <DirectoryBox>
      <CardHeader>
        <Phone size={16} color="#0061ff" />
        <CardTitle>교내 전화번호부</CardTitle>
      </CardHeader>
      {contacts.length === 0 ? (
        <EmptyMessage>연락처 검색 결과가 없습니다.</EmptyMessage>
      ) : (
        <DirectoryList>
          {contacts.slice(0, 3).map((c, idx) => (
            <DirectoryItem
              key={c.id ?? idx}
              onClick={() => {
                if (onNavigate) onNavigate();
                navigate(ROUTES.PHONEBOOK.ROOT);
              }}
              style={{ cursor: "pointer" }}
            >
              <DirectoryMeta>
                <DeptName>{c.departmentName || c.name}</DeptName>
                <CollegeName>{c.collegeName || c.position || ""}</CollegeName>
              </DirectoryMeta>
              {c.officePhoneNumber && (
                <CallButton
                  href={`tel:${c.officePhoneNumber}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone size={12} />
                  <span>{c.officePhoneNumber}</span>
                </CallButton>
              )}
            </DirectoryItem>
          ))}
        </DirectoryList>
      )}
    </DirectoryBox>
  );
};

/* --- 8. Auth Required Card --- */
const AuthRequiredCard: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => (
  <AuthBox>
    <AuthMessage>시간표 및 학과 맞춤 정보를 확인하려면 로그인이 필요합니다.</AuthMessage>
    <LoginActionBtn type="button" onClick={onLoginClick}>
      <LogIn size={15} />
      <span>로그인하러 가기</span>
    </LoginActionBtn>
  </AuthBox>
);

/* --- 9. Keyword Confirm Card --- */
const KeywordConfirmCard: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;
  const isExcluded = Boolean(data.isExcluded);

  return (
    <ActionCardBox>
      <CardHeader>
        <Bell size={16} color={isExcluded ? "#f04438" : "#0061ff"} />
        <CardTitle>{data.statusText || "키워드 알림 설정"}</CardTitle>
      </CardHeader>
      <KeywordContent>
        <KeywordBadgeRow>
          <KeywordChip $excluded={isExcluded}>
            #{data.keyword}
          </KeywordChip>
          <TargetTag>{data.targetName || "공지사항"}</TargetTag>
        </KeywordBadgeRow>
        <ActionDescription>
          {isExcluded
            ? "이 키워드가 포함된 공지는 알림에서 제외됩니다."
            : "새로운 공지사항이 등록되면 즉시 푸시 알림을 보내드립니다."}
        </ActionDescription>
      </KeywordContent>
    </ActionCardBox>
  );
};

/* --- 10. Setting Result Card --- */
const SettingResultCard: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;
  const enabled = Boolean(data.enabled);

  return (
    <ActionCardBox>
      <CardHeader>
        <Sliders size={16} color="#0061ff" />
        <CardTitle>{data.title || "알림 설정"}</CardTitle>
        <SettingBadge $enabled={enabled}>
          {data.statusText || (enabled ? "켜짐" : "꺼짐")}
        </SettingBadge>
      </CardHeader>
      <ActionDescription>
        {data.message || (enabled ? "설정이 활성화되었습니다." : "설정이 비활성화되었습니다.")}
      </ActionDescription>
    </ActionCardBox>
  );
};

/* --- 10-1. Reminder Setting Result Card --- */
const ReminderSettingResultCard: React.FC<{
  data: any;
  onNavigate?: () => void;
}> = ({ data, onNavigate }) => {
  const navigate = useNavigate();
  if (!data) return null;

  return (
    <ActionCardBox>
      <CardHeader>
        <Bell size={16} color="#0061ff" />
        <CardTitle>{data.title || "AI 맞춤 알림"}</CardTitle>
        <SettingBadge $enabled={true}>
          {data.statusText || `${data.targetTime || "08:30"} 예약`}
        </SettingBadge>
      </CardHeader>
      <ActionDescription>
        {data.repeatTypeDesc || "평일"} {data.targetTime || "08:30"}에 맞춤 알림이 예약되었어요.
      </ActionDescription>
      <ReminderManageButton
        type="button"
        onClick={() => {
          if (onNavigate) onNavigate();
          navigate("/mobile/daily-brief?tab=agent");
        }}
      >
        <span>내 맞춤 알림 관리</span>
        <ExternalLink size={13} />
      </ReminderManageButton>
    </ActionCardBox>
  );
};

const ReminderManageButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  padding: 6px 12px;
  background-color: #f1f5f9;
  color: #0061ff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  width: fit-content;

  &:hover {
    background-color: #e2e8f0;
  }
`;

/* --- 11. My Settings Card --- */
const MySettingsCard: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;
  const chatPush = Boolean(data.chatPushEnabled);
  const brief = data.dailyBrief;
  const keywords: any[] = Array.isArray(data.keywords) ? data.keywords : [];

  return (
    <ActionCardBox>
      <CardHeader>
        <Bell size={16} color="#0061ff" />
        <CardTitle>내 알림 설정 현황</CardTitle>
      </CardHeader>
      <SettingsList>
        <SettingItemRow>
          <SettingLabel>채팅 푸시 알림</SettingLabel>
          <SettingBadge $enabled={chatPush}>{chatPush ? "켜짐" : "꺼짐"}</SettingBadge>
        </SettingItemRow>
        {brief && (
          <SettingItemRow>
            <SettingLabel>데일리 브리프</SettingLabel>
            <SettingSubText>
              {brief.timetableDailyBriefEnabled ? `매일 ${brief.timetableDailyBriefTime || "08:00"}` : "꺼짐"}
            </SettingSubText>
          </SettingItemRow>
        )}
        <SettingItemRow>
          <SettingLabel>공지 키워드 알림</SettingLabel>
          <SettingSubText>{keywords.length}개 등록됨</SettingSubText>
        </SettingItemRow>
        {keywords.length > 0 && (
          <KeywordsChipsContainer>
            {keywords.slice(0, 6).map((k: any, idx: number) => (
              <MiniKeywordChip key={k.keywordId ?? idx} $excluded={k.isExcluded}>
                #{k.keyword}
              </MiniKeywordChip>
            ))}
          </KeywordsChipsContainer>
        )}
      </SettingsList>
    </ActionCardBox>
  );
};

/* --- 12. Dynamic Data Card (OpenAPI Discovery) --- */
const DynamicDataCard: React.FC<{
  data: any;
  onNavigate?: () => void;
}> = ({ data, onNavigate }) => {
  const navigate = useNavigate();
  if (!data) return null;

  const items: any[] = Array.isArray(data.items) ? data.items : [];
  const title = data.title || "조회 결과";
  const totalCount = data.totalCount ?? items.length;
  const redirectUrl = data.redirectUrl;

  const handleClick = () => {
    if (redirectUrl) {
      if (onNavigate) onNavigate();
      if (redirectUrl.startsWith("http")) {
        window.open(redirectUrl, "_blank", "noopener,noreferrer");
      } else {
        navigate(redirectUrl);
      }
    }
  };

  return (
    <DynamicBox onClick={handleClick} $clickable={Boolean(redirectUrl)}>
      <CardHeader>
        <Layers size={16} color="#0061ff" />
        <CardTitle>{title}</CardTitle>
        {totalCount > 0 && <DynamicCountBadge>총 {totalCount}건</DynamicCountBadge>}
      </CardHeader>

      {items.length === 0 ? (
        <EmptyMessage>조회된 내역이 없습니다.</EmptyMessage>
      ) : (
        <DynamicItemList>
          {items.slice(0, 4).map((item, idx) => {
            const itemTitle =
              item.name || item.title || item.clubName || (typeof item === "string" ? item : "항목");
            const itemCategory = item.category || item.subCategory || "";
            const itemContent = item.content || item.description || "";
            const itemDate = item.createDate || item.date || "";

            return (
              <DynamicItemRow key={idx}>
                <DynamicItemMain>
                  <DynamicItemTitleRow>
                    {itemCategory && <DynamicCatTag>{itemCategory}</DynamicCatTag>}
                    <DynamicItemTitle>{itemTitle}</DynamicItemTitle>
                  </DynamicItemTitleRow>
                  {itemContent && <DynamicItemSub>{itemContent}</DynamicItemSub>}
                </DynamicItemMain>
                {itemDate && <DynamicItemDate>{itemDate}</DynamicItemDate>}
              </DynamicItemRow>
            );
          })}
        </DynamicItemList>
      )}

      {redirectUrl && (
        <CardFooterLink>
          <span>자세히 보기</span>
          <ExternalLink size={13} />
        </CardFooterLink>
      )}
    </DynamicBox>
  );
};

/* --- Styled Components --- */
const WidgetCardWrapper = styled.div`
  width: 100%;
  max-width: 340px;
  margin-top: 10px;
`;

const CardContainer = styled.div`
  margin-top: 10px;
  background-color: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 330px;
`;

const CardFooterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 14px;
  background-color: #f8f9fa;
  border: none;
  border-top: 1px solid #edf0f2;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #0061ff;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f1f4f8;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const CardTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #191f28;
`;

const EmptyMessage = styled.p`
  font-size: 13px;
  color: #8b95a1;
  padding: 10px 0;
  margin: 0;
  text-align: center;
`;

/* Weather */
const WeatherBox = styled.div`
  position: relative;
  height: 120px;
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  background: linear-gradient(90deg, #b5f1fb 0%, #8ce3d6 100%);
`;

const WeatherBg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const WeatherInner = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100%;
  padding: 0 16px;
`;

const WeatherIconImg = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
`;

const WeatherDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: #ffffff;
`;

const WeatherDegreeRow = styled.div`
  display: flex;
  align-items: flex-start;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.8);
  padding-bottom: 2px;
`;

const WeatherDegree = styled.span`
  font-size: 32px;
  font-weight: 600;
  line-height: 1;
`;

const WeatherDegreeUnit = styled.span`
  font-size: 16px;
  margin-top: 2px;
`;

const WeatherStatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-top: 4px;
`;

const PmIcon = styled.img`
  width: 14px;
  height: 14px;
`;

const WeatherLocation = styled.span`
  font-size: 13px;
  font-weight: 500;
  margin-top: 2px;
`;

/* Notice */
const NoticeListBox = styled.div`
  display: flex;
  flex-direction: column;
`;

/* Schedule */
const ScheduleBox = styled.div`
  padding: 14px;
`;

const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
`;

/* Directory */
const DirectoryBox = styled.div`
  padding: 14px;
`;

const DirectoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
`;

const DirectoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background-color: #f8f9fa;
  border-radius: 10px;
`;

const DirectoryMeta = styled.div`
  display: flex;
  flex-direction: column;
`;

const DeptName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #191f28;
`;

const CollegeName = styled.span`
  font-size: 11px;
  color: #8b95a1;
`;

const CallButton = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background-color: #eff6ff;
  color: #0061ff;
  border-radius: 8px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;

  &:hover {
    background-color: #dbeafe;
  }
`;

/* Auth */
const AuthBox = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
`;

const AuthMessage = styled.p`
  font-size: 13px;
  color: #4e5968;
  margin: 0;
  line-height: 1.4;
`;

const LoginActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #0061ff;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #0052d9;
  }
`;

/* Carousel */
const CarouselWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 330px;
`;

const CarouselContainer = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  padding: 4px 0 6px 0;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CarouselSlide = styled.div`
  flex: 0 0 92%;
  scroll-snap-align: start;
`;

const CarouselDots = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  padding-bottom: 2px;
`;

const CarouselDot = styled.span<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? "16px" : "6px")};
  height: 6px;
  border-radius: 3px;
  background-color: ${({ $active }) => ($active ? "#0061ff" : "#d1d5db")};
  transition: all 0.2s ease;
`;

/* Action & Settings Cards */
const ActionCardBox = styled.div`
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const KeywordContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const KeywordBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const KeywordChip = styled.span<{ $excluded?: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${({ $excluded }) => ($excluded ? "#d92d20" : "#0061ff")};
  background-color: ${({ $excluded }) => ($excluded ? "#fee4e2" : "#eff6ff")};
  padding: 4px 10px;
  border-radius: 12px;
`;

const TargetTag = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #4e5968;
  background-color: #f2f4f6;
  padding: 3px 8px;
  border-radius: 8px;
`;

const ActionDescription = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: #4e5968;
  word-break: keep-all;
`;

const SettingBadge = styled.span<{ $enabled: boolean }>`
  margin-left: auto;
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  color: ${({ $enabled }) => ($enabled ? "#0061ff" : "#6b7684")};
  background-color: ${({ $enabled }) => ($enabled ? "#eff6ff" : "#f2f4f6")};
`;

const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SettingItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
`;

const SettingLabel = styled.span`
  color: #333d4b;
  font-weight: 600;
`;

const SettingSubText = styled.span`
  color: #0061ff;
  font-weight: 600;
  font-size: 12px;
`;

const KeywordsChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 4px;
`;

const MiniKeywordChip = styled.span<{ $excluded?: boolean }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ $excluded }) => ($excluded ? "#d92d20" : "#333d4b")};
  background-color: ${({ $excluded }) => ($excluded ? "#fee4e2" : "#f2f4f6")};
  padding: 2px 7px;
  border-radius: 8px;
`;

const TimeTableBox = styled.div`
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TodayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TodayHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TodayTitle = styled.span`
  color: var(--text-secondary, #333d4b);
  font-size: 14px;
  font-weight: 700;
`;

const TimetableEmptyState = styled.div`
  padding: 12px 0;
  text-align: center;
`;

const TimetableEmptyText = styled.p`
  margin: 0;
  color: #b0b8c1;
  font-size: 13.5px;
`;

const TimeTableGapCard: React.FC<{ data: any }> = ({ data }) => {
  if (!data || data.hasTimetable === false) {
    return (
      <TimeTableBox>
        <TodayHeader>
          <TodayHeaderLeft>
            <Clock size={16} color="#0061ff" />
            <TodayTitle>시간표 공강 분석</TodayTitle>
          </TodayHeaderLeft>
        </TodayHeader>
        <TimetableEmptyState>
          <TimetableEmptyText>
            등록된 시간표가 없어요. 시간표를 먼저 등록해주세요.
          </TimetableEmptyText>
        </TimetableEmptyState>
      </TimeTableBox>
    );
  }

  const {
    dayName,
    isToday,
    isDayOff,
    lectureCount,
    totalClassText,
    totalGapText,
    statusText,
    gaps,
    hasBigGap,
    hasLunchGap,
  } = data;

  return (
    <TimeTableBox>
      <TodayHeader>
        <TodayHeaderLeft>
          <Clock size={16} color="#0061ff" />
          <TodayTitle>
            {isToday ? `오늘(${dayName})` : `${dayName}요일`} 공강 분석
          </TodayTitle>
        </TodayHeaderLeft>
        <GapStatusBadge $isDayOff={isDayOff} $hasBigGap={hasBigGap}>
          {statusText || (isDayOff ? "전일 공강 🎉" : "공강 분석")}
        </GapStatusBadge>
      </TodayHeader>

      {isDayOff ? (
        <DayOffBanner>
          <DayOffEmoji>🎉</DayOffEmoji>
          <DayOffTitle>등록된 강의가 없는 전일 공강(Day Off)입니다!</DayOffTitle>
          <DayOffSub>여유롭게 휴식을 취하거나 자유로운 하루를 보내세요.</DayOffSub>
        </DayOffBanner>
      ) : (
        <>
          <GapSummaryStats>
            <StatBox>
              <StatLabel>총 수업</StatLabel>
              <StatValue>{lectureCount}개 ({totalClassText})</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>총 공강</StatLabel>
              <StatValue $highlight={hasBigGap}>{totalGapText || "0분"}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>점심 시간</StatLabel>
              <StatValue>{hasLunchGap ? "식사 가능 🍱" : "연강 주의 ☕"}</StatValue>
            </StatBox>
          </GapSummaryStats>

          {gaps && gaps.length > 0 ? (
            <GapListSection>
              <GapSectionTitle>수업 사이 공강 구간 ({gaps.length}개)</GapSectionTitle>
              {gaps.map((gap: any, idx: number) => (
                <GapItemCard key={idx}>
                  <GapTimeRow>
                    <GapTimeSlot>
                      <Clock size={12} />
                      {gap.startTime} ~ {gap.endTime}
                    </GapTimeSlot>
                    <GapTypeTag $isBig={gap.durationMinutes >= 120}>
                      {gap.gapType || gap.durationText}
                    </GapTypeTag>
                  </GapTimeRow>
                  <GapBetweenText>
                    <span>{gap.beforeLecture}</span>
                    <span style={{ color: "#8b95a1" }}> ➔ </span>
                    <span>{gap.afterLecture}</span>
                  </GapBetweenText>
                </GapItemCard>
              ))}
            </GapListSection>
          ) : (
            <NoGapNotice>
              수업 사이에 15분 이상의 공강이 없습니다. (연강 일정)
            </NoGapNotice>
          )}
        </>
      )}
    </TimeTableBox>
  );
};

const GapStatusBadge = styled.span<{ $isDayOff?: boolean; $hasBigGap?: boolean }>`
  font-size: 12px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 12px;
  color: ${({ $isDayOff, $hasBigGap }) =>
    $isDayOff ? "#d97706" : $hasBigGap ? "#7c3aed" : "#0061ff"};
  background-color: ${({ $isDayOff, $hasBigGap }) =>
    $isDayOff ? "#fef3c7" : $hasBigGap ? "#f3e8ff" : "#eff6ff"};
`;

const DayOffBanner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 16px;
  background-color: #fffbeb;
  border-radius: 12px;
  border: 1px solid #fde68a;
  gap: 6px;
`;

const DayOffEmoji = styled.div`
  font-size: 32px;
`;

const DayOffTitle = styled.div`
  font-size: 14.5px;
  font-weight: 700;
  color: #92400e;
`;

const DayOffSub = styled.div`
  font-size: 12.5px;
  color: #b45309;
`;

const GapSummaryStats = styled.div`
  display: flex;
  gap: 8px;
  background-color: #f9fafb;
  padding: 10px 12px;
  border-radius: 12px;
  margin-bottom: 12px;
`;

const StatBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const StatLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #8b95a1;
`;

const StatValue = styled.span<{ $highlight?: boolean }>`
  font-size: 12.5px;
  font-weight: 700;
  color: ${({ $highlight }) => ($highlight ? "#7c3aed" : "#191f28")};
`;

const GapListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GapSectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #4e5968;
  margin-bottom: 2px;
`;

const GapItemCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background-color: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 10px;
`;

const GapTimeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GapTimeSlot = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  color: #191f28;
`;

const GapTypeTag = styled.span<{ $isBig?: boolean }>`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
  color: ${({ $isBig }) => ($isBig ? "#7c3aed" : "#0061ff")};
  background-color: ${({ $isBig }) => ($isBig ? "#f3e8ff" : "#eff6ff")};
`;

const GapBetweenText = styled.div`
  font-size: 11.5px;
  color: #4e5968;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoGapNotice = styled.div`
  text-align: center;
  padding: 16px;
  font-size: 13px;
  color: #6b7684;
  background-color: #f9fafb;
  border-radius: 10px;
`;

const BusHistoryBox = styled.div`
  background-color: var(--surface-primary, #ffffff);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BusAvgBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #eff6ff;
  color: #0061ff;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12.5px;
  strong {
    font-weight: 700;
  }
`;

const BusHistoryDateText = styled.div`
  font-size: 11.5px;
  color: #8b95a1;
  font-weight: 500;
`;

const BusRecordList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BusRecordItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background-color: #f9fafb;
  border-radius: 8px;
  font-size: 12.5px;
`;

const BusRouteBadge = styled.span`
  font-weight: 700;
  color: #191f28;
  background-color: #e5e8eb;
  padding: 2px 6px;
  border-radius: 4px;
`;

const BusPlateText = styled.span`
  color: #8b95a1;
  font-size: 11.5px;
`;

const BusTimeText = styled.span`
  font-weight: 600;
  color: #0061ff;
`;

const CardFooterLink = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 12px;
  color: #8b95a1;
  margin-top: 4px;
`;

const DynamicBox = styled.div<{ $clickable?: boolean }>`
  background-color: var(--surface-primary, #ffffff);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
`;

const DynamicCountBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #0061ff;
  background-color: #eff6ff;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
`;

const DynamicItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DynamicItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  background-color: #f9fafb;
  border-radius: 10px;
  gap: 8px;
`;

const DynamicItemMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;

const DynamicItemTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const DynamicCatTag = styled.span`
  font-size: 10.5px;
  font-weight: 600;
  color: #4e5968;
  background-color: #e5e8eb;
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
`;

const DynamicItemTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #191f28;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DynamicItemSub = styled.span`
  font-size: 11.5px;
  color: #8b95a1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DynamicItemDate = styled.span`
  font-size: 11px;
  color: #b0b8c1;
  flex-shrink: 0;
`;

/**
 * 학적 정보 카드 (Client-side SSO 결과)
 */
const AcademicInfoCard: React.FC<{
  data?: any;
  onNavigate?: () => void;
}> = ({ data }) => {
  if (!data) return null;

  const {
    koreanName,
    studentId,
    departmentName,
    collegeName,
    enrollmentStatus,
    completedSemesterCount,
    acquiredCredits,
    gradeAverage,
    advisorProfessorName,
  } = data;

  return (
    <AcademicCardContainer>
      <AcademicHeader>
        <AcademicIconWrap>
          <GraduationCap size={20} color="#3182f6" />
        </AcademicIconWrap>
        <AcademicTitleWrap>
          <AcademicTitle>{koreanName || "학우님"}의 학적 정보</AcademicTitle>
          <AcademicSubtitle>
            {studentId} · {collegeName ? `${collegeName} ` : ""}{departmentName}
          </AcademicSubtitle>
        </AcademicTitleWrap>
        <StatusBadge $status={enrollmentStatus}>
          {enrollmentStatus || "재학"}
        </StatusBadge>
      </AcademicHeader>

      <AcademicStatGrid>
        <AcademicStatItem>
          <AcademicStatLabel>취득 학점</AcademicStatLabel>
          <AcademicStatValue>{acquiredCredits ? `${acquiredCredits}학점` : "-"}</AcademicStatValue>
        </AcademicStatItem>
        <StatDivider />
        <AcademicStatItem>
          <AcademicStatLabel>평점 평균</AcademicStatLabel>
          <AcademicStatValue>{gradeAverage ? `${gradeAverage}` : "-"}</AcademicStatValue>
        </AcademicStatItem>
        <StatDivider />
        <AcademicStatItem>
          <AcademicStatLabel>이수 학기</AcademicStatLabel>
          <AcademicStatValue>{completedSemesterCount || "-"}</AcademicStatValue>
        </AcademicStatItem>
      </AcademicStatGrid>

      {advisorProfessorName && (
        <AdvisorInfoRow>
          <BookOpen size={13} color="#8b95a1" />
          <span>지도교수: {advisorProfessorName} 교수님</span>
        </AdvisorInfoRow>
      )}
    </AcademicCardContainer>
  );
};

/**
 * 포털 계정 1회 연동 안내 카드 (학적 조회를 위해 연동이 필요한 경우)
 */
const PortalAuthRequiredCard: React.FC<{
  data?: any;
  onNavigate?: () => void;
}> = () => {
  return (
    <PortalAuthContainer>
      <PortalAuthIconWrap>
        <KeyRound size={22} color="#f04452" />
      </PortalAuthIconWrap>
      <PortalAuthTextWrap>
        <PortalAuthTitle>포털 계정 1회 연동이 필요해요</PortalAuthTitle>
        <PortalAuthDesc>
          학적 정보 조회를 위해 최초 1회 포털 로그인이 필요합니다. 입력하신 정보는 기기 보안 영역(KeyStore)에만 안전하게 보관됩니다.
        </PortalAuthDesc>
      </PortalAuthTextWrap>
      <PortalAuthActionBtn
        type="button"
        onClick={() => {
          window.dispatchEvent(new CustomEvent("openPortalAccountModal"));
        }}
      >
        포털 계정 연동하기
      </PortalAuthActionBtn>
    </PortalAuthContainer>
  );
};

const AcademicCardContainer = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid #f2f4f6;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const AcademicHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AcademicIconWrap = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #e8f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const AcademicTitleWrap = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const AcademicTitle = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
`;

const AcademicSubtitle = styled.span`
  font-size: 12px;
  color: #8b95a1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatusBadge = styled.span<{ $status?: string }>`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  background: ${({ $status }) =>
    $status === "휴학" ? "#fee8e8" : "#e8f8f0"};
  color: ${({ $status }) =>
    $status === "휴학" ? "#f04452" : "#00a651"};
  flex-shrink: 0;
`;

const AcademicStatGrid = styled.div`
  display: flex;
  align-items: center;
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px 14px;
  justify-content: space-around;
`;

const AcademicStatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const AcademicStatLabel = styled.span`
  font-size: 11.5px;
  color: #8b95a1;
`;

const AcademicStatValue = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #333d4b;
`;

const StatDivider = styled.div`
  width: 1px;
  height: 24px;
  background: #e5e8eb;
`;

const AdvisorInfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: #8b95a1;
  padding-left: 2px;
`;

const PortalAuthContainer = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #fee8e8;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
`;

const PortalAuthIconWrap = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fde8e9;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PortalAuthTextWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PortalAuthTitle = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #191f28;
`;

const PortalAuthDesc = styled.span`
  font-size: 12px;
  color: #6b7684;
  line-height: 1.4;
`;

const PortalAuthActionBtn = styled.button`
  width: 100%;
  padding: 10px 0;
  background: #3182f6;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
`;

/**
 * 도서관 열람실 실시간 잔여석 인터랙티브 카드
 */
const LibraryRoomsCard: React.FC<{
  data?: any;
  onNavigate?: () => void;
}> = ({ data }) => {
  const rooms: any[] = Array.isArray(data?.rooms) ? data.rooms : (Array.isArray(data) ? data : []);

  return (
    <LibraryCardBox>
      <CardHeader>
        <BookOpen size={17} color="#3182f6" />
        <CardTitle>학산도서관 실시간 열람실</CardTitle>
        <LibCountBadge>실시간 현황</LibCountBadge>
      </CardHeader>
      <LibRoomList>
        {rooms.slice(0, 5).map((room: any, idx: number) => {
          const total = room.seats?.total ?? room.totalSeats ?? 0;
          const occupied = room.seats?.occupied ?? room.occupiedSeats ?? 0;
          const available = room.seats?.available ?? room.availableSeats ?? Math.max(0, total - occupied);
          const percent = total > 0 ? Math.round((occupied / total) * 100) : 0;

          return (
            <LibRoomItem key={room.id ?? idx}>
              <LibRoomHeader>
                <LibRoomName>{room.name}</LibRoomName>
                <LibRoomSeats>
                  <LibAvailable>{available}석</LibAvailable> / {total}석
                </LibRoomSeats>
              </LibRoomHeader>
              <LibProgressBarTrack>
                <LibProgressBarFill $percent={percent} $warning={percent >= 85} />
              </LibProgressBarTrack>
            </LibRoomItem>
          );
        })}
      </LibRoomList>
    </LibraryCardBox>
  );
};

/**
 * 도서관 스터디룸 및 세미나실 목록/예약 인터랙티브 카드
 */
const LibraryStudyRoomsCard: React.FC<{
  data?: any;
  onNavigate?: () => void;
}> = ({ data }) => {
  const rooms: any[] = Array.isArray(data?.rooms) ? data.rooms : (Array.isArray(data) ? data : []);
  const notice: string = data?.notice || "스터디룸 예약은 1회 최대 2시간, 당일 예약 가능합니다.";

  const handleBookRoom = (roomId: number, roomName?: string) => {
    console.log(`[LibraryStudyRoomsCard] Booking room ${roomId}: ${roomName}`);
    window.open(`https://lib.inu.ac.kr/#/facility/study-room`, "_blank", "noopener,noreferrer");
  };

  return (
    <LibraryCardBox>
      <CardHeader>
        <Users size={17} color="#0061ff" />
        <CardTitle>학산도서관 스터디룸</CardTitle>
        <StudyRoomCountBadge>예약 가능</StudyRoomCountBadge>
      </CardHeader>
      <StudyNoticeBox>
        <span>💡 {notice}</span>
      </StudyNoticeBox>
      <StudyRoomList>
        {rooms.map((room: any, idx: number) => {
          const location = room.location || (room.floor?.label ? `${room.roomType?.name || ''} ${room.floor.label}` : "도서관");
          const quota = room.quota || (room.minQuota && room.maxQuota ? `${room.minQuota}~${room.maxQuota}명` : "정원 문의");
          const tags: string[] = Array.isArray(room.tags) ? room.tags : [];
          const availSummary = room.availableSummary || room.availableHoursSummary;

          return (
            <StudyRoomItem key={room.id ?? idx}>
              <StudyRoomTop>
                <div>
                  <StudyRoomName>{room.name}</StudyRoomName>
                  <StudyRoomLocation>{location} · 정원 {quota}</StudyRoomLocation>
                </div>
                <StudyBookButton
                  type="button"
                  onClick={() => handleBookRoom(room.id, room.name)}
                >
                  예약하기
                </StudyBookButton>
              </StudyRoomTop>
              {availSummary && (
                <StudyAvailSlotBadge>
                  ⏰ 가능: {availSummary}
                </StudyAvailSlotBadge>
              )}
              {tags.length > 0 && (
                <StudyTagRow>
                  {tags.map((t, tIdx) => (
                    <StudyTag key={tIdx}>{t}</StudyTag>
                  ))}
                </StudyTagRow>
              )}
            </StudyRoomItem>
          );
        })}
      </StudyRoomList>
    </LibraryCardBox>
  );
};

/**
 * 도서관 계정 연동 안내 카드
 */
const LibraryAuthRequiredCard: React.FC<{
  data?: any;
  onNavigate?: () => void;
}> = () => {
  return (
    <PortalAuthContainer>
      <PortalAuthIconWrap style={{ background: '#e8f3ff' }}>
        <BookOpen size={22} color="#3182f6" />
      </PortalAuthIconWrap>
      <PortalAuthTextWrap>
        <PortalAuthTitle>도서관 계정 연동이 필요해요</PortalAuthTitle>
        <PortalAuthDesc>
          좌석 예약, 이용 연장 및 스터디룸 신청을 위해 도서관 로그인이 필요합니다. 기기 보안 영역(SecureStore)에만 안전하게 보관됩니다.
        </PortalAuthDesc>
      </PortalAuthTextWrap>
      <PortalAuthActionBtn
        type="button"
        onClick={() => {
          window.dispatchEvent(new CustomEvent("openLibraryAccountModal"));
        }}
      >
        도서관 계정 연동하기
      </PortalAuthActionBtn>
    </PortalAuthContainer>
  );
};

const LibraryCardBox = styled.div`
  padding: 16px;
  background: #ffffff;
`;

const LibCountBadge = styled.span`
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: #3182f6;
  background: #e8f3ff;
  padding: 2px 8px;
  border-radius: 6px;
`;

const LibRoomList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
`;

const LibRoomItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LibRoomHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LibRoomName = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: #191f28;
`;

const LibRoomSeats = styled.span`
  font-size: 12.5px;
  color: #8b95a1;
`;

const LibAvailable = styled.strong`
  color: #3182f6;
  font-weight: 700;
`;

const LibProgressBarTrack = styled.div`
  width: 100%;
  height: 6px;
  background: #f2f4f6;
  border-radius: 3px;
  overflow: hidden;
`;

const LibProgressBarFill = styled.div<{ $percent: number; $warning: boolean }>`
  height: 100%;
  width: ${({ $percent }) => Math.min(100, Math.max(0, $percent))}%;
  background: ${({ $warning }) => ($warning ? "#f04452" : "#3182f6")};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const StudyRoomCountBadge = styled.span`
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: #0061ff;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 6px;
`;

const StudyNoticeBox = styled.div`
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 11.5px;
  color: #475569;
  line-height: 1.4;
`;

const StudyRoomList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
`;

const StudyRoomItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
`;

const StudyRoomTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StudyRoomName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
`;

const StudyRoomLocation = styled.div`
  font-size: 11.5px;
  color: #64748b;
  margin-top: 2px;
`;

const StudyBookButton = styled.button`
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  background: #0061ff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background: #0050d4;
  }
`;

const StudyAvailSlotBadge = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #0284c7;
  background: #f0f9ff;
  padding: 3px 6px;
  border-radius: 4px;
  width: fit-content;
`;

const StudyTagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
`;

const StudyTag = styled.span`
  font-size: 10.5px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
`;

/**
 * LMS 과제 및 마감 일정 인터랙티브 카드
 */
const LmsAssignmentsCard: React.FC<{
  data?: any;
  onNavigate?: () => void;
}> = ({ data }) => {
  const events: any[] = Array.isArray(data?.events) ? data.events : (Array.isArray(data) ? data : []);
  const courses: any[] = Array.isArray(data?.courses) ? data.courses : [];

  return (
    <LibraryCardBox>
      <CardHeader>
        <GraduationCap size={18} color="#00a651" />
        <CardTitle>사이버캠퍼스(LMS) 과제 & 강좌</CardTitle>
        <LmsCountBadge>
          {events.length > 0 ? `마감 예정 ${events.length}건` : `수강 중 ${courses.length}과목`}
        </LmsCountBadge>
      </CardHeader>

      {events.length === 0 && courses.length === 0 ? (
        <EmptyMessage>예정된 과제나 일정이 없습니다. 👍</EmptyMessage>
      ) : events.length > 0 ? (
        <LmsItemList>
          {events.slice(0, 5).map((ev: any, idx: number) => {
            const dueDate = ev.timesort ? new Date(ev.timesort * 1000) : null;
            const diffDays = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
            const isUrgent = diffDays !== null && diffDays <= 2;

            return (
              <LmsItem key={ev.id ?? idx}>
                <LmsItemMain>
                  <LmsItemCourse>{ev.course?.fullname || "강좌"}</LmsItemCourse>
                  <LmsItemTitle>{ev.name}</LmsItemTitle>
                </LmsItemMain>
                <LmsItemDue $urgent={Boolean(isUrgent)}>
                  {diffDays !== null ? (diffDays <= 0 ? "오늘 마감" : `D-${diffDays}`) : "기한 있음"}
                </LmsItemDue>
              </LmsItem>
            );
          })}
        </LmsItemList>
      ) : (
        <LmsItemList>
          {courses.slice(0, 5).map((c: any, idx: number) => (
            <LmsItem key={c.id ?? idx}>
              <LmsItemMain>
                <LmsItemTitle style={{ fontSize: 13 }}>{c.fullname}</LmsItemTitle>
                <LmsItemCourse>{c.shortname}</LmsItemCourse>
              </LmsItemMain>
            </LmsItem>
          ))}
        </LmsItemList>
      )}
    </LibraryCardBox>
  );
};

/**
 * LMS 계정 연동 안내 카드
 */
const LmsAuthRequiredCard: React.FC<{
  data?: any;
  onNavigate?: () => void;
}> = () => {
  return (
    <PortalAuthContainer style={{ border: '1px solid #e1f5eb' }}>
      <PortalAuthIconWrap style={{ background: '#e8f8f0' }}>
        <GraduationCap size={22} color="#00a651" />
      </PortalAuthIconWrap>
      <PortalAuthTextWrap>
        <PortalAuthTitle>사이버캠퍼스(LMS) 연동이 필요해요</PortalAuthTitle>
        <PortalAuthDesc>
          강좌별 과제 마감 일정 및 미제출 과제를 확인하려면 LMS 로그인이 필요합니다. 기기 보안 영역(SecureStore)에만 안전하게 보관됩니다.
        </PortalAuthDesc>
      </PortalAuthTextWrap>
      <PortalAuthActionBtn
        type="button"
        style={{ background: '#00a651' }}
        onClick={() => {
          window.dispatchEvent(new CustomEvent("openLmsAccountModal"));
        }}
      >
        LMS 계정 연동하기
      </PortalAuthActionBtn>
    </PortalAuthContainer>
  );
};

const LmsCountBadge = styled.span`
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: #00a651;
  background: #e8f8f0;
  padding: 2px 8px;
  border-radius: 6px;
`;

const LmsItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
`;

const LmsItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 10px;
  gap: 10px;
`;

const LmsItemMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

const LmsItemCourse = styled.span`
  font-size: 11px;
  color: #8b95a1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LmsItemTitle = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: #191f28;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LmsItemDue = styled.span<{ $urgent?: boolean }>`
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${({ $urgent }) => ($urgent ? "#fee8e8" : "#eefaf3")};
  color: ${({ $urgent }) => ($urgent ? "#f04452" : "#00a651")};
  flex-shrink: 0;
`;

/**
 * 스마트 감시 등록 결과 카드
 */
const CampusWatchResultCard: React.FC<{
  data?: any;
  onNavigate?: () => void;
}> = ({ data, onNavigate }) => {
  const navigate = useNavigate();
  const targetName = data?.targetName || "힐링존";
  const remainingMinutes = data?.remainingMinutes || data?.job?.remainingMinutes || 90;

  return (
    <WatchCardBox>
      <CardHeader>
        <Bell size={17} color="#0061ff" />
        <CardTitle>실시간 빈자리 감시 시작</CardTitle>
        <WatchLiveBadge>감시 중</WatchLiveBadge>
      </CardHeader>
      <WatchBody>
        <WatchTargetTitle>{targetName} 빈자리 스나이퍼</WatchTargetTitle>
        <WatchDesc>
          서버가 45초마다 안전하게 감시 중입니다. 빈자리 발생 시 즉시 푸시 알림을 보내드릴게요!
        </WatchDesc>
        <WatchTimeInfo>
          <Clock size={13} color="#f59e0b" />
          <span>최대 감시 시간: 약 {remainingMinutes}분 (만료 시 자동 종료)</span>
        </WatchTimeInfo>
      </WatchBody>
      <WatchManageBtn
        type="button"
        onClick={() => {
          if (onNavigate) onNavigate();
          navigate(ROUTES.MYPAGE.SMART_WATCH);
        }}
      >
        감시 목록 & 관리 페이지 열기
      </WatchManageBtn>
    </WatchCardBox>
  );
};

/**
 * 스마트 감시 목록 카드
 */
const CampusWatchListCard: React.FC<{
  data?: any;
  onNavigate?: () => void;
}> = ({ data, onNavigate }) => {
  const navigate = useNavigate();
  const jobs: any[] = Array.isArray(data?.jobs) ? data.jobs : [];
  const activeJobs = jobs.filter((j: any) => j.status === "ACTIVE");

  return (
    <WatchCardBox>
      <CardHeader>
        <Bell size={17} color="#0061ff" />
        <CardTitle>내 스마트 감시 현황</CardTitle>
        <WatchCountBadge>{activeJobs.length}건 진행 중</WatchCountBadge>
      </CardHeader>
      {activeJobs.length === 0 ? (
        <WatchEmptyText>현재 진행 중인 실시간 빈자리 감시가 없습니다.</WatchEmptyText>
      ) : (
        <WatchMiniList>
          {activeJobs.slice(0, 4).map((job: any) => (
            <WatchMiniItem key={job.id}>
              <div>
                <WatchMiniName>{job.targetName}</WatchMiniName>
                <WatchMiniSub>{job.domainDescription || "도서관"}</WatchMiniSub>
              </div>
              <WatchMiniTime>약 {job.remainingMinutes}분 남음</WatchMiniTime>
            </WatchMiniItem>
          ))}
        </WatchMiniList>
      )}
      <WatchManageBtn
        type="button"
        onClick={() => {
          if (onNavigate) onNavigate();
          navigate(ROUTES.MYPAGE.SMART_WATCH);
        }}
      >
        스마트 감시 관리 대시보드
      </WatchManageBtn>
    </WatchCardBox>
  );
};

const WatchCardBox = styled.div`
  padding: 16px;
  background: #ffffff;
`;

const WatchLiveBadge = styled.span`
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: #16a34a;
  background: #dcfce7;
  padding: 2px 8px;
  border-radius: 6px;
`;

const WatchCountBadge = styled.span`
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: #0061ff;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 6px;
`;

const WatchBody = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const WatchTargetTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
`;

const WatchDesc = styled.div`
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
`;

const WatchTimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: #d97706;
  font-weight: 600;
  margin-top: 4px;
`;

const WatchManageBtn = styled.button`
  margin-top: 14px;
  width: 100%;
  padding: 10px;
  font-size: 12.5px;
  font-weight: 600;
  color: #0061ff;
  background: #eff6ff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  &:hover {
    background: #dbeafe;
  }
`;

const WatchEmptyText = styled.div`
  padding: 16px 0;
  font-size: 12.5px;
  color: #94a3b8;
  text-align: center;
`;

const WatchMiniList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
`;

const WatchMiniItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: #f8fafc;
  border-radius: 8px;
`;

const WatchMiniName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
`;

const WatchMiniSub = styled.div`
  font-size: 11px;
  color: #64748b;
`;

const WatchMiniTime = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #f59e0b;
`;

export default AgentGenerativeCards;


