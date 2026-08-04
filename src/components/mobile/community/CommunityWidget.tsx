import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getPostsByCategories } from "@/apis/posts";
import { CategoryPosts } from "@/types/posts";
import Box from "@/components/common/Box";
import Skeleton from "@/components/common/Skeleton";
import { ROUTES } from "@/constants/routes";

export default function CommunityWidget() {
  const navigate = useNavigate();
  const [categoryPosts, setCategoryPosts] = useState<CategoryPosts[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getPostsByCategories(1);
        setCategoryPosts(response.data);
      } catch (error) {
        console.error("커뮤니티 게시글 로드 실패", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box style={{ padding: 0 }}>
      <ListContainer>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`community-skeleton-${index}`} style={{ width: "100%" }}>
              <SkeletonRow>
                <Skeleton width={60} height={18} />
                <Skeleton width={10} height={14} />
                <Skeleton width="60%" height={18} />
              </SkeletonRow>
              {index < 3 && <ItemDivider />}
            </div>
          ))
        ) : categoryPosts.length === 0 ? (
          <EmptyContainer>
            <EmptyText>등록된 게시글이 없습니다.</EmptyText>
          </EmptyContainer>
        ) : (
          categoryPosts.map((item, index) => {
            const latestPost =
              item.posts && item.posts.length > 0 ? item.posts[0] : null;

            const handleClick = () => {
              navigate(`${ROUTES.BOARD.TIPS}?category=${encodeURIComponent(item.category)}`);
            };

            return (
              <div key={item.category} style={{ width: "100%" }}>
                <ItemRow onClick={handleClick}>
                  <CategoryName>{item.category}</CategoryName>
                  <Dash>-</Dash>
                  <PostTitle $hasPost={!!latestPost}>
                    {latestPost ? latestPost.title : "게시글이 없습니다."}
                  </PostTitle>
                </ItemRow>
                {index < categoryPosts.length - 1 && <ItemDivider />}
              </div>
            );
          })
        )}
      </ListContainer>
    </Box>
  );
}

// Styled Components
const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;

  &:active {
    background-color: var(--bg-subtle, #f8f9fb);
  }
`;

const CategoryName = styled.span`
  color: var(--text-brand, #0061ff);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
`;

const Dash = styled.span`
  color: var(--text-tertiary, #8b95a1);
  font-size: 13px;
  flex-shrink: 0;
`;

const PostTitle = styled.span<{ $hasPost: boolean }>`
  color: ${(props) =>
    props.$hasPost
      ? "var(--text-primary, #333d4b)"
      : "var(--text-tertiary, #8b95a1)"};
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  text-align: left;
`;

const ItemDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: var(--border-default, #e5e8eb);
`;

const EmptyContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  width: 100%;
  box-sizing: border-box;
`;

const EmptyText = styled.span`
  font-size: 14px;
  color: var(--text-tertiary, #8b95a1);
`;

const SkeletonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  width: 100%;
  box-sizing: border-box;
`;
