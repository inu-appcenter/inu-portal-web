import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import {
  DormitoryStudentInfo,
  parseDormitoryStudentInfo,
} from "@/utils/ssvParser";
import { secureStorage } from "@/utils/secureStorage";
import { MobileDormitoryCard } from "@/components/mobile/dormitory/MobileDormitoryCard";
import { typography } from "@/styles/typography";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";

const STORAGE_KEY_DORMITORY_DATA = "portal_dormitory_student_info";

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

function mapGrade(val?: string): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (trimmed.endsWith("학년")) return trimmed;
  if (/^\d+$/.test(trimmed)) return `${trimmed}학년`;
  return trimmed;
}

function mapInOutStatus(code?: string): string {
  if (!code) return "";
  const trimmed = code.trim();
  switch (trimmed) {
    case "01":
      return "입사";
    case "02":
      return "퇴사";
    case "03":
      return "중도퇴사";
    default:
      return trimmed;
  }
}

export default function MobileDormitoryCardPage() {
  const navigate = useNavigate();
  const [dormInfo, setDormInfo] = useState<DormitoryStudentInfo | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCached = async () => {
      try {
        const cached = await secureStorage.getItem<unknown>(STORAGE_KEY_DORMITORY_DATA);
        const academicCached = await secureStorage.getItem<unknown>("portal_student_info");
        let academicParsed: DormitoryStudentInfo | null = null;
        if (academicCached) {
          try {
            academicParsed = parseDormitoryStudentInfo(academicCached);
          } catch (err) {
            void err;
          }
        }

        if (!isMounted) return;

        if (cached) {
          const restored = parseDormitoryStudentInfo(cached);
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
        console.error("사생정보 로드 실패", e);
      }
    };

    void fetchCached();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(ROUTES.LABS.PORTAL.DORMITORY);
    }
  };

  const profile = dormInfo?.profile;
  const rawFields = dormInfo?.rawFields;

  const studentName =
    dormInfo?.studentName ||
    profile?.name ||
    rawFields?.korNm ||
    rawFields?.nm ||
    "-";

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
  const dormitoryBuilding = profile?.dormitoryBuilding || rawFields?.dormBdNm || rawFields?.dormBdCd || mappedDormName || "-";
  const studentDormNo = profile?.studentDormNo || rawFields?.domstuNo || rawFields?.domStuNo || "-";

  const year = profile?.year || dormInfo?.appliedYear || rawFields?.yy || "";
  const term = profile?.term || dormInfo?.appliedSemester || rawFields?.tmGbn || "";
  const rawStatus = dormInfo?.inOutList?.[0]?.status || rawFields?.dormLeavdormGbn || "";
  const status = rawStatus ? mapInOutStatus(rawStatus) : "-";

  return (
    <PageContainer as="main">
      <TopBar>
        <BackButton onClick={handleBack} aria-label="뒤로가기">
          <ChevronLeft size={24} color="var(--text-primary)" />
        </BackButton>
        <BarTitle>모바일 사생증</BarTitle>
        <TopBarSpacer />
      </TopBar>

      <CardArea as="section">
        <MobileDormitoryCard
          fullscreen
          studentName={studentName}
          englishName={englishName}
          studentId={studentId}
          department={department}
          grade={grade}
          photoSrc={photoSrc}
          dormitoryType={dormitoryType}
          dormitoryBuilding={dormitoryBuilding || mappedDormName}
          studentDormNo={studentDormNo}
          year={year}
          term={term}
          status={status}
        />
      </CardArea>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-subtle);
  overflow: hidden;
  box-sizing: border-box;
  padding-top: var(--native-safe-area-inset-top, env(safe-area-inset-top, 0px));
  padding-bottom: var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px));

  @media (min-width: 768px) {
    max-width: 440px;
    margin: 0 auto;
    box-shadow: var(--bottom-sheet-shadow);
  }
`;

const TopBar = styled.header`
  height: 52px;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: var(--bg-base);
  border-bottom: 1px solid var(--border-default);
  z-index: 10;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;

  &:active {
    background-color: var(--bg-subtle);
  }

  &:focus-visible {
    outline: 2px solid var(--border-brand);
  }
`;

const BarTitle = styled.h1`
  ${typography.heading2}
  color: var(--text-primary);
  margin: 0;
`;

const TopBarSpacer = styled.div`
  width: 38px;
`;

const CardArea = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px ${MOBILE_PAGE_GUTTER} calc(16px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));
  box-sizing: border-box;
  overflow-y: auto;
`;
