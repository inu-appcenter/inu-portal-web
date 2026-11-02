import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  onboardingTimetable,
  onboardingNotice,
  onboardingAi,
  onboardingComplete,
} from "@/resources/assets/illustrations/onboarding";
import {
  isMobileAppEnvironment,
  fetchAcademicInfoFromApp,
} from "@/apis/mobileAgentBridge";
import {
  postOnboarding,
  checkMergeFreshman,
  getMembers,
} from "@/apis/members";
import { getMyInviteCode } from "@/apis/friends";
import {
  getDepartmentOptionGroups,
  findDepartmentCodeByName,
} from "@/utils/departmentOptions";
import { getAcademicYear } from "@/utils/academicYear";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";
import InputField from "@/components/common/InputField";
import { useHeader } from "@/context/HeaderContext";

const TOTAL_STEPS = 6;
const PROFILE_IMAGE_IDS = Array.from({ length: 12 }, (_, index) => index + 1);
const FORBIDDEN_KEYWORDS = [
  "알림", "공지", "알람", "운영자", "운영진", "관리자", "시스템", "스태프", "어드민",
  "notice", "admin", "system", "staff", "intip", "인팁", "appcenter", "앱센터",
];

const getProfileImageUrl = (fireId: number) =>
  `https://portal.inuappcenter.kr/images/profile/${fireId}`;

