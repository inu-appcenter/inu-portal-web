import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import { Plus, RefreshCw, Eye, EyeOff, Settings2, Flag as FlagIcon } from "lucide-react";
import MobilePillSearchBar from "@/components/mobile/common/MobilePillSearchBar";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";

import {
  createFeatureFlag,
  getAdminFeatureFlags,
  updateFeatureFlag,
} from "@/apis/featureFlags";
import Switch from "@/components/common/Switch";
import { ROUTES } from "@/constants/routes";
import { useHeader } from "@/context/HeaderContext";
import { FEATURE_FLAGS_QUERY_KEY } from "@/hooks/useFeatureFlags";
import { SOFT_CARD_SHADOW } from "@/styles/shadows";
import useUserStore from "@/stores/useUserStore";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminModal from "@/components/admin/AdminModal";
import type {
  AdminFeatureFlag,
  CreateFeatureFlagRequest,
  UpdateFeatureFlagRequest,
} from "@/types/featureFlags";

const ADMIN_FEATURE_FLAGS_QUERY_KEY = ["admin-feature-flags"] as const;

export default function MobileAdminFeatureFlagsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tokenInfo, userInfo } = useUserStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<AdminFeatureFlag | null>(null);
  const [createForm, setCreateForm] = useState<CreateFeatureFlagRequest>({
    key: "",
    enabled: false,
    clientVisible: true,
    description: "",
  });

  useHeader({
    title: "Feature Flag 관리",
  });

  useEffect(() => {
    const hasStoredToken = Boolean(localStorage.getItem("tokenInfo"));
    if (!tokenInfo.accessToken && !hasStoredToken) {
      navigate(ROUTES.HOME, { replace: true });
      return;
    }
    if (tokenInfo.accessToken && userInfo.role && userInfo.role !== "admin") {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [navigate, tokenInfo.accessToken, userInfo.role]);

  const {
    data: featureFlags = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ADMIN_FEATURE_FLAGS_QUERY_KEY,
    queryFn: getAdminFeatureFlags,
  });

  const filteredFlags = useMemo(() => {
    return featureFlags
      .filter((flag) => flag.key.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [featureFlags, searchQuery]);

  const syncFeatureFlagQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ADMIN_FEATURE_FLAGS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: FEATURE_FLAGS_QUERY_KEY }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: createFeatureFlag,
    onSuccess: async (created) => {
      alert(`${created.key} 플래그가 생성되었습니다.`);
      setIsCreateModalOpen(false);
      setCreateForm({ key: "", enabled: false, clientVisible: true, description: "" });
      await syncFeatureFlagQueries();
    },
    onError: (err) => alert(err instanceof Error ? err.message : "생성 실패"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, body }: { key: string; body: UpdateFeatureFlagRequest }) => {
      return updateFeatureFlag(key, body);
    },
    onSuccess: async (updated) => {
      alert(`${updated.key} 플래그가 저장되었습니다.`);
      setEditingFlag(null);
      await syncFeatureFlagQueries();
    },
    onError: (err) => alert(err instanceof Error ? err.message : "저장 실패"),
  });

  const handleToggleEnable = (flag: AdminFeatureFlag, checked: boolean) => {
    updateMutation.mutate({
      key: flag.key,
      body: { enabled: checked, clientVisible: flag.clientVisible },
    });
  };

  return (
    <AdminLayout>
      <PageWrapper>
        <PageHeader>
          <HeaderActions>
            <RefreshBtn
              onClick={() => queryClient.invalidateQueries({ queryKey: ADMIN_FEATURE_FLAGS_QUERY_KEY })}
              disabled={isFetching}
            >
              <LoadingIcon size={18} $loading={isFetching} />
            </RefreshBtn>
            <CreateBtn onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={20} />
              <span>새 플래그 추가</span>
            </CreateBtn>
          </HeaderActions>
        </PageHeader>


        <FlagsGrid>
          {isLoading ? (
            <EmptyState>불러오는 중...</EmptyState>
          ) : filteredFlags.length === 0 ? (
            <EmptyState>검색 결과가 없습니다.</EmptyState>
          ) : (
            filteredFlags.map((flag) => (
              <FlagCard key={flag.key}>
                <FlagHeader>
                  <FlagTitleContainer>
                    <FlagIconBox $enabled={flag.enabled}>
                      <FlagIcon size={20} />
                    </FlagIconBox>
                    <FlagKey>{flag.key}</FlagKey>
                  </FlagTitleContainer>
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={(checked) => handleToggleEnable(flag, checked)}
                  />
                </FlagHeader>
                <FlagDescription>{flag.description || "설명이 없습니다."}</FlagDescription>
                <FlagFooter>
                  <VisibilityIndicator $visible={flag.clientVisible}>
                    {flag.clientVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span>{flag.clientVisible ? "공개" : "비공개"}</span>
                  </VisibilityIndicator>
                  <SettingBtn onClick={() => setEditingFlag(flag)}>
                    <Settings2 size={16} />
                    <span>설정</span>
                  </SettingBtn>
                </FlagFooter>
              </FlagCard>
            ))
          )}
          <SearchSpacer />
        </FlagsGrid>

        <FloatingSearchBar>
          <MobilePillSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={() => { }}
            placeholder="플래그 키를 검색하세요."
          />
        </FloatingSearchBar>

        {/* 생성 모달 */}
        <AdminModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="새 Feature Flag 추가"
          footer={
            <ModalFooter>
              <CancelBtn onClick={() => setIsCreateModalOpen(false)}>취소</CancelBtn>
              <PrimaryBtn
                onClick={() => createMutation.mutate(createForm)}
                disabled={createMutation.isPending || !createForm.key}
              >
                생성하기
              </PrimaryBtn>
            </ModalFooter>
          }
        >
          <Form>
            <FormGroup>
              <Label>플래그 키 (Unique Key)</Label>
              <Input
                placeholder="예: NEW_UI_BETA"
                value={createForm.key}
                onChange={(e) => setCreateForm({ ...createForm, key: e.target.value.toUpperCase() })}
              />
            </FormGroup>
            <FormGroup>
              <Label>상세 설명</Label>
              <TextArea
                placeholder="이 플래그가 무엇을 제어하는지 설명해주세요."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={3}
              />
            </FormGroup>
            <ToggleRow>
              <ToggleInfo>
                <ToggleTitle>클라이언트 공개</ToggleTitle>
                <ToggleDesc>프론트엔드 API 응답에 이 플래그를 포함합니다.</ToggleDesc>
              </ToggleInfo>
              <Switch
                checked={createForm.clientVisible}
                onCheckedChange={(v) => setCreateForm({ ...createForm, clientVisible: v })}
              />
            </ToggleRow>
          </Form>
        </AdminModal>

        {/* 편집 모달 */}
        <AdminModal
          isOpen={!!editingFlag}
          onClose={() => setEditingFlag(null)}
          title="Feature Flag 설정 편집"
          footer={
            <ModalFooter>
              <CancelBtn onClick={() => setEditingFlag(null)}>취소</CancelBtn>
              <PrimaryBtn
                onClick={() => {
                  if (editingFlag) {
                    updateMutation.mutate({
                      key: editingFlag.key,
                      body: {
                        description: editingFlag.description ?? undefined,
                        clientVisible: editingFlag.clientVisible,
                        enabled: editingFlag.enabled
                      }
                    });
                  }
                }}
                disabled={updateMutation.isPending}
              >
                저장하기
              </PrimaryBtn>
            </ModalFooter>
          }
        >
          {editingFlag && (
            <Form>
              <FormGroup>
                <Label>플래그 키</Label>
                <ReadOnlyValue>{editingFlag.key}</ReadOnlyValue>
              </FormGroup>
              <FormGroup>
                <Label>상세 설명</Label>
                <TextArea
                  value={editingFlag.description ?? ""}
                  onChange={(e) => setEditingFlag({ ...editingFlag, description: e.target.value })}
                  rows={3}
                />
              </FormGroup>
              <ToggleRow>
                <ToggleInfo>
                  <ToggleTitle>활성화 상태</ToggleTitle>
                  <ToggleDesc>기능의 실제 작동 여부를 제어합니다.</ToggleDesc>
                </ToggleInfo>
                <Switch
                  checked={editingFlag.enabled}
                  onCheckedChange={(v) => setEditingFlag({ ...editingFlag, enabled: v })}
                />
              </ToggleRow>
              <ToggleRow>
                <ToggleInfo>
                  <ToggleTitle>클라이언트 공개 여부</ToggleTitle>
                  <ToggleDesc>프론트엔드 노출 여부를 제어합니다.</ToggleDesc>
                </ToggleInfo>
                <Switch
                  checked={editingFlag.clientVisible}
                  onCheckedChange={(v) => setEditingFlag({ ...editingFlag, clientVisible: v })}
                />
              </ToggleRow>
            </Form>
          )}
        </AdminModal>
      </PageWrapper>
    </AdminLayout>
  );
}

