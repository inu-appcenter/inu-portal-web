import Categories from "components/posts/Categories";

import PostsTitle from "components/map/MapTitle";
import Map from "components/map/components/KakaoMap.tsx";
import { useEffect /*useState*/ } from "react";
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
        <Map />
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
