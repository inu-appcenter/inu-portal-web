import { useState } from "react";
import styled from "styled-components";
import BottomSheet from "@/components/common/BottomSheet";
import InputField from "@/components/common/InputField";
import { PortalSyncConsentSheet } from "@/components/common/PortalSyncConsentSheet";
import OnboardingBottomCTA from "@/components/mobile/onboarding/OnboardingBottomCTA";
import PortalLookupIllustration from "@/components/mobile/onboarding/PortalLookupIllustration";
import {
  Subtitle,
  Title,
  TitleBlock,
} from "@/components/mobile/onboarding/onboardingText";
import {
  checkPortalAccountLinked,
  deletePortalAccount,
  fetchFullAcademicReportFromApp,
  isMobileAppEnvironment,
  savePortalAccount,
} from "@/apis/mobileAgentBridge";
import { typography } from "@/styles/typography";
import { isCredentialError } from "@/utils/portalCredential";
import {
  hasPortalSyncConsent,
  recordPortalSyncConsent,
} from "@/utils/portalSyncConsent";

type CourseGrades = NonNullable<
  Awaited<ReturnType<typeof fetchFullAcademicReportFromApp>>["data"]
>["courseGrades"];

/**
 * confirm: 덮어쓰기 안내 / account: 포털 계정 등록 / loading: 성적 불러오는 중 / error: 실패
 * 온보딩 퍼널의 포털 계정 등록(Figma 08 · lookingup 6304:22848)과 같은 시트·문구·버튼을 쓴다.
 */
type Phase = "confirm" | "account" | "loading" | "error";

interface PortalGradeImportSheetProps {
  open: boolean;
  onClose: () => void;
  /** 불러온 과목별 성적. 계산기에 넣는 건 페이지가 맡는다. */
  onImported: (courseGrades: CourseGrades) => void;
}

const LOAD_ERROR = "포털 성적을 불러오지 못했어요. 잠시 후 다시 시도해주세요.";

