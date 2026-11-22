import styled from "styled-components";
import SuggestionListView from "@/components/mobile/suggestion/SuggestionListView";
import { useHeader } from "@/context/HeaderContext";
import { useSuggestionAdminGuard } from "@/hooks/useSuggestionAuth";

export default function MobileAdminSuggestionPage() {
  const allowed = useSuggestionAdminGuard();

  useHeader({ title: "건의사항 관리", pageBgColor: "var(--bg-base)" });

  if (!allowed) return null;

  return (
    <Page>
      <SuggestionListView admin />
    </Page>
  );
}

const Page = styled.div`
  width: 100%;
  min-height: 100svh;
  box-sizing: border-box;
  background: var(--bg-base);
`;
