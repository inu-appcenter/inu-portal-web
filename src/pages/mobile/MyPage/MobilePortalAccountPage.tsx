import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import {
  checkPortalAccountLinked,
  savePortalAccount,
  deletePortalAccount,
  fetchAcademicInfoFromApp,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import { StudentInfo } from "@/types/portal";
import { adaptAcademicInfoToStudentInfo } from "@/apis/portal";
import { ROUTES } from "@/constants/routes";
import { MOBILE_PAGE_GUTTER, DESKTOP_MEDIA } from "@/styles/responsive";
import CapsuleButton from "@/components/common/CapsuleButton";
import Modal from "@/components/common/Modal";
import Skeleton from "@/components/common/Skeleton";
import { openIntipAppOrStore } from "@/utils/appLauncher";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  User,
  GraduationCap,
  BookOpen,
  FileText,
  RotateCcw,
  Trash2,
  ChevronRight,
  AlertCircle,
  Smartphone,
} from "lucide-react";

export default function MobilePortalAccountPage() {
  const navigate = useNavigate();
  const { userInfo } = useUserStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  // 등록/재등록 폼 상태
  const [studentIdInput, setStudentIdInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isRelinkMode, setIsRelinkMode] = useState<boolean>(false);

  // 모달 상태
  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useHeader({
    title: "포털 계정 관리",
    subHeader: null,
    hasback: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      // 로컬에 캐시된 학적 정보 확인
      const savedInfo = localStorage.getItem("portal_student_info");
      if (savedInfo) {
        try {
          setStudentInfo(JSON.parse(savedInfo));
        } catch {}
      }

      if (isMobileAppEnvironment()) {
        const linked = await checkPortalAccountLinked().catch(() => false);
        setIsLinked(linked);
        if (linked && !savedInfo) {
          // 연동되어 있으나 로컬 학적 데이터가 없으면 백그라운드 갱신
          const academicRes = await fetchAcademicInfoFromApp().catch(() => null);
          if (academicRes?.success && academicRes.data) {
            const student = adaptAcademicInfoToStudentInfo(academicRes.data);
            setStudentInfo(student);
            localStorage.setItem("portal_student_info", JSON.stringify(student));
            localStorage.setItem("portal_info_last_updated", new Date().toISOString());
          }
        }
      } else {
        setIsLinked(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput.trim() || !passwordInput.trim()) {
      setErrorMessage("학번과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (!isMobileAppEnvironment()) {
      setErrorMessage("포털 계정 연동은 INTIP 모바일 앱 환경에서만 지원돼요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const saveRes = await savePortalAccount(studentIdInput.trim(), passwordInput.trim());
      if (saveRes.success) {
        // 학적 정보 조회 시도하여 유효성 검증
        const academicRes = await fetchAcademicInfoFromApp();
        if (academicRes.success && academicRes.data) {
          const student = adaptAcademicInfoToStudentInfo(academicRes.data);
          setStudentInfo(student);
          localStorage.setItem("portal_student_info", JSON.stringify(student));
          localStorage.setItem("portal_info_last_updated", new Date().toISOString());
        }

        setIsLinked(true);
        setIsRelinkMode(false);
        setStudentIdInput("");
        setPasswordInput("");
        showToast("포털 계정이 성공적으로 연동되었어요.");
      } else {
        setErrorMessage(saveRes.errorMessage || "계정 연동에 실패했어요.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "오류가 발생했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinkModalOpen(false);
    try {
      if (isMobileAppEnvironment()) {
        await deletePortalAccount().catch(() => {});
      }
      localStorage.removeItem("portal_student_info");
      localStorage.removeItem("portal_info_last_updated");
      setStudentInfo(null);
      setIsLinked(false);
      setIsRelinkMode(false);
      showToast("포털 계정 연동이 해제되었어요.");
    } catch (e: any) {
      alert(e?.message || "연동 해제 중 오류가 발생했어요.");
    }
  };

  return (
    <PageWrapper>
      {toastMessage && (
        <ToastBanner>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </ToastBanner>
      )}

      {isLoading ? (
        <ContentContainer>
          <Skeleton width="100%" height="160px" style={{ borderRadius: "20px" }} />
          <Skeleton width="100%" height="220px" style={{ borderRadius: "20px" }} />
        </ContentContainer>
      ) : !isMobileAppEnvironment() ? (
        /* ================= 0. 모바일 앱 환경 아닐 때 안내 화면 ================= */
        <ContentContainer>
          <NotAppCard>
            <Smartphone size={36} color="#0061ff" />
            <NotAppTitle>INTIP 모바일 앱 전용 기능이에요</NotAppTitle>
            <NotAppDesc>
              포털 계정 연동은 기기 보안 저장소(KeyStore)를 이용하므로 INTIP 모바일 앱 환경에서만 등록하고 이용할 수 있어요.
            </NotAppDesc>

            <UsageGuideBox style={{ width: "100%", boxSizing: "border-box", textAlign: "left" }}>
              <UsageGuideTitle>연동 시 이용 가능한 기능</UsageGuideTitle>
              <UsageGuideList>
                <li>기본 학적 정보 (취득 학점, 성적, 학적 상태를 조회해요)</li>
                <li>이러닝 LMS (과제 마감 알림과 수강 강좌를 확인해요)</li>
                <li>학산도서관 (열람실 좌석 배정 및 스터디룸을 예약해요)</li>
              </UsageGuideList>
            </UsageGuideBox>

            <CapsuleButton
              variant="brand"
              style={{ marginTop: "16px", padding: "10px 20px", fontSize: "14px" }}
              onClick={() => openIntipAppOrStore("mypage/portal")}
            >
              앱 열기 및 설치
            </CapsuleButton>

            <FootnoteText style={{ marginTop: "16px" }}>이 폰에서 직접 작업이 수행돼요.</FootnoteText>
          </NotAppCard>
        </ContentContainer>
      ) : isLinked && !isRelinkMode ? (
        /* ================= 1. 연동 완료 상태 화면 ================= */
        <ContentContainer>
          <StatusCard>
            <StatusHeader>
              <StatusBadge>
                <CheckCircle2 size={16} />
                <span>정상 연동됨</span>
              </StatusBadge>
              <SecurityTag>
                <ShieldCheck size={14} />
                <span>기기 보안 저장소 (KeyStore)</span>
              </SecurityTag>
            </StatusHeader>

            <AccountInfoSection>
              <StudentTitle>
                {studentInfo?.koreanName || userInfo.nickname || "학우"}님의 포털 계정
              </StudentTitle>
              <StudentDetailRow>
                <DetailItem>
                  <span className="label">학번</span>
                  <span className="value">{studentInfo?.studentId || "등록됨"}</span>
                </DetailItem>
                {studentInfo?.departmentName && (
                  <DetailItem>
                    <span className="label">소속</span>
                    <span className="value">{studentInfo.departmentName}</span>
                  </DetailItem>
                )}
                {studentInfo?.enrollmentStatusName && (
                  <DetailItem>
                    <span className="label">학적 상태</span>
                    <span className="value">{studentInfo.enrollmentStatusName}</span>
                  </DetailItem>
                )}
              </StudentDetailRow>
            </AccountInfoSection>

            <ActionButtonsRow>
              <SubActionBtn onClick={() => setIsRelinkMode(true)}>
                <RotateCcw size={15} />
                <span>계정 재등록</span>
              </SubActionBtn>
              <DangerActionBtn onClick={() => setIsUnlinkModalOpen(true)}>
                <Trash2 size={15} />
                <span>등록 해제</span>
              </DangerActionBtn>
            </ActionButtonsRow>
          </StatusCard>

          {/* 원클릭 연동 서비스 안내 */}
          <SectionTitle>자동 연동 서비스</SectionTitle>
          <ServiceListCard>
            <ServiceItem onClick={() => navigate(ROUTES.LABS.PORTAL.BASIC_INFO)}>
              <ServiceLeft>
                <ServiceIcon $color="#0061ff" $bg="#eff6ff">
                  <FileText size={18} color="#0061ff" />
                </ServiceIcon>
                <ServiceText>
                  <strong>기본 학적 정보 조회</strong>
                  <span>취득학점, 이수학기, 성적 및 학적 상태</span>
                </ServiceText>
              </ServiceLeft>
              <ChevronRight size={18} color="#b0b8c1" />
            </ServiceItem>

            <ServiceDivider />

            <ServiceItem onClick={() => navigate(ROUTES.SERVICES.LMS)}>
              <ServiceLeft>
                <ServiceIcon $color="#16a34a" $bg="#f0fdf4">
                  <GraduationCap size={18} color="#16a34a" />
                </ServiceIcon>
                <ServiceText>
                  <strong>이러닝 (LMS)</strong>
                  <span>수강 강좌, 출석 체크, 과제 마감 리마인더</span>
                </ServiceText>
              </ServiceLeft>
              <ChevronRight size={18} color="#b0b8c1" />
            </ServiceItem>

            <ServiceDivider />

            <ServiceItem onClick={() => navigate(ROUTES.SERVICES.LIBRARY)}>
              <ServiceLeft>
                <ServiceIcon $color="#2563eb" $bg="#eff6ff">
                  <BookOpen size={18} color="#2563eb" />
                </ServiceIcon>
                <ServiceText>
                  <strong>학산도서관</strong>
                  <span>열람실 잔여 좌석 배정 및 스터디룸 원클릭 예약</span>
                </ServiceText>
              </ServiceLeft>
              <ChevronRight size={18} color="#b0b8c1" />
            </ServiceItem>
          </ServiceListCard>

          <FootnoteText>이 폰에서 직접 작업이 수행돼요.</FootnoteText>
        </ContentContainer>
      ) : (
        /* ================= 2. 미연동 또는 재등록 폼 화면 ================= */
        <ContentContainer>
          <HeroCard>
            <HeroTitle>
              {isRelinkMode ? "포털 계정 다시 등록" : "포털 계정을 등록해 주세요"}
            </HeroTitle>
            <HeroSubtitle>
              인천대학교 포털 계정(학번/비밀번호)을 등록하면 학적·LMS·도서관 기능을 바로 이용할 수 있어요.
            </HeroSubtitle>

            <UsageGuideBox>
              <UsageGuideTitle>연동 시 이용 가능한 기능</UsageGuideTitle>
              <UsageGuideList>
                <li>기본 학적 정보 (취득 학점, 성적, 학적 상태를 조회해요)</li>
                <li>이러닝 LMS (과제 마감 알림과 수강 강좌를 확인해요)</li>
                <li>학산도서관 (열람실 좌석 배정 및 스터디룸을 예약해요)</li>
              </UsageGuideList>
            </UsageGuideBox>
          </HeroCard>

          <FormCard onSubmit={handleRegister}>
            <InputGroup>
              <InputLabel>포털 학번</InputLabel>
              <InputWrap>
                <User size={18} color="#8b95a1" />
                <StyledInput
                  type="text"
                  inputMode="numeric"
                  placeholder="예: 202600000"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  disabled={isSubmitting}
                />
              </InputWrap>
            </InputGroup>

            <InputGroup>
              <InputLabel>포털 비밀번호</InputLabel>
              <InputWrap>
                <Lock size={18} color="#8b95a1" />
                <StyledInput
                  type="password"
                  placeholder="포털 비밀번호 입력"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  disabled={isSubmitting}
                />
              </InputWrap>
            </InputGroup>

            {errorMessage && (
              <ErrorBox>
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </ErrorBox>
            )}

            <ButtonGroupWrapper>
              <CapsuleButton
                type="submit"
                variant="brand"
                fullWidth
                loading={isSubmitting}
                disabled={!studentIdInput.trim() || !passwordInput.trim()}
              >
                {isSubmitting ? "기기 보안 영역에 저장 중..." : "포털 계정 연동하기"}
              </CapsuleButton>

              {isRelinkMode && (
                <CancelTextBtn type="button" onClick={() => setIsRelinkMode(false)}>
                  취소하고 돌아가기
                </CancelTextBtn>
              )}
            </ButtonGroupWrapper>
          </FormCard>

          <FootnoteText>이 폰에서 직접 작업이 수행되며, 계정 정보는 서버로 전송되지 않아요.</FootnoteText>
        </ContentContainer>
      )}

      {/* 등록 해제 확인 모달 */}
      <Modal
        isOpen={isUnlinkModalOpen}
        onClose={() => setIsUnlinkModalOpen(false)}
        title="포털 계정 연동을 해제할까요?"
        description="연동을 해제하면 이 폰에 저장된 로그인 정보와 학적 데이터가 삭제되고, 이러닝 및 도서관 자동 연동이 중단돼요."
        primaryButton={{
          text: "연동 해제",
          variant: "danger",
          onClick: handleUnlink,
        }}
        secondaryButton={{
          text: "취소",
          onClick: () => setIsUnlinkModalOpen(false),
        }}
      />
    </PageWrapper>
  );
}

// ================= STYLES =================

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100svh;
  box-sizing: border-box;
  background: var(--bg-subtle, #f8f9fb);
  padding: 16px ${MOBILE_PAGE_GUTTER}px 80px;

  @media ${DESKTOP_MEDIA} {
    max-width: 640px;
    margin: 0 auto;
    padding: 24px 0 80px;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const ToastBanner = styled.div`
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  background: #191f28;
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
`;

const StatusCard = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #e8f8f0;
  color: #1b633d;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
`;

const SecurityTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-tertiary, #8b95a1);
  font-size: 11.5px;
  font-weight: 500;
`;

const AccountInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 0 4px;
`;

const StudentTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
`;

const StudentDetailRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: var(--bg-muted, #f8fafc);
  border-radius: 12px;
  padding: 12px 14px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-tertiary, #8b95a1);
  }
  .value {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary, #191f28);
  }
`;

const ActionButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 4px;
`;

const SubActionBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--bg-muted, #f2f4f6);
  color: var(--text-secondary, #4e5968);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  padding: 10px 0;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: var(--border-default, #e5e8eb);
    transform: scale(0.98);
  }
`;

const DangerActionBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #fff0f0;
  color: #ef4444;
  border: 1px solid #fee2e2;
  border-radius: 12px;
  padding: 10px 0;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: #fee2e2;
    transform: scale(0.98);
  }
`;

const SectionTitle = styled.h4`
  margin: 8px 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary, #4e5968);
`;

const ServiceListCard = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
`;

const ServiceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.7;
  }
`;

const ServiceLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ServiceIcon = styled.div<{ $color: string; $bg: string }>`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ServiceText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary, #191f28);
  }
  span {
    font-size: 12px;
    color: var(--text-tertiary, #8b95a1);
  }
`;

const ServiceDivider = styled.div`
  height: 1px;
  background: var(--border-default, #e5e8eb);
  width: 100%;
`;

const FootnoteText = styled.p`
  margin: 14px 4px 0;
  font-size: 12.5px;
  color: var(--text-tertiary, #8b95a1);
  text-align: center;
  line-height: 1.4;
`;

const NotAppCard = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 32px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
`;

const NotAppTitle = styled.h3`
  margin: 4px 0 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
`;

const NotAppDesc = styled.p`
  margin: 0 0 8px;
  font-size: 13.5px;
  color: var(--text-secondary, #6b7684);
  line-height: 1.5;
  max-width: 320px;
`;

const HeroCard = styled.div`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeroTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
  letter-spacing: -0.3px;
`;

const HeroSubtitle = styled.p`
  margin: 0;
  font-size: 13.5px;
  color: var(--text-secondary, #6b7684);
  line-height: 1.5;
`;

const UsageGuideBox = styled.div`
  background: var(--bg-muted, #f8fafc);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
`;

const UsageGuideTitle = styled.div`
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
`;

const UsageGuideList = styled.ul`
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  li {
    font-size: 12px;
    color: var(--text-secondary, #6b7684);
    line-height: 1.4;
  }
`;

const FormCard = styled.form`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InputLabel = styled.label`
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-secondary, #4e5968);
`;

const InputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-muted, #f2f4f6);
  border-radius: 12px;
  padding: 0 14px;
  height: 48px;
`;

const StyledInput = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  font-size: 15px;
  color: var(--text-primary, #191f28);
  outline: none;

  &::placeholder {
    color: var(--text-disabled, #b0b8c1);
  }
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #ef4444;
  background: #fff0f0;
  padding: 8px 12px;
  border-radius: 8px;
`;

const ButtonGroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
`;

const CancelTextBtn = styled.button`
  background: none;
  border: none;
  color: var(--text-tertiary, #8b95a1);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 0;

  &:hover {
    color: var(--text-secondary, #4e5968);
  }
`;
