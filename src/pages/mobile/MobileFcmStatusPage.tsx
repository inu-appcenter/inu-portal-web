import styled from "styled-components";
import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";

interface FcmLog {
  status: "success" | "fail";
  timestamp: string;
  token?: string;
  error?: string;
}

export default function MobileFcmStatusPage() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [fcmLog, setFcmLog] = useState<FcmLog | null>(null);

  useHeader({
    title: "알림 설정 확인",
    subHeader: null,
    hasback: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("fcmToken");
    const logStr = localStorage.getItem("fcmSendLog");

    setFcmToken(token);
    if (logStr) {
      try {
        setFcmLog(JSON.parse(logStr));
      } catch (e) {
        console.error("FCM 로그 파싱 실패", e);
      }
    }
  }, []);

  const handleCopyToken = () => {
    if (fcmToken) {
      navigator.clipboard.writeText(fcmToken);
      alert("FCM 토큰이 복사되었습니다.");
    }
  };

  return (
    <Container>
      <Section>
        <Label>현재 발급된 FCM 토큰</Label>
        <TokenWrapper>
          <TokenValue>{fcmToken || "발급된 토큰이 없습니다."}</TokenValue>
          {fcmToken && <CopyButton onClick={handleCopyToken}>복사</CopyButton>}
        </TokenWrapper>
      </Section>

      <Section>
        <Label>최근 전송 결과</Label>
        <StatusBox $status={fcmLog?.status}>
          {fcmLog ? (
            <>
              <StatusRow>
                <span>상태:</span>
                <StatusText $status={fcmLog.status}>
                  {fcmLog.status === "success" ? "성공" : "실패"}
                </StatusText>
              </StatusRow>
              <StatusRow>
                <span>시간:</span>
                <span>{fcmLog.timestamp}</span>
              </StatusRow>
              {fcmLog.error && (
                <StatusRow
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "4px",
                  }}
                >
                  <span>에러 내용:</span>
                  <ErrorText>{fcmLog.error}</ErrorText>
                </StatusRow>
              )}
            </>
          ) : (
            "전송 기록이 없습니다."
          )}
        </StatusBox>
      </Section>

      <InfoBox>
        <p>※ 앱을 완전히 종료 후 다시 실행하면 토큰 전송이 다시 시도됩니다.</p>
        <p>
          ※ 네이티브 앱에서 토큰을 전달받지 못하면 '발급된 토큰이 없습니다'로
          표시됩니다.
        </p>
      </InfoBox>
    </Container>
  );
}

const Container = styled.div`
  padding: 20px;
  background-color: #f8f9fa;
  min-height: calc(100vh - 100px);
`;

const Section = styled.div`
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Label = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 600;
`;

const TokenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TokenValue = styled.div`
  background: #f1f3f5;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  word-break: break-all;
  line-height: 1.5;
  color: #444;
  border: 1px solid #e9ecef;
`;

const CopyButton = styled.button`
  align-self: flex-end;
  background: #3b5bdb;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  &:active {
    opacity: 0.8;
  }
`;

const StatusBox = styled.div<{ $status?: "success" | "fail" }>`
  font-size: 14px;
  color: #444;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusText = styled.span<{ $status?: "success" | "fail" }>`
  font-weight: 700;
  color: ${(props) => (props.$status === "success" ? "#2b8a3e" : "#e03131")};
`;

const ErrorText = styled.div`
  background: #fff5f5;
  color: #e03131;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  width: 100%;
  box-sizing: border-box;
`;

const InfoBox = styled.div`
  margin-top: 32px;
  font-size: 12px;
  color: #868e96;
  line-height: 1.6;
  p {
    margin: 4px 0;
  }
`;