type AcademicStepState = "IDLE" | "FETCHING" | "SUCCESS" | "FAIL" | "MANUAL";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useUserStore();

  useHeader({
    visible: false,
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // 학적 정보 상태 (Slide 4)
  const [academicState, setAcademicState] = useState<AcademicStepState>("IDLE");
  const [realName, setRealName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [isAcademicVerified, setIsAcademicVerified] = useState(false);
  const [failErrorMessage, setFailErrorMessage] = useState("");
  const [mergedNotice, setMergedNotice] = useState<string | null>(null);

  // 프로필 설정 상태 (Slide 5)
  const [nickname, setNickname] = useState("");
  const [fireId, setFireId] = useState(1);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [nicknameError, setNicknameError] = useState("");

  // 초대 링크 상태 (Slide 6)
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  const departmentGroups = useMemo(() => getDepartmentOptionGroups(), []);

  // 학생 여부 판별 (학번이 9자리 숫자인 경우)
  const isStudent = useMemo(() => {
    return /^\d{9}$/.test(userInfo.studentId ?? "");
  }, [userInfo.studentId]);

  // 초기 사용자 정보 바인딩
  useEffect(() => {
    if (userInfo.realName) {
      setRealName(userInfo.realName);
    }
    if (userInfo.department) {
      setDepartmentName(userInfo.department);
      setDepartmentCode(
        userInfo.departmentCode || findDepartmentCodeByName(userInfo.department),
      );
    }
    if (userInfo.fireId) {
      setFireId(userInfo.fireId);
    }
    if (userInfo.nickname && userInfo.nickname !== userInfo.studentId) {
      setNickname(userInfo.nickname);
    }
    if (userInfo.isAcademicVerified) {
      setIsAcademicVerified(true);
      setAcademicState("SUCCESS");
    } else if (userInfo.memberType === "FRESHMAN") {
      setIsAcademicVerified(true);
      setAcademicState("SUCCESS");
    } else if (!isStudent && userInfo.id > 0) {
      // 교직원/교수는 기본 수동 모드로 진입
      setAcademicState("MANUAL");
    }
  }, [userInfo, isStudent]);

  // 사용자가 명시적으로 '학적 정보 가져오기'를 클릭했을 때만 스크래핑 실행
  const handleFetchAcademic = async () => {
    if (!isMobileAppEnvironment()) {
      setAcademicState("MANUAL");
      return;
    }

    try {
      setLoading(true);
      setAcademicState("FETCHING");
      setFailErrorMessage("");

      const res = await fetchAcademicInfoFromApp();
      if (res.success && res.data) {
        const scrapedName = res.data.koreanName || "";
        const scrapedDept = res.data.departmentName || "";
        const scrapedBirth =
          res.data.rawFields?.birthDt ||
          res.data.rawFields?.birthDate ||
          res.data.rawFields?.birth ||
          "";

        if (scrapedName) {
          setRealName(scrapedName);
        }
        if (scrapedDept) {
          setDepartmentName(scrapedDept);
          setDepartmentCode(findDepartmentCodeByName(scrapedDept));
        }
        setIsAcademicVerified(true);
        setAcademicState("SUCCESS");

        // 3월 정규 학번 발급 시 신입생 계정 통합 확인
        if (scrapedName && scrapedBirth) {
          try {
            const mergeRes = await checkMergeFreshman({
              koreanName: scrapedName,
              birthDate: scrapedBirth.replace(/\D/g, ""),
              departmentName: scrapedDept,
            });
            if (mergeRes.data.merged) {
              setMergedNotice(
                `${getAcademicYear()}학년도 신입생 전산망으로 작성했던 이전 활동 내역(시간표, 글, 스크랩 등)이 현재 학번 계정으로 모두 통합되었어요.`,
              );
            }
          } catch (mergeErr) {
            console.debug("[Onboarding] merge check error:", mergeErr);
          }
        }
      } else {
        setFailErrorMessage(
          res.errorMessage ||
            "학적 정보를 가져오지 못했어요. 포털 로그인 정보를 확인해주세요.",
        );
        setAcademicState("FAIL");
      }
    } catch (e: any) {
      setFailErrorMessage(
        e?.message || "학적 정보를 가져오는 중 오류가 발생했어요.",
      );
      setAcademicState("FAIL");
    } finally {
      setLoading(false);
    }
  };

  // Slide 6 진입 시 초대 코드 조회
  useEffect(() => {
    if (step === 6 && !inviteCode) {
      void (async () => {
        try {
          const res = await getMyInviteCode();
          if (res.data?.code) {
            setInviteCode(res.data.code);
          }
        } catch (e) {
          console.debug("[Onboarding] failed to get invite code:", e);
        }
      })();
    }
  }, [step, inviteCode]);

  // 닉네임 유효성 검사
  const validateNickname = (value: string): string => {
    const trimmed = value.trim();
    if (trimmed.length < 2) return "닉네임은 2자 이상 입력해주세요.";
    if (trimmed.length > 10) return "닉네임은 10자 이내로 입력해주세요.";
    if (trimmed === userInfo.studentId) return "학번과 동일한 닉네임은 사용할 수 없어요.";

    const normalized = trimmed.replace(/\s+/g, "").toLowerCase();
    const hasForbidden = FORBIDDEN_KEYWORDS.some((kw) =>
      normalized.includes(kw.toLowerCase()),
    );
    if (hasForbidden) return "사용할 수 없는 단어가 포함되어 있어요.";

    return "";
  };

  const handleNextFromIntro = () => {
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleNextFromAcademic = () => {
    if (academicState === "MANUAL") {
      if (!realName.trim()) {
        alert("이름을 입력해주세요.");
        return;
      }
      if (!departmentName) {
        alert("학과를 선택해주세요.");
        return;
      }
    }
    setStep(5);
  };

  const handleCompleteOnboarding = async () => {
    const error = validateNickname(nickname);
    if (error) {
      setNicknameError(error);
      return;
    }
    if (!agreeTerms) {
      alert("서비스 이용약관에 동의해주세요.");
      return;
    }

    try {
      setLoading(true);
      await postOnboarding({
        nickname: nickname.trim(),
        fireId,
        realName: realName.trim() || undefined,
        realNameSource: isAcademicVerified ? "PORTAL_SCRAPE" : "MANUAL",
        departmentCode: departmentCode || undefined,
        isAcademicVerified,
      });

      // 최신 사용자 정보 동기화
      const memberRes = await getMembers();
      setUserInfo(memberRes.data);

      setStep(6);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "프로필 설정 중 문제가 발생했어요. 다시 시도해주세요.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteLink = async () => {
    const inviteUrl = inviteCode
      ? `${window.location.origin}/friend/invite/${inviteCode}`
      : `${window.location.origin}/`;

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      } catch (e) {}
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: "인팁 친구 초대",
          text: "인팁에서 시간표 맞추고 학교 생활 같이 해요!",
          url: inviteUrl,
        });
      } catch (e) {}
    }
  };

  const handleStartService = () => {
    navigate(ROUTES.HOME, { replace: true });
  };

  const isAppEnv = isMobileAppEnvironment();

  return (
    <OuterWrapper>
      <PageContainer>
        {/* 상단 프로그레스 바 */}
        <ProgressContainer>
          <ProgressBar $progress={(step / TOTAL_STEPS) * 100} />
        </ProgressContainer>

        {/* 상단 바 (이전 버튼 및 단계 표시) */}
        <TopBar>
          {step > 1 && step < 6 ? (
            <BackButton type="button" onClick={() => setStep((s) => s - 1)}>
              ‹ 이전
            </BackButton>
          ) : (
            <span />
          )}
          <StepIndicator>{step} / {TOTAL_STEPS}</StepIndicator>
        </TopBar>

        <ContentArea>
          {/* Slide 1: 시간표 & 편람 & 친구 비교 */}
          {step === 1 && (
            <SlideSection>
              <IllustrationFrame>
                <IllustrationImage src={onboardingTimetable} alt="시간표와 공강 비교" />
              </IllustrationFrame>
              <Title>시간표 짜기부터<br />친구와 공강 비교까지</Title>
              <Subtitle>
                수강 편람이 열리면 바로 시간표를 만들고,<br />
                친구 시간표와 겹치는 공강 시간을 한눈에 비교해보세요.
              </Subtitle>
            </SlideSection>
          )}

          {/* Slide 2: 공지사항 키워드 알림 */}
          {step === 2 && (
            <SlideSection>
              <IllustrationFrame>
                <IllustrationImage src={onboardingNotice} alt="공지사항 키워드 알림" />
              </IllustrationFrame>
              <Title>놓치기 쉬운 학과 공지,<br />키워드로 바로 알림</Title>
              <Subtitle>
                장학금, 수강신청 등 원하는 키워드를 등록하면<br />
                새 공지가 뜰 때마다 바로 푸시 알림을 보내드려요.
              </Subtitle>
            </SlideSection>
          )}

          {/* Slide 3: 횃불이 AI 어시스턴트 */}
          {step === 3 && (
            <SlideSection>
              <IllustrationFrame>
                <IllustrationImage src={onboardingAi} alt="횃불이 AI" />
              </IllustrationFrame>
              <Title>학교 생활 궁금할 땐<br />언제나 횃불이 AI</Title>
              <Subtitle>
                학식 메뉴, 도서관 잔여석, 졸업 요건까지<br />
                인천대 생활의 모든 궁금증을 해결해드려요.
              </Subtitle>
            </SlideSection>
          )}

          {/* Slide 4: 학적 정보 확인 및 연동 */}
          {step === 4 && (
            <SlideSection>
              <Title>학적 정보를 확인해요</Title>
              <Subtitle>
                인천대학교 공식 학적 정보와 연동하여<br />
                학과 커뮤니티와 시간표 기능을 시작해요.
              </Subtitle>

              {/* 1. 가져오기 대기 상태 (IDLE) */}
              {academicState === "IDLE" && (
                <CardBox>
                  <NoticeBox>
                    <NoticeStrongText>
                      이 기기에서 학교 시스템에 직접 접속하여 학적 정보를 안전하게 가져와요.
                    </NoticeStrongText>
                    <NoticeSubText>
                      서버로 비밀번호가 전송되지 않으며, 오직 이 폰 안에서만 안전하게 수행돼요.
                    </NoticeSubText>
                  </NoticeBox>

                  {isAppEnv ? (
                    <ActionWrapper>
                      <ImportActionButton
                        type="button"
                        onClick={handleFetchAcademic}
                      >
                        학적 정보 가져오기
                      </ImportActionButton>
                      <TextLinkButton
                        type="button"
                        onClick={() => setAcademicState("MANUAL")}
                      >
                        직접 입력하기
                      </TextLinkButton>
                    </ActionWrapper>
                  ) : (
                    <ActionWrapper>
                      <BrowserNotice>
                        자동 학적 정보 가져오기는 인팁 모바일 앱 환경에서만 가능해요.
                        지금은 직접 입력하고, 나중에 앱에서 공식 인증할 수 있어요.
                      </BrowserNotice>
                      <ImportActionButton
                        type="button"
                        onClick={() => setAcademicState("MANUAL")}
                      >
                        직접 입력하여 계속하기
                      </ImportActionButton>
                    </ActionWrapper>
                  )}
                </CardBox>
              )}

              {/* 2. 가져오는 중 (FETCHING) */}
              {academicState === "FETCHING" && (
                <CardBox>
                  <LoadingBox>
                    <Spinner />
                    <LoadingText>
                      이 기기에서 학적 정보를 안전하게 확인하는 중이에요...
                    </LoadingText>
                  </LoadingBox>
                </CardBox>
              )}

              {/* 3. 성공 상태 (SUCCESS) */}
              {academicState === "SUCCESS" && (
                <CardBox>
                  <InfoRow>
                    <InfoLabel>성명</InfoLabel>
                    <InfoValue>{realName || "인증 완료"}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>학과</InfoLabel>
                    <InfoValue>{departmentName || "확인됨"}</InfoValue>
                  </InfoRow>
                  {userInfo.studentId && (
                    <InfoRow>
                      <InfoLabel>학번</InfoLabel>
                      <InfoValue>{userInfo.studentId}</InfoValue>
                    </InfoRow>
                  )}
                  <VerifiedBadge>공식 학적 인증 완료</VerifiedBadge>

                  {mergedNotice && (
                    <MergedBanner>
                      <MergedTitle>신입생 활동 내역 통합 안내</MergedTitle>
                      <MergedText>{mergedNotice}</MergedText>
                    </MergedBanner>
                  )}
                </CardBox>
              )}

              {/* 4. 실패 상태 (FAIL) */}
              {academicState === "FAIL" && (
                <CardBox>
                  <FailText>
                    {failErrorMessage || "학적 정보를 가져오지 못했어요."}<br />
                    포털 로그인 상태를 확인하고 다시 시도하거나,<br />
                    직접 입력하여 계속 진행할 수 있어요.
                  </FailText>
                  <ButtonGroup>
                    <SecondaryButton
                      type="button"
                      onClick={handleFetchAcademic}
                    >
                      다시 시도하기
                    </SecondaryButton>
                    <SecondaryButton
                      type="button"
                      onClick={() => setAcademicState("MANUAL")}
                    >
                      직접 입력하여 계속하기
                    </SecondaryButton>
                  </ButtonGroup>
                </CardBox>
              )}

              {/* 5. 수동 입력 모드 (MANUAL) */}
              {academicState === "MANUAL" && (
                <ManualForm>
                  <ManualNotice>
                    지금은 직접 입력하고, 나중에 홈 화면 상단 배너에서 언제든
                    공식 학적으로 인증할 수 있어요.
                  </ManualNotice>
                  <InputField
                    label="이름"
                    type="text"
                    placeholder="본명 입력"
                    value={realName}
                    onChange={setRealName}
                  />
                  <DepartmentSelectGroup>
                    <SelectLabel>학과 선택</SelectLabel>
                    <Select
                      value={departmentCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setDepartmentCode(code);
                        for (const g of departmentGroups) {
                          const found = g.departments.find((d) => d.code === code);
                          if (found) {
                            setDepartmentName(found.title);
                            break;
                          }
                        }
                      }}
                    >
                      <option value="">학과를 선택해주세요</option>
                      {departmentGroups.map((group) => (
                        <optgroup key={group.college} label={group.college}>
                          {group.departments.map((dept) => (
                            <option key={dept.code} value={dept.code}>
                              {dept.title}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </Select>
                  </DepartmentSelectGroup>
                  {isAppEnv && (
                    <TextLinkButton
                      type="button"
                      onClick={() => setAcademicState("IDLE")}
                    >
                      ‹ 기기에서 직접 가져오기로 돌아가기
                    </TextLinkButton>
                  )}
                </ManualForm>
              )}
            </SlideSection>
          )}

          {/* Slide 5: 프로필 설정 (닉네임 & 횃불이) */}
          {step === 5 && (
            <SlideSection>
              <Title>프로필을 완성해주세요</Title>
              <Subtitle>
                커뮤니티에서 활동할 닉네임과 횃불이 캐릭터를 선택해주세요.
              </Subtitle>

              <ProfileForm>
                <InputField
                  label="닉네임"
                  type="text"
                  placeholder="2~10자 한글/영문/숫자"
                  value={nickname}
                  onChange={(val) => {
                    setNickname(val);
                    setNicknameError(validateNickname(val));
                  }}
                />
                {nicknameError && <ErrorText>{nicknameError}</ErrorText>}

                <CharacterSection>
                  <SectionLabel>횃불이 캐릭터 선택</SectionLabel>
                  <CharacterGrid>
                    {PROFILE_IMAGE_IDS.map((id) => (
                      <CharacterOption
                        key={id}
                        type="button"
                        $isSelected={fireId === id}
                        onClick={() => setFireId(id)}
                      >
                        <CharacterImg
                          src={getProfileImageUrl(id)}
                          alt={`횃불이 ${id}`}
                        />
                      </CharacterOption>
                    ))}
                  </CharacterGrid>
                </CharacterSection>

                <TermsBox>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span>
                      인팁 서비스 이용약관 및 개인정보 처리방침에 동의합니다.
                    </span>
                  </CheckboxLabel>
                </TermsBox>
              </ProfileForm>
            </SlideSection>
          )}

          {/* Slide 6: 온보딩 완료 & 친구 초대 */}
          {step === 6 && (
            <SlideSection>
              <IllustrationFrame>
                <IllustrationImage src={onboardingComplete} alt="온보딩 완료" />
              </IllustrationFrame>
              <Title>모든 준비가 끝났어요!</Title>
              <Subtitle>
                친구에게 초대 링크를 보내고<br />
                시간표와 공강을 함께 맞춰보세요.
              </Subtitle>

              <InviteActionBox>
                <InviteCopyButton type="button" onClick={handleCopyInviteLink}>
                  {copied ? "초대 링크가 복사되었어요!" : "친구 초대 링크 복사하기"}
                </InviteCopyButton>
              </InviteActionBox>
            </SlideSection>
          )}
        </ContentArea>

        {/* 하단 고정 액션 버튼 */}
        <BottomCtaContainer>
          {step < 4 && (
            <PrimaryButton type="button" onClick={handleNextFromIntro}>
              다음
            </PrimaryButton>
          )}
          {step === 4 && (
            <PrimaryButton
              type="button"
              onClick={handleNextFromAcademic}
              disabled={
                loading ||
                (academicState !== "SUCCESS" && academicState !== "MANUAL") ||
                (academicState === "MANUAL" && (!realName.trim() || !departmentName))
              }
            >
              다음
            </PrimaryButton>
          )}
          {step === 5 && (
            <PrimaryButton
              type="button"
              onClick={handleCompleteOnboarding}
              disabled={
                loading ||
                !nickname.trim() ||
                Boolean(nicknameError) ||
                !agreeTerms
              }
            >
              {loading ? "설정 완료하는 중..." : "인팁 시작하기"}
            </PrimaryButton>
          )}
          {step === 6 && (
            <PrimaryButton type="button" onClick={handleStartService}>
              홈으로 이동하기
            </PrimaryButton>
          )}
        </BottomCtaContainer>
      </PageContainer>
    </OuterWrapper>
  );
}

const OuterWrapper = styled.div`
  width: 100%;
  min-height: 100dvh;
  background-color: var(--bg-base, #f9fafb);
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const PageContainer = styled.div`
  width: 100%;
  max-width: 440px;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-surface, #ffffff);
  box-sizing: border-box;
  padding-top: calc(12px + env(safe-area-inset-top, 0px));
  position: relative;
  box-shadow: 0 0 24px rgba(0, 0, 0, 0.04);
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 4px;
  background-color: var(--bg-subtle, #f2f4f6);
`;

const ProgressBar = styled.div<{ $progress: number }>`
  width: ${({ $progress }) => $progress}%;
  height: 100%;
  background-color: var(--brand-primary, #3182f6);
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 8px;
  height: 40px;
  box-sizing: border-box;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary, #4e5968);
  cursor: pointer;
  padding: 4px 8px;
  margin-left: -8px;
`;

const StepIndicator = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-caption, #8b95a1);
`;

const ContentArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 24px calc(96px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
`;

const SlideSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const IllustrationFrame = styled.div`
  width: 180px;
  height: 180px;
  margin: 12px 0 20px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.08);
  background-color: var(--bg-surface, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IllustrationImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Title = styled.h1`
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--text-primary, #191f28);
  letter-spacing: -0.4px;
  white-space: pre-line;
`;

const Subtitle = styled.p`
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-secondary, #4e5968);
  white-space: pre-line;
`;

const CardBox = styled.div`
  width: 100%;
  background-color: var(--bg-base, #f9fafb);
  border-radius: 18px;
  padding: 20px 18px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid var(--border-divider, #e5e8eb);
`;

const NoticeBox = styled.div`
  background-color: var(--bg-surface, #ffffff);
  border: 1px solid var(--border-divider, #e5e8eb);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
`;

const NoticeStrongText = styled.span`
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--brand-primary, #3182f6);
`;

const NoticeSubText = styled.span`
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-secondary, #4e5968);
`;

const ActionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
`;

const ImportActionButton = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 12px;
  border: none;
  background-color: var(--brand-primary, #3182f6);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const TextLinkButton = styled.button`
  background: none;
  border: none;
  font-size: 13px;
  color: var(--text-secondary, #4e5968);
  text-decoration: underline;
  cursor: pointer;
  padding: 6px;

  &:hover {
    color: var(--brand-primary, #3182f6);
  }
`;

const BrowserNotice = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary, #4e5968);
  text-align: left;
`;

const LoadingBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 24px 0;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid var(--bg-subtle, #f2f4f6);
  border-top-color: var(--brand-primary, #3182f6);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.span`
  font-size: 13px;
  color: var(--text-secondary, #4e5968);
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: var(--text-caption, #8b95a1);
`;

const InfoValue = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #191f28);
`;

const VerifiedBadge = styled.div`
  margin-top: 4px;
  padding: 8px;
  background-color: var(--brand-subtle, #e8f3ff);
  color: var(--brand-primary, #3182f6);
  font-size: 13px;
  font-weight: 700;
  border-radius: 10px;
  text-align: center;
`;

const FailText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-secondary, #4e5968);
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SecondaryButton = styled.button`
  width: 100%;
  height: 46px;
  border-radius: 12px;
  border: 1px solid var(--border-divider, #e5e8eb);
  background-color: var(--bg-surface, #ffffff);
  color: var(--text-primary, #191f28);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }
`;

const ManualForm = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
`;

const ManualNotice = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-caption, #8b95a1);
`;

const DepartmentSelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SelectLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #4e5968);
`;

const Select = styled.select`
  width: 100%;
  height: 46px;
  border-radius: 12px;
  border: 1px solid var(--border-divider, #e5e8eb);
  padding: 0 12px;
  font-size: 14px;
  color: var(--text-primary, #191f28);
  background-color: var(--bg-surface, #ffffff);
  outline: none;

  &:focus {
    border-color: var(--brand-primary, #3182f6);
  }
`;

const MergedBanner = styled.div`
  margin-top: 10px;
  width: 100%;
  background-color: var(--brand-subtle, #e8f3ff);
  border-radius: 12px;
  padding: 12px 14px;
  box-sizing: border-box;
  text-align: left;
`;

const MergedTitle = styled.h4`
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 700;
  color: var(--brand-primary, #3182f6);
`;

const MergedText = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--text-secondary, #4e5968);
`;

const ProfileForm = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  text-align: left;
`;

const ErrorText = styled.p`
  margin: -10px 0 0;
  font-size: 12px;
  color: var(--status-error, #f04452);
`;

const CharacterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #4e5968);
`;

const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const CharacterOption = styled.button<{ $isSelected: boolean }>`
  aspect-ratio: 1;
  border-radius: 14px;
  border: 2px solid
    ${({ $isSelected }) =>
      $isSelected ? "var(--brand-primary, #3182f6)" : "transparent"};
  background-color: var(--bg-subtle, #f2f4f6);
  padding: 4px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.95);
  }
`;

const CharacterImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const TermsBox = styled.div`
  margin-top: 4px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-secondary, #4e5968);
  cursor: pointer;

  input {
    margin-top: 2px;
  }
`;

const InviteActionBox = styled.div`
  width: 100%;
  margin-top: 10px;
`;

const InviteCopyButton = styled.button`
  width: 100%;
  height: 50px;
  border-radius: 14px;
  border: 1px solid var(--brand-primary, #3182f6);
  background-color: var(--brand-subtle, #e8f3ff);
  color: var(--brand-primary, #3182f6);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const BottomCtaContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 440px;
  padding: 16px 20px calc(16px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(
    to top,
    var(--bg-surface, #ffffff) 80%,
    rgba(255, 255, 255, 0)
  );
  box-sizing: border-box;
  z-index: 100;
`;

const PrimaryButton = styled.button`
  width: 100%;
  height: 52px;
  border-radius: 14px;
  border: none;
  background-color: var(--brand-primary, #3182f6);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background-color: var(--bg-disabled, #e5e8eb);
    color: var(--text-disabled, #8b95a1);
    cursor: not-allowed;
    transform: none;
  }
`;
