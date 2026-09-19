import { useEffect, useState } from "react";
import styled from "styled-components";
import { getWeathers } from "@/apis/weathers";
import { WeatherInfo } from "@/types/weathers";
import Icon from "@/components/common/Icon";

const NAVER_WEATHER_URL = "https://weather.naver.com/today/11185106";

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

  const getWeatherEmoji = (sky: string) => {
    if (sky.includes("비")) return "🌧️";
    if (sky.includes("눈")) return "❄️";
    if (sky.includes("구름") || sky.includes("흐림")) return "⛅";
    return "☀️";
  };

  return (
    <SectionWrapper>
      <ContextIntro>송도 캠퍼스 날씨를 확인해 보세요.</ContextIntro>
      <WeatherCardWrapper onClick={handleCardClick} role="button" tabIndex={0}>
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
          <WeatherEmojiBadge>{getWeatherEmoji(skyText)}</WeatherEmojiBadge>
          <TempInfoWrapper>
            <CurrentTemp>{rawTemp}°</CurrentTemp>
            <SkyStatus>{skyText}</SkyStatus>
          </TempInfoWrapper>
        </MainWeatherRow>

        <AirQualityGrid>
          <AirQualityBox>
            <AirQualityTitle>미세먼지</AirQualityTitle>
            <AirQualityStatusRow>
              <GradeBadge $grade={pm10Grade}>{pm10Grade}</GradeBadge>
              {pm10Value && <ValueText>{pm10Value}</ValueText>}
            </AirQualityStatusRow>
          </AirQualityBox>

          <AirQualityBox>
            <AirQualityTitle>초미세먼지</AirQualityTitle>
            <AirQualityStatusRow>
              <GradeBadge $grade={pm25Grade}>{pm25Grade}</GradeBadge>
              {pm25Value && <ValueText>{pm25Value}</ValueText>}
            </AirQualityStatusRow>
          </AirQualityBox>
        </AirQualityGrid>

        <FooterRow>
          <FooterTip>상세 예보 및 주간 날씨는 여기를 눌러 확인하세요.</FooterTip>
        </FooterRow>
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

const WeatherCardWrapper = styled.div`
  background: linear-gradient(155deg, #3a7fe4 0%, #4a8ff0 50%, #5ba0f7 100%);
  border-radius: 28px;
  padding: 24px 20px 18px 20px;
  box-shadow:
    0 8px 24px rgba(58, 127, 228, 0.28),
    0 2px 6px rgba(0, 0, 0, 0.04);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 18px;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:active {
    transform: scale(0.985);
  }
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
  font-size: 19px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.4px;
  margin: 0;
`;

const LocationBadge = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
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
`;

const MainWeatherRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 0;
`;

const WeatherEmojiBadge = styled.div`
  font-size: 44px;
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  flex-shrink: 0;
`;

const TempInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CurrentTemp = styled.span`
  font-size: 42px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1.5px;
  color: #ffffff;
`;

const SkyStatus = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
`;

const AirQualityGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const AirQualityBox = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  backdrop-filter: blur(6px);
`;

const AirQualityTitle = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
`;

const AirQualityStatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const GradeBadge = styled.span<{ $grade: string }>`
  font-size: 13px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 6px;
  background: ${({ $grade }) => {
    if ($grade === "좋음") return "#22c55e";
    if ($grade === "보통") return "#3b82f6";
    if ($grade === "나쁨") return "#f97316";
    if ($grade === "매우나쁨") return "#ef4444";
    return "#3b82f6";
  }};
  color: #ffffff;
`;

const ValueText = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
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