const PageWrapper = styled.div`
  margin: 0 ${MOBILE_PAGE_GUTTER};
  padding: 20px 0 24px;
  box-sizing: border-box;

  @media ${DESKTOP_MEDIA} {
    margin: 0;
    padding: 40px 48px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
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
  &:hover { background-color: #0d9488; }
`;

const RefreshBtn = styled.button`
  padding: 10px;
  background-color: #fff;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;
  &:hover { background-color: #f8fafc; }
  &:disabled { opacity: 0.7; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoadingIcon = styled(RefreshCw) <{ $loading: boolean }>`
  animation: ${props => props.$loading ? css`${spin} 1s linear infinite` : "none"};
`;

const FlagsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: 16px;
`;

const SearchSpacer = styled.div`
  height: 88px;
`;

const FloatingSearchBar = styled.div`
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  z-index: 100;

  @media ${DESKTOP_MEDIA} {
    width: min(calc(100% - 48px), 760px);
  }
`;

const FlagCard = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: ${SOFT_CARD_SHADOW};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 20px -8px rgba(15, 23, 42, 0.1);
  }
`;

const FlagHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FlagTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FlagIconBox = styled.div<{ $enabled: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: ${(props) => props.$enabled ? "#ecfdf5" : "#f1f5f9"};
  color: ${(props) => props.$enabled ? "#059669" : "#94a3b8"};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FlagKey = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
`;

const FlagDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
  height: 42px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const FlagFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
`;

const VisibilityIndicator = styled.div<{ $visible: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${(props) => props.$visible ? "#0f766e" : "#94a3b8"};
`;

const SettingBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #64748b;
  padding: 6px 10px;
  border-radius: 8px;
  &:hover { background-color: #f1f5f9; color: #0f172a; }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  padding: 60px;
  text-align: center;
  color: #94a3b8;
  font-weight: 500;
`;

const Form = styled.div`
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
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
  &:focus { outline: none; border-color: #0f766e; }
`;

const ReadOnlyValue = styled.div`
  padding: 12px 14px;
  border-radius: 10px;
  background-color: #f8fafc;
  color: #64748b;
  font-family: monospace;
  font-weight: 700;
`;

const TextArea = styled.textarea`
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
  resize: vertical;
  &:focus { outline: none; border-color: #0f766e; }
`;

const ToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 12px;
`;

const ToggleInfo = styled.div``;

const ToggleTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
`;

const ToggleDesc = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
`;

const CancelBtn = styled.button`
  padding: 10px 20px;
  font-weight: 700;
  color: #64748b;
`;

const PrimaryBtn = styled.button`
  padding: 10px 24px;
  background-color: #0f766e;
  color: #fff;
  border-radius: 10px;
  font-weight: 700;
  &:disabled { background-color: #94a3b8; }
`;
