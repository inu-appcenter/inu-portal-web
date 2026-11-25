import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  onboardingAi,
  onboardingNotice,
  onboardingPortalMagnifier,
  onboardingPortalWindow,
  onboardingTimetable,
} from "@/resources/assets/illustrations/onboarding";
import {
  deletePortalAccount,
  fetchAcademicInfoFromApp,
  isMobileAppEnvironment,
  savePortalAccount,
} from "@/apis/mobileAgentBridge";
import { adaptAcademicInfoToStudentInfo } from "@/apis/portal";
import { checkMergeFreshman, getMembers, postOnboarding } from "@/apis/members";
import { getSchoolDepartments, SchoolDepartment } from "@/apis/departments";
import { getMyInviteCode } from "@/apis/friends";
import { getDepartmentOptionGroups, findDepartmentCodeByName } from "@/utils/departmentOptions";
import { getAcademicYear } from "@/utils/academicYear";
import { secureStorage } from "@/utils/secureStorage";
import { showToast } from "@/utils/toast";
import { hasPortalSyncConsent, recordPortalSyncConsent } from "@/utils/portalSyncConsent";
import {
  NICKNAME_MAX_LENGTH,
  validateNickname,
  validateRealName,
} from "@/utils/onboardingValidation";
import useUserStore from "@/stores/useUserStore";
import { ROUTES } from "@/constants/routes";
import { useHeader } from "@/context/HeaderContext";
import { typography } from "@/styles/typography";
import { SAFE_AREA } from "@/styles/safeArea";
import InputField from "@/components/common/InputField";
import BottomSheet from "@/components/common/BottomSheet";
import Icon from "@/components/common/Icon";
import { recordTermsAgreement } from "@/components/common/TermsAgreement";
import { PortalSyncConsentSheet } from "@/components/common/PortalSyncConsentSheet";
import OnboardingFunnelHeader from "@/components/mobile/onboarding/OnboardingFunnelHeader";
import OnboardingBottomCTA from "@/components/mobile/onboarding/OnboardingBottomCTA";
import DepartmentSelectSheet, {
  DepartmentOption,
} from "@/components/mobile/onboarding/DepartmentSelectSheet";
import ServiceTermsSheet from "@/components/mobile/onboarding/ServiceTermsSheet";

/**
 * 온보딩 퍼널 (Figma 08 온보딩 퍼널 6269:18497).
 *
 * 인트로 3장 → 포털 계정 등록(성공하면 이름·학과 자동) 또는 이름·학과 직접 입력
 * → 닉네임 → 프로필 이미지 → 확인(약관 동의 시트) → 완료.
 * - 교직원(학번이 9자리 숫자가 아님)은 포털 단계 없이 직접 입력부터.
 * - 이미 학적 인증된 회원·신입생 계정은 포털·이름·학과를 건너뛴다.
 * - 진행 바 칸 수는 시안(5칸)과 달리 실제로 거치는 단계 수에 맞춘다.
 */

type FunnelStep = "portal" | "name" | "nickname" | "department" | "profile" | "confirm";
type Step = "intro" | FunnelStep | "done";
type PortalStatus = "idle" | "loading" | "error";

const PROFILE_IMAGE_IDS = Array.from({ length: 12 }, (_, index) => index + 1);
const INTRO_SLIDES = [
  {
    image: onboardingTimetable,
    alt: "시간표와 공강 비교",
    title: "시간표 짜기부터\n친구와 공강 비교까지",
    body: "수강 편람이 열리면 바로 시간표를 만들고\n친구와 겹치는 공강을 한눈에 봐요.",
  },
  {
    image: onboardingNotice,
    alt: "공지사항 키워드 알림",
    title: "놓치기 쉬운 학과 공지\n키워드로 바로 알림",
    body: "장학금·수강신청 같은 키워드를 등록하면\n새 공지가 올라올 때 알려드려요.",
  },
  {
    image: onboardingAi,
    alt: "횃불이 AI",
    title: "학교생활이 궁금할 땐\n언제나 횃불이 AI",
    body: "학식, 도서관 빈자리, 졸업 요건까지\n인천대 생활 궁금증을 물어보세요.",
  },
] as const;

