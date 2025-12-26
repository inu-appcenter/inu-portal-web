import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { useEffect, useState, Fragment } from "react";
import Box from "@/components/common/Box";
import MobileHeader from "@/containers/mobile/common/MobileHeader";
import { getTipsCategories } from "@/apis/categories";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import { getPostsMobile } from "@/apis/posts";
import { Post } from "@/types/posts";
import Divider from "@/components/common/Divider";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

const MobileSchoolNoticePage = () => {
  useHeader({
    title: "TIPS",
    hasback: true,
  });
  const navigate = useNavigate();

  const [tips, setTips] = useState<Post[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || categoryList[0];

  // 데이터 로드
  useEffect(() => {
    const initData = async () => {
      try {
        const categoryRes = await getTipsCategories();
        setCategoryList([...categoryRes.data]);

        const postRes = await getPostsMobile(undefined, "전체");
        setTips(postRes.data);
      } catch (error) {
        console.error("데이터 로드 실패", error);
      }
    };

    initData();
  }, []);

  // 카테고리 선택 시 스크롤 제어
  useEffect(() => {
    // SubLayout의 AppContainer 참조
    const scrollContainer = document.getElementById("app-scroll-view");

    if (selectedCategory === "전체") {
      scrollContainer?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const targetElement = document.getElementById(
      `category-${selectedCategory}`,
    );
    if (targetElement && scrollContainer) {
      // MobileHeader(56px) + CategorySelector(약 48px) 높이 고려
      const headerOffset = 104;
      const targetPosition = targetElement.offsetTop - headerOffset;

      scrollContainer.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  }, [selectedCategory, tips]);

  return (
    <>
      <MobileHeader
        subHeader={
          <CategorySelectorNew
            categories={categoryList}
            selectedCategory={selectedCategory}
          />
        }
        floatingSubHeader={true}
      />

      <MobileSchoolNoticePageWrapper>
        <TipsListContainerWrapper>
          {categoryList.map((categoryItem) => {
            const filteredTips = tips.filter(
              (tip) => tip.category === categoryItem,
            );

            return (
              <div id={`category-${categoryItem}`} key={categoryItem}>
                <TitleContentArea title={categoryItem}>
                  <Box>
                    {filteredTips.length > 0 ? (
                      filteredTips.map((tip, index) => (
                        <Fragment key={tip.id}>
                          <TipTitle
                            onClick={() => {
                              navigate(ROUTES.BOARD.TIPS_DETAIL(tip.id));
                            }}
                          >
                            {tip.title}
                          </TipTitle>
                          {index < filteredTips.length - 1 && (
                            <Divider margin={"16px 0"} />
                          )}
                        </Fragment>
                      ))
                    ) : (
                      <EmptyState>
                        해당 카테고리의 게시글이 없습니다.
                      </EmptyState>
                    )}
                  </Box>
                </TitleContentArea>
              </div>
            );
          })}
        </TipsListContainerWrapper>
      </MobileSchoolNoticePageWrapper>
    </>
  );
};

export default MobileSchoolNoticePage;

/* Styled Components */

const MobileSchoolNoticePageWrapper = styled.div`
  width: 100%;
  position: relative;
`;

const TipsListContainerWrapper = styled.div`
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TipTitle = styled.span`
  font-size: 15px;
  color: #333;
  line-height: 1.5;
`;

const EmptyState = styled.div`
  //padding: 30px 0;
  font-size: 14px;
  color: #bbb;
  text-align: center;
`;
