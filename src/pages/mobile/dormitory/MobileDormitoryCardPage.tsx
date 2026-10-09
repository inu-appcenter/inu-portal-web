import { useState, useEffect, useMemo, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  RefreshCw,
  User,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import {
  isMobileAppEnvironment,
  checkPortalAccountLinked,
  fetchDormitoryStudentInfoFromApp,
  fetchAcademicInfoFromApp,
  resolveCurrentStudentId,
} from "@/apis/mobileAgentBridge";
import {
  DormitoryStudentInfo,
  parseDormitoryStudentInfo,
} from "@/utils/ssvParser";
import { PortalAccountModal } from "@/components/mobile/agent/PortalAccountModal";

const STORAGE_KEY_DORMITORY_DATA = "portal_dormitory_student_info";
const STORAGE_KEY_DORMITORY_UPDATED = "portal_dormitory_last_updated";

interface DormitoryTheme {
  name: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  boxBg: string;
  boxBorder: string;
  accentColor: string;
}

function resolveDormitoryTheme(dormType?: string, dormBuilding?: string): DormitoryTheme {
  const combined = `${dormType || ""} ${dormBuilding || ""}`.trim();

  // 제2기숙사 (직영 / BTL) -> 그린
  if (
    combined.includes("02") ||
    combined.includes("03") ||
    combined.includes("2기숙사") ||
    combined.includes("제2")
  ) {
    return {
      name: "제2기숙사",
      borderColor: "rgba(21, 128, 61, 0.28)",
      badgeBg: "#15803d",
      badgeText: "#ffffff",
      boxBg: "#f0fdf4",
      boxBorder: "rgba(22, 163, 74, 0.2)",
      accentColor: "#15803d",
    };
  }

  // 제3기숙사 (BTL) -> 인디고 / 네이비
  if (
    combined.includes("04") ||
    combined.includes("05") ||
    combined.includes("3기숙사") ||
    combined.includes("제3")
  ) {
    return {
      name: "제3기숙사(BTL)",
      borderColor: "rgba(67, 56, 202, 0.28)",
      badgeBg: "#4338ca",
      badgeText: "#ffffff",
      boxBg: "#eef2ff",
      boxBorder: "rgba(79, 70, 229, 0.2)",
      accentColor: "#4338ca",
    };
  }

  // 기본값: 제1기숙사 -> INU 시그니처 블루
  return {
    name: "제1기숙사",
    borderColor: "rgba(29, 78, 216, 0.28)",
    badgeBg: "#1d4ed8",
    badgeText: "#ffffff",
    boxBg: "#eff6ff",
    boxBorder: "rgba(37, 99, 235, 0.2)",
    accentColor: "#1d4ed8",
  };
}

function toImageSrc(base64?: string): string | null {
  if (!base64 || typeof base64 !== "string") return null;
  const clean = base64.replace(/\s/g, "");
  if (!clean) return null;
  if (clean.startsWith("data:")) return clean;
  if (clean.startsWith("Qk")) return `data:image/bmp;base64,${clean}`;
  if (clean.startsWith("/9j/")) return `data:image/jpeg;base64,${clean}`;
  if (clean.startsWith("iVBOR")) return `data:image/png;base64,${clean}`;
  return `data:image/bmp;base64,${clean}`;
}

function mapDormitoryType(code?: string): string {
  if (!code) return "";
  const trimmed = code.trim();
  switch (trimmed) {
    case "01":
      return "제1기숙사";
    case "02":
      return "제2기숙사";
    case "03":
      return "제2기숙사(BTL)";
    case "04":
      return "제3기숙사";
    case "05":
      return "제3기숙사(BTL)";
    default:
      return trimmed;
  }
}

function mapSemester(term?: string): string {
  if (!term) return "";
  const trimmed = term.trim();
  if (trimmed === "10" || trimmed === "1") return "1";
  if (trimmed === "20" || trimmed === "2") return "2";
  if (trimmed === "30") return "여름";
  if (trimmed === "40") return "겨울";
  return trimmed;
}

function mapGrade(val?: string): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (trimmed.endsWith("학년")) return trimmed;
  if (/^\d+$/.test(trimmed)) return `${trimmed}학년`;
  return trimmed;
}

