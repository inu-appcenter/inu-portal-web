import styled from "styled-components";
import {useState} from "react";
// import TipsPageTitle from "mobile/components/tips/TipsPageTitle";
import CategorySelector from "mobile/components/common/CategorySelector";
import {useLocation} from "react-router-dom";
import ViewModeButtons from "mobile/components/tips/ViewModeButtons";
import TipsListContainer from "mobile/containers/tips/TipsListContainer";
import SerachForm from "mobile/containers/home/SerachForm";
import {useResetTipsStore} from "reducer/resetTipsStore";
import Title from "mobile/containers/mypage/Title.tsx"
import useMobileNavigate from "../../hooks/useMobileNavigate.ts";


export default function MobileTipsPage() {
    const location = useLocation();
    const mobileNavigate = useMobileNavigate();

    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const resetKey = useResetTipsStore((state) => state.resetKey); // 전역 상태에서 resetKey 구독
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";
    let docType = "TIPS";
    if (query) {
        docType = "SEARCH";
    } else if (params.get("type") === "notice") {
        docType = "NOTICE";
    } else if (params.get("type") === "councilNotice") {
        docType = "COUNCILNOTICE";
    }
    const category = params.get("category") || "전체";
    const title = docType === "NOTICE" ? "공지사항" : docType === "COUNCILNOTICE" ? "총학생회 공지사항" : docType;

    return (
        <MobileTipsPageWrapper>
            <TitleCategorySelectorWrapper>
                {/*<TipsPageTitle value={docType + (query ? ` - ${query}` : "")}/>*/}
                <Title title={title} onback={() => mobileNavigate('/home')}/>


                <ViewModeButtonCategorySelectorWrapper>
                    {(docType === "TIPS" || docType === "NOTICE") && <CategorySelector/>}
                    <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode}/>
                </ViewModeButtonCategorySelectorWrapper>
            </TitleCategorySelectorWrapper>
            {(docType === "TIPS" || docType === "SEARCH") && <SerachForm/>}

            <Wrapper>
                <TipsListContainer
                    key={resetKey}
                    viewMode={viewMode}
                    docType={docType}
                    category={category}
                    query={query}
                />
            </Wrapper>
        </MobileTipsPageWrapper>
    );
}

const MobileTipsPageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 0 16px 0 16px;
    width: 100%;
`;

const TitleCategorySelectorWrapper = styled.div`
    width: 100%;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;

`;

const ViewModeButtonCategorySelectorWrapper = styled.div`
    position: absolute;
    right: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
`;
const Wrapper = styled.div`
    display: flex;
    width: 100%;
    height: 100%;

`;
