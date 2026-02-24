import Categories from "@/components/desktop/posts/Categories";

import PostsTitle from "@/components/map/MapTitle";
import MapManager from "../../components/map/MapManager.tsx";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";

export default function MapPage() {
  const location = useLocation();
  // const [id, setId] = useState(0);

  useEffect(() => {
    // const params = new URLSearchParams(location.search);
    // setId(Number(params.get("id")) || 0);
  }, [location.search]);

  return (
    <PostsPageWrapper>
      <Categories />
      <ContentsWrapper>
        <PostsTitle />
        <MapManager />
      </ContentsWrapper>
    </PostsPageWrapper>
  );
}

const PostsPageWrapper = styled.div`
  padding: 0 32px;
  display: flex;
  gap: 16px;
  position: relative;
`;

const ContentsWrapper = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
`;
