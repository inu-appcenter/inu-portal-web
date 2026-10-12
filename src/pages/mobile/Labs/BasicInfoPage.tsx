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
import CapsuleButton from "@/components/common/CapsuleButton";
import { postApiLogs } from "@/apis/members";
import { FEATURE_FLAG_KEYS } from "@/types/featureFlags";
import { formatKoreanDateTime } from "@/utils/date";
import { KeyRound, Smartphone } from "lucide-react";
import { openIntipAppOrStore } from "@/utils/appLauncher";
import { secureStorage } from "@/utils/secureStorage";
import { typography } from "@/styles/typography";
import { MOBILE_PAGE_GUTTER, DESKTOP_MEDIA } from "@/styles/responsive";

interface InfoItemProps {
  title: string;
  description: string;
}

const InfoItem = ({ title, description }: InfoItemProps) => (
  <InfoItemWrapper>
    <span className="title">{title}</span>
    <span className="description">{description || "-"}</span>
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
    let isMounted = true;
    const restoreData = async () => {
      const savedStudent = await secureStorage.getItem<StudentInfo>("portal_student_info");
      const savedTime = localStorage.getItem("portal_info_last_updated");

      if (!isMounted) return;
      if (savedStudent && savedTime) {
        setStudentInfo(savedStudent);
        setLastUpdated(savedTime);
        setIsFetched(true);
      } else {
        setIsFetched(false);
      }
    };

    void restoreData();
    void checkLinkStatus();

    return () => {
      isMounted = false;
    };
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
      alert("포털 학적 정보 조회는 INTIP 모바일 앱 환경에서만 가능해요.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("포털 로그인 및 학적 정보를 확인하고 있어요... (약 10초)");

    try {
      const res = await fetchAcademicInfoFromApp(true);
      if (res.success && res.data) {
        const student = adaptAcademicInfoToStudentInfo(res.data);
        const now = new Date().toISOString();

        setStudentInfo(student);
        setLastUpdated(now);
        setIsFetched(true);
        setIsPortalLinked(true);

        void secureStorage.setItem("portal_student_info", student);
        localStorage.setItem("portal_info_last_updated", now);

        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 300);

        alert("성공적으로 학적 정보를 가져왔어요.");
      } else {
        const errText = res.errorMessage || "포털 로그인에 실패했어요.";
        const isCredError =
          errText.includes("비밀번호") ||
          errText.includes("아이디") ||
          errText.includes("틀렸습니다") ||
          errText.includes("휴면");

        if (isCredError) {
          await deletePortalAccount().catch(() => {});
          setIsPortalLinked(false);
          alert("포털 계정 정보가 올바르지 않아요. 마이페이지에서 다시 연동해 주세요.");
          navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT);
        } else {
          alert(`학적 정보를 가져오는 데 실패했어요: ${errText}`);
        }
      }
    } catch (error: unknown) {
      console.error("학적 조회 실패:", error);
      const msg = error instanceof Error ? error.message : "학적 정보를 가져오는 중 오류가 발생했어요.";
      alert(msg);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleMainAction = async () => {
    if (!isMobileAppEnvironment()) {
      alert("포털 학적 정보 연동은 INTIP 모바일 앱 환경에서만 지원돼요.");
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
            secureStorage.removeItem("portal_student_info");
            localStorage.removeItem("portal_info_last_updated");
            setStudentInfo(null);
            setLastUpdated(null);
            setIsFetched(false);
            alert("캐시 데이터가 삭제되었어요.");
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
    <BasicInfoPageWrapper as="main">
      <ContentSection as="section">
        <TitleContentArea description="인천대학교 포털 시스템에서 내 기본 학적 정보를 가져와요. 이 폰에서 직접 작업이 수행되며 서버에는 저장되지 않아요." />

        {!isMobileAppEnvironment() ? (
          <EmptyCard>
            <Smartphone size={32} color="var(--interactive-primary)" />
            <EmptyTitle>INTIP 모바일 앱에서 이용할 수 있어요</EmptyTitle>
            <EmptyDesc>
              학적 정보 조회는 INTIP 모바일 앱 환경에서 제공돼요.
            </EmptyDesc>
            <CapsuleButtonWrapper>
              <CapsuleButton
                variant="brand"
                onClick={() => openIntipAppOrStore("basic-info")}
              >
                앱에서 보기
              </CapsuleButton>
            </CapsuleButtonWrapper>
            <FootnoteText>이 폰에서 직접 작업이 수행돼요.</FootnoteText>
          </EmptyCard>
        ) : !isPortalLinked && !isFetched ? (
          <EmptyCard>
            <KeyRound size={32} color="var(--interactive-primary)" />
            <EmptyTitle>포털 계정 연동 후 학적 정보를 확인할 수 있어요</EmptyTitle>
            <EmptyDesc>
              마이페이지에서 포털 계정을 등록하면 학적 상태, 취득 학점, 성적 정보를 안전하게 가져와요.
            </EmptyDesc>
            <CapsuleButtonWrapper>
              <CapsuleButton
                variant="brand"
                onClick={() => navigate(ROUTES.MYPAGE.PORTAL_ACCOUNT)}
              >
                포털 계정 연동하기
              </CapsuleButton>
            </CapsuleButtonWrapper>
            <FootnoteText>이 폰에서 직접 작업이 수행돼요.</FootnoteText>
          </EmptyCard>
        ) : isFetched ? (
          <>
            {lastUpdated && (
              <UpdateInfoText>
                마지막 업데이트: {formatKoreanDateTime(lastUpdated)}
              </UpdateInfoText>
            )}
            <TitleContentArea title="기본 인적 사항">
              <Box>
                <InfoGrid>
                  <InfoRowItem>
                    <InfoItem
                      title="성명"
                      description={
                        studentInfo?.koreanName
                          ? `${studentInfo.koreanName} (${studentInfo?.englishName || ""})`
                          : "-"
                      }
                    />
                    <Divider margin="0" />
                  </InfoRowItem>
                  <InfoRowItem>
                    <InfoItem
                      title="생년월일"
                      description={studentInfo?.birthDate || "-"}
                    />
                    <Divider margin="0" />
                  </InfoRowItem>
                  <InfoRowItem>
                    <InfoItem
                      title="성별"
                      description={studentInfo?.genderName || "-"}
                    />
                    <Divider margin="0" />
                  </InfoRowItem>
                  <InfoRowItem>
                    <InfoItem
                      title="휴대전화"
                      description={studentInfo?.mobilePhone || "-"}
                    />
                    <Divider margin="0" />
                  </InfoRowItem>
                  <InfoRowItem>
                    <InfoItem
                      title="국적"
                      description={studentInfo?.nationalityName || "-"}
                    />
                  </InfoRowItem>
                </InfoGrid>
              </Box>
            </TitleContentArea>

            <TitleContentArea title="소속 및 학적 상태">
              <Box>
                <InfoGrid>
                  <InfoRowItem>
                    <InfoItem
                      title="학번"
                      description={studentInfo?.studentId || "-"}
                    />
                    <Divider margin="0" />
                  </InfoRowItem>
                  <InfoRowItem>
                    <InfoItem
                      title="학적상태"
                      description={studentInfo?.enrollmentStatusName || "-"}
                    />
                    <Divider margin="0" />
                  </InfoRowItem>
                  <InfoRowItem>
                    <InfoItem
                      title="과정"
                      description={studentInfo?.courseName || "-"}
                    />
                    <Divider margin="0" />
                  </InfoRowItem>
                  <InfoRowItem>
                    <InfoItem
                      title="단과대학"
                      description={studentInfo?.collegeName || "-"}
                    />
                    <Divider margin="0" />
                  </InfoRowItem>
                  <InfoRowItem className="grid-item">
                    <InfoItem
                      title="학과(전공)"
                      description={studentInfo?.majorName || "-"}
                    />
                    <Divider margin="0" />
                  </InfoRowItem>
                  <InfoRowItem>
                    <InfoItem
                      title="지도교수"
                      description={studentInfo?.advisorProfessorName || "-"}
                    />
                  </InfoRowItem>
                </InfoGrid>
              </Box>
            </TitleContentArea>

            <TitleContentArea title="이수 및 성적 정보">
              <Box>
                <InfoGrid>
                  <InfoRowItem>
                    <InfoItem
                      title="평균평점"
                      description={
                        studentInfo?.gradeAverage
                          ? `${studentInfo.gradeAverage.trim()} / 4.5`
                          : "-"
                      }
                    />
                    <Divider margin="0" />
                  </InfoRowItem>
                  <InfoRowItem>
                    <InfoItem
                      title="취득학점"
                      description={
                        studentInfo?.acquiredCredits !== undefined
                          ? `${studentInfo.acquiredCredits} 학점`
                          : "-"
                      }
                    />
                    <Divider margin="0" />
                  </InfoRowItem>
                  <InfoRowItem className="grid-item">
                    <InfoItem
                      title="이수학기"
                      description={
                        studentInfo?.completedSemesterCount !== undefined
                          ? `${studentInfo.completedSemesterCount} 학기`
                          : "-"
                      }
                    />
                    <Divider margin="0" />
                  </InfoRowItem>
                  <InfoRowItem>
                    <InfoItem
                      title="졸업예정"
                      description={
                        studentInfo?.graduationExpectedYn === "1"
                          ? "대상"
                          : "비대상"
                      }
                    />
                  </InfoRowItem>
                </InfoGrid>
              </Box>
            </TitleContentArea>

            <ActionAreaContainer>
              <ActionButton
                as="button"
                onClick={handleMainAction}
                disabled={isLoading || !isRefetchAvailable}
              >
                {isLoading ? (loadingMessage || "가져오는 중...") : "최신 정보 다시 가져오기"}
              </ActionButton>
            </ActionAreaContainer>
          </>
        ) : (
          <ActionAreaContainer>
            <ActionButton
              as="button"
              onClick={handleMainAction}
              disabled={isLoading}
            >
              {isLoading ? (loadingMessage || "가져오는 중...") : "포털에서 학적 정보 가져오기"}
            </ActionButton>
            <FootnoteText>이 폰에서 직접 작업이 수행돼요.</FootnoteText>
          </ActionAreaContainer>
        )}
      </ContentSection>
    </BasicInfoPageWrapper>
  );
};

export default BasicInfoPage;

const BasicInfoPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: 16px ${MOBILE_PAGE_GUTTER} calc(24px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    max-width: 1200px;
    padding: 24px 0 calc(32px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));
  }
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  width: 100%;
`;

const EmptyCard = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--space-2);
  width: 100%;
  box-sizing: border-box;
`;

const EmptyTitle = styled.h3`
  ${typography.heading2}
  margin: 4px 0 0;
  color: var(--text-primary);
  text-align: center;
`;

const EmptyDesc = styled.p`
  ${typography.body2}
  margin: 0 auto;
  color: var(--text-secondary);
  line-height: 1.5;
  max-width: 320px;
  text-align: center;
`;

const CapsuleButtonWrapper = styled.div`
  margin-top: var(--space-2);
  display: flex;
  justify-content: center;
  width: 100%;
`;

const ActionAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: var(--space-4);
  gap: var(--space-3);
  width: 100%;
`;

const FootnoteText = styled.p`
  ${typography.caption1}
  margin: 0;
  color: var(--text-tertiary);
  text-align: center;
`;

const UpdateInfoText = styled.div`
  ${typography.caption1}
  color: var(--text-tertiary);
  text-align: right;
  margin-top: -8px;
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const InfoRowItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const InfoItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  box-sizing: border-box;

  .title {
    ${typography.caption1}
    color: var(--text-tertiary);
  }

  .description {
    ${typography.heading2}
    color: var(--text-primary);
  }
`;
