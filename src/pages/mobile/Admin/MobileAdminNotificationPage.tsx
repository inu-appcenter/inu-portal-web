import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import useUserStore from "@/stores/useUserStore.ts";
import useMobileNavigate from "@/hooks/useMobileNavigate.ts";
import {
  getFcmAdminLogResult,
  getFcmAdminLogs,
  sendFcmAdminNotification,
} from "@/apis/admin.ts";
import {
  AdminNotificationTargetType,
  FcmAdminLogData,
  FcmSendRequest,
  FcmSendStatus,
} from "@/types/admin.ts";
import { useHeader } from "@/context/HeaderContext.tsx";
import { navBarList } from "old/resource/string/navBarList";

type DepartmentNode = {
  title?: string;
  code?: string;
  child?: DepartmentNode[];
  subItems?: DepartmentNode[];
};

type DepartmentOption = {
  label: string;
  value: string;
};

const TARGET_OPTIONS: Array<{
  value: AdminNotificationTargetType;
  label: string;
  description: string;
}> = [
  {
    value: "ALL",
    label: "전체",
    description: "저장된 모든 토큰으로 전송합니다.",
  },
  {
    value: "LOGGED_IN",
    label: "로그인 회원",
    description: "회원 계정과 연결된 토큰으로만 전송합니다.",
  },
  {
    value: "LOGGED_OUT",
    label: "로그아웃 회원",
    description: "회원 계정과 연결되지 않은 토큰으로만 전송합니다.",
  },
  {
    value: "MEMBERS",
    label: "회원 ID",
    description: "쉼표나 줄바꿈으로 회원 ID를 입력해 전송합니다.",
  },
  {
    value: "STUDENT_IDS",
    label: "학번",
    description: "쉼표나 줄바꿈으로 학번을 입력해 전송합니다.",
  },
  {
    value: "DEPARTMENTS",
    label: "학과",
    description: "선택한 학과 회원만 대상으로 전송합니다.",
  },
];

const STATUS_META: Record<
  FcmSendStatus,
  { label: string; tone: "blue" | "green" | "amber" | "red" | "gray" }
> = {
  PENDING: { label: "처리 중", tone: "blue" },
  SUCCESS: { label: "성공", tone: "green" },
  PARTIAL_FAILURE: { label: "부분 실패", tone: "amber" },
  FAILED: { label: "실패", tone: "red" },
  NO_TARGET: { label: "대상 없음", tone: "gray" },
};

const parseListInput = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const sleep = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

const extractDepartmentOptions = (items: DepartmentNode[]): DepartmentOption[] => {
  const options: DepartmentOption[] = [];
  const seen = new Set<string>();

  const traverse = (nodes: DepartmentNode[]) => {
    nodes.forEach((node) => {
      if (node.code && node.title && !seen.has(node.code)) {
        seen.add(node.code);
        options.push({ label: node.title, value: node.code });
      }

      if (Array.isArray(node.child)) {
        traverse(node.child);
      }

      if (Array.isArray(node.subItems)) {
        traverse(node.subItems);
      }
    });
  };

  traverse(items);
  return options;
};

const buildTargetSummary = (
  targetType: AdminNotificationTargetType,
  memberIds: number[],
  studentIds: string[],
  departments: string[],
) => {
  switch (targetType) {
    case "ALL":
      return "전체 토큰";
    case "LOGGED_IN":
      return "로그인 회원";
    case "LOGGED_OUT":
      return "로그아웃 회원";
    case "MEMBERS":
      return `회원 ID ${memberIds.length}명`;
    case "STUDENT_IDS":
      return `학번 ${studentIds.length}명`;
    case "DEPARTMENTS":
      return `학과 ${departments.length}개`;
  }
};

