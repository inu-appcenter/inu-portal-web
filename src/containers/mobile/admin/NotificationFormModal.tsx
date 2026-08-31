import React, { useState, useMemo } from "react";
import styled from "styled-components";
import Icon from "@/components/common/Icon";

import AdminModal from "@/components/admin/AdminModal";
import AdminSelect from "@/components/admin/AdminSelect";
import {
  AdminNotificationTargetType,
  AdminNotificationSubFilter,
  FcmSendRequest,
} from "@/types/admin";
import { navBarList } from "@/resources/strings/navBarList";

interface NotificationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (request: FcmSendRequest) => Promise<void>;
  sending: boolean;
  sendMessage: string;
}

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
  { value: "ALL", label: "전체", description: "모든 사용자 대상" },
  { value: "LOGGED_IN", label: "로그인 회원", description: "로그인 중인 사용자만" },
  { value: "LOGGED_OUT", label: "로그아웃 회원", description: "비회원/로그아웃 사용자" },
  { value: "MEMBERS", label: "회원 ID", description: "특정 개별 회원 타겟팅" },
  { value: "STUDENT_IDS", label: "학번", description: "특정 학번 타겟팅" },
  { value: "DEPARTMENTS", label: "학과", description: "특정 학과 소속 회원" },
];

const SUB_FILTER_OPTIONS: Array<{
  value: AdminNotificationSubFilter;
  label: string;
  description: string;
}> = [
  { value: "NONE", label: "미적용 (전체)", description: "하위 필터 없이 상위 필터 대상 전체에 발송" },
  { value: "NO_TIMETABLE_CURRENT_SEMESTER", label: "[시간표] 이번 학기 시간표 미생성자", description: "이번 활성 학기 시간표가 0개인 회원" },
  { value: "EMPTY_TIMETABLE", label: "[시간표] 빈 시간표 보유자", description: "시간표는 있으나 수업/강의가 0개인 회원" },
  { value: "PAST_USER_NO_CURRENT_TIMETABLE", label: "[시간표] 지난 학기 유저 (이번 학기 미작성)", description: "직전 학기는 시간표가 있으나 이번 학기 미작성 회원" },
  { value: "NO_FRIENDS", label: "[친구] 친구 0명인 회원", description: "수락된 친구 관계가 0명인 회원" },
  { value: "NO_COMMUNITY_ACTIVITY", label: "[커뮤니티] 작성 글/댓글 없음", description: "게시글 및 댓글 작성 이력이 0건인 회원" },
];

const PATH_OPTIONS = [
  { value: "", label: "기본 메인 화면 (/home)", description: "앱 기본 홈 화면으로 이동" },
  { value: "/timetable", label: "시간표 메인 (/timetable)", description: "시간표 조회 화면으로 이동" },
  { value: "/timetable/wizard", label: "시간표 마법사 (/timetable/wizard)", description: "시간표 생성 및 과목 추가" },
  { value: "/friend/list", label: "친구 목록 (/friend/list)", description: "친구 목록 및 시간표 공유" },
  { value: "/home/notice", label: "학교 공지사항 (/home/notice)", description: "전체 공지사항 목록" },
  { value: "/home/deptnotice", label: "학과 공지사항 (/home/deptnotice)", description: "학과 공지사항 목록" },
  { value: "/home/council", label: "총학생회 공지 (/home/council)", description: "총학 공지사항" },
  { value: "/home/club", label: "동아리 목록 (/home/club)", description: "동아리 정보 목록" },
  { value: "/bus", label: "버스/셔틀 (/bus)", description: "버스 및 셔틀 정보" },
  { value: "/chat/list", label: "채팅 목록 (/chat/list)", description: "실시간 채팅방 목록" },
  { value: "/mypage", label: "마이페이지 (/mypage)", description: "내 정보 화면" },
  { value: "CUSTOM", label: "직접 URL 입력", description: "특정 상세 게시글이나 외부 링크 직접 입력" },
];

const extractDepartmentOptions = (items: DepartmentNode[]): DepartmentOption[] => {
  const options: DepartmentOption[] = [];
  const seen = new Set<string>();

  const traverse = (nodes: DepartmentNode[]) => {
    nodes.forEach((node) => {
      if (node.code && node.title && !seen.has(node.code)) {
        seen.add(node.code);
        options.push({ label: node.title, value: node.code });
      }
      if (Array.isArray(node.child)) traverse(node.child);
      if (Array.isArray(node.subItems)) traverse(node.subItems);
    });
  };

  traverse(items);
  return options;
};

