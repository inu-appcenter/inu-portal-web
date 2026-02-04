import styled from "styled-components";
import useUserStore from "../../../stores/useUserStore.ts";
import { useEffect, useState } from "react";
import useMobileNavigate from "../../../hooks/useMobileNavigate.ts";
import MobileHeader from "../../containers/common/MobileHeader.tsx";
import {
  getFcmAdminLogs,
  sendFcmAdminNotification,
} from "../../../apis/admin.ts";
// 타입은 실제 경로에 맞게 수정 필요
import { FcmAdminLogData } from "../../../types/admin.ts";

const MobileAdminNotificationPage: React.FC = () => {
  const mobilenavigate = useMobileNavigate();
  const { tokenInfo, userInfo } = useUserStore();

  // 상태 관리
  const [logs, setLogs] = useState<FcmAdminLogData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [targetIds, setTargetIds] = useState<string>("");
  const [isAllUsers, setIsAllUsers] = useState<boolean>(false);

  useEffect(() => {
    // 관리자 권한 체크
    if (!tokenInfo.accessToken || userInfo.role !== "admin") {
      mobilenavigate("/home");
    }
  }, [tokenInfo, userInfo, mobilenavigate]);

  // 로그 조회 함수
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await getFcmAdminLogs(1); // 기본 1페이지 조회
      if (Array.isArray(response.data)) {
        setLogs(response.data);
      }
    } catch (error) {
      console.error(error);
      alert("전송 이력을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 알림 전송 핸들러
  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    let memberIds: number[] = [];

    // 전체 전송이 아닐 경우 ID 파싱
    if (!isAllUsers) {
      if (!targetIds.trim()) {
        alert("대상 회원 ID를 입력하거나 전체 전송을 선택해주세요.");
        return;
      }
      memberIds = targetIds
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));

      if (memberIds.length === 0) {
        alert("유효한 회원 ID가 없습니다.");
        return;
      }
    }

    try {
      const isConfirmed = window.confirm(
        isAllUsers
          ? "전체 회원에게 알림을 전송하시겠습니까?"
          : `${memberIds.length}명의 회원에게 알림을 전송하시겠습니까?`,
      );

      if (!isConfirmed) return;

      await sendFcmAdminNotification({
        memberIds, // 빈 배열이면 전체 전송 (API 명세)
        title,
        content,
      });

      alert("알림이 성공적으로 전송되었습니다.");

      // 폼 초기화 및 로그 갱신
      setTitle("");
      setContent("");
      setTargetIds("");
      setIsAllUsers(false);
      fetchLogs();
    } catch (error) {
      console.error(error);
      alert("알림 전송 중 오류가 발생했습니다.");
    }
  };

  return (
    <Wrapper>
      <MobileHeader title={"관리자 알림 전송"} />
      <Content>
        {/* 알림 전송 폼 섹션 */}
        <SectionCard>
          <CardTitle>새 알림 보내기</CardTitle>
          <FormGroup>
            <Label>제목</Label>
            <Input
              type="text"
              placeholder="알림 제목 입력"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>내용</Label>
            <TextArea
              rows={3}
              placeholder="전송할 메시지 내용 입력"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <LabelRow>
              <Label>수신 대상 (회원 ID)</Label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={isAllUsers}
                  onChange={(e) => setIsAllUsers(e.target.checked)}
                />
                전체 회원 전송
              </CheckboxLabel>
            </LabelRow>
            <Input
              type="text"
              placeholder="예: 1, 2, 3 (쉼표로 구분)"
              value={targetIds}
              onChange={(e) => setTargetIds(e.target.value)}
              disabled={isAllUsers}
            />
          </FormGroup>

          <SendButton onClick={handleSend}>전송하기</SendButton>
        </SectionCard>

        {/* 전송 이력 섹션 */}
        <SectionCard>
          <CardHeader>
            <CardTitle>최근 전송 이력</CardTitle>
            <RefreshButton onClick={fetchLogs} disabled={loading}>
              {loading ? "로딩..." : "새로고침"}
            </RefreshButton>
          </CardHeader>

          <LogList>
            {logs.length > 0 ? (
              logs.map((log) => (
                <LogItem key={log.id}>
                  <LogHeader>
                    <LogTitle>{log.title}</LogTitle>
                    <LogCount>성공: {log.sendCount}</LogCount>
                  </LogHeader>
                  <LogBody>{log.body}</LogBody>
                </LogItem>
              ))
            ) : (
              <NoData>전송된 알림 내역이 없습니다.</NoData>
            )}
          </LogList>
        </SectionCard>
      </Content>
    </Wrapper>
  );
};

export default MobileAdminNotificationPage;

// --- Styled Components ---

const Wrapper = styled.div`
  padding: 30px 16px;
  padding-top: 50px;
  box-sizing: border-box;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Content = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionCard = styled.div`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  user-select: none;

  input {
    accent-color: #007bff;
    width: 16px;
    height: 16px;
  }
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  color: #333;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &:disabled {
    background-color: #f0f0f0;
    color: #aaa;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  color: #333;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const SendButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  transition:
    background-color 0.2s ease,
    transform 0.1s;

  &:hover {
    background-color: #0056b3;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;

  &:disabled {
    color: #ccc;
  }
`;

const LogList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const LogItem = styled.li`
  background-color: #fcfcfc;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogTitle = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
  color: #333;
`;

const LogCount = styled.span`
  font-size: 0.85rem;
  color: #28a745;
  font-weight: 600;
  background-color: #e6f9ed;
  padding: 4px 8px;
  border-radius: 20px;
`;

const LogBody = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
  white-space: pre-wrap; // 줄바꿈(\n) 적용 및 자동 줄바꿈
`;

const NoData = styled.p`
  text-align: center;
  color: #999;
  font-size: 0.9rem;
  padding: 20px 0;
`;