export default function MobileAdminNotificationPage() {
  const mobilenavigate = useMobileNavigate();
  const { tokenInfo, userInfo } = useUserStore();

  const [logs, setLogs] = useState<FcmAdminLogData[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetType, setTargetType] =
    useState<AdminNotificationTargetType>("ALL");
  const [memberIdInput, setMemberIdInput] = useState("");
  const [studentIdInput, setStudentIdInput] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [latestResult, setLatestResult] = useState<FcmAdminLogData | null>(
    null,
  );
  const [sendMessage, setSendMessage] = useState("");

  const departmentOptions = useMemo(
    () => extractDepartmentOptions(navBarList as DepartmentNode[]),
    [],
  );

  useHeader({
    title: "푸시알림 전송",
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
      alert("푸시 알림 이력을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenInfo.accessToken && userInfo.role === "admin") {
      void fetchLogs();
    }
  }, [tokenInfo.accessToken, userInfo.role]);

  const toggleDepartment = (departmentCode: string) => {
    setSelectedDepartments((current) =>
      current.includes(departmentCode)
        ? current.filter((item) => item !== departmentCode)
        : [...current, departmentCode],
    );
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTargetType("ALL");
    setMemberIdInput("");
    setStudentIdInput("");
    setSelectedDepartments([]);
  };

  const buildRequest = (): FcmSendRequest | null => {
    const parsedMemberIds = Array.from(
      new Set(
        parseListInput(memberIdInput)
          .map((id) => Number.parseInt(id, 10))
          .filter((id) => Number.isInteger(id)),
      ),
    );
    const parsedStudentIds = Array.from(new Set(parseListInput(studentIdInput)));

    switch (targetType) {
      case "ALL":
      case "LOGGED_IN":
      case "LOGGED_OUT":
        return {
          targetType,
          title: title.trim(),
          content: content.trim(),
        };
      case "MEMBERS":
        if (parsedMemberIds.length === 0) {
          alert("전송할 회원 ID를 하나 이상 입력해주세요.");
          return null;
        }
        return {
          targetType,
          memberIds: parsedMemberIds,
          title: title.trim(),
          content: content.trim(),
        };
      case "STUDENT_IDS":
        if (parsedStudentIds.length === 0) {
          alert("전송할 학번을 하나 이상 입력해주세요.");
          return null;
        }
        return {
          targetType,
          studentIds: parsedStudentIds,
          title: title.trim(),
          content: content.trim(),
        };
      case "DEPARTMENTS":
        if (selectedDepartments.length === 0) {
          alert("전송할 학과를 하나 이상 선택해주세요.");
          return null;
        }
        return {
          targetType,
          departments: selectedDepartments,
          title: title.trim(),
          content: content.trim(),
        };
    }
  };

  const pollSendResult = async (fcmMessageId: number) => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const response = await getFcmAdminLogResult(fcmMessageId);
      const result = response.data;

      if (result.status !== "PENDING") {
        return result;
      }

      await sleep(1200);
    }

    return null;
  };

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    const request = buildRequest();
    if (!request) {
      return;
    }

    const summary = buildTargetSummary(
      request.targetType,
      request.memberIds ?? [],
      request.studentIds ?? [],
      request.departments ?? [],
    );

    const isConfirmed = window.confirm(
      `${summary} 대상으로 푸시 알림을 전송할까요?`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setSending(true);
      setSendMessage("전송 요청을 접수했습니다. 결과를 확인하고 있습니다.");
      const response = await sendFcmAdminNotification(request);
      const fcmMessageId = response.data;
      const result = await pollSendResult(fcmMessageId);

      if (result) {
        setLatestResult(result);
        setSendMessage(
          `${STATUS_META[result.status].label} - 대상 ${result.targetCount}, 성공 ${result.sendCount}, 실패 ${result.failureCount}`,
        );
      } else {
        setLatestResult(null);
        setSendMessage("전송 요청은 접수되었습니다. 최종 결과는 아래 이력에서 확인해주세요.");
      }

      resetForm();
      await fetchLogs();
    } catch (error) {
      console.error(error);
      setSendMessage("푸시 알림 전송 중 오류가 발생했습니다.");
      alert("푸시 알림 전송 중 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  };

  const renderTargetInput = () => {
    if (targetType === "MEMBERS") {
      return (
        <FormGroup>
          <Label>회원 ID</Label>
          <TextArea
            rows={4}
            placeholder="예: 1, 2, 3 또는 줄바꿈으로 구분"
            value={memberIdInput}
            onChange={(event) => setMemberIdInput(event.target.value)}
          />
          <FieldHint>쉼표 또는 줄바꿈으로 여러 회원 ID를 입력할 수 있습니다.</FieldHint>
        </FormGroup>
      );
    }

    if (targetType === "STUDENT_IDS") {
      return (
        <FormGroup>
          <Label>학번</Label>
          <TextArea
            rows={4}
            placeholder="예: 201900001, 202000002"
            value={studentIdInput}
            onChange={(event) => setStudentIdInput(event.target.value)}
          />
          <FieldHint>쉼표 또는 줄바꿈으로 여러 학번을 입력할 수 있습니다.</FieldHint>
        </FormGroup>
      );
    }

    if (targetType === "DEPARTMENTS") {
      return (
        <FormGroup>
          <Label>학과 선택</Label>
          <DepartmentGrid>
            {departmentOptions.map((department) => (
              <DepartmentChip
                key={department.value}
                type="button"
                $selected={selectedDepartments.includes(department.value)}
                onClick={() => toggleDepartment(department.value)}
              >
                {department.label}
              </DepartmentChip>
            ))}
          </DepartmentGrid>
          <FieldHint>
            선택된 학과 코드:{" "}
            {selectedDepartments.length > 0
              ? selectedDepartments.join(", ")
              : "없음"}
          </FieldHint>
        </FormGroup>
      );
    }

    return (
      <FieldHintBox>
        {TARGET_OPTIONS.find((option) => option.value === targetType)?.description}
      </FieldHintBox>
    );
  };

  return (
    <Wrapper>
      <Content>
        <SectionCard>
          <CardTitle>푸시알림 보내기</CardTitle>

          <FormGroup>
            <Label>대상</Label>
            <TargetGrid>
              {TARGET_OPTIONS.map((option) => (
                <TargetButton
                  key={option.value}
                  type="button"
                  $selected={targetType === option.value}
                  onClick={() => setTargetType(option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </TargetButton>
              ))}
            </TargetGrid>
          </FormGroup>

          {renderTargetInput()}

          <FormGroup>
            <Label>제목</Label>
            <Input
              type="text"
              placeholder="푸시 제목을 입력해주세요"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>내용</Label>
            <TextArea
              rows={4}
              placeholder="푸시 내용을 입력해주세요"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </FormGroup>

          <SendButton type="button" onClick={handleSend} disabled={sending}>
            {sending ? "전송 중..." : "전송하기"}
          </SendButton>

          {sendMessage && <StatusMessage>{sendMessage}</StatusMessage>}
        </SectionCard>

        {latestResult && (
          <SectionCard>
            <CardHeader>
              <CardTitle>방금 전송한 결과</CardTitle>
              <StatusBadge $tone={STATUS_META[latestResult.status].tone}>
                {STATUS_META[latestResult.status].label}
              </StatusBadge>
            </CardHeader>
            <LogTitle>{latestResult.title}</LogTitle>
            <LogBody>{latestResult.body}</LogBody>
            <MetricRow>
              <MetricPill>대상 {latestResult.targetCount}</MetricPill>
              <MetricPill $variant="success">
                성공 {latestResult.sendCount}
              </MetricPill>
              <MetricPill $variant="failure">
                실패 {latestResult.failureCount}
              </MetricPill>
            </MetricRow>
          </SectionCard>
        )}

        <SectionCard>
          <CardHeader>
            <CardTitle>최근 전송 이력</CardTitle>
            <RefreshButton type="button" onClick={() => void fetchLogs()} disabled={loading}>
              {loading ? "불러오는 중..." : "새로고침"}
            </RefreshButton>
          </CardHeader>

          <LogList>
            {logs.length > 0 ? (
              logs.map((log) => (
                <LogItem key={log.id}>
                  <LogTopRow>
                    <LogTitle>{log.title}</LogTitle>
                    <StatusBadge $tone={STATUS_META[log.status].tone}>
                      {STATUS_META[log.status].label}
                    </StatusBadge>
                  </LogTopRow>
                  <LogBody>{log.body}</LogBody>
                  <MetricRow>
                    <MetricPill>대상 {log.targetCount}</MetricPill>
                    <MetricPill $variant="success">성공 {log.sendCount}</MetricPill>
                    <MetricPill $variant="failure">실패 {log.failureCount}</MetricPill>
                  </MetricRow>
                </LogItem>
              ))
            ) : (
              <NoData>
                {loading
                  ? "전송 이력을 불러오는 중입니다."
                  : "전송한 푸시 알림 이력이 없습니다."}
              </NoData>
            )}
          </LogList>
        </SectionCard>
      </Content>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 0 16px 24px;
  box-sizing: border-box;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  min-height: 100vh;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionCard = styled.section`
  background: #ffffff;
  border: 1px solid #ece7de;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 10px 24px rgba(26, 32, 44, 0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 1.08rem;
  font-weight: 700;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: #46505f;
  font-size: 0.92rem;
  font-weight: 700;
`;

const TargetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 520px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const TargetButton = styled.button<{ $selected: boolean }>`
  border-radius: 14px;
  border: 1px solid ${({ $selected }) => ($selected ? "#0f766e" : "#d7ddd4")};
  background: ${({ $selected }) => ($selected ? "#ecfdf5" : "#f9fafb")};
  padding: 14px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #1f2937;

  strong {
    font-size: 0.95rem;
  }

  span {
    font-size: 0.82rem;
    line-height: 1.45;
    color: #5f6b7a;
  }
`;

const Input = styled.input`
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #d7ddd4;
  font-size: 1rem;
  color: #273142;
  background: #ffffff;

  &:focus {
    outline: none;
    border-color: #0f766e;
    box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
  }
`;

const TextArea = styled.textarea`
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #d7ddd4;
  font-size: 0.98rem;
  color: #273142;
  background: #ffffff;
  resize: vertical;
  min-height: 96px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #0f766e;
    box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
  }
`;

const FieldHint = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.82rem;
  line-height: 1.45;
`;

const FieldHintBox = styled.div`
  border-radius: 12px;
  background: #f6f8fb;
  color: #5a6574;
  padding: 12px 14px;
  font-size: 0.88rem;
  line-height: 1.5;
`;

const DepartmentGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const DepartmentChip = styled.button<{ $selected: boolean }>`
  border: 1px solid ${({ $selected }) => ($selected ? "#b45309" : "#d6d3d1")};
  background: ${({ $selected }) => ($selected ? "#fff7ed" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#9a3412" : "#44403c")};
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 0.84rem;
  cursor: pointer;
`;

const SendButton = styled.button`
  border: none;
  border-radius: 12px;
  padding: 14px;
  background: #0f766e;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    background-color 0.2s ease;

  &:hover:not(:disabled) {
    background: #0b5f59;
  }

  &:active:not(:disabled) {
    transform: scale(0.985);
  }

  &:disabled {
    background: #9ca3af;
    cursor: wait;
  }
`;

const StatusMessage = styled.p`
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: #435164;
`;

const RefreshButton = styled.button`
  border: none;
  background: none;
  color: #0f766e;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;

  &:disabled {
    color: #9ca3af;
    cursor: wait;
  }
`;

const LogList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LogItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #ece7de;
  border-radius: 14px;
  padding: 16px;
  background: #fcfcfb;
`;

const LogTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

const LogTitle = styled.h4`
  margin: 0;
  color: #1f2937;
  font-size: 0.98rem;
  font-weight: 700;
`;

const LogBody = styled.p`
  margin: 0;
  color: #5b6472;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const MetricRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const MetricPill = styled.span<{ $variant?: "default" | "success" | "failure" }>`
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.82rem;
  font-weight: 700;
  background: ${({ $variant = "default" }) => {
    if ($variant === "success") return "#e8f8ee";
    if ($variant === "failure") return "#fdecec";
    return "#eef2f7";
  }};
  color: ${({ $variant = "default" }) => {
    if ($variant === "success") return "#20744a";
    if ($variant === "failure") return "#b42318";
    return "#445064";
  }};
`;

const StatusBadge = styled.span<{
  $tone: "blue" | "green" | "amber" | "red" | "gray";
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
  background: ${({ $tone }) => {
    if ($tone === "green") return "#e8f8ee";
    if ($tone === "amber") return "#fff3e8";
    if ($tone === "red") return "#fdecec";
    if ($tone === "gray") return "#eef2f7";
    return "#e8f1ff";
  }};
  color: ${({ $tone }) => {
    if ($tone === "green") return "#20744a";
    if ($tone === "amber") return "#b45309";
    if ($tone === "red") return "#b42318";
    if ($tone === "gray") return "#667085";
    return "#1d4ed8";
  }};
`;

const NoData = styled.p`
  margin: 0;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
  padding: 20px 0;
`;
