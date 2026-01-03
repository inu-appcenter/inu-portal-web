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
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import Skeleton from "@/components/common/Skeleton";

const MobileTipsPage = () => {
  const navigate = useNavigate();
  const [tips, setTips] = useState<Post[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // 현재 선택된 카테고리
  const selectedCategory = params.get("category") || "자유게시판";

  // 데이터 초기 로드
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const categoryRes = await getTipsCategories();
        setCategoryList([...categoryRes.data]);

        // 전체 팁 데이터 로드
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

  // 카테고리 변경 시 스크롤 이동
  useEffect(() => {
    if (isLoading || tips.length === 0) return;

    const scrollContainer = document.getElementById("app-scroll-view");
    if (!scrollContainer) return;

    // 전체 카테고리 선택 시 최상단 이동
    if (selectedCategory === "전체") {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 특정 카테고리 섹션 이동
    const scrollTimer = setTimeout(() => {
      const targetElement = document.getElementById(
        `category-${selectedCategory}`,
      );
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, [selectedCategory, tips, isLoading]);

  // 상단 헤더 컴포넌트
  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={categoryList}
        selectedCategory={selectedCategory}
      />
    ),
    [categoryList, selectedCategory],
  );

  // 헤더 설정 등록
  useHeader({
    title: "TIPS",
    hasback: true,
    subHeader: subHeader,
    floatingSubHeader: true,
  });

  return (
    <MobileTipsPageWrapper>
      <TipsListContainerWrapper>
        {isLoading
          ? // 로딩 스켈레톤
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
          : // 카테고리별 섹션 렌더링
            categoryList.map((categoryItem) => {
              const filteredTips = tips.filter(
                (tip) => tip.category === categoryItem,
              );

              return (
                <CategorySection
                  id={`category-${categoryItem}`}
                  key={categoryItem}
                >
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
                </CategorySection>
              );
            })}
      </TipsListContainerWrapper>
    </MobileTipsPageWrapper>
  );
};

export default MobileTipsPage;

/* 스타일 정의 */
const MobileTipsPageWrapper = styled.div`
  width: 100%;
`;

const CategorySection = styled.div`
  // 헤더 높이(140px) 고려 스크롤 여백
  scroll-margin-top: 150px;
`;

const TipsListContainerWrapper = styled.div`
  width: 100%;
  padding: 0 16px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TipTitle = styled.span`
  font-size: 15px;
  color: #333;
  line-height: 1.5;
  display: block;
`;

const EmptyState = styled.div`
  font-size: 14px;
  color: #bbb;
  text-align: center;
`;
