import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import {
  createFeatureFlag,
  getAdminFeatureFlags,
  updateFeatureFlag,
} from "@/apis/featureFlags";
import Switch from "@/components/common/Switch";
import { ROUTES } from "@/constants/routes";
import { useHeader } from "@/context/HeaderContext";
import { FEATURE_FLAGS_QUERY_KEY } from "@/hooks/useFeatureFlags";
import useUserStore from "@/stores/useUserStore";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import type {
  AdminFeatureFlag,
  CreateFeatureFlagRequest,
  UpdateFeatureFlagRequest,
} from "@/types/featureFlags";

const ADMIN_FEATURE_FLAGS_QUERY_KEY = ["admin-feature-flags"] as const;

type FeatureFlagDraft = {
  enabled: boolean;
  clientVisible: boolean;
  description: string;
};

const createInitialCreateForm = (): CreateFeatureFlagRequest => ({
  key: "",
  enabled: false,
  clientVisible: true,
  description: "",
});

export default function MobileAdminFeatureFlagsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tokenInfo, userInfo } = useUserStore();

  const [createForm, setCreateForm] = useState<CreateFeatureFlagRequest>(
    createInitialCreateForm(),
  );
  const [drafts, setDrafts] = useState<Record<string, FeatureFlagDraft>>({});
  const [notice, setNotice] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useHeader({
    title: "기능 플래그 관리",
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

  const sortedFlags = useMemo(
    () => [...featureFlags].sort((left, right) => left.key.localeCompare(right.key)),
    [featureFlags],
  );

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        sortedFlags.map((flag) => [
          flag.key,
          {
            enabled: flag.enabled,
            clientVisible: flag.clientVisible,
            description: flag.description ?? "",
          },
        ]),
      ),
    );
  }, [sortedFlags]);

  const syncFeatureFlagQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ADMIN_FEATURE_FLAGS_QUERY_KEY,
      }),
      queryClient.invalidateQueries({
        queryKey: FEATURE_FLAGS_QUERY_KEY,
      }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: createFeatureFlag,
    onSuccess: async (createdFlag) => {
      setNotice(`${createdFlag.key} 기능 플래그를 생성했습니다.`);
      setCreateForm(createInitialCreateForm());
      await syncFeatureFlagQueries();
    },
    onError: (error) => {
      console.error(error);
      setNotice(
        error instanceof Error ? error.message : "기능 플래그 생성에 실패했습니다.",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      key,
      body,
    }: {
      key: string;
      body: UpdateFeatureFlagRequest;
    }) => {
      setSavingKey(key);
      return updateFeatureFlag(key, body);
    },
    onSuccess: async (updatedFlag) => {
      setNotice(`${updatedFlag.key} 기능 플래그를 저장했습니다.`);
      await syncFeatureFlagQueries();
    },
    onError: (error) => {
      console.error(error);
      setNotice(
        error instanceof Error ? error.message : "기능 플래그 저장에 실패했습니다.",
      );
    },
    onSettled: () => {
      setSavingKey(null);
    },
  });

  const handleCreateInputChange = (
    field: keyof CreateFeatureFlagRequest,
    value: string | boolean,
  ) => {
    setCreateForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleDraftChange = (
    key: string,
    field: keyof FeatureFlagDraft,
    value: string | boolean,
  ) => {
    setDrafts((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [field]: value,
      },
    }));
  };

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedKey = createForm.key.trim().toUpperCase();
    if (!normalizedKey) {
      setNotice("기능 플래그 키를 입력해주세요.");
      return;
    }

    setNotice("");
    createMutation.mutate({
      key: normalizedKey,
      enabled: createForm.enabled,
      clientVisible: createForm.clientVisible,
      description: createForm.description?.trim() || undefined,
    });
  };

  const handleSave = (flag: AdminFeatureFlag) => {
    const draft = drafts[flag.key];
    if (!draft) {
      return;
    }

    setNotice("");
    updateMutation.mutate({
      key: flag.key,
      body: {
        enabled: draft.enabled,
        clientVisible: draft.clientVisible,
        description: draft.description.trim() || undefined,
      },
    });
  };

  return (
    <Wrapper>
      <Content>
        <SectionCard as="form" onSubmit={handleCreateSubmit}>
          <CardTitle>새 기능 플래그 만들기</CardTitle>
          <Description>
            새 기능 플래그 키를 등록하고, 활성화 여부와 공개 API 노출 여부를 함께
            설정할 수 있습니다.
          </Description>

          <FormGroup>
            <Label htmlFor="feature-flag-key">키</Label>
            <Input
              id="feature-flag-key"
              type="text"
              placeholder="예: LABS"
              value={createForm.key}
              onChange={(event) => handleCreateInputChange("key", event.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="feature-flag-description">설명</Label>
            <TextArea
              id="feature-flag-description"
              rows={3}
              placeholder="이 기능 플래그가 무엇을 제어하는지 적어주세요."
              value={createForm.description ?? ""}
              onChange={(event) =>
                handleCreateInputChange("description", event.target.value)
              }
            />
          </FormGroup>

          <ToggleGroup>
            <ToggleItem>
              <ToggleTextBox>
                <ToggleTitle>생성과 동시에 활성화</ToggleTitle>
                <ToggleDescription>
                  생성 직후 바로 켜진 상태로 저장합니다.
                </ToggleDescription>
              </ToggleTextBox>
              <ToggleAction>
                <ToggleState $active={createForm.enabled}>
                  {createForm.enabled ? "켜짐" : "꺼짐"}
                </ToggleState>
                <Switch
                  checked={createForm.enabled}
                  onCheckedChange={(checked) =>
                    handleCreateInputChange("enabled", checked)
                  }
                />
              </ToggleAction>
            </ToggleItem>

            <ToggleItem>
              <ToggleTextBox>
                <ToggleTitle>공개 API 노출</ToggleTitle>
                <ToggleDescription>
                  `/api/feature-flags` 응답에 포함할지 정합니다.
                </ToggleDescription>
              </ToggleTextBox>
              <ToggleAction>
                <ToggleState $active={createForm.clientVisible}>
                  {createForm.clientVisible ? "노출" : "숨김"}
                </ToggleState>
                <Switch
                  checked={createForm.clientVisible}
                  onCheckedChange={(checked) =>
                    handleCreateInputChange("clientVisible", checked)
                  }
                />
              </ToggleAction>
            </ToggleItem>
          </ToggleGroup>

          <PrimaryButton type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "생성 중..." : "기능 플래그 생성"}
          </PrimaryButton>
        </SectionCard>

        <SectionCard>
          <CardHeader>
            <div>
              <CardTitle>등록된 기능 플래그</CardTitle>
              <Description>
                `enabled`는 실제 사용 여부, 공개 여부는 프론트 공개 API 노출 여부입니다.
              </Description>
            </div>
            <RefreshButton
              type="button"
              onClick={() =>
                void queryClient.invalidateQueries({
                  queryKey: ADMIN_FEATURE_FLAGS_QUERY_KEY,
                })
              }
              disabled={isFetching}
            >
              {isFetching ? "새로고침 중..." : "새로고침"}
            </RefreshButton>
          </CardHeader>

          {notice && <Notice>{notice}</Notice>}

          {isLoading ? (
            <EmptyState>기능 플래그 목록을 불러오는 중입니다.</EmptyState>
          ) : sortedFlags.length === 0 ? (
            <EmptyState>등록된 기능 플래그가 없습니다.</EmptyState>
          ) : (
            <FlagList>
              {sortedFlags.map((flag) => {
                const draft = drafts[flag.key];

                if (!draft) {
                  return null;
                }

                return (
                  <FlagCard key={flag.key}>
                    <FlagHeader>
                      <FlagKey>{flag.key}</FlagKey>
                      <SecondaryText>
                        공개: {draft.clientVisible ? "ON" : "OFF"} / 활성화:{" "}
                        {draft.enabled ? "ON" : "OFF"}
                      </SecondaryText>
                    </FlagHeader>

                    <FormGroup>
                      <Label htmlFor={`description-${flag.key}`}>설명</Label>
                      <TextArea
                        id={`description-${flag.key}`}
                        rows={3}
                        value={draft.description}
                        onChange={(event) =>
                          handleDraftChange(
                            flag.key,
                            "description",
                            event.target.value,
                          )
                        }
                      />
                    </FormGroup>

                    <ToggleGroup>
                      <ToggleItem>
                        <ToggleTextBox>
                          <ToggleTitle>활성화</ToggleTitle>
                          <ToggleDescription>
                            이 기능을 실제로 사용할지 결정합니다.
                          </ToggleDescription>
                        </ToggleTextBox>
                        <ToggleAction>
                          <ToggleState $active={draft.enabled}>
                            {draft.enabled ? "켜짐" : "꺼짐"}
                          </ToggleState>
                          <Switch
                            checked={draft.enabled}
                            onCheckedChange={(checked) =>
                              handleDraftChange(flag.key, "enabled", checked)
                            }
                          />
                        </ToggleAction>
                      </ToggleItem>

                      <ToggleItem>
                        <ToggleTextBox>
                          <ToggleTitle>클라이언트 공개</ToggleTitle>
                          <ToggleDescription>
                            프론트 공개 API에 이 플래그를 포함합니다.
                          </ToggleDescription>
                        </ToggleTextBox>
                        <ToggleAction>
                          <ToggleState $active={draft.clientVisible}>
                            {draft.clientVisible ? "노출" : "숨김"}
                          </ToggleState>
                          <Switch
                            checked={draft.clientVisible}
                            onCheckedChange={(checked) =>
                              handleDraftChange(flag.key, "clientVisible", checked)
                            }
                          />
                        </ToggleAction>
                      </ToggleItem>
                    </ToggleGroup>

                    <SaveButton
                      type="button"
                      onClick={() => handleSave(flag)}
                      disabled={updateMutation.isPending}
                    >
                      {savingKey === flag.key ? "저장 중..." : "저장"}
                    </SaveButton>
                  </FlagCard>
                );
              })}
            </FlagList>
          )}
        </SectionCard>
      </Content>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 0 ${MOBILE_PAGE_GUTTER} 24px;
  box-sizing: border-box;
  max-width: 860px;
  margin: 0 auto;
  width: 100%;
  min-height: 100vh;

  @media ${DESKTOP_MEDIA} {
    padding: 0 0 24px;
  }
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
  align-items: flex-start;
  gap: 12px;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 1.08rem;
  font-weight: 700;
`;

const Description = styled.p`
  margin: 0;
  color: #5f6b7a;
  font-size: 0.9rem;
  line-height: 1.5;
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

const ToggleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ToggleItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid #e7ecef;
  border-radius: 14px;
  background: #f8fafb;
  padding: 14px 16px;
`;

const ToggleTextBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const ToggleTitle = styled.span`
  color: #334155;
  font-size: 0.92rem;
  font-weight: 700;
`;

const ToggleDescription = styled.span`
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.45;
`;

const ToggleAction = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const ToggleState = styled.span<{ $active: boolean }>`
  min-width: 30px;
  color: ${({ $active }) => ($active ? "#0f766e" : "#64748b")};
  font-size: 0.82rem;
  font-weight: 700;
  text-align: right;
`;

const PrimaryButton = styled.button`
  border: none;
  border-radius: 12px;
  padding: 14px;
  background: #0f766e;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    background: #9ca3af;
    cursor: wait;
  }
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

const Notice = styled.p`
  margin: 0;
  border-radius: 12px;
  background: #f6f8fb;
  color: #435164;
  padding: 12px 14px;
  font-size: 0.88rem;
  line-height: 1.5;
`;

const EmptyState = styled.p`
  margin: 0;
  text-align: center;
  color: #94a3b8;
  font-size: 0.92rem;
  padding: 24px 0;
`;

const FlagList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FlagCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid #ece7de;
  border-radius: 16px;
  padding: 16px;
  background: #fcfcfb;
`;

const FlagHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const FlagKey = styled.h4`
  margin: 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 700;
`;

const SecondaryText = styled.span`
  color: #5f6b7a;
  font-size: 0.85rem;
  font-weight: 600;
`;

const SaveButton = styled.button`
  align-self: flex-start;
  border: 1px solid #d7ddd4;
  border-radius: 10px;
  padding: 10px 14px;
  background: #ffffff;
  color: #1f2937;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    color: #9ca3af;
    cursor: wait;
  }
`;
