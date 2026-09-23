import { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import Box from "@/components/common/Box";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import ActionButton from "@/components/common/ActionButton";
import { ROUTES } from "@/constants/routes";
import { useFeatureFlag } from "@/hooks/useFeatureFlags";
import { adaptAcademicInfoToStudentInfo } from "@/apis/portal";
import {
  checkPortalAccountLinked,
  deletePortalAccount,
  fetchAcademicInfoFromApp,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { StudentInfo } from "@/types/portal";
import Divider from "@/components/common/Divider";
import PortalLinkBanner from "@/components/common/PortalLinkBanner";
import CapsuleButton from "@/components/common/CapsuleButton";
import { postApiLogs } from "@/apis/members";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";
import { formatKoreanDateTime } from "@/utils/date";
import { KeyRound } from "lucide-react";

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
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isFetched, setIsFetched] = useState(false);
  const [isPortalLinked, setIsPortalLinked] = useState(false);
  const navigate = useNavigate();
  const { enabled: isLabsEnabled, isFetched: isLabsFlagFetched } = useFeatureFlag(
    FEATURE_FLAG_KEYS.LABS,
  );

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

    void checkLinkStatus();
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

  const isRefetchAvailable = useMemo(() => {
    if (!lastUpdated) return true;

    const last = new Date(lastUpdated).getTime();
    const now = Date.now();
    const diff = now - last;

    return diff >= 10 * 60 * 1000; // 10분 후 재조회 가능
  }, [lastUpdated]);

  // 모바일 앱 브릿지를 통해 직접 학적 정보 가져오기
  const fetchAcademicDataFromBridge = async () => {
    if (!isMobileAppEnvironment()) {
      alert("포털 학적 정보 조회는 INTIP 모바일 앱 환경에서만 가능합니다.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("포털 로그인 및 학적 정보를 확인 중입니다... (약 10초)");

    try {
      const res = await fetchAcademicInfoFromApp(true);
      if (res.success && res.data) {
        const student = adaptAcademicInfoToStudentInfo(res.data);
        const now = new Date().toISOString();

        setStudentInfo(student);
        setLastUpdated(now);
        setIsFetched(true);
        setIsPortalLinked(true);

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
          alert("포털 계정 정보가 올바르지 않습니다. 마이페이지에서 다시 연동해 주세요.");
          navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT);
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

  const handleMainAction = async () => {
    if (!isMobileAppEnvironment()) {
      alert("포털 학적 정보 연동은 INTIP 모바일 앱 환경에서만 지원됩니다.");
      return;
    }

    const linked = await checkLinkStatus();
    if (linked) {
      await fetchAcademicDataFromBridge();
    } else {
      navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT);
    }
  };

  const menuItems = useMemo(() => {
    const items = [
      {
        label: "포털 계정 관리",
        onClick: () => {
          navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT);
        },
      },
    ];

    if (isFetched) {
      items.push({
        label: "캐시된 학적 데이터 삭제",
        onClick: async () => {
          if (window.confirm("기기에 캐시된 학적 정보를 삭제할까요?")) {
            localStorage.removeItem("portal_student_info");
            localStorage.removeItem("portal_info_last_updated");
            setStudentInfo(null);
            setLastUpdated(null);
            setIsFetched(false);
            alert("캐시 데이터가 삭제되었습니다.");
          }
        },
      });
    }

    return items;
  }, [isFetched, navigate]);

  useHeader({
    title: "내 기본 학적 정보",
    menuItems,
  });

  if (isLabsFlagFetched && !isLabsEnabled) {
    return null;
  }

  return (
    <MoreAppsPageWrapper>
      {!isPortalLinked && !isFetched && (
        <PortalLinkBanner
          title="포털 계정 연동 필요"
          description="포털 계정을 등록하면 학적 정보를 바로 조회할 수 있어요."
          actionText="연동하기"
          onAction={() => navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT)}
        />
      )}

      <ContentSection>
        <TitleContentArea description="인천대학교 포털 시스템에서 내 기본 학적 정보를 가져와요. 이 폰에서 직접 작업이 수행되며 서버에는 저장되지 않아요." />

        {!isPortalLinked && !isFetched ? (
          <EmptyCard>
            <KeyRound size={32} color="#0061ff" />
            <EmptyTitle>포털 계정 연동 후 학적 정보를 확인할 수 있어요</EmptyTitle>
            <EmptyDesc>
              마이페이지에서 포털 계정을 등록하면 학적 상태, 취득 학점, 성적 정보를 안전하게 가져와요.
            </EmptyDesc>
            <CapsuleButton
              variant="brand"
              style={{ marginTop: "12px", padding: "10px 20px", fontSize: "14px" }}
              onClick={() => navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT)}
            >
              포털 계정 연동하기
            </CapsuleButton>
            <FootnoteText style={{ marginTop: "12px" }}>이 폰에서 직접 작업이 수행돼요.</FootnoteText>
          </EmptyCard>
        ) : isFetched ? (
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
                disabled={isLoading || !isRefetchAvailable}
              >
                {isLoading ? (loadingMessage || "가져오는 중...") : "최신 정보 다시 가져오기"}
              </ActionButton>
            </div>
          </>
        ) : (
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
              disabled={isLoading}
            >
              {isLoading ? (loadingMessage || "가져오는 중...") : "포털에서 학적 정보 가져오기"}
            </ActionButton>
            <FootnoteText>이 폰에서 직접 작업이 수행돼요.</FootnoteText>
          </div>
        )}
      </ContentSection>
    </MoreAppsPageWrapper>
  );
};

export default BasicInfoPage;

const FootnoteText = styled.p`
  margin: 8px 0 0;
  font-size: 12.5px;
  color: var(--text-tertiary, #8b95a1);
  text-align: center;
  line-height: 1.4;
`;

const MoreAppsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px 16px 50px 16px;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const EmptyCard = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
`;

const EmptyTitle = styled.h3`
  margin: 8px 0 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
`;

const EmptyDesc = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary, #6b7684);
  line-height: 1.45;
  max-width: 320px;
`;

const UpdateInfoText = styled.div`
  font-size: 12px;
  color: #969696;
  text-align: right;
  margin-top: -8px;
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
