import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import SuggestionListView from "@/components/mobile/suggestion/SuggestionListView";
import { ROUTES } from "@/constants/routes";
import { useHeader } from "@/context/HeaderContext";
import { useSuggestionAuthGuard } from "@/hooks/useSuggestionAuth";
import { typography } from "@/styles/typography";
import { mixpanelTrack } from "@/utils/mixpanel";

export default function MobileSuggestionListPage() {
  const allowed = useSuggestionAuthGuard();
  const navigate = useNavigate();

  // 헤더 설정에 들어가는 요소라 매 렌더 새로 만들면 헤더 갱신이 무한 반복된다.
  const rightArea = useMemo(
    () => (
      <NewButton
        type="button"
        onClick={() => {
          mixpanelTrack.suggestionFormOpened("list_header");
          navigate(ROUTES.MYPAGE.SUGGESTION_WRITE);
        }}
      >
        새 의견
      </NewButton>
    ),
    [navigate],
  );

  useHeader({
    title: "내가 보낸 의견",
    pageBgColor: "var(--bg-base)",
    rightAreaNotCircle: true,
    rightArea,
  });

  if (!allowed) return null;

  return (
    <Page>
      <SuggestionListView />
    </Page>
  );
}

const Page = styled.div`
  width: 100%;
  min-height: 100svh;
  box-sizing: border-box;
  background: var(--bg-base);
`;

const NewButton = styled.button`
  ${typography.label2}
  padding: 0 4px;
  border: none;
  background: transparent;
  color: var(--text-brand);
  white-space: nowrap;
  cursor: pointer;
`;
