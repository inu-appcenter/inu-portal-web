import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import styled from "styled-components";
import Icon from "@/components/common/Icon";
import { getSuggestions } from "@/apis/suggestions";
import { ROUTES } from "@/constants/routes";
import { typography } from "@/styles/typography";
import { mixpanelTrack } from "@/utils/mixpanel";
import {
  SUGGESTION_CATEGORY_LABEL,
  SUGGESTION_QUERY_KEY,
} from "@/types/suggestions";
import SuggestionStatusBadge from "./SuggestionStatusBadge";

// "yyyy.MM.dd HH:mm:ss" -> "yyyy.MM.dd"
const toDate = (createDate: string) => createDate.slice(0, 10);

/** 내 의견 목록(일반)과 전체 목록(관리자)이 같이 쓰는 무한 스크롤 목록. */
export default function SuggestionListView({ admin = false }: { admin?: boolean }) {
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const query = useInfiniteQuery({
    queryKey: [...SUGGESTION_QUERY_KEY, "list", admin ? "admin" : "mine"],
    queryFn: ({ pageParam }) => getSuggestions(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, all) =>
      all.length < last.pages ? all.length + 1 : undefined,
  });

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  const items = query.data?.pages.flatMap((p) => p.suggestions) ?? [];
  const total = query.data?.pages[0]?.total;

  useEffect(() => {
    if (total !== undefined && !admin) mixpanelTrack.suggestionListViewed(total);
  }, [total, admin]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, items.length]);

  const detailPath = (id: number) =>
    admin ? ROUTES.ADMIN.SUGGESTION_DETAIL(id) : ROUTES.MYPAGE.SUGGESTION_DETAIL(id);

  if (query.isLoading) return <Hint>불러오는 중…</Hint>;

  if (query.isError) {
    return (
      <Center>
        <EmptyTitle>의견을 불러오지 못했어요</EmptyTitle>
        <OutlineButton type="button" onClick={() => query.refetch()}>
          다시 시도
        </OutlineButton>
      </Center>
    );
  }

  if (items.length === 0) {
    return (
      <Center>
        <EmptyIcon>
          <Icon name="chat-dots" size={28} color="var(--text-disabled)" />
        </EmptyIcon>
        <EmptyTitle>
          {admin ? "접수된 의견이 없어요" : "아직 보낸 의견이 없어요"}
        </EmptyTitle>
        {!admin && (
          <>
            <EmptySub>불편했던 점이나 바라는 기능을 알려주세요.</EmptySub>
            <OutlineButton
              type="button"
              onClick={() => {
                mixpanelTrack.suggestionFormOpened("list_empty");
                navigate(ROUTES.MYPAGE.SUGGESTION_WRITE);
              }}
            >
              의견 보내기
            </OutlineButton>
          </>
        )}
      </Center>
    );
  }

  return (
    <List>
      {admin && total !== undefined && <Intro>전체 {total}건</Intro>}
      {!admin && <Intro>내가 보낸 의견은 나와 운영진만 볼 수 있어요.</Intro>}
      {items.map((s) => (
        <Row key={s.id} type="button" onClick={() => navigate(detailPath(s.id))}>
          <RowHead>
            <RowTitle>
              <strong>{SUGGESTION_CATEGORY_LABEL[s.category] ?? s.category}</strong>
              <time>{toDate(s.createDate)}</time>
              {admin && <Author>{s.memberNickname}</Author>}
            </RowTitle>
            <SuggestionStatusBadge status={s.status} />
          </RowHead>
          <Preview>{s.content}</Preview>
        </Row>
      ))}
      <div ref={sentinelRef} aria-hidden="true" />
      {isFetchingNextPage && <Hint>불러오는 중…</Hint>}
    </List>
  );
}

const List = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const Intro = styled.p`
  ${typography.body2}
  margin: 0;
  padding: 16px 16px 8px;
  color: var(--text-tertiary);
`;

const Row = styled.button`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  border: none;
  border-bottom: 1px solid var(--border-default);
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:active {
    background: var(--bg-subtle);
  }
`;

const RowHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const RowTitle = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;

  strong {
    ${typography.heading2}
    color: var(--text-primary);
    white-space: nowrap;
  }

  time {
    ${typography.label3}
    color: var(--text-tertiary);
    white-space: nowrap;
  }
`;

const Author = styled.span`
  ${typography.label3}
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Preview = styled.p`
  ${typography.body2}
  margin: 0;
  color: var(--text-tertiary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
`;

const Hint = styled.p`
  ${typography.body2}
  margin: 0;
  padding: 24px 16px;
  text-align: center;
  color: var(--text-tertiary);
`;

const Center = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 120px 16px 0;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--bg-muted);
  margin-bottom: 8px;
`;

const EmptyTitle = styled.p`
  ${typography.heading2}
  margin: 0;
  color: var(--text-secondary);
`;

const EmptySub = styled.p`
  ${typography.body2}
  margin: 0;
  color: var(--text-tertiary);
`;

const OutlineButton = styled.button`
  ${typography.label2}
  margin-top: 12px;
  height: 40px;
  padding: 0 20px;
  border: 1px solid var(--border-brand-subtle);
  border-radius: var(--radius-full);
  background: var(--bg-brand);
  color: var(--text-brand);
  cursor: pointer;
`;
