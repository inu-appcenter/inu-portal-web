import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import Modal from "@/components/common/Modal";
import Icon from "@/components/common/Icon";
import SuggestionImages from "@/components/mobile/suggestion/SuggestionImages";
import SuggestionStatusBadge from "@/components/mobile/suggestion/SuggestionStatusBadge";
import {
  deleteSuggestion,
  getSuggestion,
  patchSuggestionStatus,
} from "@/apis/suggestions";
import { ROUTES } from "@/constants/routes";
import { useHeader } from "@/context/HeaderContext";
import {
  useSuggestionAdminGuard,
  useSuggestionAuthGuard,
} from "@/hooks/useSuggestionAuth";
import { useToastStore } from "@/stores/useToastStore";
import { typography } from "@/styles/typography";
import { mixpanelTrack } from "@/utils/mixpanel";
import {
  SUGGESTION_CATEGORY_LABEL,
  SUGGESTION_QUERY_KEY,
  SUGGESTION_STATUSES,
  type SuggestionResponse,
  type SuggestionStatus,
} from "@/types/suggestions";

const osLabel = (s: SuggestionResponse) =>
  [s.osType, s.osVersion].filter(Boolean).join(" ") || "-";

/** 의견 상세. `admin`이면 작성자·기기 정보·상태 변경을 함께 보여 준다. */
export default function MobileSuggestionDetailPage({
  admin = false,
}: {
  admin?: boolean;
}) {
  const userAllowed = useSuggestionAuthGuard();
  const adminAllowed = useSuggestionAdminGuard();
  const allowed = admin ? adminAllowed : userAllowed;

  const { id } = useParams();
  const suggestionId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useHeader({ title: admin ? "건의사항 상세" : "의견 상세", pageBgColor: "var(--bg-base)" });

  const query = useQuery({
    queryKey: [...SUGGESTION_QUERY_KEY, "detail", suggestionId],
    queryFn: () => getSuggestion(suggestionId),
    enabled: allowed && !deleted && Number.isFinite(suggestionId),
    retry: false,
  });
  const data = query.data;

  useEffect(() => {
    if (data && !admin) {
      mixpanelTrack.suggestionDetailViewed({
        suggestionId: data.id,
        category: data.category,
        status: data.status,
        imageCount: data.imageCount,
      });
    }
    // 같은 글을 상태 변경 등으로 다시 받아도 조회로 세지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id, admin]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: SUGGESTION_QUERY_KEY });

  const remove = useMutation({
    mutationFn: () => deleteSuggestion(suggestionId),
    onSuccess: () => {
      mixpanelTrack.suggestionDeleted(suggestionId, admin);
      // 지운 글의 상세를 다시 불러오다 404가 나지 않게 조회를 멈춘다.
      setDeleted(true);
      setConfirmOpen(false);
      queryClient.invalidateQueries({
        queryKey: [...SUGGESTION_QUERY_KEY, "list"],
      });
      showToast("의견을 삭제했어요.");
      navigate(admin ? ROUTES.ADMIN.SUGGESTIONS : ROUTES.MYPAGE.SUGGESTION_LIST, {
        replace: true,
      });
    },
    onError: () => {
      setConfirmOpen(false);
      showToast("삭제에 실패했어요. 다시 시도해 주세요.");
    },
  });

  const changeStatus = useMutation({
    mutationFn: (status: SuggestionStatus) =>
      patchSuggestionStatus(suggestionId, status),
    onSuccess: (_, status) => {
      if (data) {
        mixpanelTrack.adminSuggestionStatusChanged(
          suggestionId,
          data.status,
          status,
        );
      }
      invalidate();
      showToast("처리 상태를 변경했어요.");
    },
    onError: () => showToast("상태 변경에 실패했어요. 다시 시도해 주세요."),
  });

  if (!allowed) return null;

  return (
    <Page>
      {query.isLoading && <Hint>불러오는 중…</Hint>}
      {query.isError && <Hint>의견을 불러오지 못했어요.</Hint>}
      {data && (
        <Body>
          <SuggestionStatusBadge status={data.status} />
          <Title>{SUGGESTION_CATEGORY_LABEL[data.category] ?? data.category}</Title>
          <Meta>{data.createDate.slice(0, 16)} 보냄</Meta>
          <Divider />
          <Content>{data.content}</Content>

          {data.imageCount > 0 && (
            <Block>
              <BlockLabel>첨부 사진 {data.imageCount}</BlockLabel>
              <SuggestionImages
                suggestionId={data.id}
                count={data.imageCount}
              />
            </Block>
          )}

          {admin && (
            <>
              <Block>
                <BlockLabel>작성자 · 기기 정보</BlockLabel>
                <InfoTable>
                  <dt>작성자</dt>
                  <dd>
                    {data.memberNickname} (#{data.memberId})
                  </dd>
                  <dt>앱 버전</dt>
                  <dd>{data.appVersion ?? "-"}</dd>
                  <dt>OS</dt>
                  <dd>{osLabel(data)}</dd>
                  <dt>기기</dt>
                  <dd>{data.deviceModel ?? "-"}</dd>
                </InfoTable>
              </Block>
              <Block>
                <BlockLabel>처리 상태 변경</BlockLabel>
                <StatusChips role="radiogroup" aria-label="처리 상태">
                  {SUGGESTION_STATUSES.map((s) => (
                    <StatusChip
                      key={s.value}
                      type="button"
                      role="radio"
                      aria-checked={data.status === s.value}
                      $selected={data.status === s.value}
                      disabled={changeStatus.isPending}
                      onClick={() => {
                        if (s.value !== data.status) changeStatus.mutate(s.value);
                      }}
                    >
                      {s.label}
                    </StatusChip>
                  ))}
                </StatusChips>
              </Block>
            </>
          )}

          {!admin && (
            <Notice>
              <Icon name="info" size={16} color="var(--text-tertiary)" />
              <span>
                처리 상태는 운영진의 내부 진행 상황이에요. 개별 답변은 드리지
                않아요.
              </span>
            </Notice>
          )}

          <DeleteButton type="button" onClick={() => setConfirmOpen(true)}>
            삭제
          </DeleteButton>
        </Body>
      )}

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="이 의견을 삭제할까요?"
        description="삭제한 의견은 되돌릴 수 없어요."
        secondaryButton={{ text: "취소", onClick: () => setConfirmOpen(false) }}
        primaryButton={{
          text: "삭제",
          variant: "danger",
          loading: remove.isPending,
          onClick: () => remove.mutate(),
        }}
      />
    </Page>
  );
}

const Page = styled.div`
  width: 100%;
  min-height: 100svh;
  box-sizing: border-box;
  background: var(--bg-base);
`;

const Body = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 16px 16px 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
`;

const Hint = styled.p`
  ${typography.body2}
  margin: 0;
  padding: 80px 16px;
  text-align: center;
  color: var(--text-tertiary);
`;

const Title = styled.h1`
  ${typography.title2}
  margin: 0;
  color: var(--text-primary);
`;

const Meta = styled.p`
  ${typography.caption1}
  margin: 0;
  color: var(--text-tertiary);
`;

const Divider = styled.hr`
  width: 100%;
  margin: 4px 0;
  border: none;
  border-top: 1px solid var(--border-default);
`;

const Content = styled.p`
  ${typography.body1}
  margin: 0;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-all;
`;

const Block = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const BlockLabel = styled.h2`
  ${typography.label2}
  margin: 0;
  color: var(--text-tertiary);
`;

const InfoTable = styled.dl`
  ${typography.body2}
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 4px 12px;
  margin: 0;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--bg-subtle);

  dt {
    color: var(--text-tertiary);
  }
  dd {
    margin: 0;
    color: var(--text-secondary);
    word-break: break-all;
  }
`;

const StatusChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StatusChip = styled.button<{ $selected: boolean }>`
  ${typography.label2}
  height: 36px;
  padding: 0 14px;
  border-radius: var(--radius-full);
  border: 1px solid
    ${({ $selected }) =>
      $selected ? "var(--border-brand)" : "var(--border-default)"};
  background: ${({ $selected }) =>
    $selected ? "var(--bg-brand)" : "var(--bg-base)"};
  color: ${({ $selected }) =>
    $selected ? "var(--text-brand)" : "var(--text-secondary)"};
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const Notice = styled.div`
  ${typography.caption1}
  width: 100%;
  box-sizing: border-box;
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding: 12px;
  border-radius: 12px;
  background: var(--bg-subtle);
  color: var(--text-tertiary);
`;

const DeleteButton = styled.button`
  ${typography.label2}
  align-self: center;
  margin-top: 16px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--text-error);
  cursor: pointer;
`;
