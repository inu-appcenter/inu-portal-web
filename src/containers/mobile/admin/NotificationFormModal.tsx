import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Send } from "lucide-react";

import AdminModal from "@/components/admin/AdminModal";
import AdminSelect from "@/components/admin/AdminSelect";
import {
  AdminNotificationTargetType,
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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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

    let request: FcmSendRequest = {
      targetType,
      title: title.trim(),
      content: content.trim(),
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
            <Send size={18} />
            <span>{sending ? "전송 중..." : "알림 보내기"}</span>
          </SubmitButton>
        </>
      }
    >
      <FormContainer>
        <FormGroup>
          <AdminSelect
            label="전송 대상 유형"
            options={TARGET_OPTIONS}
            value={targetType}
            onChange={(val) => setTargetType(val)}
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