export default function PortalGradeImportSheet({
  open,
  onClose,
  onImported,
}: PortalGradeImportSheetProps) {
  const [phase, setPhase] = useState<Phase>("confirm");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [accountError, setAccountError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [consentOpen, setConsentOpen] = useState(false);
  /** 동의 시트에서 돌아온 뒤 이어서 할 일 */
  const [afterConsent, setAfterConsent] = useState<"start" | "account">("start");

  const isAppEnv = isMobileAppEnvironment();
  const isLoading = phase === "loading";

  // 닫힐 때마다 처음 상태로 돌린다. 비밀번호는 남기지 않는다.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      setPhase("confirm");
      setPassword("");
      setAccountError("");
      setLoadError("");
    }
  }

  const loadGrades = async () => {
    setPhase("loading");
    setLoadError("");
    try {
      const res = await fetchFullAcademicReportFromApp();
      if (!res.success || !res.data) {
        if (res.errorCode === "AUTH_REQUIRED") {
          setPhase("account");
          return;
        }
        throw new Error(res.errorMessage || LOAD_ERROR);
      }
      onImported(res.data.courseGrades);
    } catch (e) {
      setLoadError(e instanceof Error && e.message ? e.message : LOAD_ERROR);
      setPhase("error");
    }
  };

  const start = async () => {
    if (!hasPortalSyncConsent()) {
      setAfterConsent("start");
      setConsentOpen(true);
      return;
    }
    const linked = await checkPortalAccountLinked().catch(() => false);
    if (!linked) {
      setPhase("account");
      return;
    }
    await loadGrades();
  };

  const submitAccount = async () => {
    const id = studentId.trim();
    if (!id || !password) return;
    if (!hasPortalSyncConsent()) {
      setAfterConsent("account");
      setConsentOpen(true);
      return;
    }

    setPhase("loading");
    setAccountError("");
    const saveRes = await savePortalAccount(id, password);
    if (!saveRes.success) {
      setAccountError(saveRes.errorMessage || "계정을 등록하지 못했어요.");
      setPhase("account");
      return;
    }

    const res = await fetchFullAcademicReportFromApp();
    if (!res.success || !res.data) {
      const message = res.errorMessage || "";
      if (isCredentialError(message)) {
        await deletePortalAccount().catch(() => {});
        setAccountError("학번 또는 비밀번호가 맞지 않아요. 다시 확인해주세요.");
        setPhase("account");
        return;
      }
      setLoadError(message || LOAD_ERROR);
      setPhase("error");
      return;
    }
    setPassword("");
    onImported(res.data.courseGrades);
  };

  return (
    <>
      <BottomSheet
        open={open && !consentOpen}
        onOpenChange={(next) => {
          if (!next && !isLoading) onClose();
        }}
        // 불러오는 중에는 닫지 못하게 한다(응답이 와도 넣을 곳이 없어진다).
        dismissible={!isLoading}
        closeOnBack={!isLoading}
        repositionInputs={phase === "account"}
        handle="compact"
      >
        <SheetContent>
          {phase === "confirm" && (
            <>
              <TitleBlock $center>
                <Title>포털에서 성적을 가져올게요</Title>
                <Subtitle>
                  {
                    "전체 학기 성적표를 불러와 지금 입력된 과목을\n포털 성적으로 모두 바꿔요."
                  }
                </Subtitle>
              </TitleBlock>
              <PortalLookupIllustration />
              {isAppEnv ? (
                <OnboardingBottomCTA
                  placement="inline"
                  caption="계정 정보는 기기에만 저장되며, 포털에 직접 요청합니다."
                  secondary={{ label: "취소", onClick: onClose }}
                  primary={{ label: "가져오기", onClick: () => void start() }}
                />
              ) : (
                <OnboardingBottomCTA
                  placement="inline"
                  caption="포털 성적 가져오기는 INTIP 앱에서 할 수 있어요"
                  primary={{ label: "확인", onClick: onClose }}
                />
              )}
            </>
          )}

          {phase === "loading" && (
            <>
              <TitleBlock $center>
                <Title>포털에서 성적을 불러오고 있어요</Title>
                <Subtitle>
                  {"학기가 많으면 30초쯤 걸려요.\n이 화면을 닫지 말고 기다려주세요."}
                </Subtitle>
              </TitleBlock>
              <PortalLookupIllustration />
              <OnboardingBottomCTA
                placement="inline"
                primary={{ label: "불러오는 중…", onClick: () => {}, disabled: true }}
              />
            </>
          )}

          {phase === "account" && (
            <>
              <TitleBlock>
                <Title>포털 계정 등록</Title>
                <Subtitle>
                  {
                    "성적을 가져오려면 인천대학교 포털 계정이 필요해요.\n한 번 등록하면 학적·LMS·도서관 기능도 바로 쓸 수 있어요."
                  }
                </Subtitle>
              </TitleBlock>
              <Fields>
                <InputField
                  label="학번"
                  type="text"
                  inputMode="numeric"
                  autoComplete="username"
                  placeholder="입력하세요"
                  value={studentId}
                  onChange={(v) => {
                    setStudentId(v.replace(/\D/g, ""));
                    setAccountError("");
                  }}
                  error={Boolean(accountError)}
                />
                <InputField
                  label="비밀번호"
                  type="password"
                  autoComplete="current-password"
                  placeholder="입력하세요"
                  value={password}
                  onChange={(v) => {
                    setPassword(v);
                    setAccountError("");
                  }}
                  error={Boolean(accountError)}
                />
                {accountError && <ErrorText>{accountError}</ErrorText>}
              </Fields>
              <OnboardingBottomCTA
                placement="inline"
                caption="계정 정보는 기기에만 저장되며, 포털에 직접 요청합니다."
                primary={{
                  label: "다음",
                  onClick: () => void submitAccount(),
                  disabled: !studentId.trim() || !password,
                }}
              />
            </>
          )}

          {phase === "error" && (
            <>
              <TitleBlock $center>
                <Title>성적을 불러오지 못했어요</Title>
                <Subtitle>{loadError}</Subtitle>
              </TitleBlock>
              <PortalLookupIllustration />
              <OnboardingBottomCTA
                placement="inline"
                secondary={{ label: "닫기", onClick: onClose }}
                primary={{ label: "다시 시도", onClick: () => void start() }}
              />
            </>
          )}
        </SheetContent>
      </BottomSheet>

      <PortalSyncConsentSheet
        open={consentOpen}
        ctaLabel="동의하고 가져오기"
        onAgree={(choice) => {
          recordPortalSyncConsent(choice);
          setConsentOpen(false);
          if (afterConsent === "account") void submitAccount();
          else void start();
        }}
        onDismiss={() => setConsentOpen(false)}
      />
    </>
  );
}

const SheetContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px 0 10px;
`;

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const ErrorText = styled.p`
  ${typography.caption1}
  margin: 0;
  padding: 0 4px;
  color: var(--text-error);
`;
