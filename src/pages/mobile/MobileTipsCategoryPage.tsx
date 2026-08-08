import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

const MobileTipsCategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const selectedCategory = category || "전체";

  return (
    <Navigate
      to={`${ROUTES.BOARD.TIPS}?category=${encodeURIComponent(selectedCategory)}`}
      replace
    />
  );
};

export default MobileTipsCategoryPage;
