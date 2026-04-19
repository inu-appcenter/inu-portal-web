import { useEffect, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { Plus, RefreshCcw, Bell, CheckCircle2, AlertCircle, Clock } from "lucide-react";

import useUserStore from "@/stores/useUserStore.ts";
import useMobileNavigate from "@/hooks/useMobileNavigate.ts";
import {
  getFcmAdminLogResult,
  getFcmAdminLogs,
  sendFcmAdminNotification,
} from "@/apis/admin.ts";
import {
  FcmAdminLogData,
  FcmSendRequest,
  FcmSendStatus,
} from "@/types/admin.ts";
import { useHeader } from "@/context/HeaderContext.tsx";
import { SOFT_CARD_SHADOW } from "@/styles/shadows";
import AdminLayout from "@/components/admin/AdminLayout";
import NotificationFormModal from "@/containers/mobile/admin/NotificationFormModal";
import AdminModal from "@/components/admin/AdminModal";

const STATUS_CONFIG: Record<
  FcmSendStatus,
  { label: string; color: string; bg: string; icon: any }
> = {
  PENDING: { label: "처리 중", color: "#3b82f6", bg: "#eff6ff", icon: Clock },
  SUCCESS: { label: "성공", color: "#10b981", bg: "#ecfdf5", icon: CheckCircle2 },
  PARTIAL_FAILURE: { label: "부분 실패", color: "#f59e0b", bg: "#fffbeb", icon: AlertCircle },
  FAILED: { label: "실패", color: "#ef4444", bg: "#fef2f2", icon: AlertCircle },
  NO_TARGET: { label: "대상 없음", color: "#64748b", bg: "#f8fafc", icon: AlertCircle },
};

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export default function MobileAdminNotificationPage() {
  const mobilenavigate = useMobileNavigate();
  const { tokenInfo, userInfo } = useUserStore();

  const [logs, setLogs] = useState<FcmAdminLogData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState("");
  const [selectedLog, setSelectedLog] = useState<FcmAdminLogData | null>(null);

  useHeader({
    title: "푸시 알림 전송",
  });

  useEffect(() => {
    if (!tokenInfo.accessToken || userInfo.role !== "admin") {
      mobilenavigate("/home");
    }
  }, [mobilenavigate, tokenInfo.accessToken, userInfo.role]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await getFcmAdminLogs(1);
      setLogs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenInfo.accessToken && userInfo.role === "admin") {
      void fetchLogs();
    }
  }, [tokenInfo.accessToken, userInfo.role]);

  const pollSendResult = async (fcmMessageId: number) => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const response = await getFcmAdminLogResult(fcmMessageId);
      const result = response.data;
      if (result.status !== "PENDING") return result;
      await sleep(1200);
    }
    return null;
  };

  const handleSendRequest = async (request: FcmSendRequest) => {
    try {
      setSending(true);
      setSendMessage("발송 요청 중...");
      const response = await sendFcmAdminNotification(request);
      const fcmMessageId = response.data;
      
      setSendMessage("전송 결과를 확인하고 있습니다...");
      const result = await pollSendResult(fcmMessageId);

      if (result) {
        setSendMessage(`발송 완료: ${STATUS_CONFIG[result.status].label}`);
        setSelectedLog(result); // 결과를 바로 모달로 보여줌
      } else {
        setSendMessage("발송 요청이 접수되었습니다. 목록에서 상태를 확인하세요.");
      }

      setIsFormOpen(false);
      await fetchLogs();
    } catch (error) {
      console.error(error);
      alert("전송 실패");
    } finally {
      setSending(false);
      setSendMessage("");
    }
  };

  return (
    <AdminLayout>
      <PageHeader>
        <HeaderActions>
          <RefreshBtn onClick={fetchLogs} disabled={loading}>
            <LoadingIcon size={18} $loading={loading} />
            <span>새로고침</span>
          </RefreshBtn>
          <CreateBtn onClick={() => setIsFormOpen(true)}>
            <Plus size={20} />
            <span>새 알림 발송</span>
          </CreateBtn>
        </HeaderActions>
      </PageHeader>

      <LogsContainer>
        {logs.length > 0 ? (
          <LogList>
            {logs.map((log) => {
              const status = STATUS_CONFIG[log.status];
              return (
                <LogCard key={log.id} onClick={() => setSelectedLog(log)}>
                  <LogIconBox $bg={status.bg} $color={status.color}>
                    <status.icon size={20} />
                  </LogIconBox>
                  <LogMainInfo>
                    <LogHeaderRow>
                      <LogTitle>{log.title}</LogTitle>
                      <StatusBadge $bg={status.bg} $color={status.color}>
                        {status.label}
                      </StatusBadge>
                    </LogHeaderRow>
                    <LogBody>{log.body}</LogBody>
                    <LogMeta>
                      <MetaItem>대상 {log.targetCount}명</MetaItem>
                      <MetaItem>성공 {log.sendCount}명</MetaItem>
                      <MetaItem>실패 {log.failureCount}명</MetaItem>
                    </LogMeta>
                  </LogMainInfo>
                </LogCard>
              );
            })}
          </LogList>
        ) : (
          <EmptyState>
            <Bell size={48} color="#e2e8f0" />
            <p>{loading ? "불러오는 중..." : "전송 이력이 없습니다."}</p>
          </EmptyState>
        )}
      </LogsContainer>

      <NotificationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSend={handleSendRequest}
        sending={sending}
        sendMessage={sendMessage}
      />

      <AdminModal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="발송 결과 상세"
      >
        {selectedLog && (
          <DetailView>
            <DetailItem>
              <DetailLabel>알림 제목</DetailLabel>
              <DetailValue>{selectedLog.title}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>알림 내용</DetailLabel>
              <DetailValue style={{ whiteSpace: "pre-wrap" }}>{selectedLog.body}</DetailValue>
            </DetailItem>
            <Divider />
            <StatsRow>
              <StatItem>
                <StatVal>{selectedLog.targetCount}</StatVal>
                <StatLab>총 대상</StatLab>
              </StatItem>
              <StatItem>
                <StatVal style={{ color: "#10b981" }}>{selectedLog.sendCount}</StatVal>
                <StatLab>성공</StatLab>
              </StatItem>
              <StatItem>
                <StatVal style={{ color: "#ef4444" }}>{selectedLog.failureCount}</StatVal>
                <StatLab>실패</StatLab>
              </StatItem>
            </StatsRow>
          </DetailView>
        )}
      </AdminModal>
    </AdminLayout>
  );
}

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
`;



const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const CreateBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #0f766e;
  color: #fff;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.2s;

  &:hover { background-color: #0d9488; transform: translateY(-1px); }
`;

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #fff;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover { background-color: #f8fafc; color: #0f172a; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoadingIcon = styled(RefreshCcw)<{ $loading: boolean }>`
  animation: ${props => props.$loading ? css`${spin} 1s linear infinite` : "none"};
