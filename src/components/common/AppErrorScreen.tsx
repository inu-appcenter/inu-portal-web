import { useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  HiOutlineClipboardDocument,
  HiOutlineExclamationTriangle,
  HiOutlineHome,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { ROUTES } from "@/constants/routes";

interface AppErrorScreenProps {
  error: unknown;
  componentStack?: string;
}

interface ParsedError {
  message: string;
  detail: string;
  stack: string;
}

const DEFAULT_ERROR_MESSAGE =
  "예상치 못한 문제가 발생해 페이지를 정상적으로 불러오지 못했어요.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringifyValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value == null) {
    return "";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function parseError(error: unknown): ParsedError {
  if (error instanceof Error) {
    return {
      message: error.message || DEFAULT_ERROR_MESSAGE,
      detail: error.name,
      stack: error.stack ?? "",
    };
  }

  if (isRecord(error)) {
    const status =
      typeof error.status === "number" ? `HTTP ${error.status}` : "";
    const statusText =
      typeof error.statusText === "string" ? error.statusText : "";
    const message =
      typeof error.message === "string"
        ? error.message
        : typeof error.data === "string"
          ? error.data
          : DEFAULT_ERROR_MESSAGE;
    const detail = stringifyValue(error.data) || statusText || status;
    const stack = typeof error.stack === "string" ? error.stack : "";

    return {
      message: message || DEFAULT_ERROR_MESSAGE,
      detail,
      stack,
    };
  }

  return {
    message: DEFAULT_ERROR_MESSAGE,
    detail: stringifyValue(error),
    stack: "",
  };
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export default function AppErrorScreen({
  error,
  componentStack,
}: AppErrorScreenProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const { message, detail, stack } = parseError(error);
  const currentUrl = window.location.href;
  const occurredAt = new Date().toLocaleString("ko-KR");
  const errorText = [
    "[INTIP 오류 제보용 정보]",
    `발생 시각: ${occurredAt}`,
    `페이지 주소: ${currentUrl}`,
    `오류 메시지: ${message}`,
    detail ? `오류 상세: ${detail}` : "",
    stack ? `오류 스택:\n${stack}` : "",
    componentStack ? `컴포넌트 스택:\n${componentStack}` : "",
    `브라우저: ${navigator.userAgent}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const handleCopy = async () => {
    try {
      await copyToClipboard(errorText);
      setCopyStatus("success");
    } catch (copyError) {
      console.error("오류 내용 복사 실패", copyError);
      setCopyStatus("error");
    }
  };

  const handleGoHome = () => {
    window.location.assign(ROUTES.HOME);
  };

  return (
    <ScreenWrapper>
      <AmbientOrb className="left" />
      <AmbientOrb className="right" />

      <ErrorCard>
        <Badge>
          <HiOutlineSparkles aria-hidden="true" />
          INTIP Error Notice
        </Badge>

        <HeroSection>
          <IconWrap aria-hidden="true">
            <HiOutlineExclamationTriangle />
          </IconWrap>
          <div>
            <Title>앗, 화면을 불러오던 중 문제가 생겼어요</Title>
            <Description>
              잠시 후 다시 시도해 주세요. 문제가 계속되면{" "}
              <strong>오류 내용 복사하기</strong> 버튼으로 내용을 복사한 뒤
              <strong> 마이페이지 &gt; 1대1 문의하기</strong>로 개발자에게
              전달해 주세요.
            </Description>
          </div>
        </HeroSection>

        <SummaryPanel>
          <SummaryLabel>오류 요약</SummaryLabel>
          <SummaryMessage>{message}</SummaryMessage>
          {detail ? <SummaryDetail>{detail}</SummaryDetail> : null}
        </SummaryPanel>

        <DetailPanel>
          <DetailHeader>
            <span>개발자 전달용 오류 정보</span>
            <small>{occurredAt}</small>
          </DetailHeader>
          <DetailBody>{errorText}</DetailBody>
        </DetailPanel>

        <ActionRow>
          <SecondaryButton type="button" onClick={handleCopy}>
            <HiOutlineClipboardDocument aria-hidden="true" />
            {copyStatus === "success"
              ? "오류 내용 복사 완료"
              : "오류 내용 복사하기"}
          </SecondaryButton>
          <PrimaryButton type="button" onClick={handleGoHome}>
            <HiOutlineHome aria-hidden="true" />
            홈으로 가기
          </PrimaryButton>
        </ActionRow>

        <FooterText>
          {copyStatus === "error"
            ? "복사에 실패했어요. 잠시 후 다시 시도해 주세요."
            : "복사한 내용을 함께 보내주시면 원인 확인이 훨씬 빨라져요."}
        </FooterText>
      </ErrorCard>
    </ScreenWrapper>
  );
}

const float = keyframes`
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(0, -18px, 0) scale(1.03);
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
`;

const ScreenWrapper = styled.main`
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(131, 185, 255, 0.28), transparent 40%),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 48%, #e6edf7 100%);
`;

const AmbientOrb = styled.div`
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  filter: blur(18px);
  opacity: 0.75;
  animation: ${float} 7s ease-in-out infinite;

  &.left {
    top: 8%;
    left: -80px;
    background: radial-gradient(circle, rgba(79, 137, 221, 0.28) 0%, transparent 72%);
  }

  &.right {
    right: -60px;
    bottom: 8%;
    background: radial-gradient(circle, rgba(255, 157, 110, 0.24) 0%, transparent 70%);
    animation-delay: 1.5s;
  }
`;

const ErrorCard = styled.section`
  position: relative;
  z-index: 1;
  width: min(100%, 760px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px 22px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.82);
  box-shadow:
    0 24px 60px rgba(28, 57, 105, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  @media (min-width: 768px) {
    padding: 36px;
  }
`;

const Badge = styled.div`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(54, 108, 192, 0.08);
  color: #335a96;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;

  svg {
    font-size: 14px;
  }
`;

const HeroSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const IconWrap = styled.div`
  width: 68px;
  height: 68px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: linear-gradient(135deg, #1f5fbf 0%, #5f9cff 100%);
  color: #ffffff;
  box-shadow: 0 18px 32px rgba(58, 114, 201, 0.3);

  svg {
    font-size: 34px;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #16335b;
  font-size: clamp(28px, 4vw, 38px);
  font-weight: 900;
  line-height: 1.12;
  letter-spacing: -0.03em;
`;

const Description = styled.p`
  margin: 12px 0 0;
  color: #526b8f;
  font-size: 15px;
  line-height: 1.7;
  word-break: keep-all;

  strong {
    color: #1b4f98;
    font-weight: 800;
  }
`;

const SummaryPanel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(244, 248, 255, 0.96) 0%, rgba(234, 241, 252, 0.98) 100%);
  border: 1px solid rgba(211, 223, 241, 0.95);
`;

const SummaryLabel = styled.span`
  color: #4d6a93;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
`;

const SummaryMessage = styled.p`
  margin: 0;
  color: #173861;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.45;
  word-break: break-word;
`;

const SummaryDetail = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.6;
  color: #59729a;
`;

const DetailPanel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #4b668f;
  font-size: 13px;
  font-weight: 800;

  small {
    color: #8197b6;
    font-size: 12px;
    font-weight: 600;
  }
`;

const DetailBody = styled.pre`
  margin: 0;
  padding: 16px;
  min-height: 180px;
  max-height: 280px;
  overflow: auto;
  border-radius: 20px;
  background: #0f2038;
  color: #e2ecff;
  font-size: 12px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
`;

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const BaseButton = styled.button`
  min-height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 18px;
  border-radius: 18px;
  font-size: 15px;
  font-weight: 800;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;

  &:active {
    transform: scale(0.985);
  }

  svg {
    font-size: 18px;
  }
`;

const SecondaryButton = styled(BaseButton)`
  color: #28568f;
  background: #eff5ff;
  border: 1px solid #d4e1f5;
  box-shadow: 0 10px 22px rgba(27, 79, 152, 0.08);
`;

const PrimaryButton = styled(BaseButton)`
  color: #ffffff;
  background: linear-gradient(135deg, #1f5fbf 0%, #4f87de 100%);
  box-shadow: 0 16px 30px rgba(31, 95, 191, 0.28);
`;

const FooterText = styled.p`
  margin: -4px 0 0;
  color: #6e84a6;
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
  word-break: keep-all;
`;
