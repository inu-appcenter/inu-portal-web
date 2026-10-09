import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { User } from "lucide-react";

export interface MobileDormitoryCardProps {
  studentName?: string;
  englishName?: string;
  studentId?: string;
  department?: string;
  grade?: string;
  photoSrc?: string | null;
  dormitoryType?: string;
  dormitoryBuilding?: string;
  studentDormNo?: string;
  year?: string;
  term?: string;
  status?: string;
  fullscreen?: boolean;
}

interface DormitoryTheme {
  name: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  boxBg: string;
  boxBorder: string;
}

/**
 * 1, 2, 3 기숙사별 고유 색상 테마 계산
 */
function resolveDormitoryTheme(dormType?: string, dormBuilding?: string): DormitoryTheme {
  const combined = `${dormType || ""} ${dormBuilding || ""}`.trim();

  // 데이터가 없거나 미배정인 경우 -> 중립 테마
  if (!combined || combined === "-") {
    return {
      name: "-",
      borderColor: "rgba(148, 163, 184, 0.28)",
      badgeBg: "#64748b",
      badgeText: "#ffffff",
      boxBg: "#f8fafc",
      boxBorder: "rgba(148, 163, 184, 0.2)",
    };
  }

  // 제2기숙사 (직영 / BTL) -> 그린
  if (combined.includes("02") || combined.includes("03") || combined.includes("2기숙사") || combined.includes("제2")) {
    return {
      name: "제2기숙사",
      borderColor: "rgba(21, 128, 61, 0.28)",
      badgeBg: "#15803d",
      badgeText: "#ffffff",
      boxBg: "#f0fdf4",
      boxBorder: "rgba(22, 163, 74, 0.2)",
    };
  }

  // 제3기숙사 (BTL) -> 인디고 / 네이비
  if (combined.includes("04") || combined.includes("05") || combined.includes("3기숙사") || combined.includes("제3")) {
    return {
      name: "제3기숙사(BTL)",
      borderColor: "rgba(67, 56, 202, 0.28)",
      badgeBg: "#4338ca",
      badgeText: "#ffffff",
      boxBg: "#eef2ff",
      boxBorder: "rgba(79, 70, 229, 0.2)",
    };
  }

  // 제1기숙사 -> INU 시그니처 블루
  return {
    name: "제1기숙사",
    borderColor: "rgba(29, 78, 216, 0.28)",
    badgeBg: "#1d4ed8",
    badgeText: "#ffffff",
    boxBg: "#eff6ff",
    boxBorder: "rgba(37, 99, 235, 0.2)",
  };
}

/**
 * 학기 코드 변환 (10 -> 1학기, 20 -> 2학기)
 */
function formatSemesterTerm(term?: string): string {
  if (!term) return "";
  const trimmed = term.trim();
  if (trimmed === "10" || trimmed === "1") return "1학기";
  if (trimmed === "20" || trimmed === "2") return "2학기";
  if (trimmed === "30") return "여름학기";
  if (trimmed === "40") return "겨울학기";
  return trimmed.endsWith("학기") ? trimmed : `${trimmed}학기`;
}

