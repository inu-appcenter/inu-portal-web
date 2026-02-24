import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import CategorySelectorNew from "@/components/mobile/common/CategorySelectorNew";
import { useEffect, useState, Fragment, useMemo } from "react";
import Box from "@/components/common/Box";
import { getTipsCategories } from "@/apis/categories";
import TitleContentArea from "@/components/desktop/common/TitleContentArea";
import { getPostsByCategories } from "@/apis/posts";
import { Post } from "@/types/posts";
import Divider from "@/components/common/Divider";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import Skeleton from "@/components/common/Skeleton";
import PostItem from "@/components/mobile/notice/PostItem";

interface CategoryPosts {
  category: string;
  posts: Post[];
}

const MobileTipsPage = () => {
  const navigate = useNavigate();
  const [categoryPosts, setCategoryPosts] = useState<CategoryPosts[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const selectedCategory = params.get("category") || "자유게시판";

  // 데이터 초기 로드
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const categoryRes = await getTipsCategories();
        setCategoryList([...categoryRes.data]);

        // 카테고리별 최신 게시글 가져오기 (기본 5개)
        const postRes = await getPostsByCategories(3);
        setCategoryPosts(postRes.data);
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
    if (isLoading || categoryPosts.length === 0) return;

    const scrollContainer = document.getElementById("app-scroll-view");
    if (!scrollContainer) return;

    if (selectedCategory === "전체") {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

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
  }, [selectedCategory, categoryPosts, isLoading]);

  const subHeader = useMemo(
    () => (
      <CategorySelectorNew
        categories={categoryList}
        selectedCategory={selectedCategory}
      />
    ),
    [categoryList, selectedCategory],
  );

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
          ? Array.from({ length: 3 }).map((_, groupIdx) => (
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
          : categoryPosts.map((categoryItem) => (
              <CategorySection
                id={`category-${categoryItem.category}`}
                key={categoryItem.category}
              >
                <TitleContentArea
                  title={categoryItem.category}
                  link={ROUTES.BOARD.TIPS_CATEGORY(categoryItem.category)}
                >
                  <Box>
                    {categoryItem.posts.length > 0 ? (
                      categoryItem.posts.map((tip, index) => (
                        <Fragment key={tip.id}>
                          <PostItem
                            title={tip.title}
                            // category={tip.category}
                            date={tip.createDate}
                            writer={tip.writer}
                            onClick={() => {
                              navigate(ROUTES.BOARD.TIPS_DETAIL(tip.id));
                            }}
                          />
                          {index < categoryItem.posts.length - 1 && (
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
            ))}
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

const EmptyState = styled.div`
  font-size: 14px;
  color: #bbb;
  text-align: center;
`;
