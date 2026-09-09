import React from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { formatRoom } from "@/components/mobile/timetable/TimetableGrid";
import {
  ExternalLink,
  Phone,
  Calendar,
  Clock,
  Bus as BusIcon,
  Utensils,
  LogIn,
  Bell,
  Sliders,
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

const SingleCardItem: React.FC<{
  component: UiComponent;
  onNavigate?: () => void;
}> = ({ component, onNavigate }) => {
  const navigate = useNavigate();

  const handleLinkClick = (url: string) => {
    if (onNavigate) onNavigate();
    if (url.startsWith("http")) {
      window.open(url, "_blank");
    } else {
      navigate(url);
    }
  };

  const renderContent = () => {
    switch (component.type) {
      case "WEATHER":
        return <WeatherCard data={component.data} />;
      case "NOTICE_LIST":
        return (
          <NoticeListCard
            data={component.data}
            onItemClick={(id) => {
              if (onNavigate) onNavigate();
              navigate(ROUTES.BOARD.NOTICE_DETAIL(id));
            }}
          />
        );
      case "CAFETERIA":
        return <CafeteriaCard data={component.data} />;
      case "BUS":
        return <BusCard data={component.data} />;
      case "TIMETABLE":
        return <TimeTableCard data={component.data} />;
      case "SCHEDULE":
        return <ScheduleCard data={component.data} />;
      case "DIRECTORY":
        return <DirectoryCard data={component.data} />;
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
      case "MY_SETTINGS":
        return <MySettingsCard data={component.data} />;
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
  onItemClick: (id: number) => void;
}> = ({ data, onItemClick }) => {
  const notices: any[] = Array.isArray(data) ? data : [];

  if (notices.length === 0) {
    return <EmptyMessage>조회된 공지사항이 없습니다.</EmptyMessage>;
  }

  return (
    <NoticeListBox>
      {notices.slice(0, 4).map((item, idx) => (
        <NoticeItemRow key={item.id ?? idx} onClick={() => onItemClick(item.id)}>
          <NoticeHeaderRow>
            {item.category && <NoticeBadge>{item.category}</NoticeBadge>}
            <NoticeDate>{item.createDate || item.date || ""}</NoticeDate>
          </NoticeHeaderRow>
          <NoticeTitle>{item.title}</NoticeTitle>
          {item.writer && <NoticeWriter>{item.writer}</NoticeWriter>}
        </NoticeItemRow>
      ))}
    </NoticeListBox>
  );
};

/* --- 3. Cafeteria Card --- */
const CafeteriaCard: React.FC<{ data: any }> = ({ data }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);
  if (!data) return null;

  if (data.isAllCafeterias) {
    const cafeterias: any[] = Array.isArray(data.cafeterias) ? data.cafeterias : [];
    const activeCafeterias = cafeterias.filter((c) => c.isOperated);
    const displayList = activeCafeterias.length > 0 ? activeCafeterias : cafeterias;
    const currentCafeteria = displayList[selectedTab] || displayList[0];

    return (
      <CafeteriaBox>
        <CardHeader>
          <Utensils size={16} color="#0061ff" />
          <CardTitle>오늘의 학식 ({data.mealLabel || "메뉴"})</CardTitle>
        </CardHeader>

        <CafeteriaTabBar>
          {displayList.map((c, idx) => (
            <CafeteriaTabBtn
              key={c.name}
              type="button"
              $active={selectedTab === idx}
              onClick={() => setSelectedTab(idx)}
            >
              {c.name.replace("식당", "").replace("(교직원)", "")}
            </CafeteriaTabBtn>
          ))}
        </CafeteriaTabBar>

        {currentCafeteria ? (
          <CafeteriaMenuContent>
            <CafeteriaSelectedTitle>
              {currentCafeteria.name}
            </CafeteriaSelectedTitle>
            <MealValue>
              {currentCafeteria.menu || "운영 정보가 없습니다."}
            </MealValue>
          </CafeteriaMenuContent>
        ) : (
          <EmptyMessage>운영 중인 식당 정보를 찾지 못했습니다.</EmptyMessage>
        )}
      </CafeteriaBox>
    );
  }

  return (
    <CafeteriaBox>
      <CardHeader>
        <Utensils size={16} color="#0061ff" />
        <CardTitle>{data.cafeteria || "식당"}</CardTitle>
      </CardHeader>
      <MealRow>
        <MealLabel>중식</MealLabel>
        <MealValue>{data.lunch || "메뉴 정보가 없습니다."}</MealValue>
      </MealRow>
      {data.dinner && data.dinner !== "-" && (
        <MealRow>
          <MealLabel>석식</MealLabel>
          <MealValue>{data.dinner}</MealValue>
        </MealRow>
      )}
      {data.breakfast && data.breakfast !== "-" && (
        <MealRow>
          <MealLabel>조식</MealLabel>
          <MealValue>{data.breakfast}</MealValue>
        </MealRow>
      )}
    </CafeteriaBox>
  );
};

/* --- 4. Bus Realtime Card --- */
const BusCard: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;
  const arrivals: any[] = Array.isArray(data.arrivals) ? data.arrivals : [];

  return (
    <BusBox>
      <CardHeader>
        <BusIcon size={16} color="#0061ff" />
        <CardTitle>[{data.stopName || "정류소"}] 실시간 도착</CardTitle>
      </CardHeader>
      {arrivals.length === 0 ? (
        <EmptyMessage>현재 도착 예정인 버스가 없습니다.</EmptyMessage>
      ) : (
        <BusList>
          {arrivals.slice(0, 4).map((b, idx) => {
            const sec = parseInt(b.arrivalEstimateTime || "0", 10);
            const min = Math.floor(sec / 60);
            return (
              <BusItemRow key={idx}>
                <BusRouteNumber>{b.routeNo}</BusRouteNumber>
                <BusTimeInfo>
                  <BusMinText>{min > 0 ? `${min}분` : "곧 도착"}</BusMinText>
                  <BusStopCount>({b.restStopCount}개 정류소 전)</BusStopCount>
                </BusTimeInfo>
              </BusItemRow>
            );
          })}
        </BusList>
      )}
    </BusBox>
  );
};

/* --- 5. TimeTable Card --- */
const TimeTableCard: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;

  if (data.hasTimetable === false) {
    return (
      <TimeTableBox>
        <TodayHeader>
          <TodayHeaderLeft>
            <Clock size={16} color="#0061ff" />
            <TodayTitle>오늘의 시간표</TodayTitle>
          </TodayHeaderLeft>
        </TodayHeader>
        <TimetableEmptyState>
          <TimetableEmptyText>
            등록된 시간표가 없어요. 시간표를 만들어 보세요.
          </TimetableEmptyText>
        </TimetableEmptyState>
      </TimeTableBox>
    );
  }

  const todayClasses: any[] = Array.isArray(data.todayClasses) ? data.todayClasses : [];

  return (
    <TimeTableBox>
      <TodayHeader>
        <TodayHeaderLeft>
          <Clock size={16} color="#0061ff" />
          <TodayTitle>{data.todayDateText || "오늘의 시간표"}</TodayTitle>
        </TodayHeaderLeft>
        {data.statusText && (
          <TodayStatusBadge>{data.statusText}</TodayStatusBadge>
        )}
      </TodayHeader>

      {todayClasses.length > 0 ? (
        <ClassListContainer>
          {todayClasses.map((classItem, idx) => (
            <ClassItemRow key={idx} $current={Boolean(classItem.isCurrent)}>
              <ClassNameText>{classItem.name}</ClassNameText>
              <ClassInfoText>
                <ClassDetailTime>
                  {classItem.startTime}~{classItem.endTime}
                </ClassDetailTime>
                {classItem.room && (
                  <ClassRoomLocation>{formatRoom(classItem.room)}</ClassRoomLocation>
                )}
              </ClassInfoText>
            </ClassItemRow>
          ))}
        </ClassListContainer>
      ) : (
        <TimetableEmptyState>
          <TimetableEmptyText>
            오늘은 등록된 수업이 없어요.
          </TimetableEmptyText>
        </TimetableEmptyState>
      )}
    </TimeTableBox>
  );
};