const getProfileImageUrl = (fireId: number) =>
  `https://portal.inuappcenter.kr/images/profile/${fireId}`;

const normalizeDeptName = (name: string) => name.replace(/[\s·\-()]/g, "").toLowerCase();

const isCredentialError = (message: string) =>
  ["비밀번호", "아이디", "틀렸습니다", "휴면"].some((kw) => message.includes(kw));

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { userInfo, setUserInfo, setTokenInfo } = useUserStore();

  useHeader({
    visible: false,
    immersive: true,
    pageBgColor: "var(--bg-base)",
  });

  const isAppEnv = isMobileAppEnvironment();
  const isStudent = /^\d{9}$/.test(userInfo.studentId ?? "");
  /** 이미 학적이 확인된 회원: 포털·이름·학과를 건너뛴다 */
  const academicLocked =
    Boolean(userInfo.isAcademicVerified) || userInfo.memberType === "FRESHMAN";

  const [step, setStep] = useState<Step>("intro");
  const [introIndex, setIntroIndex] = useState(0);
  /** 확인 단계에서 항목을 눌러 들어온 경우, 다음을 누르면 확인 단계로 돌아간다 */
  const [returnToConfirm, setReturnToConfirm] = useState(false);
  /** 학생이 포털 대신 직접 입력을 고른 경우 */
  const [manualChosen, setManualChosen] = useState(false);

  // 포털 계정
  const [portalSheetOpen, setPortalSheetOpen] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [portalStatus, setPortalStatus] = useState<PortalStatus>("idle");
  const [portalError, setPortalError] = useState("");
  const [portalStudentId, setPortalStudentId] = useState("");
  const [portalPassword, setPortalPassword] = useState("");

  // 학적
  const [realName, setRealName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [isAcademicVerified, setIsAcademicVerified] = useState(false);
  const [mergedNotice, setMergedNotice] = useState<string | null>(null);
  const [deptSheetOpen, setDeptSheetOpen] = useState(false);

  // 프로필
  const [nickname, setNickname] = useState("");
  const [fireId, setFireId] = useState(1);

  // 확인·완료
  const [termsOpen, setTermsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const [schoolDepartments, setSchoolDepartments] = useState<SchoolDepartment[]>([]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await getSchoolDepartments();
        if (active && Array.isArray(res.data)) setSchoolDepartments(res.data);
      } catch (e) {
        console.debug("[Onboarding] failed to load school departments:", e);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  /** 서버 학과 목록, 못 불러오면 내장 목록을 한 줄로 편다 */
  const departmentOptions = useMemo<DepartmentOption[]>(() => {
    if (schoolDepartments.length > 0) {
      return schoolDepartments.map((d) => ({ code: d.code, name: d.name }));
    }
    return getDepartmentOptionGroups().flatMap((g) =>
      g.departments.map((d) => ({ code: d.code, name: d.title })),
    );
  }, [schoolDepartments]);

  const resolveDepartmentCode = useCallback(
    (name: string): string => {
      const trimmed = name.trim();
      if (!trimmed) return "";
      const exact = schoolDepartments.find((d) => d.name === trimmed);
      if (exact) return exact.code;
      const target = normalizeDeptName(trimmed);
      const normalized = schoolDepartments.find((d) => normalizeDeptName(d.name) === target);
      if (normalized) return normalized.code;
      return findDepartmentCodeByName(trimmed);
    },
    [schoolDepartments],
  );

  // 서버에 이미 있는 회원 정보로 채운다
  useEffect(() => {
    if (userInfo.realName) setRealName(userInfo.realName);
    if (userInfo.department) {
      setDepartmentName(userInfo.department);
      setDepartmentCode(userInfo.departmentCode || resolveDepartmentCode(userInfo.department));
    }
    if (userInfo.fireId) setFireId(userInfo.fireId);
    if (userInfo.nickname && userInfo.nickname !== userInfo.studentId) {
      setNickname(userInfo.nickname);
    }
    if (userInfo.isAcademicVerified || userInfo.memberType === "FRESHMAN") {
      setIsAcademicVerified(true);
    }
    if (/^\d{9}$/.test(userInfo.studentId ?? "")) {
      setPortalStudentId((prev) => prev || (userInfo.studentId ?? ""));
    }
  }, [userInfo, resolveDepartmentCode]);

  /** 이 사용자가 거치는 단계. 진행 바 칸 수도 여기서 나온다 */
  const funnelSteps = useMemo<FunnelStep[]>(() => {
    if (academicLocked || (isAcademicVerified && !manualChosen)) {
      // 포털에서 불러왔으면 포털 단계는 남겨 둔다(뒤로 가서 다시 불러올 수 있게)
      return isAcademicVerified && !academicLocked
        ? ["portal", "nickname", "profile", "confirm"]
        : ["nickname", "profile", "confirm"];
    }
    if (isStudent && !manualChosen) return ["portal", "nickname", "profile", "confirm"];
    return ["name", "nickname", "department", "profile", "confirm"];
  }, [academicLocked, isAcademicVerified, isStudent, manualChosen]);

  const goToFunnelStep = (next: FunnelStep) => {
    setStep(next);
    if (next === "portal" && portalStatus !== "loading" && !isAcademicVerified) {
      setPortalSheetOpen(true);
    }
  };

  const handleIntroNext = () => {
    if (introIndex < INTRO_SLIDES.length - 1) {
      setIntroIndex((i) => i + 1);
      return;
    }
    goToFunnelStep(funnelSteps[0]);
  };

  const handleNext = () => {
    if (step === "intro" || step === "done") return;
    if (returnToConfirm) {
      setReturnToConfirm(false);
      setStep("confirm");
      return;
    }
    const index = funnelSteps.indexOf(step);
    const next = funnelSteps[index + 1];
    if (next) goToFunnelStep(next);
  };

  const handleBack = () => {
    if (step === "intro" || step === "done") return;
    if (returnToConfirm) {
      setReturnToConfirm(false);
      setStep("confirm");
      return;
    }
    const index = funnelSteps.indexOf(step);
    if (index <= 0) {
      setPortalSheetOpen(false);
      setStep("intro");
      setIntroIndex(INTRO_SLIDES.length - 1);
      return;
    }
    setStep(funnelSteps[index - 1]);
  };

  const chooseManual = () => {
    setPortalSheetOpen(false);
    setManualChosen(true);
    if (!academicLocked) setIsAcademicVerified(false);
    setPortalStatus("idle");
    setPortalError("");
    setStep("name");
  };

  const choosePortal = () => {
    setPortalSheetOpen(false);
    if (!hasPortalSyncConsent()) setConsentOpen(true);
  };

  // 포털 계정 저장 → 학적 불러오기
  const handlePortalSubmit = async () => {
    const studentId = portalStudentId.trim();
    const password = portalPassword;
    if (!studentId || !password) return;
    if (!isAppEnv) {
      setPortalSheetOpen(true);
      return;
    }
    // 시트를 내려 닫고 바로 입력한 경우에도 필수 동의 없이는 불러오지 않는다
    if (!hasPortalSyncConsent()) {
      setConsentOpen(true);
      return;
    }

    setPortalStatus("loading");
    setPortalError("");
    try {
      const saveRes = await savePortalAccount(studentId, password);
      if (!saveRes.success) throw new Error(saveRes.errorMessage || "계정을 등록하지 못했어요.");

      const res = await fetchAcademicInfoFromApp(true);
      if (!res.success || !res.data) {
        const message = res.errorMessage || "";
        if (isCredentialError(message)) {
          await deletePortalAccount().catch(() => {});
          throw new Error("학번 또는 비밀번호가 맞지 않아요. 다시 확인해주세요.");
        }
        throw new Error(message || "포털 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      }

      const info = res.data;
      try {
        await secureStorage.setItem("portal_student_info", adaptAcademicInfoToStudentInfo(info));
        localStorage.setItem("portal_info_last_updated", new Date().toISOString());
      } catch (e) {
        console.debug("[Onboarding] failed to cache student info:", e);
      }

      const scrapedName = info.koreanName || "";
      const scrapedDept = info.departmentName || "";
      if (scrapedName) setRealName(scrapedName);
      if (scrapedDept) {
        setDepartmentName(scrapedDept);
        setDepartmentCode(resolveDepartmentCode(scrapedDept));
      }
      setIsAcademicVerified(true);
      setManualChosen(false);
      setPortalStatus("idle");
      setPortalPassword("");

      // 3월 정규 학번 발급 시 신입생 계정 통합 확인
      const birth =
        info.rawFields?.birthDt || info.rawFields?.birthDate || info.rawFields?.birth || "";
      if (scrapedName && birth) {
        try {
          const mergeRes = await checkMergeFreshman({
            koreanName: scrapedName,
            birthDate: birth.replace(/\D/g, ""),
            departmentName: scrapedDept,
          });
          if (mergeRes.data.merged) {
            if (mergeRes.data.token) setTokenInfo(mergeRes.data.token);
            try {
              const memberRes = await getMembers();
              setUserInfo(memberRes.data);
            } catch (syncErr) {
              console.debug("[Onboarding] post-merge member sync error:", syncErr);
            }
            setMergedNotice(
              `${getAcademicYear()}학년도 신입생 계정의 시간표·글·스크랩을\n이 계정으로 옮겼어요.`,
            );
          }
        } catch (mergeErr) {
          console.debug("[Onboarding] merge check error:", mergeErr);
        }
      }

      if (returnToConfirm) {
        setReturnToConfirm(false);
        setStep("confirm");
      } else {
        setStep("nickname");
      }
    } catch (e) {
      setPortalStatus("error");
      setPortalError(
        e instanceof Error && e.message
          ? e.message
          : "포털 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  // 완료 화면에서 초대 코드 조회
  useEffect(() => {
    if (step !== "done" || inviteCode) return;
    void (async () => {
      try {
        const res = await getMyInviteCode();
        if (res.data?.code) setInviteCode(res.data.code);
      } catch (e) {
        console.debug("[Onboarding] failed to get invite code:", e);
      }
    })();
  }, [step, inviteCode]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await postOnboarding({
        nickname: nickname.trim(),
        fireId,
        realName: realName.trim() || undefined,
        realNameSource: isAcademicVerified ? "PORTAL_SCRAPE" : "MANUAL",
        departmentCode: departmentCode || undefined,
        isAcademicVerified,
      });
      recordTermsAgreement();
      const memberRes = await getMembers();
      setUserInfo(memberRes.data);
      setTermsOpen(false);
      setStep("done");
    } catch (err: unknown) {
      const serverMessage =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setTermsOpen(false);
      showToast(serverMessage || "저장하지 못했어요. 잠시 후 다시 시도해주세요.", {
        bottomOffset: 80,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyInvite = async () => {
    const inviteUrl = inviteCode
      ? `${window.location.origin}/friend/invite/${inviteCode}`
      : `${window.location.origin}/`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(inviteUrl);
        showToast("초대 링크를 복사했어요.", { bottomOffset: 80 });
        return;
      }
    } catch {
      // 클립보드가 막힌 환경이면 공유 시트로 넘긴다
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: "인팁 친구 초대",
          text: "인팁에서 시간표 맞추고 학교생활 같이 해요!",
          url: inviteUrl,
        });
      } catch {
        // 사용자가 공유를 닫음
      }
    }
  };

  const editFromConfirm = (target: FunnelStep) => {
    setReturnToConfirm(true);
    goToFunnelStep(target);
  };

  const nameError = validateRealName(realName);
  const nicknameError = validateNickname(nickname, userInfo.studentId);
  const nicknameLength = nickname.trim().length;

  /* ───────────── 렌더 ───────────── */

  if (step === "intro") {
    const slide = INTRO_SLIDES[introIndex];
    return (
      <Page>
        <IntroBody key={introIndex}>
          <IntroImage src={slide.image} alt={slide.alt} />
          <TitleBlock $center>
            <Title>{slide.title}</Title>
            <Subtitle>{slide.body}</Subtitle>
          </TitleBlock>
          <Dots aria-label={`${INTRO_SLIDES.length}장 중 ${introIndex + 1}장`}>
            {INTRO_SLIDES.map((_, i) => (
              <Dot key={i} $active={i === introIndex} />
            ))}
          </Dots>
        </IntroBody>
        <OnboardingBottomCTA primary={{ label: "다음", onClick: handleIntroNext }} />
      </Page>
    );
  }

  if (step === "done") {
    return (
      <Page>
        <DoneBody>
          <Avatar src={getProfileImageUrl(fireId)} alt="" $size={120} />
          <TitleBlock $center>
            <Title>{nickname.trim()}님, 환영해요!</Title>
            <Subtitle>
              {"이제 INTIP의 모든 기능을 쓸 수 있어요.\n친구를 초대해 공강을 함께 맞춰보세요."}
            </Subtitle>
          </TitleBlock>
        </DoneBody>
        <OnboardingBottomCTA
          secondary={{ label: "초대 링크 복사", onClick: handleCopyInvite }}
          primary={{
            label: "INTIP 시작하기",
            onClick: () => navigate(ROUTES.HOME, { replace: true }),
          }}
        />
      </Page>
    );
  }

  const stepIndex = funnelSteps.indexOf(step);
  const header = (
    <OnboardingFunnelHeader
      step={stepIndex + 1}
      total={funnelSteps.length}
      onBack={portalStatus === "loading" ? undefined : handleBack}
    />
  );

  return (
    <Page>
      {header}

      {step === "portal" && (
        <>
          <Body>
            <TitleBlock>
              <Title>포털 계정 등록</Title>
              <Subtitle>
                {"인천대학교 포털 계정을 등록하면\n학적·LMS·도서관 기능을 바로 이용할 수 있어요."}
              </Subtitle>
            </TitleBlock>
            <Fields>
              <InputField
                label="학번"
                type="text"
                inputMode="numeric"
                autoComplete="username"
                placeholder="입력하세요"
                value={portalStudentId}
                onChange={(v) => {
                  setPortalStudentId(v.replace(/\D/g, ""));
                  if (portalStatus === "error") setPortalStatus("idle");
                }}
                disabled={portalStatus === "loading"}
                error={portalStatus === "error"}
              />
              <InputField
                label="비밀번호"
                type="password"
                autoComplete="current-password"
                placeholder="입력하세요"
                value={portalPassword}
                onChange={(v) => {
                  setPortalPassword(v);
                  if (portalStatus === "error") setPortalStatus("idle");
                }}
                disabled={portalStatus === "loading"}
                error={portalStatus === "error"}
              />
              {portalStatus === "error" && portalError && <Helper $error>{portalError}</Helper>}
            </Fields>
          </Body>
          <OnboardingBottomCTA
            caption={
              portalStatus === "loading"
                ? "포털에서 이름과 학과를 불러오고 있어요"
                : portalStatus === "error"
                  ? "이름, 학과 직접 입력하기"
                  : "계정 정보는 기기에만 저장되며, 포털에 직접 요청합니다."
            }
            onCaptionClick={portalStatus === "error" ? chooseManual : undefined}
            primary={{
              label: portalStatus === "loading" ? "불러오는 중…" : "다음",
              onClick: handlePortalSubmit,
              disabled:
                portalStatus === "loading" || !portalStudentId.trim() || !portalPassword,
            }}
          />

          <BottomSheet
            open={portalSheetOpen}
            onOpenChange={(next) => {
              if (!next) setPortalSheetOpen(false);
            }}
            handle="compact"
          >
            <SheetContent>
              <TitleBlock>
                <Title>포털 계정을 등록할 수 있어요</Title>
                <Subtitle>
                  {
                    "인천대학교 포털 계정을 등록하면\n학사정보 시스템·LMS·도서관 기능을 바로 이용할 수 있어요."
                  }
                </Subtitle>
              </TitleBlock>
              <PortalIllustration aria-hidden>
                <img className="window" src={onboardingPortalWindow} alt="" />
                <img className="magnifier" src={onboardingPortalMagnifier} alt="" />
              </PortalIllustration>
              {isAppEnv ? (
                <OnboardingBottomCTA
                  placement="inline"
                  caption="이름, 학과 직접 입력하기"
                  onCaptionClick={chooseManual}
                  primary={{ label: "포털 계정 등록하기", onClick: choosePortal }}
                />
              ) : (
                <OnboardingBottomCTA
                  placement="inline"
                  caption="포털 계정 등록은 INTIP 앱에서 할 수 있어요"
                  primary={{ label: "이름, 학과 입력하기", onClick: chooseManual }}
                />
              )}
            </SheetContent>
          </BottomSheet>

          <PortalSyncConsentSheet
            open={consentOpen}
            ctaLabel="동의하고 시작하기"
            onAgree={(choice) => {
              recordPortalSyncConsent(choice);
              setConsentOpen(false);
              if (portalStudentId.trim() && portalPassword) void handlePortalSubmit();
            }}
            onDismiss={() => {
              setConsentOpen(false);
              setPortalSheetOpen(true);
            }}
          />
        </>
      )}

      {step === "name" && (
        <>
          <Body>
            <TitleBlock>
              <Title>이름을 알려주세요</Title>
              <Subtitle>실제 이름을 입력해주세요.</Subtitle>
            </TitleBlock>
            <Field>
              <InputField
                label="이름"
                type="text"
                autoComplete="name"
                placeholder="입력하세요"
                value={realName}
                onChange={setRealName}
                error={Boolean(nameError)}
                autoFocus
              />
              {nameError && <Helper $error>{nameError}</Helper>}
            </Field>
          </Body>
          <OnboardingBottomCTA
            primary={{
              label: "다음",
              onClick: handleNext,
              disabled: !realName.trim() || Boolean(nameError),
            }}
          />
        </>
      )}

      {step === "nickname" && (
        <>
          <Body>
            <TitleBlock>
              <Title>{"커뮤니티에서 쓸\n닉네임을 정해주세요"}</Title>
              <Subtitle>커뮤니티와 마이페이지에 표시돼요.</Subtitle>
            </TitleBlock>
            <Field>
              <InputField
                label="닉네임"
                type="text"
                placeholder="입력하세요"
                value={nickname}
                onChange={setNickname}
                error={Boolean(nicknameError)}
                autoFocus
              />
              <HelperRow>
                <Helper $error>{nicknameError}</Helper>
                <Counter $error={Boolean(nicknameError)}>
                  {nicknameLength}/{NICKNAME_MAX_LENGTH}
                </Counter>
              </HelperRow>
            </Field>
          </Body>
          <OnboardingBottomCTA
            primary={{
              label: "다음",
              onClick: handleNext,
              disabled: !nickname.trim() || Boolean(nicknameError),
            }}
          />
        </>
      )}

      {step === "department" && (
        <>
          <Body>
            <TitleBlock>
              <Title>어느 학과 소속이신가요?</Title>
              <Subtitle>부/복수전공 선택은 추후 추가될 예정이에요.</Subtitle>
            </TitleBlock>
            <SelectField type="button" onClick={() => setDeptSheetOpen(true)}>
              <SelectText>
                <SelectLabel>학과 (주전공)</SelectLabel>
                <SelectValue $placeholder={!departmentName}>
                  {departmentName || "학과를 선택하세요"}
                </SelectValue>
              </SelectText>
              <Icon name="chevron-down" size={20} />
            </SelectField>
          </Body>
          <OnboardingBottomCTA
            primary={{ label: "다음", onClick: handleNext, disabled: !departmentCode }}
          />
          <DepartmentSelectSheet
            open={deptSheetOpen}
            departments={departmentOptions}
            selectedCode={departmentCode}
            onSelect={(d) => {
              setDepartmentCode(d.code);
              setDepartmentName(d.name);
              setDeptSheetOpen(false);
            }}
            onClose={() => setDeptSheetOpen(false)}
          />
        </>
      )}

      {step === "profile" && (
        <>
          <Body $gap={24}>
            <TitleBlock>
              <Title>프로필 이미지를 골라주세요</Title>
              <Subtitle>마이페이지에서 언제든 바꿀 수 있어요.</Subtitle>
            </TitleBlock>
            <Preview>
              <Avatar src={getProfileImageUrl(fireId)} alt="" $size={64} />
              <PreviewText>
                <PreviewName>{nickname.trim()}</PreviewName>
                {departmentName && <PreviewDept>{departmentName}</PreviewDept>}
              </PreviewText>
            </Preview>
            <ProfileGrid role="radiogroup" aria-label="프로필 이미지">
              {PROFILE_IMAGE_IDS.map((id) => (
                <ProfileOption
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={fireId === id}
                  aria-label={`프로필 이미지 ${id}`}
                  $selected={fireId === id}
                  onClick={() => setFireId(id)}
                >
                  <img src={getProfileImageUrl(id)} alt="" />
                </ProfileOption>
              ))}
            </ProfileGrid>
          </Body>
          <OnboardingBottomCTA primary={{ label: "다음", onClick: handleNext }} />
        </>
      )}

      {step === "confirm" && (
        <>
          <Body $gap={24}>
            <TitleBlock>
              <Title>이대로 시작할까요?</Title>
              <Subtitle>
                {isAcademicVerified
                  ? "이름·학번·학과는 포털에서 불러와서 고칠 수 없어요."
                  : "항목을 누르면 다시 고칠 수 있어요."}
              </Subtitle>
            </TitleBlock>
            <Summary>
              <SummaryRow
                label="이름"
                value={realName}
                onClick={isAcademicVerified ? undefined : () => editFromConfirm("name")}
              />
              {isAcademicVerified && userInfo.studentId && (
                <SummaryRow label="학번" value={userInfo.studentId} />
              )}
              <SummaryRow
                label="닉네임"
                value={nickname.trim()}
                onClick={() => editFromConfirm("nickname")}
              />
              <SummaryRow
                label="학과"
                value={departmentName}
                onClick={isAcademicVerified ? undefined : () => editFromConfirm("department")}
              />
              <SummaryRow
                label="프로필 이미지"
                value={<Avatar src={getProfileImageUrl(fireId)} alt="" $size={32} />}
                onClick={() => editFromConfirm("profile")}
              />
            </Summary>
            {mergedNotice && (
              <Notice>
                <NoticeTitle>신입생 때 쓰던 기록을 합쳤어요</NoticeTitle>
                <NoticeText>{mergedNotice}</NoticeText>
              </Notice>
            )}
          </Body>
          <OnboardingBottomCTA primary={{ label: "시작하기", onClick: () => setTermsOpen(true) }} />
          <ServiceTermsSheet
            open={termsOpen}
            submitting={saving}
            onAgree={handleSave}
            onDismiss={() => setTermsOpen(false)}
          />
        </>
      )}
    </Page>
  );
}

/* Figma Onboarding/Summary_Row 6269:18544 — 누를 수 없는 행은 › 자리만 비워 값 끝을 맞춘다 */
function SummaryRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      <RowLabel>{label}</RowLabel>
      <RowValue>{value}</RowValue>
      <RowChevron $hidden={!onClick} aria-hidden>
        <Icon name="chevron-right" size={20} />
      </RowChevron>
    </>
  );
  return onClick ? (
    <RowButton type="button" onClick={onClick} aria-label={`${label} 고치기`}>
      {content}
    </RowButton>
  ) : (
    <RowStatic>{content}</RowStatic>
  );
}

/* ───────────── styles ───────────── */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(6px, 4px) rotate(-6deg); }
`;

const Page = styled.div`
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding-top: ${SAFE_AREA.TOP};
  background: var(--bg-base);
`;

const Body = styled.main<{ $gap?: number }>`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap ?? 32}px;
  padding: 24px 24px 0;
  animation: ${fadeIn} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
`;

const TitleBlock = styled.div<{ $center?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  text-align: ${({ $center }) => ($center ? "center" : "left")};
`;

const Title = styled.h1`
  margin: 0;
  ${typography.title1}
  color: var(--text-primary);
  white-space: pre-line;
  word-break: keep-all;
`;

const Subtitle = styled.p`
  margin: 0;
  ${typography.body2}
  color: var(--text-tertiary);
  white-space: pre-line;
  word-break: keep-all;
`;

const IntroBody = styled.main`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 0 24px;
  animation: ${fadeIn} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
`;

const IntroImage = styled.img`
  width: 280px;
  height: 280px;
  border-radius: 24px;
  object-fit: cover;
`;

const Dots = styled.div`
  display: flex;
  gap: 6px;
`;

const Dot = styled.span<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? 16 : 6)}px;
  height: 6px;
  border-radius: 3px;
  background: ${({ $active }) =>
    $active ? "var(--interactive-primary)" : "var(--border-default)"};
  transition: width 0.2s ease;
