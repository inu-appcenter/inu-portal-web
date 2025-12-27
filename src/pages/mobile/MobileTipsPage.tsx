import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { useEffect, useState, Fragment, useMemo } from "react";
import Box from "@/components/common/Box";
import { getTipsCategories } from "@/apis/categories";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import { getPostsMobile } from "@/apis/posts";
import { Post } from "@/types/posts";
import Divider from "@/components/common/Divider";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import Skeleton from "@/components/common/Skeleton";

const MobileSchoolNoticePage = () => {
  const navigate = useNavigate();

  const [tips, setTips] = useState<Post[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || categoryList[0];

  // 초기 데이터 로드
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const categoryRes = await getTipsCategories();
        setCategoryList([...categoryRes.data]);

        const postRes = await getPostsMobile(undefined, "전체");
        setTips(postRes.data);
      } catch (error) {
        console.error("데이터 로드 실패", error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // 카테고리 선택 시 스크롤 제어
  useEffect(() => {
    if (isLoading) return; // 로딩 중 스크롤 방지

    const scrollContainer = document.getElementById("app-scroll-view");

    if (selectedCategory === "전체") {
      scrollContainer?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const targetElement = document.getElementById(
      `category-${selectedCategory}`,
    );
    if (targetElement && scrollContainer) {
      const headerOffset = 104;
      const targetPosition = targetElement.offsetTop - headerOffset;

      scrollContainer.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  }, [selectedCategory, tips, isLoading]);

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={categoryList}
        selectedCategory={selectedCategory}
      />
    ),
    [categoryList, selectedCategory],
  ); // 의존성 배열 관리

  useHeader({
    title: "TIPS",
    hasback: true,
    subHeader: subHeader,
    floatingSubHeader: true,
  });

  return (
    <MobileSchoolNoticePageWrapper>
      <TipsListContainerWrapper>
        {isLoading
          ? // 로딩 중 스켈레톤 UI
            Array.from({ length: 3 }).map((_, groupIdx) => (
              <div key={`group-skeleton-${groupIdx}`}>
                <TitleContentArea title={<Skeleton width={100} height={20} />}>
                  <Box>
                    {Array.from({ length: 3 }).map((_, itemIdx) => (
                      <Fragment key={`item-skeleton-${itemIdx}`}>
                        <Skeleton width="70%" height={22} />
                        {itemIdx < 2 && <Divider margin={"16px 0"} />}
                      </Fragment>
                    ))}
                  </Box>
                </TitleContentArea>
              </div>
            ))
          : // 실제 데이터 렌더링
            categoryList.map((categoryItem) => {
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
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TipTitle = styled.span`
  font-size: 15px;
  color: #333;
  line-height: 1.5;
  display: block; // 클릭 영역 확보
`;

const EmptyState = styled.div`
  font-size: 14px;
  color: #bbb;
  text-align: center;
`;