const parseListInput = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const NotificationFormModal: React.FC<NotificationFormModalProps> = ({
  isOpen,
  onClose,
  onSend,
  sending,
  sendMessage,
}) => {
  const [targetType, setTargetType] = useState<AdminNotificationTargetType>("ALL");
  const [subFilter, setSubFilter] = useState<AdminNotificationSubFilter>("NONE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedPathOption, setSelectedPathOption] = useState<string>("");
  const [customPath, setCustomPath] = useState<string>("");
  const [memberIdInput, setMemberIdInput] = useState("");
  const [studentIdInput, setStudentIdInput] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const departmentOptions = useMemo(
    () => extractDepartmentOptions(navBarList as DepartmentNode[]),
    [],
  );

  const toggleDepartment = (code: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const handleFormSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const resolvedPath =
      selectedPathOption === "CUSTOM"
        ? customPath.trim()
        : selectedPathOption.trim();

    let request: FcmSendRequest = {
      targetType,
      subFilter,
      title: title.trim(),
      content: content.trim(),
      path: resolvedPath || undefined,
    };

    if (targetType === "MEMBERS") {
      const ids = parseListInput(memberIdInput)
        .map((id) => Number.parseInt(id, 10))
        .filter((id) => !isNaN(id));
      if (ids.length === 0) return alert("회원 ID를 입력해주세요.");
      request.memberIds = ids;
    } else if (targetType === "STUDENT_IDS") {
      const ids = parseListInput(studentIdInput);
      if (ids.length === 0) return alert("학번을 입력해주세요.");
      request.studentIds = ids;
    } else if (targetType === "DEPARTMENTS") {
      if (selectedDepartments.length === 0) return alert("학과를 선택해주세요.");
      request.departments = selectedDepartments;
    }

    await onSend(request);
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="푸시 알림 전송"
      description="전송 대상을 선택하고 알림 내용을 입력하세요."
      footer={
        <>
          <CancelButton onClick={onClose} disabled={sending}>취소</CancelButton>
          <SubmitButton onClick={handleFormSubmit} disabled={sending}>
            <Icon name="paper-plane" size={18} />
            <span>{sending ? "전송 중..." : "알림 보내기"}</span>
          </SubmitButton>
        </>
      }
    >
      <FormContainer>
        <FormGroup>
          <AdminSelect
            label="1. 상위 대상 유저 그룹"
            options={TARGET_OPTIONS}
            value={targetType}
            onChange={(val) => setTargetType(val)}
          />
        </FormGroup>

        <FormGroup>
          <AdminSelect
            label="2. 하위 세부 기능/활동 타깃 필터"
            options={SUB_FILTER_OPTIONS}
            value={subFilter}
            onChange={(val) => setSubFilter(val)}
          />
        </FormGroup>

        {targetType === "MEMBERS" && (
          <FormGroup>
            <Label>회원 ID 목록</Label>
            <TextArea
              placeholder="쉼표(,)나 줄바꿈으로 구분하여 입력"
              value={memberIdInput}
              onChange={(e) => setMemberIdInput(e.target.value)}
              rows={3}
            />
          </FormGroup>
        )}

        {targetType === "STUDENT_IDS" && (
          <FormGroup>
            <Label>학번 목록</Label>
            <TextArea
              placeholder="쉼표(,)나 줄바꿈으로 구분하여 입력"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              rows={3}
            />
          </FormGroup>
        )}

        {targetType === "DEPARTMENTS" && (
          <FormGroup>
            <Label>학과 선택 ({selectedDepartments.length}개 선택됨)</Label>
            <DepartmentList>
              {departmentOptions.map((opt) => (
                <DepartmentChip
                  key={opt.value}
                  $active={selectedDepartments.includes(opt.value)}
                  onClick={() => toggleDepartment(opt.value)}
                >
                  {opt.label}
                </DepartmentChip>
              ))}
            </DepartmentList>
          </FormGroup>
        )}

        <Divider />

        <FormGroup>
          <Label>알림 제목</Label>
          <Input
            placeholder="사용자 기기에 표시될 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>알림 내용</Label>
          <TextArea
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </FormGroup>

        <FormGroup>
          <AdminSelect
            label="클릭 시 이동할 앱 경로 (선택)"
            options={PATH_OPTIONS}
            value={selectedPathOption}
            onChange={(val) => setSelectedPathOption(val)}
          />
        </FormGroup>

        {selectedPathOption === "CUSTOM" && (
          <FormGroup>
            <Label>직접 경로 입력</Label>
            <Input
              placeholder="예: /postdetail?id=123, https://... (상세 URL 입력)"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
            />
          </FormGroup>
        )}

        {sendMessage && <StatusMsg>{sendMessage}</StatusMsg>}
      </FormContainer>
    </AdminModal>
  );
};

export default NotificationFormModal;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 700;
  color: #475569;
`;

const Input = styled.input`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }
`;

const DepartmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
`;

const DepartmentChip = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: all 0.2s;
  background-color: ${(props) => (props.$active ? "#0f766e" : "#ffffff")};
  color: ${(props) => (props.$active ? "#ffffff" : "#64748b")};
  border: 1px solid ${(props) => (props.$active ? "#0f766e" : "#e2e8f0")};

  &:hover {
    border-color: #0f766e;
    color: ${(props) => (props.$active ? "#ffffff" : "#0f766e")};
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #f1f5f9;
  margin: 4px 0;
`;

const StatusMsg = styled.p`
  font-size: 0.875rem;
  color: #0f766e;
  background-color: #f0fdfa;
  padding: 12px;
  border-radius: 10px;
  margin: 0;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  color: #64748b;
  &:hover { background-color: #f1f5f9; }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 10px;
  background-color: #0f766e;
  color: #ffffff;
  font-weight: 700;
  transition: all 0.2s;

  &:hover { background-color: #0d9488; transform: translateY(-1px); }
  &:disabled { background-color: #94a3b8; transform: none; cursor: not-allowed; }
`;