`;

const DoneBody = styled.main`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 0 24px;
  animation: ${fadeIn} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
`;

const Avatar = styled.img<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--bg-subtle);
`;

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HelperRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 0 4px;
`;

const Helper = styled.p<{ $error?: boolean }>`
  flex: 1 0 0;
  min-width: 0;
  margin: 0;
  padding: 0 4px;
  ${typography.caption1}
  color: ${({ $error }) => ($error ? "var(--text-error)" : "var(--text-tertiary)")};

  ${HelperRow} & {
    padding: 0;
  }
`;

const Counter = styled.span<{ $error: boolean }>`
  flex-shrink: 0;
  ${typography.caption1}
  color: ${({ $error }) => ($error ? "var(--text-error)" : "var(--text-tertiary)")};
`;

const SheetContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px 0 10px;
`;

/* Figma lookingup (6304:22848): 창 + 돋보기. 돋보기는 시안처럼 살짝 움직인다 */
const PortalIllustration = styled.div`
  position: relative;
  width: 240px;
  height: 240px;
  flex-shrink: 0;

  .window {
    position: absolute;
    top: 20.76%;
    right: 20.23%;
    bottom: 20.89%;
    left: 20.24%;
    width: 59.53%;
    height: 58.35%;
  }

  .magnifier {
    position: absolute;
    top: 22.12%;
    left: 16.26%;
    width: 26.07%;
    height: 26.07%;
    animation: ${float} 2.4s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .magnifier {
      animation: none;
    }
  }
`;

