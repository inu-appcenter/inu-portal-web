import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

interface CategorySelectorNewProps {
  categories: string[];
  selectedCategory?: string;
}

export default function CategorySelectorNew({
  categories,
  selectedCategory,
}: CategorySelectorNewProps) {
  const location = useLocation();
  const navigate = useNavigate();
  // const [type, setType] = useState("");
  // const [categories, setCategories] = useState<string[]>([]);
  // const { isAppUrl } = useAppStateStore();

  // useEffect(() => {
  //   const params = new URLSearchParams(location.search);
  //
  //   if (location.pathname === `${isAppUrl}/write`) {
  //     setType("write");
  //   } else if (location.pathname === `${isAppUrl}/home/notice`) {
  //     setType("notice");
  //   } else if (location.pathname === `${isAppUrl}/home/tips`) {
  //     setType("tips");
  //   }
  //
  //   if (params.get("search")) {
  //     setSelectedCategory("");
  //   } else {
  //     setSelectedCategory(params.get("category") || "전체");
  //   }
  // }, [location.pathname, location.search]);
  //
  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       if (categoriesProp && categoriesProp.length > 0) {
  //         // ✅ props가 있으면 그걸 우선 사용
  //         setCategories(categoriesProp);
  //         setSelectedCategory("-1");
  //         return;
  //       }
  //
  //       if (type === "tips") {
  //         const response = await getTipsCategories();
  //         setCategories(["전체", ...response.data]);
  //       } else if (type === "write") {
  //         const response = await getTipsCategories();
  //         setCategories(response.data);
  //       } else if (type === "notice") {
  //         const response = await getSchoolNoticeCategories();
  //         setCategories(["전체", ...response.data]);
  //       }
  //     } catch (error) {
  //       console.error("모든 카테고리 가져오기 실패", error);
  //     }
  //   };
  //   fetchCategories();
  // }, [type, categoriesProp]);

  const handleClickCategory = (category: string) => {
    const params = new URLSearchParams(location.search);
    params.delete("search");
    params.set("category", category);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  return (
    <CategorySelectorWrapper>
      <CategoryScrollArea>
        {categories.map((category, index) => (
          <FillItem
            key={index}
            $selected={selectedCategory === category}
            onClick={() => handleClickCategory(category)}
          >
            <div>{category}</div>
          </FillItem>
        ))}
      </CategoryScrollArea>

      {/*<GradientRight />*/}
    </CategorySelectorWrapper>
  );
}

const CategorySelectorWrapper = styled.div`
  //position: relative;
  width: 100%;
  height: fit-content;
`;

const CategoryScrollArea = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
  overflow-x: auto;
  padding: 0 20px 4px 0;
  box-sizing: border-box;

  /* 우측 끝부분을 투명하게 처리 (배경색 무관) */
  mask-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 90%,
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 1) 90%,
    rgba(0, 0, 0, 0) 100%
  );

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FillItem = styled.div<{ $selected: boolean }>`
  min-width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  height: fit-content;
  border-radius: 100px;
  padding: 8px 14px;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 500;

  background: ${({ $selected }) => ($selected ? "#5E92F0" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#F4F4F4" : "#666")};
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
`;