export default function MobileDormitoryCardPage() {
  const navigate = useNavigate();
  const [dormInfo, setDormInfo] = useState<DormitoryStudentInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [clockText, setClockText] = useState("");

  // 초 단위 실시간 디지털 시계 갱신
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const updateClock = () => {
      const now = new Date();
      const y = now.getFullYear();
      const m = pad(now.getMonth() + 1);
      const d = pad(now.getDate());
      const hh = pad(now.getHours());
      const mm = pad(now.getMinutes());
      const ss = pad(now.getSeconds());
      setClockText(`${y}.${m}.${d} ${hh}:${mm}:${ss}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 로컬 스토리지 데이터 로드
  const loadCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_DORMITORY_DATA);
      const academicCached = localStorage.getItem("portal_student_info");
      let academicParsed: any = null;
      if (academicCached) {
        try {
          academicParsed = parseDormitoryStudentInfo(JSON.parse(academicCached));
        } catch {}
      }

      if (cached) {
        const parsedJson = JSON.parse(cached);
        const restored = parseDormitoryStudentInfo(parsedJson);
        const hasValidRf = restored.rawFields && Object.keys(restored.rawFields).length > 0;
        if ((!restored.studentName || !hasValidRf) && academicParsed) {
          setDormInfo({
            ...academicParsed,
            ...restored,
            studentName: restored.studentName || academicParsed.studentName,
            studentId: restored.studentId || academicParsed.studentId,
            profile: restored.profile || academicParsed.profile,
            rawFields: hasValidRf ? restored.rawFields : academicParsed.rawFields,
          });
        } else {
          setDormInfo(restored);
        }
      } else if (academicParsed) {
        setDormInfo(academicParsed);
      }
    } catch (e) {
      console.error("사생정보 로컬 로드 실패", e);
    }
  }, []);

  useEffect(() => {
    loadCachedData();
  }, [loadCachedData]);

  // 새로고침 함수
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    if (!isMobileAppEnvironment()) {
      setIsAccountModalOpen(true);
      setIsRefreshing(false);
      return;
    }

    try {
      const isLinked = await checkPortalAccountLinked();
      if (!isLinked) {
        setIsAccountModalOpen(true);
        setIsRefreshing(false);
        return;
      }

      let myStudentId = resolveCurrentStudentId();
      if (!myStudentId) {
        try {
          const academicRes = await fetchAcademicInfoFromApp(false);
          if (academicRes.success && academicRes.data?.studentId) {
            myStudentId = academicRes.data.studentId.trim();
          }
        } catch {}
      }

      const res = await fetchDormitoryStudentInfoFromApp({ stuno: myStudentId });
      if (res.success && res.data) {
        const parsed = parseDormitoryStudentInfo(res.data);
        setDormInfo(parsed);
        localStorage.setItem(STORAGE_KEY_DORMITORY_DATA, JSON.stringify(res.data));
        localStorage.setItem(STORAGE_KEY_DORMITORY_UPDATED, new Date().toISOString());
      }
    } catch (err) {
      console.error("사생정보 갱신 실패", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // 뒤로가기
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(ROUTES.LABS.PORTAL.DORMITORY);
    }
  };

  // 필드 파싱
  const profile = dormInfo?.profile;
  const rawFields = dormInfo?.rawFields;

  const studentName =
    dormInfo?.studentName ||
    profile?.name ||
    rawFields?.korNm ||
    rawFields?.nm ||
    "사생";

  const englishName =
    profile?.englishName ||
    rawFields?.engNm ||
    "";

  const studentId =
    profile?.studentId ||
    dormInfo?.studentId ||
    rawFields?.persNo ||
    rawFields?.stuno ||
    "-";

  const department =
    profile?.department ||
    rawFields?.deptNm ||
    rawFields?.hgNm ||
    "-";

  const rawGrade =
    profile?.grade ||
    rawFields?.hySeqGbn ||
    "";
  const grade = mapGrade(rawGrade) || "-";

  const photoSrc = toImageSrc(dormInfo?.photoBase64 || rawFields?.phtFile);

  const rawDormGbn = rawFields?.dormGbn || profile?.dormitoryType || "";
  const mappedDormName = mapDormitoryType(rawDormGbn);
  const dormitoryType = mappedDormName || profile?.dormitoryBuilding || rawFields?.dormBdNm || "-";
  const dormitoryBuilding = profile?.dormitoryBuilding || rawFields?.dormBdNm || rawFields?.dormBdCd || "";
  const studentDormNo = profile?.studentDormNo || rawFields?.domstuNo || rawFields?.domStuNo || "-";

  const year = profile?.year || dormInfo?.appliedYear || rawFields?.yy || "";
  const term = profile?.term || dormInfo?.appliedSemester || rawFields?.tmGbn || "";
  const semesterStr = mapSemester(term);
  const status = dormInfo?.inOutList?.[0]?.status ? dormInfo.inOutList[0].status : (profile ? "정규입사생" : "");

  const meritNum = Number(profile?.meritPoints ?? dormInfo?.meritPoints ?? rawFields?.ardScr1 ?? 0) || 0;
  const demeritNum = Number(profile?.demeritPoints ?? dormInfo?.demeritPoints ?? rawFields?.ardScr2 ?? 0) || 0;

  // 기숙사 테마 색상 결정
  const theme = useMemo(
    () => resolveDormitoryTheme(dormitoryType, dormitoryBuilding || mappedDormName),
    [dormitoryType, dormitoryBuilding, mappedDormName]
  );

  return (
    <PageContainer>
      {/* 상단 액션 바 */}
      <TopBar>
        <IconButton onClick={handleBack} aria-label="뒤로가기">
          <ChevronLeft size={24} color="#1e293b" />
        </IconButton>
        <BarTitle>모바일 사생증</BarTitle>
        <IconButton onClick={handleRefresh} aria-label="새로고침" disabled={isRefreshing}>
          <RefreshCw
            size={19}
            color="#475569"
            style={{
              animation: isRefreshing ? "spin 1s linear infinite" : "none",
            }}
          />
        </IconButton>
      </TopBar>

      {/* 사생증 본체 캔버스 (전체 화면 높이를 점유하는 카드) */}
      <CardViewport>
        {!dormInfo ? (
          <EmptyStateBox>
            <AlertCircle size={44} color="#94a3b8" />
            <EmptyTitle>사생증 정보가 없습니다</EmptyTitle>
            <EmptyDesc>
              포털 계정을 연동하거나 동기화하여 생활원 사생증을 불러올 수 있습니다.
            </EmptyDesc>
            <ActionButtonGroup>
              <PrimaryBtn onClick={handleRefresh}>
                <RefreshCw size={16} /> 사생정보 동기화
              </PrimaryBtn>
              <SecondaryBtn onClick={() => navigate(ROUTES.LABS.PORTAL.DORMITORY)}>
                사생 관리 메뉴로 이동
              </SecondaryBtn>
            </ActionButtonGroup>
          </EmptyStateBox>
        ) : (
          <IdPassCard $borderColor={theme.borderColor}>
            {/* 위조 방지: 은은하게 흐르는 백그라운드 워터마크 */}
            <WatermarkLayer aria-hidden="true">
              <WatermarkRow>
                인천대학교 생활원 • 모바일 사생증 • INCHEON NATIONAL UNIVERSITY •{" "}
              </WatermarkRow>
              <WatermarkRow $reverse>
                인천대학교 생활원 • 모바일 사생증 • INCHEON NATIONAL UNIVERSITY •{" "}
              </WatermarkRow>
              <WatermarkRow>
                인천대학교 생활원 • 모바일 사생증 • INCHEON NATIONAL UNIVERSITY •{" "}
              </WatermarkRow>
              <WatermarkRow $reverse>
                인천대학교 생활원 • 모바일 사생증 • INCHEON NATIONAL UNIVERSITY •{" "}
              </WatermarkRow>
            </WatermarkLayer>

            {/* 카드 컨텐츠 영역 */}
            <PassContentWrapper>
              {/* 1. 상단 기관 표기 및 배정 기숙사 */}
              <PassHeader>
                <InstitutionGroup>
                  <InstitutionLabel>인천대학교 생활원</InstitutionLabel>
                  <ResidentPassTitle>모바일 사생증</ResidentPassTitle>
                </InstitutionGroup>
                <HeaderBadges>
                  <BuildingBadge $bg={theme.badgeBg} $text={theme.badgeText}>
                    <Building2 size={13} strokeWidth={2.2} />
                    {dormitoryBuilding || mappedDormName || theme.name}
                  </BuildingBadge>
                </HeaderBadges>
              </PassHeader>

              {/* 2. 핵심 식별자: 사생번호 대형 강조 박스 */}
              <DormNumberHero $boxBg={theme.boxBg} $boxBorder={theme.boxBorder}>
                <HeroHeader>
                  <HeroLabel>사생번호</HeroLabel>
                  {year ? (
                    <TermTag>
                      <Calendar size={11} />
                      {year}년 {semesterStr ? `${semesterStr}학기` : ""}
                    </TermTag>
                  ) : null}
                </HeroHeader>
                <HeroNumber $accent={theme.accentColor}>
                  {studentDormNo !== "-" ? studentDormNo : "미발급"}
                </HeroNumber>
              </DormNumberHero>

              {/* 3. 학생 인적사항 및 증명사진 영역 */}
              <StudentProfileSection>
                <PhotoFrame>
                  {photoSrc ? (
                    <PhotoImage src={photoSrc} alt="사생 증명사진" />
                  ) : (
                    <PhotoPlaceholder>
                      <User size={40} color="#94a3b8" strokeWidth={1.5} />
                    </PhotoPlaceholder>
                  )}
                </PhotoFrame>

                <ProfileDetails>
                  <NameContainer>
                    <StudentNameText>{studentName}</StudentNameText>
                    {englishName ? <EnglishNameText>{englishName}</EnglishNameText> : null}
                  </NameContainer>

                  <InfoTable>
                    <InfoRow>
                      <InfoKey>학번</InfoKey>
                      <InfoVal>{studentId}</InfoVal>
                    </InfoRow>
                    <InfoRow>
                      <InfoKey>소속</InfoKey>
                      <InfoVal>{department}</InfoVal>
                    </InfoRow>
                    <InfoRow>
                      <InfoKey>학년</InfoKey>
                      <InfoVal>{grade}</InfoVal>
                    </InfoRow>
                    <InfoRow>
                      <InfoKey>입사구분</InfoKey>
                      <InfoValHighlight>{status || "정규입사생"}</InfoValHighlight>
                    </InfoRow>
                  </InfoTable>
                </ProfileDetails>
              </StudentProfileSection>

              {/* 4. 상벌점 요약 바 */}
              <PointsOverviewBar>
                <PointBadge>
                  <PointLabel>상점</PointLabel>
                  <PointValue $color="#15803d">+{meritNum}점</PointValue>
                </PointBadge>
                <PointDivider />
                <PointBadge>
                  <PointLabel>벌점</PointLabel>
                  <PointValue $color="#dc2626">-{demeritNum}점</PointValue>
                </PointBadge>
                <PointDivider />
                <PointBadge>
                  <PointLabel>누계</PointLabel>
                  <PointValue $color="#1e293b">{meritNum - demeritNum}점</PointValue>
                </PointBadge>
              </PointsOverviewBar>

              {/* 5. 하단 위조 방지 실시간 디지털 시계 및 공식 기관 서명 */}
              <PassFooter>
                <SecurityClockBox>
                  <ShieldCheck size={16} color={theme.accentColor} />
                  <DigitalClockText>{clockText || "—"}</DigitalClockText>
                </SecurityClockBox>
                <IssuerText>인천대학교 학생생활원</IssuerText>
              </PassFooter>
            </PassContentWrapper>
          </IdPassCard>
        )}
      </CardViewport>

      <PortalAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSuccess={() => {
          setIsAccountModalOpen(false);
          handleRefresh();
        }}
      />
    </PageContainer>
  );
}

// ==================== Styled Components ====================

const watermarkFlow = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const spinAnim = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const PageContainer = styled.div`
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  overflow: hidden;
  position: relative;
  padding-top: var(--native-safe-area-inset-top, env(safe-area-inset-top, 0px));
  padding-bottom: var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px));

  @media (min-width: 768px) {
    max-width: 440px;
    margin: 0 auto;
    box-shadow: 0 0 35px rgba(0, 0, 0, 0.08);
  }
`;

const TopBar = styled.header`
  height: 52px;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  z-index: 10;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.15s;

  &:active {
    background-color: #f1f5f9;
  }

  & .spin {
    animation: ${spinAnim} 1s linear infinite;
  }
`;

const BarTitle = styled.h1`
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.3px;
  margin: 0;
`;

const CardViewport = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 14px 16px 16px;
  overflow-y: auto;
  box-sizing: border-box;

  @media (max-width: 360px) {
    padding: 10px 12px 12px;
  }
`;

const IdPassCard = styled.div<{ $borderColor: string }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 24px;
  border: 1.5px solid ${(props) => props.$borderColor};
  box-shadow: 0 10px 30px -4px rgba(15, 23, 42, 0.07);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
`;

const WatermarkLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  opacity: 0.038;
  overflow: hidden;
  z-index: 1;
`;

const WatermarkRow = styled.div<{ $reverse?: boolean }>`
  white-space: nowrap;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 2.5px;
  color: #0f172a;
  display: inline-block;
  animation: ${watermarkFlow} 40s linear infinite;
  animation-direction: ${(props) => (props.$reverse ? "reverse" : "normal")};
`;

const PassContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 22px 20px 20px;
  position: relative;
  z-index: 2;
  box-sizing: border-box;

  @media (max-width: 360px) {
    padding: 16px 14px 14px;
  }
`;

const PassHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const InstitutionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const InstitutionLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: -0.2px;
`;

const ResidentPassTitle = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin: 0;
`;

const HeaderBadges = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
`;

const BuildingBadge = styled.span<{ $bg: string; $text: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 9999px;
  background-color: ${(props) => props.$bg};
  color: ${(props) => props.$text};
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.2px;
  box-shadow: 0 2px 8px -1px rgba(0, 0, 0, 0.12);
`;

const DormNumberHero = styled.div<{ $boxBg: string; $boxBorder: string }>`
  background-color: ${(props) => props.$boxBg};
  border: 1.5px solid ${(props) => props.$boxBorder};
  border-radius: 16px;
  padding: 14px 18px;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  @media (max-width: 360px) {
    padding: 10px 14px;
    margin-bottom: 14px;
  }
`;

const HeroHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const HeroLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: -0.2px;
`;

const TermTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
`;

const HeroNumber = styled.span<{ $accent: string }>`
  font-size: 34px;
  font-weight: 900;
  color: ${(props) => props.$accent};
  letter-spacing: 0.5px;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;

  @media (max-width: 360px) {
    font-size: 28px;
  }
`;

const StudentProfileSection = styled.div`
  display: flex;
  gap: 18px;
  align-items: center;
  margin-bottom: 18px;

  @media (max-width: 360px) {
    gap: 12px;
    margin-bottom: 14px;
  }
`;

const PhotoFrame = styled.div`
  width: 96px;
  height: 124px;
  border-radius: 14px;
  overflow: hidden;
  background-color: #f1f5f9;
  border: 1.5px solid #e2e8f0;
  flex-shrink: 0;
  box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.08);

  @media (max-width: 360px) {
    width: 82px;
    height: 106px;
  }
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const PhotoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
`;

const ProfileDetails = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StudentNameText = styled.h3`
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.4px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EnglishNameText = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  letter-spacing: -0.1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const InfoTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  line-height: 1.4;
`;

const InfoKey = styled.span`
  width: 52px;
  color: #64748b;
  font-weight: 600;
  flex-shrink: 0;
`;

const InfoVal = styled.span`
  color: #1e293b;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const InfoValHighlight = styled(InfoVal)`
  color: #0f172a;
  font-weight: 700;
`;

const PointsOverviewBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: #f8fafc;
  border-radius: 14px;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;

  @media (max-width: 360px) {
    padding: 8px 10px;
    margin-bottom: 14px;
  }
`;

const PointBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const PointLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
`;

const PointValue = styled.span<{ $color: string }>`
  font-size: 14px;
  font-weight: 800;
  color: ${(props) => props.$color};
  font-variant-numeric: tabular-nums;
`;

const PointDivider = styled.div`
  width: 1px;
  height: 20px;
  background-color: #e2e8f0;
`;

const PassFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
`;

const SecurityClockBox = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background-color: #f1f5f9;
  border-radius: 9999px;
`;

const DigitalClockText = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.5px;
`;

const IssuerText = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: -0.2px;
`;

const EmptyStateBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 24px;
  border: 1.5px dashed #cbd5e1;
  padding: 32px 24px;
  text-align: center;
  box-sizing: border-box;
`;

const EmptyTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 16px 0 8px;
`;

const EmptyDesc = styled.p`
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 24px;
`;

const ActionButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 260px;
  gap: 10px;
`;

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px 18px;
  background-color: #1d4ed8;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px -2px rgba(29, 78, 216, 0.3);

  &:active {
    background-color: #1e40af;
  }
`;

const SecondaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px 18px;
  background-color: #f1f5f9;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;

  &:active {
    background-color: #e2e8f0;
  }
`;