/* --- 6. Schedule Card --- */
const ScheduleCard: React.FC<{ data: any }> = ({ data }) => {
  const schedules: any[] = Array.isArray(data) ? data : [];

  return (
    <ScheduleBox>
      <CardHeader>
        <Calendar size={16} color="#0061ff" />
        <CardTitle>학사 및 학과 일정</CardTitle>
      </CardHeader>
      {schedules.length === 0 ? (
        <EmptyMessage>예정된 일정이 없습니다.</EmptyMessage>
      ) : (
        <ScheduleList>
          {schedules.slice(0, 4).map((s, idx) => (
            <ScheduleItem key={s.id ?? idx}>
              <ScheduleTitle>{s.title}</ScheduleTitle>
              <SchedulePeriod>
                {s.start} ~ {s.end}
              </SchedulePeriod>
            </ScheduleItem>
          ))}
        </ScheduleList>
      )}
    </ScheduleBox>
  );
};

/* --- 7. Directory Card --- */
const DirectoryCard: React.FC<{ data: any }> = ({ data }) => {
  const contacts: any[] = Array.isArray(data) ? data : [];

  return (
    <DirectoryBox>
      <CardHeader>
        <Phone size={16} color="#0061ff" />
        <CardTitle>교내 연락처</CardTitle>
      </CardHeader>
      {contacts.length === 0 ? (
        <EmptyMessage>연락처 검색 결과가 없습니다.</EmptyMessage>
      ) : (
        <DirectoryList>
          {contacts.slice(0, 3).map((c, idx) => (
            <DirectoryItem key={c.id ?? idx}>
              <DirectoryMeta>
                <DeptName>{c.departmentName}</DeptName>
                <CollegeName>{c.collegeName}</CollegeName>
              </DirectoryMeta>
              {c.officePhoneNumber && (
                <CallButton href={`tel:${c.officePhoneNumber}`}>
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

/* --- Styled Components --- */
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

const NoticeItemRow = styled.div`
  padding: 12px 14px;
  border-bottom: 1px solid #f2f4f6;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NoticeHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const NoticeBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #0061ff;
  background-color: #eff6ff;
  padding: 2px 6px;
  border-radius: 6px;
`;

const NoticeDate = styled.span`
  font-size: 11px;
  color: #8b95a1;
`;

const NoticeTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #191f28;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NoticeWriter = styled.div`
  font-size: 11px;
  color: #8b95a1;
  margin-top: 4px;
`;

/* Cafeteria */
const CafeteriaBox = styled.div`
  padding: 14px;
`;

const MealRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.4;
`;

const MealLabel = styled.span`
  font-weight: 700;
  color: #0061ff;
  flex-shrink: 0;
  width: 32px;
`;

const MealValue = styled.span`
  color: #333d4b;
  white-space: pre-wrap;
  word-break: break-word;
`;

const CafeteriaTabBar = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 4px 0 8px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid #f2f4f6;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CafeteriaTabBtn = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  padding: 4px 9px;
  font-size: 11.5px;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? "#0061ff" : "#e5e8eb")};
  background-color: ${({ $active }) => ($active ? "#eff6ff" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#0061ff" : "#4e5968")};
  cursor: pointer;
  transition: all 0.15s ease;
`;

const CafeteriaMenuContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 0;
`;

const CafeteriaSelectedTitle = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #191f28;
`;

/* Bus */
const BusBox = styled.div`
  padding: 14px;
`;

const BusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
`;

const BusItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background-color: #f7f9fc;
  border-radius: 8px;
`;

const BusRouteNumber = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #191f28;
`;

const BusTimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BusMinText = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #f04438;
`;

const BusStopCount = styled.span`
  font-size: 11px;
  color: #8b95a1;
`;

/* Timetable */
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
  color: #333d4b;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  letter-spacing: -0.2px;
`;

const TodayStatusBadge = styled.span`
  color: #0061ff;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
`;

const ClassListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ClassItemRow = styled.div<{ $current: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: ${({ $current }) => ($current ? "#eff6ff" : "transparent")};
  ${({ $current }) =>
    $current &&
    css`
      border-left: 3px solid #0061ff;
      padding-left: 9px;
    `}
`;

const ClassNameText = styled.span`
  color: #333d4b;
  font-size: 14.5px;
  font-weight: 600;
  line-height: 20px;
`;

const ClassInfoText = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const ClassDetailTime = styled.span`
  color: #333d4b;
  opacity: 0.6;
`;

const ClassRoomLocation = styled.span`
  color: #333d4b;
  font-weight: 600;
`;

const TimetableEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
`;

const TimetableEmptyText = styled.p`
  margin: 0;
  color: #b0b8c1;
  font-size: 13.5px;
  text-align: center;
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

const ScheduleItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid #f2f4f6;
  padding-bottom: 6px;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const ScheduleTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #191f28;
`;

const SchedulePeriod = styled.span`
  font-size: 11px;
  color: #8b95a1;
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

export default AgentGenerativeCards;
