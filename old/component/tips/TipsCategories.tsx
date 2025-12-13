import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "old/utils/API/Categories";
import styled from "styled-components";
import round from "../../resource/assets/round.svg";

interface Category {
  name: string;
  iconWhite: string;
  iconGray: string;
  hasError?: boolean;
}

interface TipsCategoriesProps {
  docState: DocState;
  setDocState: (docState: DocState) => void;
}

export default function TipsCategories({
  docState,
  setDocState,
}: TipsCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [college, setCollege] = useState<Category[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isCollegeOpened, setIsCollegeOpened] = useState(false);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      if (docState.docType === "TIPS") {
        const response = await getCategories();
        const getCats = response.body.data;
        getCats.unshift("전체");
        const cats = getCats.map((cat: string) => ({
          name: cat,
          iconWhite: `/categoryIcons/${cat}_white.svg`,
          iconGray: `/categoryIcons/${cat}_gray.svg`,
        }));
        const collegeCats: Category[] = [];
        const otherCats: Category[] = [];

        cats.forEach((cat: Category) => {
          if (
            cat.name.endsWith("대학") ||
            cat.name === "동북아국제통상물류학부" ||
            cat.name === "법학부"
          ) {
            collegeCats.push(cat);
          } else {
            otherCats.push(cat);
          }
        });

        setCollege(collegeCats);
        setCategories(otherCats);
      } else if (docState.docType === "NOTICE") {
        const cats = ["전체", "학사", "모집", "학점교류", "교육시험"].map(
          (cat) => ({
            name: cat,
            iconWhite: `/categoryIcons/${cat}_white.svg`,
            iconGray: `/categoryIcons/${cat}_gray.svg`,
          }),
        );
        setCategories(cats);
      }
    } catch (error) {
      console.error("카테고리를 불러오는 중 에러가 발생했습니다:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [docState.docType]);

  const handleImageError = (index: number, type: "college" | "categories") => {
    if (type === "categories") {
      setCategories((prevCategories) =>
        prevCategories.map((cat, idx) =>
          idx === index ? { ...cat, hasError: true } : cat,
        ),
      );
    } else {
      setCollege((prevCategories) =>
        prevCategories.map((cat, idx) =>
          idx === index ? { ...cat, hasError: true } : cat,
        ),
      );
    }
  };

  const handleClickCategory = (category: string) => {
    setDocState({
      query: docState.query,
      docType: docState.docType,
      selectedCategory: category,
      sort: "date",
      page: "1",
    });

    if (docState.docType === "TIPS") {
      navigate("/tips");
    } else if (docState.docType === "NOTICE") {
      navigate("/tips/notice");
    }
  };

  const truncateText = (category: string) => {
    return category.length > 8 ? category.slice(0, 7) + "..." : category;
  };

  return (
    <>
      <CategoryOpen onClick={() => setIsVisible(!isVisible)}>
        카테고리 ▼
      </CategoryOpen>
      {isVisible && (
        <>
          <Categories>
            {categories.map((category, index) => (
              <CategoryItem
                className={
                  docState.selectedCategory === category.name ? "selected" : ""
                }
                key={index}
                onClick={() => handleClickCategory(category.name)}
              >
                {category.hasError ? (
                  <div style={{ width: "25px", height: "25px" }}></div>
                ) : (
                  <img
                    src={
                      docState.selectedCategory === category.name
                        ? category.iconWhite
                        : category.iconGray
                    }
                    alt={category.name}
                    onError={() => handleImageError(index, "categories")}
                  />
                )}
                {category.name}
              </CategoryItem>
            ))}
          </Categories>
          <Line />
          {docState.docType === "TIPS" && (
            <CollegeTitle onClick={() => setIsCollegeOpened(!isCollegeOpened)}>
              단과대 ▼
            </CollegeTitle>
          )}
          {isCollegeOpened && (
            <Colleges>
              {college.map((category, index) => (
                <CollegeItem
                  className={
                    docState.selectedCategory === category.name
                      ? "selected"
                      : ""
                  }
                  key={index}
                  onClick={() => handleClickCategory(category.name)}
                >
                  <img src={round} alt="icon" />
                  {truncateText(category.name)}
                </CollegeItem>
              ))}
            </Colleges>
          )}
        </>
      )}
    </>
  );
}

// Styled Components
const CategoryOpen = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  font-size: 20px;
  border: 1px solid gray;
  border-radius: 8px;
  padding: 5px;
  width: 90%;

  @media (min-width: 768px) {
    display: none;
  }
`;

const Categories = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 768px) {
    align-items: center;
    gap: 0px;
    width: 80%;
  }
`;

const CategoryItem = styled.div`
  width: 143px;
  padding-left: 50px;
  height: 60px;
  border-radius: 10px;
  cursor: url("/pointers/cursor-pointer.svg"), pointer;
  font-size: 17px;
  font-weight: 500;
  color: #656565;
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    width: 100%;
    height: 40px;
  }

  &.selected {
    background: linear-gradient(90deg, #6f84e2 0%, #7babe5 100%);
    font-weight: 700;
    color: #ffffff;
    width: auto;
  }
`;

const Line = styled.div`
  flex-grow: 0.1;
  height: 1px;
  background-color: #888888;
  width: auto;
  margin: 10px 0;

  @media (max-width: 768px) {
    width: 70%;
  }
`;

const CollegeTitle = styled.div`
  height: 50px;
  border-radius: 10px;
  cursor: url("/pointers/cursor-pointer.svg"), pointer;
  font-size: 18px;
  font-weight: 500;
  color: #656565;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    height: 50px;
  }
`;

const Colleges = styled.div`
  background-color: #eff5fe;
  width: 193px;
  border-radius: 10px;
  padding-bottom: 20px;
  padding-top: 10px;

  @media (max-width: 768px) {
    width: 70%;
  }
`;

const CollegeItem = styled.div`
  width: 155px;
  padding-left: 20px;
  height: 60px;
  border-radius: 10px;
  cursor: url("/pointers/cursor-pointer.svg"), pointer;
  font-size: 17px;
  font-weight: 500;
  color: #656565;
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    width: 100%;
    height: 40px;
  }

  &.selected {
    background: linear-gradient(90deg, #6f84e2 0%, #7babe5 100%);
    font-weight: 700;
    color: #ffffff;
    width: auto;
  }
`;
