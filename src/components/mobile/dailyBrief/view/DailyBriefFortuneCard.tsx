import { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { getWeathers } from "@/apis/weathers";
import { WeatherInfo } from "@/types/weathers";
import useUserStore from "@/stores/useUserStore";
import { useTimetableStore } from "@/stores/useTimetableStore";

interface FortuneTip {
  keyword: string;
  message: string;
  luckyItem: string;
}

export default function DailyBriefFortuneCard() {
  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken);
  const { timetables, selectedSemester } = useTimetableStore();
  const [weatherData, setWeatherData] = useState<WeatherInfo | null>(null);

  useEffect(() => {
    let isMounted = true;
    void getWeathers()
      .then((res) => {
        if (isMounted && res.data) {
          setWeatherData(res.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const now = useMemo(() => new Date(), []);
  const todayDayOfWeek = (now.getDay() + 6) % 7; // 0: 월 ~ 6: 일 (0: 월, 4: 금, 5: 토, 6: 일)
  const isWeekend = todayDayOfWeek === 5 || todayDayOfWeek === 6;

  // 대표 시간표의 오늘 수업 개수
  const representativeTimetableId = useMemo(() => {
    if (!isLoggedIn) return null;
    const targetSemester =
      selectedSemester ||
      (timetables.find((t) => t.isRepresentative)?.semester ??
        timetables[0]?.semester);
    const inSemester = targetSemester
      ? timetables.filter((t) => t.semester === targetSemester)
      : timetables;
    return (
      inSemester.find((t) => t.isRepresentative)?.id ??
      inSemester[0]?.id ??
      timetables.find((t) => t.isRepresentative)?.id ??
      timetables[0]?.id ??
      null
    );
  }, [isLoggedIn, selectedSemester, timetables]);

  const activeTimetable = useMemo(
    () =>
      timetables.find((timetable) => timetable.id === representativeTimetableId),
    [representativeTimetableId, timetables],
  );

  const todayClasses = useMemo(() => {
    if (!activeTimetable || !activeTimetable.events) return [];
    return activeTimetable.events.filter((cls) => cls.day === todayDayOfWeek);
  }, [activeTimetable, todayDayOfWeek]);

  // 상황 인지형 맞춤 팁 계산
  const currentTip = useMemo<FortuneTip>(() => {
    const sky = weatherData?.sky || "";
    const pm10Grade = weatherData?.pm10Grade || "";

    // 1. 날씨: 비 또는 눈 예보
    if (sky.includes("비")) {
      return {
        keyword: "우산 챙기기 ☔",
        message:
          "오늘은 송도 캠퍼스에 비 소식이 있어요. 이동할 땐 건물 간 연결 통로나 우산을 꼭 챙겨주세요!",
        luckyItem: "튼튼한 3단 우산 & 방수 파우치",
      };
    }
    if (sky.includes("눈")) {
      return {
        keyword: "따뜻한 옷차림 ❄️",
        message:
          "캠퍼스에 눈 소식이 있어요. 바닥이 미끄러우니 조심하시고 따뜻하게 입고 외출하세요!",
        luckyItem: "핫팩 & 따뜻한 목도리",
      };
    }

    // 2. 미세먼지 나쁨
    if (pm10Grade === "나쁨" || pm10Grade === "매우나쁨") {
      return {
        keyword: "공기 정화 모드 😷",
        message:
          "미세먼지 수치가 다소 높아요. 야외 활동 시 마스크를 챙기시고 실내 시설을 적극 활용해 보세요.",
        luckyItem: "KF94 마스크 & 수분 보충",
      };
    }

    // 3. 월요일
    if (todayDayOfWeek === 0) {
      return {
        keyword: "새로운 한 주의 시작 💪",
        message:
          "새로운 한 주가 시작되었어요! 월요병은 가볍게 털어내고 이번 주도 힘차게 출발해 볼까요?",
        luckyItem: "시원한 아이스 아메리카노",
      };
    }

    // 4. 금요일
    if (todayDayOfWeek === 4) {
      return {
        keyword: "불타는 금요일 ✨",
        message:
          "드디어 기다리던 금요일이에요! 오늘 하루만 힘내서 잘 마무리하고 행복한 주말을 맞이해요.",
        luckyItem: "신나는 음악 플레이리스트",
      };
    }

    // 5. 주말
    if (isWeekend) {
      return {
        keyword: "달콤한 주말 휴식 🌿",
        message:
          "평일 동안 열심히 달려온 나를 위한 꿀 같은 주말이에요. 푹 쉬면서 에너지를 가득 채워보세요.",
        luckyItem: "달콤한 디저트 & 넷플릭스",
      };
    }

    // 6. 수업이 3개 이상인 빡빡한 날
    if (isLoggedIn && todayClasses.length >= 3) {
      return {
        keyword: "열정과 몰입 🔥",
        message:
          "오늘 강의 일정이 빽빽한 날이네요! 수업 중간 쉬는 시간마다 가벼운 스트레칭과 심호흡으로 체력을 챙겨요.",
        luckyItem: "에너지 간식 & 시원한 물",
      };
    }

    // 7. 평일 공강인 날
    if (isLoggedIn && todayClasses.length === 0) {
      return {
        keyword: "여유로운 꿀공강 ☕",
        message:
          "오늘은 수업이 없는 자유로운 날이에요! 학산도서관에서 독서를 하거나 밀린 과제를 여유롭게 끝내보세요.",
        luckyItem: "노트북 & 좋아하는 카페 음악",
      };
    }

    // 8. 기본 평일 순환 팁
    const defaultTips: FortuneTip[] = [
      {
        keyword: "도서관 집중 모드 📚",
        message:
          "오늘은 학산도서관 열람실에서 집중력이 높아지는 날이에요. 미뤄둔 과제나 독서를 차분히 진행해 보세요.",
        luckyItem: "텀블러 & 파란색 볼펜",
      },
      {
        keyword: "뜻밖의 꿀팁 🍀",
        message:
          "강의실이나 동아리방에서 동기, 선배와의 대화 중에 유익한 공모전이나 취업 팁을 얻을 수 있는 하루예요.",
        luckyItem: "따뜻한 음료",
      },
      {
        keyword: "알찬 하루 계획 📝",
        message:
          "강의 시작 전 오늘 꼭 끝낼 일 3가지를 메모장에 적어보세요. 성취감 가득한 하루가 될 거예요.",
        luckyItem: "깔끔한 체크리스트",
      },
      {
        keyword: "달콤한 산책 🍂",
        message:
          "바쁜 강의 일정 사이, 캠퍼스 잔디마당이나 호수 주변을 걸으며 신선한 공기를 마셔보세요.",
        luckyItem: "편안한 운동화",
      },
    ];

    const daySeed =
      now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    return defaultTips[daySeed % defaultTips.length];
  }, [
    weatherData,
    todayDayOfWeek,
    isWeekend,
    isLoggedIn,
    todayClasses.length,
    now,
  ]);

  return (
    <SectionWrapper>
      <ContextIntro>횃불이의 오늘 한마디를 확인해 볼까요?</ContextIntro>
      <CardContainer>
        <CardHeader>
          <HeaderLeft>
            <SparkleIconCircle>💬</SparkleIconCircle>
            <CardTitle>횃불이 한마디</CardTitle>
          </HeaderLeft>
        </CardHeader>

        <FortuneBody>
          <KeywordTag>{currentTip.keyword}</KeywordTag>
          <FortuneMessage>{currentTip.message}</FortuneMessage>
          <LuckyItemRow>
            <LuckyItemLabel>오늘의 추천 아이템:</LuckyItemLabel>
            <LuckyItemValue>{currentTip.luckyItem}</LuckyItemValue>
          </LuckyItemRow>
        </FortuneBody>
      </CardContainer>
    </SectionWrapper>
  );
}

const SectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

const ContextIntro = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding: 0 4px;
  letter-spacing: -0.3px;
  line-height: 1.35;
`;

const CardContainer = styled.div`
  background: rgba(255, 255, 255, 0.65);
  border-radius: 28px;
  padding: 22px 20px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.02);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SparkleIconCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const CardTitle = styled.h2`
  font-size: 17px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.4px;
  margin: 0;
`;

const FortuneBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  background-color: #fafaf9;
  border-radius: 18px;
  border: 1px solid #f5f5f4;
`;

const KeywordTag = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: #2563eb;
`;

const FortuneMessage = styled.p`
  font-size: 14.5px;
  font-weight: 500;
  color: #374151;
  line-height: 1.5;
  margin: 0;
  letter-spacing: -0.2px;
`;

const LuckyItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding-top: 6px;
  border-top: 1px dashed #e7e5e4;
`;

const LuckyItemLabel = styled.span`
  font-weight: 600;
  color: #78716c;
`;

const LuckyItemValue = styled.span`
  font-weight: 700;
  color: #1c1917;
`;
