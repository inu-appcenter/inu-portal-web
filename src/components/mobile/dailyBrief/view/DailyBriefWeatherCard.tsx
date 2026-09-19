import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { getWeathers } from "@/apis/weathers";
import { WeatherInfo } from "@/types/weathers";
import Icon from "@/components/common/Icon";
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

const NAVER_WEATHER_URL = "https://weather.naver.com/today/11185106";

const getGradientForWeather = (sky: string, isNight: boolean): string => {
  if (isNight) {
    return "linear-gradient(135deg, #1e293b 0%, #1e1b4b 55%, #0f172a 100%)";
  }

  if (sky.includes("비") || sky.includes("진눈깨비")) {
    return "linear-gradient(135deg, #475569 0%, #546e7a 50%, #37474f 100%)";
  }
  if (sky.includes("눈")) {
    return "linear-gradient(135deg, #64748b 0%, #78909c 50%, #90a4ae 100%)";
  }
  if (sky.includes("구름") || sky.includes("흐림")) {
    return "linear-gradient(135deg, #5b9bd5 0%, #7b9ebc 50%, #94a3b8 100%)";
  }
  // 맑음 (차분하고 산뜻한 파스텔 스카이-민트)
  return "linear-gradient(135deg, #4299e1 0%, #5dade2 50%, #68d391 100%)";
};