export const MobileDormitoryCard: React.FC<MobileDormitoryCardProps> = ({
  studentName = "-",
  englishName,
  studentId = "-",
  department = "-",
  grade = "-",
  photoSrc,
  dormitoryType,
  dormitoryBuilding,
  studentDormNo = "-",
  year,
  term,
  status = "-",
  fullscreen = false,
}) => {
  // 실시간 시계 (초 단위 갱신, YYYY.MM.DD HH:mm:ss)
  const [clockText, setClockText] = useState<string>("");

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const update = () => {
      const now = new Date();
      const y = now.getFullYear();
      const m = pad(now.getMonth() + 1);
      const d = pad(now.getDate());
      const hh = pad(now.getHours());
      const mm = pad(now.getMinutes());
      const ss = pad(now.getSeconds());
      setClockText(`${y}.${m}.${d} ${hh}:${mm}:${ss}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1, 2, 3 기숙사 테마 색상 결정
  const theme = useMemo(
    () => resolveDormitoryTheme(dormitoryType, dormitoryBuilding),
    [dormitoryType, dormitoryBuilding]
  );

  const formattedTerm = formatSemesterTerm(term);
  const termDisplay = year && formattedTerm ? `${year}학년도 ${formattedTerm}` : (year ? `${year}학년도` : "");

  return (
    <CardContainer $borderColor={theme.borderColor} $fullscreen={fullscreen}>
      {/* 위조 방지: 배경 은은한 한글 워터마크 (영어 없이 순수 한글, 3.5% 투명도) */}
      <WatermarkLayer aria-hidden="true">
        <WatermarkRow>
          인천대학교 생활원 • 모바일 사생증 • 인천대학교 생활원 • 모바일 사생증 • 인천대학교 생활원 • 모바일 사생증 •{" "}
        </WatermarkRow>
        <WatermarkRow $reverse>
          인천대학교 생활원 • 모바일 사생증 • 인천대학교 생활원 • 모바일 사생증 • 인천대학교 생활원 • 모바일 사생증 •{" "}
        </WatermarkRow>
        <WatermarkRow>
          인천대학교 생활원 • 모바일 사생증 • 인천대학교 생활원 • 모바일 사생증 • 인천대학교 생활원 • 모바일 사생증 •{" "}
        </WatermarkRow>
      </WatermarkLayer>

      {/* 상단 헤더: 대학/생활원 명칭 & 학기 */}
      <HeaderSection>
        <HeaderLeft>
          <SubHeading>인천대학교 생활원</SubHeading>
          <MainTitle>모바일 사생증</MainTitle>
        </HeaderLeft>
        {termDisplay ? <TermBadge>{termDisplay}</TermBadge> : null}
      </HeaderSection>

      {/* 본문 영역: 프로필 + 핵심 사생 정보 */}
      <CardBody $fullscreen={fullscreen}>
        <ProfileSection>
          <PhotoWrapper $fullscreen={fullscreen}>
            {photoSrc ? (
              <PhotoImg src={photoSrc} alt="사생 증명사진" />
            ) : (
              <PlaceholderPhoto>
                <User size={36} strokeWidth={1.5} color="#94a3b8" />
              </PlaceholderPhoto>
            )}
          </PhotoWrapper>

          <ProfileInfo>
            <NameRow>
              <StudentName $fullscreen={fullscreen}>{studentName}</StudentName>
              {englishName ? <EnglishName>{englishName}</EnglishName> : null}
            </NameRow>

            <MetaList>
              <MetaItem>
                <MetaKey>학번</MetaKey>
                <MetaVal>{studentId}</MetaVal>
              </MetaItem>
              <MetaItem>
                <MetaKey>학과</MetaKey>
                <MetaVal>{department}</MetaVal>
              </MetaItem>
              <MetaItem>
                <MetaKey>학년</MetaKey>
                <MetaVal>{grade}</MetaVal>
              </MetaItem>
            </MetaList>
          </ProfileInfo>
        </ProfileSection>

        {/* 핵심 사생 정보 박스: 기숙사(테마색상) + 사생번호(대형 강조) */}
        <DetailBox $boxBg={theme.boxBg} $boxBorder={theme.boxBorder} $fullscreen={fullscreen}>
          <DetailHeader>
            <DetailLabel>기숙사</DetailLabel>
            <DormBadge $bg={theme.badgeBg} $text={theme.badgeText}>
              {dormitoryBuilding || dormitoryType || (theme.name !== "-" ? theme.name : "-")}
            </DormBadge>
          </DetailHeader>

          <DormNoRow>
            <DormNoLabel>사생번호</DormNoLabel>
            <DormNoValue $fullscreen={fullscreen}>{studentDormNo}</DormNoValue>
          </DormNoRow>

          <StatusRow>
            <StatusLabel>입사 구분</StatusLabel>
            <StatusValue>{status || "-"}</StatusValue>
          </StatusRow>
        </DetailBox>
      </CardBody>

      {/* 하단 풋터: 실시간 시계 */}
      <FooterSection $fullscreen={fullscreen}>
        <ClockText $fullscreen={fullscreen}>{clockText || "—"}</ClockText>
      </FooterSection>
    </CardContainer>
  );
};

export default MobileDormitoryCard;

// ==================== Styled Components ====================

const watermarkFlow = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const CardContainer = styled.div<{ $borderColor: string; $fullscreen?: boolean }>`
  position: relative;
  width: 100%;
  max-width: ${({ $fullscreen }) => ($fullscreen ? "100%" : "380px")};
  height: ${({ $fullscreen }) => ($fullscreen ? "100%" : "auto")};
  flex: ${({ $fullscreen }) => ($fullscreen ? "1" : "initial")};
  background-color: #ffffff;
  border-radius: 20px;
  border: 2px solid ${({ $borderColor }) => $borderColor};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: ${({ $fullscreen }) => ($fullscreen ? "space-between" : "flex-start")};
  margin: 0 auto;
  box-sizing: border-box;
`;

const WatermarkLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.035;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  transform: rotate(-6deg) scale(1.1);
  z-index: 1;
`;

const WatermarkRow = styled.div<{ $reverse?: boolean }>`
  display: flex;
  width: 200%;
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
  color: #0f172a;
  animation: ${watermarkFlow} 24s linear infinite;
  animation-direction: ${({ $reverse }) => ($reverse ? "reverse" : "normal")};
`;

const HeaderSection = styled.div`
  position: relative;
  z-index: 2;
  padding: 18px 20px 12px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid #f1f5f9;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const SubHeading = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  letter-spacing: -0.3px;
`;

const MainTitle = styled.h2`
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0 0 0;
  letter-spacing: -0.4px;
`;

const TermBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  background-color: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: -0.2px;
`;

const CardBody = styled.div<{ $fullscreen?: boolean }>`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  ${({ $fullscreen }) =>
    $fullscreen &&
    `
    flex: 1;
    justify-content: center;
    gap: 10px;
  `}
`;

const ProfileSection = styled.div`
  position: relative;
  z-index: 2;
  padding: 16px 20px 12px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PhotoWrapper = styled.div<{ $fullscreen?: boolean }>`
  width: ${({ $fullscreen }) => ($fullscreen ? "104px" : "96px")};
  height: ${({ $fullscreen }) => ($fullscreen ? "138px" : "128px")};
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const PhotoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PlaceholderPhoto = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  flex: 1;
`;

const NameRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const StudentName = styled.h1<{ $fullscreen?: boolean }>`
  font-size: ${({ $fullscreen }) => ($fullscreen ? "22px" : "20px")};
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin: 0;
  line-height: 1.2;
`;

const EnglishName = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  margin-top: 1px;
  letter-spacing: 0.2px;
`;

const MetaList = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const MetaItem = styled.div`
  font-size: 12px;
  display: flex;
  align-items: center;
  color: #334155;
  font-weight: 500;
`;

const MetaKey = styled.span`
  color: #94a3b8;
  width: 32px;
  flex-shrink: 0;
  font-size: 11px;
`;

const MetaVal = styled.span`
  color: #1e293b;
  font-weight: 600;
`;

const DetailBox = styled.div<{ $boxBg: string; $boxBorder: string; $fullscreen?: boolean }>`
  position: relative;
  z-index: 2;
  margin: ${({ $fullscreen }) => ($fullscreen ? "0 20px 20px 20px" : "0 20px 16px 20px")};
  padding: ${({ $fullscreen }) => ($fullscreen ? "16px 18px" : "14px 16px")};
  border-radius: ${({ $fullscreen }) => ($fullscreen ? "16px" : "14px")};
  background-color: ${({ $boxBg }) => $boxBg};
  border: 1px solid ${({ $boxBorder }) => $boxBorder};
  display: flex;
  flex-direction: column;
  gap: ${({ $fullscreen }) => ($fullscreen ? "12px" : "10px")};
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DetailLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
`;

const DormBadge = styled.span<{ $bg: string; $text: string }>`
  font-size: 12px;
  font-weight: 800;
  background-color: ${({ $bg }) => $bg};
  color: ${({ $text }) => $text};
  padding: 3px 10px;
  border-radius: 6px;
  letter-spacing: -0.3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
`;

const DormNoRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
`;

const DormNoLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #475569;
`;

const DormNoValue = styled.span<{ $fullscreen?: boolean }>`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: ${({ $fullscreen }) => ($fullscreen ? "24px" : "18px")};
  font-weight: 900;
  color: #0f172a;
  letter-spacing: 0.5px;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #64748b;
`;

const StatusLabel = styled.span`
  color: #64748b;
`;

const StatusValue = styled.span`
  font-weight: 600;
  color: #334155;
`;

const FooterSection = styled.div<{ $fullscreen?: boolean }>`
  position: relative;
  z-index: 2;
  padding: ${({ $fullscreen }) => ($fullscreen ? "14px 20px" : "10px 20px")};
  background-color: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClockText = styled.span<{ $fullscreen?: boolean }>`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: ${({ $fullscreen }) => ($fullscreen ? "13px" : "12px")};
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.3px;
`;
