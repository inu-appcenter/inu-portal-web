import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useHeader } from "@/context/HeaderContext";
import useUserStore from "@/stores/useUserStore";
import {
  checkPortalAccountLinked,
  deletePortalAccount,
  fetchAcademicInfoFromApp,
  isMobileAppEnvironment,
} from "@/apis/mobileAgentBridge";
import type { StudentInfo } from "@/types/portal";
import { secureStorage } from "@/utils/secureStorage";
import { adaptAcademicInfoToStudentInfo } from "@/apis/portal";
import { ROUTES } from "@/constants/routes";
import { MOBILE_PAGE_GUTTER, DESKTOP_MEDIA } from "@/styles/responsive";
import CapsuleButton from "@/components/common/CapsuleButton";
import Modal from "@/components/common/Modal";
import Skeleton from "@/components/common/Skeleton";
import PortalAccountForm from "@/components/common/PortalAccountForm";
import { openIntipAppOrStore } from "@/utils/appLauncher";
import {
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  FileText,
  RotateCcw,
  Trash2,
  ChevronRight,
  Smartphone,
} from "lucide-react";

export default function MobilePortalAccountPage() {
  const navigate = useNavigate();
  const { userInfo } = useUserStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [isRelinkMode, setIsRelinkMode] = useState<boolean>(false);

  // 모달 및 토스트 상태
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
      const savedInfo = await secureStorage.getItem<StudentInfo>("portal_student_info");
      if (savedInfo) {
        setStudentInfo(savedInfo);
      }

      if (isMobileAppEnvironment()) {
        const linked = await checkPortalAccountLinked().catch(() => false);
        setIsLinked(linked);
        if (linked && !savedInfo) {
          const academicRes = await fetchAcademicInfoFromApp().catch(() => null);
          if (academicRes?.success && academicRes.data) {
            const student = adaptAcademicInfoToStudentInfo(academicRes.data);
            setStudentInfo(student);
            void secureStorage.setItem("portal_student_info", student);
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

  const handleRegisterSuccess = (student?: StudentInfo) => {
    if (student) {
      setStudentInfo(student);
    }
    setIsLinked(true);
    setIsRelinkMode(false);
    showToast("포털 계정이 성공적으로 등록되었어요.");
  };

  const handleUnlink = async () => {
    setIsUnlinkModalOpen(false);
    try {
      if (isMobileAppEnvironment()) {
        await deletePortalAccount().catch(() => {});
      }
      secureStorage.removeItem("portal_student_info");
      localStorage.removeItem("portal_info_last_updated");
      setStudentInfo(null);
      setIsLinked(false);
      setIsRelinkMode(false);
      showToast("포털 계정 연동이 해제되었어요.");
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "연동 해제 중 오류가 발생했어요.";
      alert(message);
    }
  };

  return (
    <PageWrapper>
      {toastMessage && (
        <ToastBanner>
          <CheckCircle2 size={16} color="var(--text-inverse)" />
          <span>{toastMessage}</span>
        </ToastBanner>
      )}

      {isLoading ? (
        <ContentContainer>
          <Skeleton width="100%" height="180px" style={{ borderRadius: "var(--radius-xl)" }} />
          <Skeleton width="100%" height="240px" style={{ borderRadius: "var(--radius-xl)" }} />
        </ContentContainer>
      ) : !isMobileAppEnvironment() ? (
        /* 0. 모바일 앱 환경 아닐 때 안내 화면 */
        <ContentContainer>
          <SurfaceCard>
            <IconCircle>
              <Smartphone size={28} color="var(--interactive-primary)" />
            </IconCircle>
            <HeadlineTitle>INTIP 앱 전용 기능이에요</HeadlineTitle>
            <HeadlineSubtitle>
              포털 계정 등록은 기기 보안 영역을 사용하므로 INTIP 모바일 앱 환경에서만 등록하고 이용할 수 있어요.
            </HeadlineSubtitle>

            <FeatureListCard>
              <FeatureListTitle>연동 시 이용할 수 있는 기능</FeatureListTitle>
              <FeatureItem>기본 학적 정보 조회</FeatureItem>
              <FeatureItem>이러닝(LMS) 과제 마감 알림과 강좌 확인</FeatureItem>
              <FeatureItem>학산도서관 열람실 좌석 배정 및 스터디룸 예약</FeatureItem>
            </FeatureListCard>

            <CapsuleButton
              variant="primary"
              fullWidth
              onClick={() => openIntipAppOrStore("mypage/portal")}
            >
              INTIP 앱 열기 및 설치
            </CapsuleButton>
          </SurfaceCard>
        </ContentContainer>
      ) : isLinked && !isRelinkMode ? (
        /* 1. 연동 완료 상태 화면 */
        <ContentContainer>
          <SurfaceCard>
            <StatusRow>
              <ConnectedBadge>
                <CheckCircle2 size={15} color="var(--green-500)" />
                <span>정상 연결됨</span>
              </ConnectedBadge>
              <SecurityTag>
                <ShieldCheck size={14} color="var(--text-tertiary)" />
                <span>기기 보안 저장소에 안전하게 보관 중</span>
              </SecurityTag>
            </StatusRow>

            <UserInfoSection>
              <UserName>
                {studentInfo?.koreanName || userInfo.nickname || "학우"}님의 포털 계정
              </UserName>
              <InfoGrid>
                <InfoItem>
                  <span className="label">학번</span>
                  <span className="value">{studentInfo?.studentId || "등록 완료"}</span>
                </InfoItem>
                {studentInfo?.departmentName && (
                  <InfoItem>
                    <span className="label">학과</span>
                    <span className="value">{studentInfo.departmentName}</span>
                  </InfoItem>
                )}
                {studentInfo?.enrollmentStatusName && (
                  <InfoItem>
                    <span className="label">학적 상태</span>
                    <span className="value">{studentInfo.enrollmentStatusName}</span>
                  </InfoItem>
                )}
              </InfoGrid>
            </UserInfoSection>

            <ActionButtonsRow>
              <SecondaryButton type="button" onClick={() => setIsRelinkMode(true)}>
                <RotateCcw size={15} />
                <span>계정 다시 등록</span>
              </SecondaryButton>
              <DangerButton type="button" onClick={() => setIsUnlinkModalOpen(true)}>
                <Trash2 size={15} />
                <span>등록 해제</span>
              </DangerButton>
            </ActionButtonsRow>
          </SurfaceCard>

          <SectionHeader>
            <SectionTitle>자동 연동 서비스</SectionTitle>
          </SectionHeader>

          <ServiceListContainer>
            <ServiceRow onClick={() => navigate(ROUTES.LABS.PORTAL.BASIC_INFO)}>
              <ServiceLeft>
                <ServiceIconWrapper $bg="var(--bg-brand)">
                  <FileText size={18} color="var(--interactive-primary)" />
                </ServiceIconWrapper>
                <ServiceTextGroup>
                  <ServiceTitle>기본 학적 정보 조회</ServiceTitle>
                  <ServiceSubtitle>취득 학점, 이수 학기, 성적 및 학적 상태</ServiceSubtitle>
                </ServiceTextGroup>
              </ServiceLeft>
              <ChevronRight size={18} color="var(--text-tertiary)" />
            </ServiceRow>

            <DividerLine />

            <ServiceRow onClick={() => navigate(ROUTES.SERVICES.LMS)}>
              <ServiceLeft>
                <ServiceIconWrapper $bg="var(--bg-muted)">
                  <GraduationCap size={18} color="var(--text-primary)" />
                </ServiceIconWrapper>
                <ServiceTextGroup>
                  <ServiceTitle>이러닝(LMS)</ServiceTitle>
                  <ServiceSubtitle>수강 강좌, 출석 체크, 과제 마감 알림</ServiceSubtitle>
                </ServiceTextGroup>
              </ServiceLeft>
              <ChevronRight size={18} color="var(--text-tertiary)" />
            </ServiceRow>

            <DividerLine />

            <ServiceRow onClick={() => navigate(ROUTES.SERVICES.LIBRARY)}>
              <ServiceLeft>
                <ServiceIconWrapper $bg="var(--bg-brand)">
                  <BookOpen size={18} color="var(--interactive-primary)" />
                </ServiceIconWrapper>
                <ServiceTextGroup>
                  <ServiceTitle>학산도서관</ServiceTitle>
                  <ServiceSubtitle>열람실 잔여 좌석 배정 및 스터디룸 예약</ServiceSubtitle>
                </ServiceTextGroup>
              </ServiceLeft>
              <ChevronRight size={18} color="var(--text-tertiary)" />
            </ServiceRow>
          </ServiceListContainer>

          <NoticeFooter>
            기기에서 직접 조회하며, 계정 비밀번호는 외부로 전송되지 않아요.
          </NoticeFooter>
        </ContentContainer>
      ) : (
        /* 2. 미연동 또는 재등록 화면 */
        <ContentContainer>
          <TitleSection>
            <HeadlineTitle>
              {isRelinkMode ? "포털 계정 다시 등록" : "포털 계정을 등록해 주세요"}
            </HeadlineTitle>
            <HeadlineSubtitle>
              인천대학교 포털 계정을 등록하면 학적, 시간표, 이러닝(LMS), 도서관 정보를 바로 확인할 수 있어요.
            </HeadlineSubtitle>
          </TitleSection>

          <SurfaceCard>
            <PortalAccountForm
              mode="page"
              isRelink={isRelinkMode}
              onSuccess={handleRegisterSuccess}
              onCancel={isRelinkMode ? () => setIsRelinkMode(false) : undefined}
            />
          </SurfaceCard>
        </ContentContainer>
      )}

      {/* 등록 해제 확인 모달 */}
      <Modal
        isOpen={isUnlinkModalOpen}
        onClose={() => setIsUnlinkModalOpen(false)}
        title="포털 계정 연동을 해제할까요?"
        description="연동을 해제하면 이 기기에 저장된 로그인 정보가 삭제되고, 이러닝(LMS) 및 도서관 자동 연동이 중단돼요."
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

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100svh;
  box-sizing: border-box;
  background: var(--bg-subtle);
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
  background: var(--text-primary);
  color: var(--text-inverse);
  padding: 12px 20px;
  border-radius: var(--radius-full);
  font-size: 13.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
`;

const SurfaceCard = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: 22px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--elevation-1-shadow);
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 4px 2px;
`;

const HeadlineTitle = styled.h2`
  margin: 0;
  font-size: 21px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  line-height: 1.35;
`;

const HeadlineSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const IconCircle = styled.div`
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  background: var(--bg-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  margin-bottom: 4px;
`;

const FeatureListCard = styled.div`
  background: var(--bg-muted);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FeatureListTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
`;

const FeatureItem = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.45;
  position: relative;
  padding-left: 12px;

  &::before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--interactive-primary);
    font-weight: bold;
  }
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;

const ConnectedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-muted);
  color: var(--text-primary);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
`;

const SecurityTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 500;
`;

const UserInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
`;

const UserName = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.2px;
`;

const InfoGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  background: var(--bg-muted);
  border-radius: var(--radius-lg);
  padding: 12px 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 80px;

  .label {
    font-size: 11.5px;
    font-weight: 500;
    color: var(--text-tertiary);
  }
  .value {
    font-size: 14.5px;
    font-weight: 700;
    color: var(--text-primary);
  }
`;

const ActionButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 4px;
`;

const SecondaryButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: 11px 0;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: var(--border-default);
    transform: scale(0.98);
  }
`;

const DangerButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--bg-error);
  color: var(--text-error);
  border: 1px solid var(--border-error-subtle);
  border-radius: var(--radius-md);
  padding: 11px 0;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 4px 0;
`;

const SectionTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary);
`;

const ServiceListContainer = styled.div`
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: 4px 18px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--elevation-1-shadow);
`;

const ServiceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.65;
  }
`;

const ServiceLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const ServiceIconWrapper = styled.div<{ $bg: string }>`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ServiceTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ServiceTitle = styled.strong`
  font-size: 14.5px;
  font-weight: 700;
  color: var(--text-primary);
`;

const ServiceSubtitle = styled.span`
  font-size: 12.5px;
  color: var(--text-tertiary);
`;

const DividerLine = styled.div`
  height: 1px;
  background: var(--border-default);
  width: 100%;
`;

const NoticeFooter = styled.p`
  margin: 12px 4px 0;
  font-size: 12.5px;
  color: var(--text-tertiary);
  text-align: center;
  line-height: 1.45;
`;
