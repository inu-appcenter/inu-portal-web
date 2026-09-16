import { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import ActionButton from "@/components/common/ActionButton";
import { ROUTES } from "@/constants/routes";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";

// API 및 타입 임포트
import { adaptAcademicInfoToStudentInfo } from "@/apis/portal";
import {
  checkPortalAccountLinked,
  savePortalAccount,
  deletePortalAccount,
  fetchAcademicInfoFromApp,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { StudentInfo } from "@/types/portal";
import Divider from "@/components/common/Divider";
import InfoBottomSheet from "@/components/mobile/portal/InfoBottomSheet";
import { DESKTOP_MEDIA } from "@/styles/responsive";
import { postApiLogs } from "@/apis/members";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";
import { formatKoreanDateTime } from "@/utils/date";
import { ShieldCheck } from "lucide-react";

/**
 * 개별 정보 항목 컴포넌트
 */
interface InfoItemProps {
  title: string;
  description: string;
}

const InfoItem = ({ title, description }: InfoItemProps) => (
  <InfoItemWrapper>
    <div className="title">{title}</div>
    <div className="description">{description}</div>
  </InfoItemWrapper>
);

const BasicInfoPage = () => {
  // 상태 관리
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isFetched, setIsFetched] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isPortalLinked, setIsPortalLinked] = useState(false);
  const navigate = useNavigate();
  const { enabled: isLabsEnabled, isFetched: isLabsFlagFetched } = useFeatureFlag(
    FEATURE_FLAG_KEYS.LABS,
  );

  // 입력 필드 상태
  const [portalId, setPortalId] = useState("");
  const [portalPassword, setPortalPassword] = useState("");

  // 기기 내 포털 연동 여부 확인
  const checkLinkStatus = useCallback(async () => {
    if (isMobileAppEnvironment()) {
      try {
        const linked = await checkPortalAccountLinked();
        setIsPortalLinked(linked);
        return linked;
      } catch (err) {
        console.debug("checkPortalAccountLinked error:", err);
      }
    }
    return false;
  }, []);

  // 컴포넌트 마운트 시 데이터 복구 및 연동 상태 확인
  useEffect(() => {
    const savedData = localStorage.getItem("portal_student_info");
    const savedTime = localStorage.getItem("portal_info_last_updated");

    if (savedData && savedTime) {
      try {
        setStudentInfo(JSON.parse(savedData));
        setLastUpdated(savedTime);
        setIsFetched(true);
      } catch (e) {
        console.error("Failed to parse saved student info:", e);
      }
    } else {
      setIsFetched(false);
    }

    void checkLinkStatus().then((linked) => {
      if (!savedData && !linked) {
        setIsBottomSheetOpen(true);
      }
    });
  }, [checkLinkStatus]);

  useEffect(() => {
    if (isLabsFlagFetched && !isLabsEnabled) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [isLabsEnabled, isLabsFlagFetched, navigate]);

  useEffect(() => {
    if (!isLabsFlagFetched || !isLabsEnabled) {
      return;
    }

    const logApi = async () => {
      await postApiLogs("/api/labs/basic-info");
    };

    void logApi();
  }, [isLabsEnabled, isLabsFlagFetched]);

  const isInputValid = portalId.trim() !== "" && portalPassword.trim() !== "";

  const isRefetchAvailable = useMemo(() => {
    if (!lastUpdated) return false;

    const last = new Date(lastUpdated).getTime();
    const now = Date.now();

    const diff = now - last;

    return diff >= 24 * 60 * 60 * 1000; // 24시간
  }, [lastUpdated]);

  // 모바일 앱 브릿지를 통해 직접 학적 정보 가져오기 및 저장
  const fetchAcademicDataFromBridge = async () => {
    if (!isMobileAppEnvironment()) {
      alert("포털 학적 정보 조회는 INTIP 모바일 앱 환경에서만 가능합니다.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("포털 로그인 및 학적 정보를 확인 중입니다... (약 10초)");

    try {
      const res = await fetchAcademicInfoFromApp();
      if (res.success && res.data) {
        const student = adaptAcademicInfoToStudentInfo(res.data);
        const now = new Date().toISOString();

        setStudentInfo(student);
        setLastUpdated(now);
        setIsFetched(true);
        setIsPortalLinked(true);
        setIsBottomSheetOpen(false);
        setPortalId("");
        setPortalPassword("");

        localStorage.setItem("portal_student_info", JSON.stringify(student));
        localStorage.setItem("portal_info_last_updated", now);

        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 300);

        alert("성공적으로 학적 정보를 가져왔어요.");
      } else {
        const errText = res.errorMessage || "포털 로그인에 실패했습니다.";
        const isCredError =
          errText.includes("비밀번호") ||
          errText.includes("아이디") ||
          errText.includes("틀렸습니다") ||
          errText.includes("휴면");

        if (isCredError) {
          await deletePortalAccount().catch(() => {});
          setIsPortalLinked(false);
          setIsBottomSheetOpen(true);
          alert("학번 또는 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
        } else {
          alert(`학적 정보를 가져오는 데 실패했습니다: ${errText}`);
        }
      }
    } catch (error: any) {
      console.error("학적 조회 실패:", error);
      alert(error?.message || "학적 정보를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // 신규 계정 등록 후 데이터 가져오기
  const handleFetchWithNewAccount = async () => {
    if (!isInputValid || isLoading) return;

    if (!isMobileAppEnvironment()) {
      alert("포털 학적 정보 연동은 INTIP 모바일 앱 환경에서만 지원됩니다.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("기기 보안 영역에 안전하게 등록 중...");

    try {
      const saveRes = await savePortalAccount(portalId.trim(), portalPassword.trim());
      if (!saveRes.success) {
        alert(saveRes.errorMessage || "계정 등록에 실패했습니다.");
        setIsLoading(false);
        setLoadingMessage("");
        return;
      }

      await fetchAcademicDataFromBridge();
    } catch (error: any) {
      console.error("계정 등록 및 조회 실패:", error);
      alert(error?.message || "계정 등록 중 오류가 발생했습니다.");
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // '포털에서 가져오기' / '다시 가져오기' 버튼 클릭 핸들러
  const handleMainAction = async () => {
    if (!isMobileAppEnvironment()) {
      alert("포털 학적 정보 연동은 INTIP 모바일 앱 환경에서만 지원됩니다.");
      return;
    }

    const linked = await checkLinkStatus();
    if (linked) {
      // 이미 연동되어 있는 경우 원클릭으로 바로 최신 학적 정보 조회
      await fetchAcademicDataFromBridge();
    } else {
      // 계정 연동이 필요한 경우 바텀시트 열기
      setIsBottomSheetOpen(true);
    }
  };

  const menuItems = useMemo(() => {
    if (isFetched || isPortalLinked) {
      return [
        {
          label: "계정 연동 해제 및 데이터 삭제",
          onClick: async () => {
            if (window.confirm("기기에 저장된 학적 정보 및 포털 연동 계정을 삭제할까요?")) {
              if (isMobileAppEnvironment()) {
                await deletePortalAccount().catch(() => {});
              }
              localStorage.removeItem("portal_student_info");
              localStorage.removeItem("portal_info_last_updated");
              setStudentInfo(null);
              setLastUpdated(null);
              setIsFetched(false);
              setIsPortalLinked(false);
              setPortalId("");
              setPortalPassword("");
              alert("데이터 및 연동 정보가 삭제되었습니다.");
            }
          },
        },
      ];
    } else {
      return undefined;
    }
  }, [isFetched, isPortalLinked]);

  useHeader({
    title: "내 기본 학적 정보",
    menuItems,
  });

  if (isLabsFlagFetched && !isLabsEnabled) {
    return null;
  }


  return (
    <MoreAppsPageWrapper>
      <InfoBottomSheet
        open={isBottomSheetOpen}
        onOpenChange={setIsBottomSheetOpen}
        title="내 기본 학적 정보 가져오기"
        isLoading={isLoading}
      >
        <BottomSheetContentWrapper>
          <DescriptionSection>
            <SecurityBanner>
              <ShieldCheck size={20} color="#00a651" />
              <div className="text">
                <strong>안심하세요!</strong> 포털 계정(학번/비밀번호)은 기기 보안 영역(KeyStore)에만 암호화 보관되며, 서버로 절대 전송되지 않습니다.
              </div>
            </SecurityBanner>

            <GuideList style={{ marginTop: "16px" }}>
              <GuideItem>
                <div className="content">
                  <h3>가져오는 데이터</h3>
                  <p>기본 인적 사항, 소속 및 학적 상태, 이수 및 성적 정보</p>
                </div>
              </GuideItem>
              <GuideItem>
                <div className="content">
                  <h3>단말기 직접 연동 (Zero-Knowledge)</h3>
                  <p>
                    모바일 앱 내부에서 학교 포털 SSO를 직접 호출하여 안전하게 학적 정보를 가져옵니다.
                  </p>
                </div>
              </GuideItem>
              <GuideItem>
                <div className="content">
                  <h3>언제든 연동 해제 가능</h3>
                  <p>
                    우측 상단 더보기 메뉴에서 언제든지 기기에 저장된 학적 정보 및 계정 연동을 삭제할 수 있습니다.
                  </p>
                </div>
              </GuideItem>
            </GuideList>
          </DescriptionSection>

          <LoginForm>
            <InputGroup>
              <label>포털 학번</label>
              <input
                type="text"
                placeholder="학번을 입력하세요 (예: 202101234)"
                value={portalId}
                onChange={(e) => setPortalId(e.target.value)}
                disabled={isLoading}
              />
            </InputGroup>
            <InputGroup>
              <label>포털 비밀번호</label>
              <input
                type="password"
                placeholder="포털 비밀번호를 입력하세요"
                value={portalPassword}
                onChange={(e) => setPortalPassword(e.target.value)}
                disabled={isLoading}
              />
            </InputGroup>
            <div
              style={{
                marginTop: "24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <ActionButton
                as="button"
                onClick={handleFetchWithNewAccount}
                disabled={!isInputValid || isLoading}
              >
                {isLoading ? (loadingMessage || "가져오는 중...") : "포털에서 가져오기"}
              </ActionButton>
            </div>
          </LoginForm>
        </BottomSheetContentWrapper>
      </InfoBottomSheet>

      <ContentSection>
        <TitleContentArea description="인천대학교 포털 시스템에서 내 기본 학적 정보를 가져옵니다. 가져온 데이터는 기기 안에만 보관되며 서버에는 저장되지 않습니다." />
        {isFetched && (
          <>
            <UpdateInfoText>
              마지막 업데이트: {formatKoreanDateTime(lastUpdated)}
            </UpdateInfoText>
            <TitleContentArea title={"기본 인적 사항"}>
              <Box>
                <InfoGrid>
                  <div>
                    <InfoItem
                      title="성명"
                      description={`${studentInfo?.koreanName} (${studentInfo?.englishName})`}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="생년월일"
                      description={studentInfo?.birthDate || ""}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="성별"
                      description={studentInfo?.genderName || ""}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="휴대전화"
                      description={studentInfo?.mobilePhone || ""}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="국적"
                      description={studentInfo?.nationalityName || ""}
                    />
                  </div>
                </InfoGrid>
              </Box>
            </TitleContentArea>
            <TitleContentArea title={"소속 및 학적 상태"}>
              <Box>
                <InfoGrid>
                  <div>
                    <InfoItem
                      title="학번"
                      description={studentInfo?.studentId || ""}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="학적상태"
                      description={studentInfo?.enrollmentStatusName || ""}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="과정"
                      description={studentInfo?.courseName || ""}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="단과대학"
                      description={studentInfo?.collegeName || "-"}
                    />
                    <Divider />
                  </div>
                  <div className="grid-item">
                    <InfoItem
                      title="학과(전공)"
                      description={studentInfo?.majorName || "-"}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="지도교수"
                      description={studentInfo?.advisorProfessorName || ""}
                    />
                  </div>
                </InfoGrid>
              </Box>
            </TitleContentArea>
            <TitleContentArea title={"이수 및 성적 정보"}>
              <Box>
                <InfoGrid>
                  <div>
                    <InfoItem
                      title="평균평점"
                      description={`${studentInfo?.gradeAverage?.trim()} / 4.5`}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="취득학점"
                      description={`${studentInfo?.acquiredCredits} 학점`}
                    />
                    <Divider />
                  </div>
                  <div className="grid-item">
                    <InfoItem
                      title="이수학기"
                      description={`${studentInfo?.completedSemesterCount} 학기`}
                    />
                    <Divider />
                  </div>
                  <div>
                    <InfoItem
                      title="졸업예정"
                      description={
                        studentInfo?.graduationExpectedYn === "1"
                          ? "대상"
                          : "비대상"
                      }
                    />
                  </div>
                </InfoGrid>
              </Box>
            </TitleContentArea>
          </>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "16px",
            gap: "12px",
          }}
        >
          <ActionButton
            as="button"
            onClick={handleMainAction}
            disabled={isLoading || (isFetched && !isRefetchAvailable)}
          >
            {isLoading
              ? (loadingMessage || "가져오는 중...")
              : isFetched
              ? "다시 가져오기"
              : "포털에서 가져오기"}
          </ActionButton>

          {isPortalLinked && !isFetched && (
            <div style={{ fontSize: "12px", color: "#3182f6", textAlign: "center" }}>
              ✓ 포털 계정이 연동되어 있어 바로 가져올 수 있습니다.
            </div>
          )}

          {isFetched && !isRefetchAvailable && (
            <div style={{ fontSize: "12px", color: "#999", textAlign: "center" }}>
              24시간 이후에 다시 가져올 수 있습니다.
            </div>
          )}
        </div>
      </ContentSection>
    </MoreAppsPageWrapper>
  );
};

export default BasicInfoPage;

const MoreAppsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 16px 50px 16px;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const SecurityBanner = styled.div`
  background: #e8f8f0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;

  .text {
    font-size: 12.5px;
    color: #1b633d;
    line-height: 1.45;
  }
`;

const LoginForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  padding: 0 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  label {
    font-size: 13px;
    font-weight: 600;
    color: #4a4a4a;
  }
  input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    font-size: 15px;
    outline: none;
    &:focus {
      border-color: #6f9ffc;
    }
  }
`;

const UpdateInfoText = styled.div`
  font-size: 12px;
  color: #969696;
  text-align: right;
  margin-top: -12px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;

  .grid-item {
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 480px) {
    grid-template-columns: 1fr 1fr;

    /* 마지막 줄(최대 2개) Divider 제거 */
    .grid-item:nth-last-child(-n + 2) > *:last-child {
      display: none;
    }
  }
`;

const InfoItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  .title {
    color: #969696;
    font-size: 12px;
    font-weight: 500;
  }
  .description {
    color: #000;
    font-size: 16px;
    font-weight: 600;
  }
`;

const DescriptionSection = styled.div`
  padding: 0 20px;

  // @media ${DESKTOP_MEDIA} {
  //   width: 100%;
  //   padding: 0;
  //   max-width: none;
  // }
`;

const GuideList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media ${DESKTOP_MEDIA} {
    gap: 36px;
  }
`;

const GuideItem = styled.div`
  display: flex;
  gap: 4px;

  .number {
    font-size: 16px;
    font-weight: 700;
    color: #333;
    min-width: 20px;
  }

  .content {
    h3 {
      font-size: 16px;
      color: #333;
      margin: 0 0 4px;
      font-weight: 700;

      strong {
        font-weight: 700;
      }
    }

    p {
      font-size: 14px;
      color: #666;
      margin: 0;
    }
  }
`;

const BottomSheetContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