`;

const LogsContainer = styled.div``;

const LogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LogCard = styled.div`
  display: flex;
  gap: 16px;
  background: #fff;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${SOFT_CARD_SHADOW};

  &:hover {
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 8px 16px -4px rgba(15, 23, 42, 0.08);
  }
`;

const LogIconBox = styled.div<{ $bg: string; $color: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: ${(props) => props.$bg};
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const LogMainInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const LogHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

const LogTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusBadge = styled.span<{ $bg: string; $color: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  background-color: ${(props) => props.$bg};
  color: ${(props) => props.$color};
  flex-shrink: 0;
`;

const LogBody = styled.p`
  margin: 4px 0 10px;
  font-size: 0.875rem;
  color: #64748b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
`;

const LogMeta = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  color: #94a3b8;
  gap: 16px;
  p { font-size: 0.95rem; font-weight: 500; }
`;

const DetailView = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DetailItem = styled.div``;

const DetailLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

const DetailValue = styled.div`
  font-size: 1rem;
  color: #1e293b;
  line-height: 1.5;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #f1f5f9;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const StatItem = styled.div`
  text-align: center;
  background-color: #f8fafc;
  padding: 12px;
  border-radius: 12px;
`;

const StatVal = styled.div`
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
`;

const StatLab = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
`;


