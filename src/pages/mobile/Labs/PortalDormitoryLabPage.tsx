import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import ActionButton from "@/components/common/ActionButton";
import { ROUTES } from "@/constants/routes";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import {
  checkPortalAccountLinked,
  fetchAcademicInfoFromApp,
  fetchDormitoryStudentInfoFromApp,
  fetchDormitoryTabSpecificFromApp,
  resolveCurrentStudentId,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import {
  DormitoryStudentInfo,
  DormitoryAddressItem,
  DormitoryRewardItem,
  DormitoryInOutItem,
  DormitoryApplyItem,
  DormitoryPaymentItem,
  DormitoryUtilityItem,
  parseDormitoryStudentInfo,
} from "@/utils/ssvParser";
import { PortalAccountModal } from "@/components/mobile/agent/PortalAccountModal";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";
import { formatKoreanDateTime } from "@/utils/date";
import {
  Clock,
  Smartphone,
  MapPin,
  Award,
  LogIn,
  ClipboardList,
  CreditCard,
  Zap,
  FileCheck,
  ChevronRight,
  User,
  Database,
  RefreshCw,
  Inbox,
  GraduationCap,
  Terminal,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { openIntipAppOrStore } from "@/utils/appLauncher";

const STORAGE_KEY_DORMITORY_DATA = "portal_dormitory_student_info";
const STORAGE_KEY_DORMITORY_UPDATED = "portal_dormitory_last_updated";

type ActiveTab = "address" | "reward" | "inout" | "apply" | "payment" | "utility" | "pledge" | "academic";

/**
 * Base64 이미지를 안전한 Data URL로 변환 (공백 제거 및 포맷 감지)
 */
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

/**
 * 생활원 기숙사 구분 코드 매핑
 * 01: 제1기숙사, 02: 제2기숙사(직영), 03: 제2기숙사(BTL), 04: 제3기숙사, 05: 제3기숙사(BTL)
 */
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

/**
 * 학년 구분 매핑 (예: "4" -> "4학년")
 */
function mapGrade(val?: string): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (trimmed.endsWith("학년")) return trimmed;
  if (/^\d+$/.test(trimmed)) return `${trimmed}학년`;
  return `${trimmed}학년`;
}

/**
 * 성별 코드 매핑 (M -> 남성, F -> 여성)
 */
function mapGender(code?: string): string {
  if (!code) return "";
  const trimmed = code.trim().toUpperCase();
  if (trimmed === "M") return "남성";
  if (trimmed === "F") return "여성";
  return trimmed;
}

/**
 * 국적 코드 매핑 (KR -> 대한민국)
 */
function mapNationality(code?: string): string {
  if (!code) return "";
  const trimmed = code.trim().toUpperCase();
  if (trimmed === "KR") return "대한민국";
  return trimmed;
}

/**
 * 학기 코드 매핑 (10 -> 1, 20 -> 2, 30 -> 여름, 40 -> 겨울)
 */
function mapSemester(term?: string): string {
  if (!term) return "";
  const trimmed = term.trim();
  switch (trimmed) {
    case "10":
      return "1";
    case "20":
      return "2";
    case "30":
      return "여름";
    case "40":
      return "겨울";
    default:
      return trimmed.replace(/학기$/, "");
  }
}

/**
 * 상벌점 구분 매핑 (01: 상점, 02: 벌점)
 */
function mapRewardType(code?: string, score?: string): string {
  const trimmed = code?.trim();
  if (trimmed === "01") return "상점";
  if (trimmed === "02") return "벌점";
  if (trimmed?.includes("벌점")) return "벌점";
  if (trimmed?.includes("상점")) return "상점";
  const num = Number(score);
  if (!isNaN(num) && score !== undefined && score !== "") {
    return num < 0 ? "벌점" : "상점";
  }
  return trimmed || "상벌점";
}

/**
 * 입퇴사 상태 코드 매핑 (01: 정규입사, 02: 정규퇴사, 03: 중도퇴사)
 */
function mapInOutStatus(code?: string): string {
  if (!code) return "입퇴사";
  const trimmed = code.trim();
  switch (trimmed) {
    case "01":
      return "정규입사";
    case "02":
      return "정규퇴사";
    case "03":
      return "중도퇴사";
    default:
      return trimmed;
  }
}

/**
 * 기숙사 신청구분 매핑 (01: 정규선발, 02: 추가선발, 03: 방학/계절학기, 04: 잔류신청)
 */
function mapApplyType(code?: string): string {
  if (!code) return "-";
  const trimmed = code.trim();
  switch (trimmed) {
    case "01":
      return "정규선발";
    case "02":
      return "추가선발";
    case "03":
      return "방학/계절학기";
    case "04":
      return "잔류신청";
    default:
      return trimmed;
  }
}

/**
 * 선발 결과 매핑 (01: 접수완료, 02: 1차합격, 03: 불합격, 04: 예비후보, 05: 최종합격, 06: 입사포기)
 */
function mapPassStatus(code?: string): string {
  if (!code) return "";
  const trimmed = code.trim();
  switch (trimmed) {
    case "01":
      return "접수완료";
    case "02":
      return "1차합격";
    case "03":
      return "불합격";
    case "04":
      return "예비후보";
    case "05":
      return "최종합격";
    case "06":
      return "입사포기";
    default:
      return trimmed;
  }
}

/**
 * 수납 구분 매핑 (1: 등록, 2: 환불)
 */
function mapPaymentType(code?: string): string {
  if (!code) return "등록/환불";
  const trimmed = code.trim();
  switch (trimmed) {
    case "1":
    case "01":
      return "등록";
    case "2":
    case "02":
      return "환불";
    default:
      return trimmed;
  }
}

/**
 * 서약서 동의여부 매핑 (1/Y: 동의완료, 0/N: 미동의)
 */
function mapConsentStatus(status?: string): string {
  if (!status) return "-";
  const trimmed = status.trim();
  if (trimmed === "1" || trimmed === "Y" || trimmed === "동의") return "동의완료";
  if (trimmed === "0" || trimmed === "N" || trimmed === "미동의") return "미동의";
  return trimmed;
}

/**
 * 공공요금 납부상태 매핑 (1/Y: 납부완료, 0/N: 미납)
 */
function mapPaymentStatus(status?: string): string {
  if (!status) return "-";
  const trimmed = status.trim();
  if (trimmed === "1" || trimmed === "Y" || trimmed === "납부") return "납부완료";
  if (trimmed === "0" || trimmed === "N" || trimmed === "미납") return "미납";
  return trimmed;
}

/**
 * YYYYMMDD 또는 YYYYMMDDHHmmss00 등의 원시 날짜를 'YYYY.MM.DD' 형식으로 정돈
 */
function formatPortalDate(raw?: string | null): string {
  if (!raw) return "-";
  const str = String(raw).trim();
  if (!str || str === "-") return "-";
  const digits = str.replace(/\D/g, "");
  if (digits.length >= 8) {
    const y = digits.substring(0, 4);
    const m = digits.substring(4, 6);
    const d = digits.substring(6, 8);
    return `${y}.${m}.${d}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10).replace(/-/g, ".");
  }
  return str;
}

/**
 * YYYYMMDDHHmmss00 등의 일시 값을 'YYYY.MM.DD HH:mm' (시간이 00:00이면 'YYYY.MM.DD') 형식으로 정돈
 */
function formatPortalTimestamp(raw?: string | null): string {
  if (!raw) return "-";
  const str = String(raw).trim();
  if (!str || str === "-") return "-";
  const digits = str.replace(/\D/g, "");
  if (digits.length >= 12) {
    const y = digits.substring(0, 4);
    const m = digits.substring(4, 6);
    const d = digits.substring(6, 8);
    const hh = digits.substring(8, 10);
    const mm = digits.substring(10, 12);
    if (hh === "00" && mm === "00") {
      return `${y}.${m}.${d}`;
    }
    return `${y}.${m}.${d} ${hh}:${mm}`;
  }
  return formatPortalDate(str);
}

/**
 * YYYYMM 또는 YYYY-MM 등의 사용월을 'YYYY년 M월' 형식으로 정돈
 */
function formatPortalMonth(raw?: string | null): string {
  if (!raw) return "-";
  const str = String(raw).trim();
  if (!str || str === "-") return "-";
  const digits = str.replace(/\D/g, "");
  if (digits.length === 6) {
    return `${digits.substring(0, 4)}년 ${parseInt(digits.substring(4, 6), 10)}월`;
  }
  if (str.includes("-")) {
    const parts = str.split("-");
    if (parts.length === 2) {
      return `${parts[0]}년 ${parseInt(parts[1], 10)}월`;
    }
  }
  return str;
}

const PortalDormitoryLabPage = () => {
  const navigate = useNavigate();
  const { enabled: isLabsEnabled, isFetched: isLabsFlagFetched } = useFeatureFlag(
    FEATURE_FLAG_KEYS.LABS,
  );

  const [dormInfo, setDormInfo] = useState<DormitoryStudentInfo | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isPortalAccountModalOpen, setIsPortalAccountModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("address");
  const [showRawFields, setShowRawFields] = useState(false);

  // 진행 진단 로그 상태 및 타임스탬프 관리
  const [logs, setLogs] = useState<Array<{
    id: string;
    timestamp: string;
    stage: string;
    level: "info" | "success" | "warn" | "error";
    message: string;
    detail?: string;
    elapsedMs?: number;
  }>>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [isCopiedLogs, setIsCopiedLogs] = useState(false);
  const startTimeRef = useRef<number>(0);

  const addLog = useCallback(
    (
      stage: string,
      message: string,
      level: "info" | "success" | "warn" | "error" = "info",
      detail?: string
    ) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(
        now.getMilliseconds()
      ).padStart(3, "0")}`;
      const elapsedMs = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      setLogs((prev) => [
        ...prev,
        {
          id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: timeStr,
          stage,
          level,
          message,
          detail,
          elapsedMs,
        },
      ]);
    },
    []
  );

  const handleCopyLogs = useCallback(() => {
    if (logs.length === 0) return;
    const header =
      `[INTIP 기숙사 조회 진단 로그]\n` +
      `- 생성시각: ${new Date().toLocaleString()}\n` +
      `- 접속환경: ${isMobileAppEnvironment() ? "모바일 앱 (ReactNativeWebView)" : "일반 웹 브라우저"}\n` +
      `- 기록수: ${logs.length}건\n` +
      `--------------------------------------------------\n`;
    const body = logs
      .map((l) => {
        let line = `[${l.timestamp}] [${l.stage}] [${l.level.toUpperCase()}] ${l.message} (+${l.elapsedMs}ms)`;
        if (l.detail) line += `\n  - 상세: ${l.detail}`;
        return line;
      })
      .join("\n");
    const footer = `\n--------------------------------------------------`;
    const fullText = header + body + footer;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(fullText)
        .then(() => {
          setIsCopiedLogs(true);
          setTimeout(() => setIsCopiedLogs(false), 2000);
        })
        .catch(() => {
          prompt("아래 진단 로그를 복사하세요:", fullText);
        });
    } else {
      prompt("아래 진단 로그를 복사하세요:", fullText);
    }
  }, [logs]);

  useHeader({
    title: "사생정보조회(학생)",
  });

  useEffect(() => {
    if (isLabsFlagFetched && !isLabsEnabled) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [isLabsFlagFetched, isLabsEnabled, navigate]);

  // 마운트 시 캐시된 로컬 데이터를 먼저 복원
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_DORMITORY_DATA);
      const cachedTime = localStorage.getItem(STORAGE_KEY_DORMITORY_UPDATED);
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

        // 만약 복원된 dormInfo의 studentName이나 rawFields가 비어있고 학적 캐시가 있으면 보강
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
        if (cachedTime) {
          setLastUpdated(cachedTime);
        }
      } else if (academicParsed) {
        setDormInfo(academicParsed);
      }
    } catch (e) {
      console.warn("Dormitory cache load error:", e);
    }
  }, []);

  // 새로고침 버튼을 눌렀을 때만 ERP 직접 조회 (진행 단계별 로깅)
  const loadDormitoryInfo = useCallback(async () => {
    startTimeRef.current = Date.now();
    setLogs([]);
    addLog("INIT", "사생정보 조회 프로세스 시작", "info");

    if (!isMobileAppEnvironment()) {
      addLog("ENV_CHECK", "모바일 앱 환경이 아닙니다. (웹 환경 감지)", "warn");
      setIsPortalAccountModalOpen(true);
      return;
    }
    addLog("ENV_CHECK", "모바일 앱 브릿지 환경 확인 완료 (ReactNativeWebView)", "info");

    try {
      setIsLoading(true);
      setLoadingMessage("사생 정보와 탭 데이터를 조회하고 있습니다...");

      addLog("AUTH_CHECK", "기기 보안 저장소 내 포털 계정(학번/비밀번호) 등록 여부 확인 중...", "info");
      const isLinked = await checkPortalAccountLinked();
      if (!isLinked) {
        addLog("AUTH_CHECK", "포털 계정이 등록되지 않았습니다. 계정 입력창 호출", "warn");
        setIsPortalAccountModalOpen(true);
        setIsLoading(false);
        return;
      }
      addLog("AUTH_CHECK", "포털 계정 연동 확인 완료 (linked: true)", "success");

      // 본인 학번 확인 및 사전 확보
      let myStudentId = resolveCurrentStudentId();
      if (!myStudentId) {
        addLog("ID_RESOLVE", "로컬에 학번 정보가 없어 학적 조회를 통해 본인 학번을 먼저 확인합니다...", "info");
        try {
          const academicRes = await fetchAcademicInfoFromApp(false);
          if (academicRes.success && academicRes.data?.studentId) {
            myStudentId = academicRes.data.studentId.trim();
            addLog("ID_RESOLVE", `본인 학번 확인 완료 (${myStudentId})`, "success");
          }
        } catch {
          addLog("ID_RESOLVE", "학적 사전 확인 실패, 세션 기반으로 진행합니다.", "warn");
        }
      } else {
        addLog("ID_RESOLVE", `확인된 본인 학번: ${myStudentId}`, "info");
      }

      addLog(
        "DISPATCH",
        `모바일 앱 브릿지로 사생정보 Fast-Path(핵심 7개 묶음) 요청 전송 (학번: ${myStudentId || "세션"}, 타임아웃 50초)`,
        "info"
      );
      const res = await fetchDormitoryStudentInfoFromApp({ stuno: myStudentId });

      if (res.success && res.data) {
        const returnedId = res.data.profile?.studentId || res.data.studentId || "";

        // 타인 데이터 노출 방지 안전장치 (Sanity Check)
        if (myStudentId && returnedId && returnedId !== myStudentId) {
          const warnMsg = `조회된 사생 학번(${returnedId})이 본인 학번(${myStudentId})과 일치하지 않습니다.`;
          addLog("SECURITY_ALERT", warnMsg, "error", "타인 정보 노출 방지를 위해 데이터를 거부했습니다.");
          setShowLogs(true);
          alert("학적 정보 불일치가 감지되어 조회를 중단했습니다. 마이페이지에서 포털 계정을 다시 확인해 주세요.");
          return;
        }

        const studentNm = res.data.profile?.name || res.data.studentName || "(이름 없음)";
        const rawCount = Object.keys(res.data.rawFields || {}).length;
        addLog(
          "PARSE_SUCCESS",
          `사생정보 전체 탭 수신 및 파싱 완료 (사생: ${studentNm}, 학번: ${returnedId || "-"}, 원시 필드: ${rawCount}개)`,
          "success",
          `사생번호: ${res.data.profile?.studentDormNo || "-"}, 건물: ${res.data.profile?.dormitoryBuilding || "-"}`
        );

        let finalDormData = res.data;
        // 로컬에 기존 학적 사진이 있으면 병합
        try {
          const academicCached = localStorage.getItem("portal_student_info");
          if (academicCached) {
            const parsedAc = JSON.parse(academicCached);
            const acRf = parsedAc.rawFields || {};
            const photo = parsedAc.photoBase64 || acRf.phtFile2 || acRf.phtFile1 || acRf.phtFile;
            if (photo && !finalDormData.photoBase64 && !finalDormData.profile?.photoBase64) {
              finalDormData = {
                ...finalDormData,
                photoBase64: photo,
                profile: finalDormData.profile ? { ...finalDormData.profile, photoBase64: photo } : finalDormData.profile,
                rawFields: { ...acRf, ...(finalDormData.rawFields || {}) },
              };
            }
          }
        } catch {}

        setDormInfo(finalDormData);
        const nowIso = new Date().toISOString();
        setLastUpdated(nowIso);

        try {
          localStorage.setItem(STORAGE_KEY_DORMITORY_DATA, JSON.stringify(finalDormData));
          localStorage.setItem(STORAGE_KEY_DORMITORY_UPDATED, nowIso);
          addLog("CACHE_SAVED", "로컬 스토리지에 최신 사생정보 캐싱 완료", "info");
        } catch (storageErr) {
          console.warn("Dormitory cache save error:", storageErr);
          addLog("CACHE_WARN", "로컬 스토리지 캐시 저장 실패", "warn", String(storageErr));
        }

        // 학적 사진이 아직 없으면 백그라운드에서 학적 정보를 함께 조회하여 증명사진 동기화
        if (!finalDormData.photoBase64 && !finalDormData.profile?.photoBase64) {
          addLog("ACADEMIC_SYNC", "학적 증명사진 및 추가 정보를 확인하는 중...", "info");
          fetchAcademicInfoFromApp(false)
            .then((acRes) => {
              if (acRes.success && acRes.data) {
                const rf = acRes.data.rawFields || {};
                const photo = (acRes.data as any).photoBase64 || rf.phtFile2 || rf.phtFile1 || rf.phtFile;
                try {
                  localStorage.setItem("portal_student_info", JSON.stringify(acRes.data));
                } catch {}
                if (photo) {
                  setDormInfo((prev) => {
                    if (!prev) return prev;
                    const updated = {
                      ...prev,
                      photoBase64: photo,
                      profile: prev.profile ? { ...prev.profile, photoBase64: photo } : prev.profile,
                      rawFields: { ...rf, ...(prev.rawFields || {}) },
                    };
                    try {
                      localStorage.setItem(STORAGE_KEY_DORMITORY_DATA, JSON.stringify(updated));
                    } catch {}
                    return updated;
                  });
                  addLog("ACADEMIC_SYNC", "학적 증명사진 동기화 완료", "success");
                }
              }
            })
            .catch(() => {});
        }
      } else {
        const errMsg = res.errorMessage || "사생 정보 조회 중 오류가 발생했습니다.";
        addLog(
          "FAILED",
          `조회 실패: ${errMsg}`,
          "error",
          `ErrorCode: ${res.errorCode || "UNKNOWN"}`
        );
        setShowLogs(true); // 실패 시 로그를 즉시 확인/복사할 수 있도록 자동 펼침
        alert(errMsg);
      }
    } catch (e: any) {
      const errMsg = e?.message || "사생 정보 조회 실패";
      addLog("EXCEPTION", `예외 발생: ${errMsg}`, "error", String(e));
      setShowLogs(true);
      alert(errMsg);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
      addLog("FINISH", `프로세스 종료 (총 소요시간: ${Date.now() - startTimeRef.current}ms)`, "info");
    }
  }, [addLog]);

  // 특정 탭(공공요금 또는 서약서) 단독 온디맨드 조회 (상세 로깅)
  const [tabLoading, setTabLoading] = useState<string | null>(null);
  const handleFetchTabSpecific = useCallback(
    async (tabType: "utility" | "pledge") => {
      const tabName = tabType === "utility" ? "공공요금" : "입사서약서";
      startTimeRef.current = Date.now();
      addLog("TAB_INIT", `[${tabName}] 단독 상세 탭 조회 시작`, "info");

      if (!isMobileAppEnvironment()) {
        addLog("ENV_CHECK", "모바일 앱 환경이 아닙니다.", "warn");
        setIsPortalAccountModalOpen(true);
        return;
      }

      setTabLoading(tabType);
      try {
        const myStudentId = resolveCurrentStudentId();
        addLog(
          "TAB_DISPATCH",
          `[${tabName}] 모바일 앱 브릿지로 단건 요청 전송 (학번: ${myStudentId || "세션"}, 타임아웃 45초)`,
          "info"
        );
        const res = await fetchDormitoryTabSpecificFromApp(tabType, { stuno: myStudentId });
        if (res.success && res.data) {
          addLog("TAB_SUCCESS", `[${tabName}] 데이터 수신 및 파싱 성공`, "success");
          setDormInfo((prev) => {
            if (!prev) return res.data as DormitoryStudentInfo;
            const updated: DormitoryStudentInfo = {
              ...prev,
              ...(tabType === "utility" && res.data?.utilityList
                ? { utilityList: res.data.utilityList }
                : {}),
              ...(tabType === "pledge" && res.data?.pledge
                ? { pledge: res.data.pledge }
                : {}),
            };
            try {
              localStorage.setItem(STORAGE_KEY_DORMITORY_DATA, JSON.stringify(updated));
              addLog("TAB_CACHE", `[${tabName}] 기존 사생정보에 병합 캐싱 완료`, "info");
            } catch {}
            return updated;
          });
        } else {
          const errMsg = res.errorMessage || "상세 내역을 불러오는 중 오류가 발생했습니다.";
          addLog(
            "TAB_FAILED",
            `[${tabName}] 조회 실패: ${errMsg}`,
            "error",
            `ErrorCode: ${res.errorCode || "UNKNOWN"}`
          );
          setShowLogs(true);
          alert(errMsg);
        }
      } catch (e: any) {
        const errMsg = e?.message || "상세 내역 조회 실패";
        addLog("TAB_EXCEPTION", `[${tabName}] 예외 발생: ${errMsg}`, "error", String(e));
        setShowLogs(true);
        alert(errMsg);
      } finally {
        setTabLoading(null);
        addLog("TAB_FINISH", `[${tabName}] 조회 종료 (소요시간: ${Date.now() - startTimeRef.current}ms)`, "info");
      }
    },
    [addLog]
  );

  // 학적 캐시 fallback (기숙사 데이터셋에 인적사항 필드가 누락되었을 때 대비)
  const fallbackAcademic = useMemo(() => {
    try {
      const saved = localStorage.getItem("portal_student_info");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const profile = dormInfo?.profile;

  // 모든 데이터 소스로부터 필드 매핑
  const studentName =
    profile?.name ||
    dormInfo?.studentName ||
    dormInfo?.rawFields?.korNm ||
    dormInfo?.rawFields?.nm ||
    fallbackAcademic?.name ||
    fallbackAcademic?.korNm ||
    fallbackAcademic?.rawFields?.korNm ||
    fallbackAcademic?.rawFields?.nm ||
    "";

  const englishName =
    profile?.englishName ||
    dormInfo?.rawFields?.engNm ||
    fallbackAcademic?.englishName ||
    fallbackAcademic?.rawFields?.engNm ||
    "";

  const studentId =
    profile?.studentId ||
    dormInfo?.studentId ||
    dormInfo?.rawFields?.persNo ||
    dormInfo?.rawFields?.stuno ||
    fallbackAcademic?.studentId ||
    fallbackAcademic?.stuno ||
    fallbackAcademic?.rawFields?.persNo ||
    fallbackAcademic?.rawFields?.stuno ||
    "";

  const rawGender =
    profile?.gender ||
    dormInfo?.rawFields?.genGbn ||
    fallbackAcademic?.gender ||
    fallbackAcademic?.rawFields?.genGbn ||
    "";
  const gender = mapGender(rawGender);

  const rawNationality =
    profile?.nationality ||
    dormInfo?.rawFields?.natGbn ||
    fallbackAcademic?.nationality ||
    fallbackAcademic?.rawFields?.natGbn ||
    "";
  const nationality = mapNationality(rawNationality);

  const department =
    profile?.department ||
    dormInfo?.rawFields?.deptNm ||
    dormInfo?.rawFields?.hgNm ||
    fallbackAcademic?.department ||
    fallbackAcademic?.rawFields?.deptNm ||
    fallbackAcademic?.rawFields?.hgNm ||
    "";

  const rawGrade =
    profile?.grade ||
    dormInfo?.rawFields?.hySeqGbn ||
    fallbackAcademic?.grade ||
    fallbackAcademic?.rawFields?.hySeqGbn ||
    "";
  const grade = mapGrade(rawGrade);

  const rawDormGbn = dormInfo?.rawFields?.dormGbn || profile?.dormitoryType || "";
  const mappedDormName = mapDormitoryType(rawDormGbn);
  const dormitoryType = mappedDormName || dormInfo?.dormitoryBuilding || dormInfo?.rawFields?.dormBdNm || "-";
  const dormitoryBuilding = profile?.dormitoryBuilding || dormInfo?.dormitoryBuilding || dormInfo?.rawFields?.dormBdNm || dormInfo?.rawFields?.dormBdCd || "";
  const studentDormNo = profile?.studentDormNo || dormInfo?.rawFields?.domstuNo || dormInfo?.rawFields?.domStuNo || "";

  const phoneNumber =
    profile?.phoneNumber ||
    dormInfo?.rawFields?.handpNo ||
    fallbackAcademic?.phoneNumber ||
    fallbackAcademic?.rawFields?.handpNo ||
    "";

  const email =
    profile?.email ||
    dormInfo?.rawFields?.email ||
    fallbackAcademic?.email ||
    fallbackAcademic?.rawFields?.email ||
    "";

  const zipCode = profile?.zipCode || dormInfo?.rawFields?.zipNo || "";
  const address = profile?.address || dormInfo?.rawFields?.addr || "";
  const detailedAddress = profile?.detailedAddress || dormInfo?.rawFields?.detaAddr || "";
  const meritPoints = profile?.meritPoints ?? dormInfo?.meritPoints ?? dormInfo?.rawFields?.ardScr1 ?? "0";
  const demeritPoints = profile?.demeritPoints ?? dormInfo?.demeritPoints ?? dormInfo?.rawFields?.ardScr2 ?? "0";
  const nonOffsetDemeritPoints = profile?.nonOffsetDemeritPoints ?? dormInfo?.rawFields?.ardScr3 ?? "0";
  const year = profile?.year || dormInfo?.appliedYear || dormInfo?.rawFields?.yy || "";
  const term = profile?.term || dormInfo?.appliedSemester || dormInfo?.rawFields?.tmGbn || "";

  // 확장 학적/신원 필드
  const professorName =
    profile?.professorName ||
    dormInfo?.rawFields?.profNm ||
    fallbackAcademic?.profNm ||
    fallbackAcademic?.rawFields?.profNm ||
    "";
  const averageScore =
    profile?.averageScore ||
    dormInfo?.rawFields?.mrksAvg ||
    fallbackAcademic?.mrksAvg ||
    fallbackAcademic?.rawFields?.mrksAvg ||
    "";
  const completedCredits =
    profile?.completedCredits ||
    dormInfo?.rawFields?.cptnTmNm ||
    fallbackAcademic?.cptnTmNm ||
    fallbackAcademic?.rawFields?.cptnTmNm ||
    "";
  const entranceDate =
    profile?.entranceDate ||
    dormInfo?.rawFields?.entrDt ||
    fallbackAcademic?.entrDt ||
    fallbackAcademic?.rawFields?.entrDt ||
    "";
  const academicStatus =
    profile?.academicStatus ||
    dormInfo?.rawFields?.schregStGbn ||
    fallbackAcademic?.schregStGbn ||
    fallbackAcademic?.rawFields?.schregStGbn ||
    "";
  const expectedGraduation =
    profile?.expectedGraduation ||
    dormInfo?.rawFields?.grdtExpcYn ||
    fallbackAcademic?.grdtExpcYn ||
    fallbackAcademic?.rawFields?.grdtExpcYn ||
    "";
  const maskedRrn =
    profile?.maskedRrn ||
    dormInfo?.rawFields?.rrn ||
    fallbackAcademic?.rrn ||
    fallbackAcademic?.rawFields?.rrn ||
    "";

  // 프로필 이미지 소스 계산
  const profilePhotoSrc = useMemo(() => {
    const rawPhoto =
      profile?.photoBase64 ||
      dormInfo?.photoBase64 ||
      profile?.rawFields?.phtFile2 ||
      profile?.rawFields?.phtFile1 ||
      profile?.rawFields?.phtFile ||
      dormInfo?.rawFields?.phtFile2 ||
      dormInfo?.rawFields?.phtFile1 ||
      dormInfo?.rawFields?.phtFile ||
      fallbackAcademic?.rawFields?.phtFile2 ||
      fallbackAcademic?.rawFields?.phtFile1 ||
      fallbackAcademic?.rawFields?.phtFile;

    if (rawPhoto) {
      return toImageSrc(rawPhoto);
    }
    return null;
  }, [profile, dormInfo, fallbackAcademic]);

  // 원시 필드 목록 (profile, dormInfo, fallbackAcademic 종합)
  const rawEntries = useMemo(() => {
    let rf = profile?.rawFields || dormInfo?.rawFields;
    if (!rf || Object.keys(rf).length === 0) {
      if (fallbackAcademic?.rawFields && Object.keys(fallbackAcademic.rawFields).length > 0) {
        rf = fallbackAcademic.rawFields;
      }
    }
    rf = rf || {};
    return Object.entries(rf).sort(([a], [b]) => a.localeCompare(b));
  }, [profile, dormInfo, fallbackAcademic]);

  const addressList = dormInfo?.addressList || [];
  const rewardList = dormInfo?.rewardList || [];
  const inOutList = dormInfo?.inOutList || [];
  const applyList = dormInfo?.applyList || [];
  const paymentList = dormInfo?.paymentList || [];
  const utilityList = dormInfo?.utilityList || [];
  const pledge = dormInfo?.pledge || null;

  return (
    <Container>
      <Breadcrumb>
        <span>부속행정</span>
        <ChevronRight size={11} />
        <span>생활원</span>
        <ChevronRight size={11} />
        <span>사생관리</span>
        <ChevronRight size={11} />
        <span className="current">사생정보조회(학생)</span>
      </Breadcrumb>

      <TitleContentArea
        title="사생정보조회(학생)"
        description="포털 종합정보시스템(부속행정 > 생활원 > 사생관리) 사생정보 및 7개 탭 내역을 조회합니다."
        style={{ alignItems: "stretch", width: "100%" }}
      >
        {!isMobileAppEnvironment() && (
          <WebFallbackCard>
            <Smartphone size={28} />
            <div className="title">모바일 앱 전용 기능</div>
            <div className="desc">
              학교 포털 ERP 연동은 INTIP 앱 내부의 보안 세션을 통해 안전하게 조회됩니다.
            </div>
            <ActionButton
              as="button"
              onClick={() => openIntipAppOrStore(ROUTES.LABS.PORTAL.DORMITORY)}
            >
              앱 열기
            </ActionButton>
          </WebFallbackCard>
        )}

        <ActionBar>
          <div style={{ display: "flex", gap: "8px", width: "100%" }}>
            <ActionButton
              as="button"
              disabled={isLoading}
              onClick={loadDormitoryInfo}
              style={{ flex: 1 }}
            >
              <RefreshCw size={14} className={isLoading ? "spin" : ""} style={{ marginRight: 6 }} />
              {isLoading ? loadingMessage || "조회 중..." : "정보 새로고침"}
            </ActionButton>
            <ActionButton
              as="button"
              onClick={() => navigate(ROUTES.DORMITORY_CARD)}
              style={{
                flex: 1,
                backgroundColor: "#1d4ed8",
                color: "#ffffff",
                borderColor: "#1d4ed8",
                fontWeight: 600,
              }}
            >
              <CreditCard size={14} style={{ marginRight: 6 }} />
              모바일 사생증
            </ActionButton>
          </div>
          {lastUpdated && (
            <UpdatedTimeText>
              <Clock size={12} />
              {formatKoreanDateTime(lastUpdated)} 기준
            </UpdatedTimeText>
          )}
        </ActionBar>

        {/* 1. 상단 사생정보 카드 */}
        <SectionBlock>
          <SectionHeader>
            <span className="title">사생정보</span>
            {year && term ? (
              <span className="term-badge">{year}년 {mapSemester(term)}학기</span>
            ) : null}
          </SectionHeader>

          <CardContainer>
            {/* 상단 프로필 헤더: 사진 + 핵심 신원 */}
            <ProfileTopArea>
              <AvatarWrapper>
                {profilePhotoSrc ? (
                  <img src={profilePhotoSrc} alt="사생 증명사진" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">
                    <User size={32} strokeWidth={1.5} />
                    <span>미등록</span>
                  </div>
                )}
              </AvatarWrapper>

              <IdentityWrapper>
                <div className="name-row">
                  <span className="name">{studentName || "(이름 없음)"}</span>
                  {englishName ? <span className="eng-name">{englishName}</span> : null}
                </div>
                {studentId ? <div className="student-id">학번: {studentId}</div> : null}
                <div className="tags-row">
                  {department ? <span className="tag">{department}</span> : null}
                  {grade ? <span className="tag">{grade}</span> : null}
                  {dormitoryBuilding ? <span className="tag highlight">{dormitoryBuilding}</span> : null}
                </div>
              </IdentityWrapper>
            </ProfileTopArea>

            {/* 상세 항목 리스트 (모바일 친화적인 키-값 그리드) */}
            <InfoGrid>
              <InfoCell>
                <span className="label">기숙사구분</span>
                <span className="value">{dormitoryType || "-"}</span>
              </InfoCell>
              <InfoCell>
                <span className="label">건물구분</span>
                <span className="value">{dormitoryBuilding || "-"}</span>
              </InfoCell>
              <InfoCell>
                <span className="label">사생번호</span>
                <span className="value">{studentDormNo || "-"}</span>
              </InfoCell>
              <InfoCell>
                <span className="label">성별 / 국적</span>
                <span className="value">
                  {gender || "-"}{nationality ? ` / ${nationality}` : ""}
                </span>
              </InfoCell>
              <InfoCell>
                <span className="label">휴대전화번호</span>
                <span className="value">{phoneNumber || "-"}</span>
              </InfoCell>
              <InfoCell>
                <span className="label">이메일</span>
                <span className="value">{email || "-"}</span>
              </InfoCell>
              <InfoCell fullWidth>
                <span className="label">거주지 주소</span>
                <span className="value">
                  {zipCode ? `[${zipCode}] ` : ""}
                  {address || ""} {detailedAddress || ""}
                  {!zipCode && !address && !detailedAddress ? "-" : ""}
                </span>
              </InfoCell>
            </InfoGrid>

            {/* 상벌점 배지 영역 */}
            <PointBar>
              <PointChip>
                <span className="title">상점</span>
                <span className="score merit">{meritPoints}</span>
              </PointChip>
              <PointChip>
                <span className="title">일반벌점</span>
                <span className="score demerit">{demeritPoints}</span>
              </PointChip>
              <PointChip>
                <span className="title">상쇄불가벌점</span>
                <span className="score fixed">{nonOffsetDemeritPoints}</span>
              </PointChip>
            </PointBar>
          </CardContainer>
        </SectionBlock>

        {/* 2. 하단 7개 탭 네비게이션 */}
        <SectionBlock>
          <TabsWrapper>
            <TabsScrollContainer>
              <TabChip
                active={activeTab === "address"}
                onClick={() => setActiveTab("address")}
              >
                <MapPin size={13} />
                주소사항 ({addressList.length})
              </TabChip>
              <TabChip
                active={activeTab === "reward"}
                onClick={() => setActiveTab("reward")}
              >
                <Award size={13} />
                상벌점이력 ({rewardList.length})
              </TabChip>
              <TabChip
                active={activeTab === "inout"}
                onClick={() => setActiveTab("inout")}
              >
                <LogIn size={13} />
                입퇴사이력 ({inOutList.length})
              </TabChip>
              <TabChip
                active={activeTab === "apply"}
                onClick={() => setActiveTab("apply")}
              >
                <ClipboardList size={13} />
                신청이력 ({applyList.length})
              </TabChip>
              <TabChip
                active={activeTab === "payment"}
                onClick={() => setActiveTab("payment")}
              >
                <CreditCard size={13} />
                등록/환불 ({paymentList.length})
              </TabChip>
              <TabChip
                active={activeTab === "utility"}
                onClick={() => setActiveTab("utility")}
              >
                <Zap size={13} />
                공공요금 ({utilityList.length})
              </TabChip>
              <TabChip
                active={activeTab === "pledge"}
                onClick={() => setActiveTab("pledge")}
              >
                <FileCheck size={13} />
                서약서 {pledge ? "(1)" : "(0)"}
              </TabChip>
              <TabChip
                active={activeTab === "academic"}
                onClick={() => setActiveTab("academic")}
              >
                <GraduationCap size={13} />
                학적/학생정보
              </TabChip>
            </TabsScrollContainer>
          </TabsWrapper>

          {/* 3. 탭별 상세 카드 목록 */}
          <TabBody>
            {/* 탭 1: 주소사항 */}
            {activeTab === "address" && (
              <div>
                {addressList.length > 0 ? (
                  <CardsList>
                    {addressList.map((item: DormitoryAddressItem, idx: number) => (
                      <DetailCard key={idx}>
                        <DetailRow>
                          <span className="k">우편번호</span>
                          <span className="v">{item.zipCode || "-"}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">기본주소</span>
                          <span className="v">{item.address || "-"}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">상세주소</span>
                          <span className="v">{item.detailedAddress || "-"}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">보호자 연락처</span>
                          <span className="v">{item.guardianPhone || "-"}</span>
                        </DetailRow>
                      </DetailCard>
                    ))}
                  </CardsList>
                ) : (
                  <CardsList>
                    <EmptyBanner>
                      <Inbox size={15} />
                      <span>조회된 주소 내역이 없습니다. (항목 안내 틀)</span>
                    </EmptyBanner>
                    <DetailCard style={{ opacity: 0.85 }}>
                      <DetailRow>
                        <span className="k">우편번호</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">기본주소</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">상세주소</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">보호자 연락처</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                    </DetailCard>
                  </CardsList>
                )}
              </div>
            )}

            {/* 탭 2: 상벌점이력 */}
            {activeTab === "reward" && (
              <div>
                {rewardList.length > 0 ? (
                  <CardsList>
                    {rewardList.map((rw: DormitoryRewardItem, idx: number) => {
                      const typeName = mapRewardType(rw.type, rw.score);
                      const isDemerit = typeName === "벌점" || rw.type === "02" || parseInt(rw.score, 10) < 0;
                      return (
                        <DetailCard key={idx}>
                          <DetailCardHeader>
                            <span className={`status-pill ${isDemerit ? "demerit" : "merit"}`}>
                              {typeName} {Math.abs(Number(rw.score) || 0)}점
                            </span>
                            <span className="sub-text">{formatPortalTimestamp(rw.imposedDate)}</span>
                          </DetailCardHeader>
                          <DetailRow>
                            <span className="k">상벌점명</span>
                            <span className="v font-bold">{rw.name || "-"}</span>
                          </DetailRow>
                          <DetailRow>
                            <span className="k">사유</span>
                            <span className="v">{rw.reason || "-"}</span>
                          </DetailRow>
                        </DetailCard>
                      );
                    })}
                  </CardsList>
                ) : (
                  <CardsList>
                    <EmptyBanner>
                      <Inbox size={15} />
                      <span>부여된 상벌점 내역이 없습니다. (항목 안내 틀)</span>
                    </EmptyBanner>
                    <DetailCard style={{ opacity: 0.85 }}>
                      <DetailCardHeader>
                        <span className="status-pill neutral">구분 (상점/벌점)</span>
                        <span className="sub-text">부여일자 (-)</span>
                      </DetailCardHeader>
                      <DetailRow>
                        <span className="k">상벌점명</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">부여 점수</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">사유</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                    </DetailCard>
                  </CardsList>
                )}
              </div>
            )}

            {/* 탭 3: 입퇴사이력 */}
            {activeTab === "inout" && (
              <div>
                {inOutList.length > 0 ? (
                  <CardsList>
                    {inOutList.map((io: DormitoryInOutItem, idx: number) => (
                      <DetailCard key={idx}>
                        <DetailCardHeader>
                          <span className="status-pill neutral">
                            {io.year ? `${io.year}년 ` : ""}{io.term ? `${mapSemester(io.term)}학기 ` : ""}({mapDormitoryType(io.dormitoryType) || "기숙사"})
                          </span>
                          <span className="sub-text font-bold">{mapInOutStatus(io.status)}</span>
                        </DetailCardHeader>
                        <DetailRow>
                          <span className="k">사생번호</span>
                          <span className="v">{io.studentDormNo || "-"}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">입사일자</span>
                          <span className="v">{formatPortalDate(io.checkInDate)}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">퇴사일자</span>
                          <span className="v">{formatPortalDate(io.checkOutDate)}</span>
                        </DetailRow>
                      </DetailCard>
                    ))}
                  </CardsList>
                ) : (
                  <CardsList>
                    <EmptyBanner>
                      <Inbox size={15} />
                      <span>입퇴사 이력이 없습니다. (항목 안내 틀)</span>
                    </EmptyBanner>
                    <DetailCard style={{ opacity: 0.85 }}>
                      <DetailCardHeader>
                        <span className="status-pill neutral">연도/학기 (기숙사구분)</span>
                        <span className="sub-text">상태 (입사/퇴사)</span>
                      </DetailCardHeader>
                      <DetailRow>
                        <span className="k">사생번호</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">호실정보</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">입사일자</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">퇴사일자</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                    </DetailCard>
                  </CardsList>
                )}
              </div>
            )}

            {/* 탭 4: 신청이력 */}
            {activeTab === "apply" && (
              <div>
                {applyList.length > 0 ? (
                  <CardsList>
                    {applyList.map((ap: DormitoryApplyItem, idx: number) => (
                      <DetailCard key={idx}>
                        <DetailCardHeader>
                          <span className="status-pill neutral">
                            {ap.year ? `${ap.year}년 ` : ""}{ap.term ? `${mapSemester(ap.term)}학기` : ""}
                          </span>
                          <span className="sub-text font-bold">
                            {mapPassStatus(ap.passStatus) || mapApplyType(ap.applyType) || "신청"}
                          </span>
                        </DetailCardHeader>
                        <DetailRow>
                          <span className="k">신청구분</span>
                          <span className="v">{mapApplyType(ap.applyType)}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">신청일자</span>
                          <span className="v">{formatPortalDate(ap.applyDate)}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">거주기간</span>
                          <span className="v">
                            {formatPortalDate(ap.periodStart)} ~ {formatPortalDate(ap.periodEnd)}
                          </span>
                        </DetailRow>
                      </DetailCard>
                    ))}
                  </CardsList>
                ) : (
                  <CardsList>
                    <EmptyBanner>
                      <Inbox size={15} />
                      <span>기숙사 신청 내역이 없습니다. (항목 안내 틀)</span>
                    </EmptyBanner>
                    <DetailCard style={{ opacity: 0.85 }}>
                      <DetailCardHeader>
                        <span className="status-pill neutral">연도/학기</span>
                        <span className="sub-text">선발상태 (합격/불합격)</span>
                      </DetailCardHeader>
                      <DetailRow>
                        <span className="k">신청구분</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">신청일자</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">거주기간</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                    </DetailCard>
                  </CardsList>
                )}
              </div>
            )}

            {/* 탭 5: 등록/환불이력 */}
            {activeTab === "payment" && (
              <div>
                {paymentList.length > 0 ? (
                  <CardsList>
                    {paymentList.map((pm: DormitoryPaymentItem, idx: number) => (
                      <DetailCard key={idx}>
                        <DetailCardHeader>
                          <span className={`status-pill ${pm.type.includes("환불") || pm.type === "2" || pm.type === "02" ? "demerit" : "merit"}`}>
                            {mapPaymentType(pm.type)}
                          </span>
                          <span className="sub-text">{formatPortalDate(pm.date)}</span>
                        </DetailCardHeader>
                        <DetailRow>
                          <span className="k">학기</span>
                          <span className="v">{pm.year}년 {mapSemester(pm.term)}학기</span>
                        </DetailRow>
                        {pm.dormitoryType ? (
                          <DetailRow>
                            <span className="k">기숙사구분</span>
                            <span className="v">{mapDormitoryType(pm.dormitoryType)}</span>
                          </DetailRow>
                        ) : null}
                        <DetailRow>
                          <span className="k">금액</span>
                          <span className="v font-bold">
                            {pm.amount ? `${Number(pm.amount).toLocaleString()}원` : "0원"}
                          </span>
                        </DetailRow>
                        {pm.dormFee ? (
                          <DetailRow>
                            <span className="k">기숙사비(관리비)</span>
                            <span className="v">{Number(pm.dormFee).toLocaleString()}원</span>
                          </DetailRow>
                        ) : null}
                        {pm.mealFee ? (
                          <DetailRow>
                            <span className="k">식비</span>
                            <span className="v">{Number(pm.mealFee).toLocaleString()}원</span>
                          </DetailRow>
                        ) : null}
                        {pm.depositFee ? (
                          <DetailRow>
                            <span className="k">보증금</span>
                            <span className="v">{Number(pm.depositFee).toLocaleString()}원</span>
                          </DetailRow>
                        ) : null}
                        {pm.bankName || pm.accountNumber ? (
                          <DetailRow>
                            <span className="k">환불/입금계좌</span>
                            <span className="v">{pm.bankName || ""} {pm.accountNumber || ""}</span>
                          </DetailRow>
                        ) : null}
                      </DetailCard>
                    ))}
                  </CardsList>
                ) : (
                  <CardsList>
                    <EmptyBanner>
                      <Inbox size={15} />
                      <span>등록금 납부 및 환불 내역이 없습니다. (항목 안내 틀)</span>
                    </EmptyBanner>
                    <DetailCard style={{ opacity: 0.85 }}>
                      <DetailCardHeader>
                        <span className="status-pill neutral">구분 (등록/환불)</span>
                        <span className="sub-text">일자 (-)</span>
                      </DetailCardHeader>
                      <DetailRow>
                        <span className="k">학기</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">기숙사구분</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">총 납부금액</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">기숙사비(관리비)</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">식비</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">보증금</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">환불/입금계좌</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                    </DetailCard>
                  </CardsList>
                )}
              </div>
            )}

            {/* 탭 6: 공공요금 부과내역 */}
            {activeTab === "utility" && (
              <div>
                {utilityList.length > 0 ? (
                  <CardsList>
                    {utilityList.map((ut: DormitoryUtilityItem, idx: number) => (
                      <DetailCard key={idx}>
                        <DetailCardHeader>
                          <span className="status-pill neutral">사용월: {formatPortalMonth(ut.useMonth)}</span>
                          <span className="sub-text font-bold">
                            총 {ut.totalFee ? `${Number(ut.totalFee).toLocaleString()}원` : "0원"}
                          </span>
                        </DetailCardHeader>
                        <DetailRow>
                          <span className="k">전기 (사용량 / 요금)</span>
                          <span className="v">{ut.electricUsage || "0"} / {Number(ut.electricFee || "0").toLocaleString()}원</span>
                        </DetailRow>
                        {ut.prevElectricIndex || ut.currElectricIndex ? (
                          <DetailRow>
                            <span className="k">전기 지침 (전월 / 당월)</span>
                            <span className="v">{ut.prevElectricIndex || "-"} / {ut.currElectricIndex || "-"}</span>
                          </DetailRow>
                        ) : null}
                        <DetailRow>
                          <span className="k">수도 (사용량 / 요금)</span>
                          <span className="v">{ut.waterUsage || "0"} / {Number(ut.waterFee || "0").toLocaleString()}원</span>
                        </DetailRow>
                        {ut.prevWaterIndex || ut.currWaterIndex ? (
                          <DetailRow>
                            <span className="k">수도 지침 (전월 / 당월)</span>
                            <span className="v">{ut.prevWaterIndex || "-"} / {ut.currWaterIndex || "-"}</span>
                          </DetailRow>
                        ) : null}
                        <DetailRow>
                          <span className="k">온수 / 난방 사용량</span>
                          <span className="v">{ut.hotWaterUsage || "0"} / {ut.heatingUsage || "0"}</span>
                        </DetailRow>
                        <DetailRow>
                          <span className="k">소계 / 시설분담금</span>
                          <span className="v">
                            {Number(ut.subtotalFee || "0").toLocaleString()}원 / {Number(ut.facilityFee || "0").toLocaleString()}원
                          </span>
                        </DetailRow>
                        {ut.paymentDueDate || ut.paymentStatus ? (
                          <DetailRow>
                            <span className="k">납부상태 / 납부기한</span>
                            <span className="v font-bold">{mapPaymentStatus(ut.paymentStatus)} {ut.paymentDueDate ? `(~${formatPortalDate(ut.paymentDueDate)})` : ""}</span>
                          </DetailRow>
                        ) : null}
                        {ut.virtualAccount ? (
                          <DetailRow>
                            <span className="k">납부 가상계좌</span>
                            <span className="v">{ut.virtualAccount}</span>
                          </DetailRow>
                        ) : null}
                      </DetailCard>
                    ))}
                  </CardsList>
                ) : (
                  <CardsList>
                    <EmptyBanner>
                      <div className="left-area">
                        <Inbox size={15} />
                        <span>공공요금 부과 내역이 없습니다. (항목 안내 틀)</span>
                      </div>
                      <FetchInlineButton
                        disabled={tabLoading === "utility"}
                        onClick={() => handleFetchTabSpecific("utility")}
                      >
                        <RefreshCw size={11} className={tabLoading === "utility" ? "spin" : ""} />
                        {tabLoading === "utility" ? "조회 중..." : "상세 내역 불러오기"}
                      </FetchInlineButton>
                    </EmptyBanner>
                    <DetailCard style={{ opacity: 0.85 }}>
                      <DetailCardHeader>
                        <span className="status-pill neutral">사용월 (-)</span>
                        <span className="sub-text">총 청구금액 (-)</span>
                      </DetailCardHeader>
                      <DetailRow>
                        <span className="k">전기 (사용량 / 요금)</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">전기 지침 (전월 / 당월)</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">수도 (사용량 / 요금)</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">수도 지침 (전월 / 당월)</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">온수 / 난방 사용량</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">소계 / 시설분담금</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">납부상태 / 납부기한</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">납부 가상계좌</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                    </DetailCard>
                  </CardsList>
                )}
              </div>
            )}

            {/* 탭 7: 입사서약서 */}
            {activeTab === "pledge" && (
              <div>
                {pledge ? (
                  <DetailCard>
                    <DetailCardHeader>
                      <span className="status-pill merit">입사서약서</span>
                      <span className="sub-text">{pledge.consentDate ? `동의일자: ${formatPortalTimestamp(pledge.consentDate)}` : ""}</span>
                    </DetailCardHeader>
                    <DetailRow>
                      <span className="k">동의여부</span>
                      <span className="v font-bold">{mapConsentStatus(pledge.consentStatus)}</span>
                    </DetailRow>
                    {pledge.studentInfo ? (
                      <DetailRow>
                        <span className="k">학생정보</span>
                        <span className="v">{pledge.studentInfo}</span>
                      </DetailRow>
                    ) : null}
                    {pledge.documentContent ? (
                      <PledgeContentBox>
                        {pledge.documentContent}
                      </PledgeContentBox>
                    ) : null}
                  </DetailCard>
                ) : (
                  <CardsList>
                    <EmptyBanner>
                      <div className="left-area">
                        <Inbox size={15} />
                        <span>입사서약서 체결 내역이 없습니다. (항목 안내 틀)</span>
                      </div>
                      <FetchInlineButton
                        disabled={tabLoading === "pledge"}
                        onClick={() => handleFetchTabSpecific("pledge")}
                      >
                        <RefreshCw size={11} className={tabLoading === "pledge" ? "spin" : ""} />
                        {tabLoading === "pledge" ? "조회 중..." : "서약서 내역 불러오기"}
                      </FetchInlineButton>
                    </EmptyBanner>
                    <DetailCard style={{ opacity: 0.85 }}>
                      <DetailCardHeader>
                        <span className="status-pill neutral">서약서 서식</span>
                        <span className="sub-text">동의일자 (-)</span>
                      </DetailCardHeader>
                      <DetailRow>
                        <span className="k">동의여부</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">학생정보</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                      <DetailRow>
                        <span className="k">서약서 내용</span>
                        <span className="v text-muted">-</span>
                      </DetailRow>
                    </DetailCard>
                  </CardsList>
                )}
              </div>
            )}

            {/* 탭 8: 학적/학생정보 */}
            {activeTab === "academic" && (
              <div>
                <DetailCard>
                  <DetailCardHeader>
                    <span className="status-pill merit">
                      {academicStatus || "학적정보"}
                    </span>
                    <span className="sub-text font-bold">
                      {studentId || "-"}
                    </span>
                  </DetailCardHeader>
                  <DetailRow>
                    <span className="k">성명 / 영문</span>
                    <span className="v font-bold">{studentName || "-"} {englishName ? `(${englishName})` : ""}</span>
                  </DetailRow>
                  <DetailRow>
                    <span className="k">학과 / 학년</span>
                    <span className="v">{department || "-"} {grade ? `(${grade})` : ""}</span>
                  </DetailRow>
                  <DetailRow>
                    <span className="k">지도교수</span>
                    <span className="v font-bold">{professorName || "-"}</span>
                  </DetailRow>
                  <DetailRow>
                    <span className="k">누적 평점평균</span>
                    <span className="v font-bold">{averageScore || "-"}</span>
                  </DetailRow>
                  <DetailRow>
                    <span className="k">총 이수학점 / 학기</span>
                    <span className="v">{completedCredits || "-"}</span>
                  </DetailRow>
                  <DetailRow>
                    <span className="k">입학일자</span>
                    <span className="v">{formatPortalDate(entranceDate)}</span>
                  </DetailRow>
                  {expectedGraduation ? (
                    <DetailRow>
                      <span className="k">졸업예정여부</span>
                      <span className="v">{expectedGraduation === "1" ? "졸업예정" : "해당없음"}</span>
                    </DetailRow>
                  ) : null}
                  {maskedRrn ? (
                    <DetailRow>
                      <span className="k">주민등록번호</span>
                      <span className="v">{maskedRrn}</span>
                    </DetailRow>
                  ) : null}
                  <DetailRow>
                    <span className="k">국적 / 성별</span>
                    <span className="v">{nationality || "-"}{gender ? ` / ${gender}` : ""}</span>
                  </DetailRow>
                </DetailCard>
              </div>
            )}
          </TabBody>
        </SectionBlock>

        {/* 4. 진행 진단 로그 콘솔 (타임스탬프 및 복사 기능) */}
        <DebugSection>
          <DebugHeader onClick={() => setShowLogs(!showLogs)}>
            <div className="title">
              <Terminal size={13} />
              <span>진행 진단 로그 ({logs.length}건 기록)</span>
              {logs.some((l) => l.level === "error") && (
                <span className="log-badge error">
                  <AlertTriangle size={10} /> 오류 감지
                </span>
              )}
              {isLoading && (
                <span className="log-badge running">
                  <RefreshCw size={10} className="spin" /> 진행 중
                </span>
              )}
            </div>
            <span className="toggle-hint">{showLogs ? "접기" : "펼치기"}</span>
          </DebugHeader>

          {showLogs && (
            <LogConsoleBody>
              <LogToolbar>
                <span className="log-meta">
                  총 {logs.length}개 로그 | 단계별 추적
                </span>
                <div className="log-actions">
                  <LogActionButton
                    onClick={handleCopyLogs}
                    disabled={logs.length === 0}
                  >
                    {isCopiedLogs ? (
                      <>
                        <Check size={12} color="#10b981" />
                        <span style={{ color: "#10b981" }}>복사 완료!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>로그 복사</span>
                      </>
                    )}
                  </LogActionButton>
                  {logs.length > 0 && (
                    <LogActionButton onClick={() => setLogs([])}>
                      지우기
                    </LogActionButton>
                  )}
                </div>
              </LogToolbar>

              {logs.length === 0 ? (
                <LogEmptyNotice>
                  기록된 진행 로그가 없습니다. [정보 새로고침]을 누르면 단계별 로그가 기록됩니다.
                </LogEmptyNotice>
              ) : (
                <LogStream>
                  {logs.map((log) => (
                    <LogLine key={log.id} level={log.level}>
                      <span className="time">{log.timestamp}</span>
                      <span className="stage">[{log.stage}]</span>
                      <span className="level">[{log.level.toUpperCase()}]</span>
                      <span className="msg">{log.message}</span>
                      {log.elapsedMs !== undefined && (
                        <span className="elapsed">+{log.elapsedMs}ms</span>
                      )}
                      {log.detail && <div className="detail">↳ {log.detail}</div>}
                    </LogLine>
                  ))}
                </LogStream>
              )}
            </LogConsoleBody>
          )}
        </DebugSection>

        {/* 5. 원시 파싱 데이터 토글 (정리된 디버그 뷰어) */}
        <DebugSection>
          <DebugHeader onClick={() => setShowRawFields(!showRawFields)}>
            <div className="title">
              <Database size={13} />
              <span>원시 데이터 확인 ({rawEntries.length}개 필드)</span>
            </div>
            <span className="toggle-hint">{showRawFields ? "접기" : "펼치기"}</span>
          </DebugHeader>

          {showRawFields && (
            <DebugBody>
              <MiniTable>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {rawEntries.map(([k, v]) => {
                    const isPhoto =
                      k === "phtFile2" ||
                      k === "phtFile" ||
                      k.toLowerCase().includes("photo") ||
                      (typeof v === "string" &&
                        v.length > 80 &&
                        (v.startsWith("data:image") ||
                          v.startsWith("/9j/") ||
                          v.startsWith("iVBOR") ||
                          v.startsWith("Qk")));

                    return (
                      <tr key={k}>
                        <td className="key">{k}</td>
                        <td className="val">
                          {v === "" ? (
                            <span className="empty-val">(빈값)</span>
                          ) : isPhoto ? (
                            <span className="photo-val" title={`전체 데이터: ${v.length}자`}>
                              {String(v).slice(0, 45)}...
                            </span>
                          ) : (
                            String(v)
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </MiniTable>
            </DebugBody>
          )}
        </DebugSection>
      </TitleContentArea>

      <PortalAccountModal
        isOpen={isPortalAccountModalOpen}
        onClose={() => setIsPortalAccountModalOpen(false)}
        onSuccess={() => {
          setIsPortalAccountModalOpen(false);
          loadDormitoryInfo();
        }}
      />
    </Container>
  );
};

export default PortalDormitoryLabPage;

const Container = styled.div`
  padding: 12px 16px 36px;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-tertiary);
  padding: 4px 6px;
  width: 100%;
  box-sizing: border-box;

  .current {
    color: #0055b8;
    font-weight: 600;
  }
`;

const WebFallbackCard = styled.div`
  background-color: var(--bg-base);
  border: 1px dashed var(--border-strong);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  color: var(--gray-600);
  margin-top: 12px;
  width: 100%;
  box-sizing: border-box;

  .title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .desc {
    font-size: 12px;
    line-height: 1.4;
  }
`;

const ActionBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
  width: 100%;
  box-sizing: border-box;

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const UpdatedTimeText = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 11px;
  color: var(--text-tertiary);
  width: 100%;
  box-sizing: border-box;
`;

const SectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;

  .title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .term-badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    background-color: var(--bg-muted);
    color: var(--gray-700);
    font-weight: 500;
  }
`;

const CardContainer = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
`;

const ProfileTopArea = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background-color: var(--bg-base);
  border-bottom: 1px solid var(--bg-base);
  width: 100%;
  box-sizing: border-box;
`;

const AvatarWrapper = styled.div`
  width: 76px;
  height: 98px;
  flex-shrink: 0;
  border-radius: 8px;
  border: 1px solid var(--border-default);
  background-color: var(--bg-subtle);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: var(--text-tertiary);
    font-size: 10px;
  }
`;

const IdentityWrapper = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .name-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
    flex-wrap: wrap;

    .name {
      font-size: 17px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .eng-name {
      font-size: 12px;
      color: var(--gray-600);
    }
  }

  .student-id {
    font-size: 12px;
    color: var(--gray-700);
    font-weight: 500;
  }

  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;

    .tag {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      background-color: var(--bg-muted);
      color: var(--text-secondary);

      &.highlight {
        background-color: var(--bg-brand);
        color: var(--text-brand);
        font-weight: 600;
      }
    }
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  gap: 10px 14px;

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const InfoCell = styled.div<{ fullWidth?: boolean }>`
  grid-column: ${({ fullWidth }) => (fullWidth ? "1 / -1" : "auto")};
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;

  .label {
    font-size: 11px;
    color: var(--text-tertiary);
  }

  .value {
    font-size: 13px;
    color: var(--text-primary);
    font-weight: 500;
    word-break: break-all;
  }
`;

const PointBar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  box-sizing: border-box;
  gap: 8px;
  padding: 10px 14px 14px;
  background-color: var(--bg-subtle);
  border-top: 1px solid var(--bg-base);
`;

const PointChip = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 6px 4px;
  min-width: 0;

  .title {
    font-size: 10px;
    color: var(--gray-600);
  }

  .score {
    font-size: 15px;
    font-weight: 700;

    &.merit { color: var(--text-brand); }
    &.demerit { color: var(--text-error); }
    &.fixed { color: #d97706; }
  }
`;

const TabsWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
`;

const TabsScrollContainer = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 4px 0 6px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const TabChip = styled.button<{ active?: boolean }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: ${({ active }) => (active ? "600" : "400")};
  color: ${({ active }) => (active ? "#0055b8" : "var(--gray-600)")};
  background-color: ${({ active }) => (active ? "var(--bg-brand)" : "var(--bg-base)")};
  border: 1px solid ${({ active }) => (active ? "var(--border-brand-subtle)" : "var(--border-default)")};
  border-radius: 18px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
`;

const TabBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

const CardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

const DetailCard = styled.div`
  background-color: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

const DetailCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
  width: 100%;
  box-sizing: border-box;

  .status-pill {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;

    &.merit {
      background-color: var(--bg-brand);
      color: var(--text-brand);
    }
    &.demerit {
      background-color: var(--bg-error);
      color: var(--text-error);
    }
    &.neutral {
      background-color: var(--bg-muted);
      color: var(--text-secondary);
    }
  }

  .sub-text {
    font-size: 11px;
    color: var(--gray-600);

    &.font-bold {
      font-weight: 600;
      color: var(--text-primary);
    }
  }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
  width: 100%;
  box-sizing: border-box;
  gap: 8px;

  .k {
    color: var(--gray-600);
    flex-shrink: 0;
  }

  .v {
    color: var(--text-primary);
    text-align: right;
    word-break: break-all;

    &.font-bold {
      font-weight: 600;
    }

    &.text-muted {
      color: var(--text-tertiary);
    }
  }
`;

const EmptyBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--bg-subtle);
  border-radius: 8px;
  border: 1px dashed var(--border-strong);
  font-size: 11px;
  color: var(--gray-600);
  font-weight: 500;
  width: 100%;
  box-sizing: border-box;

  .left-area {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  svg {
    color: var(--text-tertiary);
    flex-shrink: 0;
  }
`;

const FetchInlineButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: var(--bg-base);
  border: 1px solid var(--border-brand-subtle);
  border-radius: 6px;
  color: #0055b8;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background-color: var(--bg-brand);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }
`;

const PledgeContentBox = styled.div`
  margin-top: 6px;
  padding: 10px;
  background-color: var(--bg-subtle);
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--gray-700);
  white-space: pre-wrap;
  max-height: 160px;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
`;

const DebugSection = styled.div`
  margin-top: 12px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background-color: var(--bg-base);
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

const DebugHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background-color: var(--bg-subtle);
  cursor: pointer;
  user-select: none;
  width: 100%;
  box-sizing: border-box;

  .title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--gray-600);
    font-weight: 500;
  }

  .log-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 4px;
    font-weight: 600;

    &.error {
      background-color: var(--bg-error);
      color: var(--text-error);
    }

    &.running {
      background-color: var(--bg-brand);
      color: #0284c7;
    }
  }

  .toggle-hint {
    font-size: 11px;
    color: var(--text-tertiary);
  }
`;

const LogConsoleBody = styled.div`
  background-color: #0f172a;
  padding: 10px 12px;
  width: 100%;
  box-sizing: border-box;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
`;

const LogToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #1e293b;
  font-size: 11px;

  .log-meta {
    color: var(--gray-600);
    font-size: 10px;
  }

  .log-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const LogActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: var(--gray-900);
  border: 1px solid #334155;
  color: var(--text-disabled);
  font-size: 11px;
  border-radius: 4px;
  padding: 3px 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background-color: var(--gray-800);
    color: var(--text-inverse);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LogEmptyNotice = styled.div`
  padding: 16px;
  text-align: center;
  color: var(--gray-700);
  font-size: 11px;
`;

const LogStream = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
`;

const LogLine = styled.div<{ level: string }>`
  font-size: 11px;
  line-height: 1.4;
  word-break: break-all;

  .time {
    color: var(--gray-600);
    margin-right: 6px;
    font-size: 10px;
  }

  .stage {
    color: #38bdf8;
    margin-right: 4px;
    font-weight: 600;
  }

  .level {
    margin-right: 6px;
    font-weight: 700;
    color: ${({ level }) =>
      level === "error"
        ? "#f87171"
        : level === "warn"
        ? "#fbbf24"
        : level === "success"
        ? "#34d399"
        : "var(--text-tertiary)"};
  }

  .msg {
    color: var(--text-inverse);
  }

  .elapsed {
    color: var(--gray-600);
    margin-left: 6px;
    font-size: 10px;
  }

  .detail {
    margin-top: 2px;
    margin-left: 12px;
    color: var(--text-disabled);
    background-color: rgba(30, 41, 59, 0.7);
    padding: 3px 6px;
    border-radius: 4px;
    font-size: 10px;
  }
`;

const DebugBody = styled.div`
  padding: 10px;
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const MiniTable = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 11px;

  th {
    background-color: var(--bg-muted);
    color: var(--gray-700);
    padding: 4px 8px;
    text-align: left;
    border-bottom: 1px solid var(--border-strong);
  }

  td {
    padding: 4px 8px;
    border-bottom: 1px solid var(--bg-base);
    font-family: monospace;
  }

  .key {
    color: var(--text-brand);
    width: 35%;
    word-break: break-all;
  }

  .val {
    color: var(--text-primary);
    width: 65%;
    word-break: break-all;
  }

  .empty-val {
    color: var(--text-tertiary);
  }

  .photo-val {
    color: #059669;
  }
`;