export default function DailyBriefWeatherCard() {
  const [weatherData, setWeatherData] = useState<WeatherInfo | null>(null);

  useEffect(() => {
    let isMounted = true;
    void getWeathers()
      .then((res) => {
        if (isMounted && res.data) {
          setWeatherData(res.data);
        }
      })
      .catch((err) => {
        console.warn("Daily brief 날씨 조회 실패:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCardClick = () => {
    window.open(NAVER_WEATHER_URL, "_blank", "noopener,noreferrer");
  };

  const rawTemp = weatherData?.temperature?.replace(/[^0-9.-]/g, "") || "21";
  const skyText = weatherData?.sky || "맑음";
  const pm10Grade = weatherData?.pm10Grade || "보통";
  const pm10Value = weatherData?.pm10Value ? `${weatherData.pm10Value}㎍/㎥` : "";
  const pm25Grade = weatherData?.pm25Grade || "좋음";
  const pm25Value = weatherData?.pm25Value ? `${weatherData.pm25Value}㎍/㎥` : "";

  const currentHour = useMemo(() => new Date().getHours(), []);
  const isNight = weatherData?.day === "night" || currentHour >= 19 || currentHour < 6;

  const { image, isShiftedIcon } = useMemo(() => {
    const skyName = (skyText in SKY_CONDITION_SLUGS ? skyText : "맑음") as SkyConditionName;
    const slug = SKY_CONDITION_SLUGS[skyName] ?? FALLBACK_SKY_CONDITION_SLUG;
    const illustration = SKY_ILLUSTRATIONS[slug];

    return {
      image: isNight ? illustration.night : illustration.day,
      isShiftedIcon: illustration.isShiftedIcon,
    };
  }, [skyText, isNight]);

  const pm10GradeImage = useMemo(() => {
    const slug = PM_GRADE_SLUGS[pm10Grade as PmGradeName];
    return slug ? PM_GRADE_ILLUSTRATIONS[slug] : undefined;
  }, [pm10Grade]);

  const pm25GradeImage = useMemo(() => {
    const slug = PM_GRADE_SLUGS[pm25Grade as PmGradeName];
    return slug ? PM_GRADE_ILLUSTRATIONS[slug] : undefined;
  }, [pm25Grade]);

  const cardGradient = useMemo(
    () => getGradientForWeather(skyText, isNight),
    [skyText, isNight],
  );

  return (
    <SectionWrapper>
      <ContextIntro>송도 캠퍼스 날씨를 확인해 보세요.</ContextIntro>
      <WeatherCardWrapper
        $gradient={cardGradient}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
      >
        <AmbientBgImage src={WEATHER_BACKGROUND} alt="" />

        <ContentLayer>
          <CardHeader>
            <HeaderLeft>
              <CardTitle>캠퍼스 날씨</CardTitle>
              <LocationBadge>연수구 송도동</LocationBadge>
            </HeaderLeft>
            <LinkIconBadge aria-label="네이버 날씨 새창 열기">
              <Icon name="link-external" size={15} color="#FFFFFF" />
            </LinkIconBadge>
          </CardHeader>

          <MainWeatherRow>
            <IllustrationWrapper $isShifted={isShiftedIcon}>
              <WeatherIllustration src={image} alt={skyText} />
            </IllustrationWrapper>

            <TempInfoWrapper>
              <TempRow>
                <CurrentTemp>{rawTemp}°</CurrentTemp>
                <SkyStatusBadge>{skyText}</SkyStatusBadge>
              </TempRow>
              <WeatherSubDesc>
                {isNight ? "편안하고 고요한 밤이에요" : "상쾌한 하루 보내세요"}
              </WeatherSubDesc>
            </TempInfoWrapper>
          </MainWeatherRow>

          <AirQualityGrid>
            <AirQualityBox>
              <AirQualityTitle>미세먼지</AirQualityTitle>
              <AirQualityStatusRow>
                {pm10GradeImage && (
                  <PmIconImage src={pm10GradeImage} alt={pm10Grade} />
                )}
                <GradeBadge $grade={pm10Grade}>{pm10Grade}</GradeBadge>
                {pm10Value && <ValueText>{pm10Value}</ValueText>}
              </AirQualityStatusRow>
            </AirQualityBox>

            <AirQualityBox>
              <AirQualityTitle>초미세먼지</AirQualityTitle>
              <AirQualityStatusRow>
                {pm25GradeImage && (
                  <PmIconImage src={pm25GradeImage} alt={pm25Grade} />
                )}
                <GradeBadge $grade={pm25Grade}>{pm25Grade}</GradeBadge>
                {pm25Value && <ValueText>{pm25Value}</ValueText>}
              </AirQualityStatusRow>
            </AirQualityBox>
          </AirQualityGrid>

          <FooterRow>
            <FooterTip>상세 예보 및 주간 날씨는 여기를 눌러 확인하세요.</FooterTip>
          </FooterRow>
        </ContentLayer>
      </WeatherCardWrapper>
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
`;

const WeatherCardWrapper = styled.div<{ $gradient: string }>`
  position: relative;
  background: ${({ $gradient }) => $gradient};
  border-radius: 28px;
  padding: 22px 20px 18px 20px;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.04);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  overflow: hidden;
  transition: background 0.4s ease;
`;

const AmbientBgImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
  pointer-events: none;
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardTitle = styled.h2`
  font-size: 17px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.4px;
  margin: 0;
`;

const LocationBadge = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.22);
  padding: 2px 8px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const LinkIconBadge = styled.div`
  background: rgba(255, 255, 255, 0.22);
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const MainWeatherRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 2px 0;
`;

const IllustrationWrapper = styled.div<{ $isShifted: boolean }>`
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transform: ${({ $isShifted }) => ($isShifted ? "scale(1.05)" : "none")};
`;

const WeatherIllustration = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15));
`;

const TempInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const TempRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

const CurrentTemp = styled.span`
  font-size: 40px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1.5px;
  color: #ffffff;
`;

const SkyStatusBadge = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 9px;
  border-radius: 10px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const WeatherSubDesc = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.88);
  letter-spacing: -0.2px;
`;

const AirQualityGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const AirQualityBox = styled.div`
  background: rgba(255, 255, 255, 0.16);
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
`;

const AirQualityTitle = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
`;

const AirQualityStatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PmIconImage = styled.img`
  width: 14px;
  height: 14px;
  flex-shrink: 0;
`;

const GradeBadge = styled.span<{ $grade: string }>`
  font-size: 12.5px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 6px;
  background: ${({ $grade }) => {
    if ($grade === "좋음") return "rgba(34, 197, 94, 0.9)";
    if ($grade === "보통") return "rgba(59, 130, 246, 0.9)";
    if ($grade === "나쁨") return "rgba(249, 115, 22, 0.9)";
    if ($grade === "매우나쁨") return "rgba(239, 68, 68, 0.9)";
    return "rgba(59, 130, 246, 0.9)";
  }};
  color: #ffffff;
`;

const ValueText = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
`;

const FooterRow = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FooterTip = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
`;