const SelectField = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 16px 8px 12px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: var(--bg-subtle);
  text-align: left;
  cursor: pointer;
  color: var(--text-tertiary);
  -webkit-tap-highlight-color: transparent;
`;

const SelectText = styled.span`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SelectLabel = styled.span`
  ${typography.caption1}
  color: var(--text-secondary);
`;

const SelectValue = styled.span<{ $placeholder: boolean }>`
  ${typography.body1}
  color: ${({ $placeholder }) => ($placeholder ? "var(--text-disabled)" : "var(--text-primary)")};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Preview = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border-brand-subtle);
  border-radius: 16px;
  background: var(--bg-brand);
`;

const PreviewText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const PreviewName = styled.p`
  margin: 0;
  ${typography.title3}
  color: var(--text-primary);
`;

const PreviewDept = styled.p`
  margin: 0;
  ${typography.body2}
  color: var(--text-tertiary);
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 80px);
  justify-content: space-between;
  row-gap: 8px;
`;

/* Figma Onboarding/Profile_Option: 80 칸 안 72 원, 선택되면 바깥 3px 테두리 */
const ProfileOption = styled.button<{ $selected: boolean }>`
  width: 80px;
  height: 80px;
  padding: 4px;
  border: none;
  background: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  img {
    display: block;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: ${({ $selected }) =>
      $selected ? "0 0 0 3px var(--interactive-primary)" : "none"};
    transition: box-shadow 0.15s ease;
  }
`;

const Summary = styled.div`
  display: flex;
  flex-direction: column;
`;

const rowBase = `
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 56px;
  padding: 16px 0;
  box-sizing: border-box;
`;

const RowButton = styled.button`
  ${rowBase}
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
`;

const RowStatic = styled.div`
  ${rowBase}
`;

const RowLabel = styled.span`
  width: 88px;
  flex-shrink: 0;
  ${typography.body2}
  color: var(--text-tertiary);
`;

const RowValue = styled.span`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  justify-content: flex-end;
  ${typography.label1}
  color: var(--text-primary);
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowChevron = styled.span<{ $hidden: boolean }>`
  display: flex;
  flex-shrink: 0;
  color: var(--text-primary);
  visibility: ${({ $hidden }) => ($hidden ? "hidden" : "visible")};
`;

const Notice = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px;
  border: 1px solid var(--border-brand-subtle);
  border-radius: 16px;
  background: var(--bg-brand);
`;

const NoticeTitle = styled.p`
  margin: 0;
  ${typography.title3}
  color: var(--text-primary);
`;

const NoticeText = styled.p`
  margin: 0;
  ${typography.body2}
  color: var(--text-tertiary);
  white-space: pre-line;
  word-break: keep-all;
`;
