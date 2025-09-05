import styled from "styled-components";

import MobileHeader from "../containers/common/MobileHeader.tsx";

export default function MobileAlertPage() {
  // const location = useLocation();
  // const { userInfo } = useUserStore();
  //
  // const mobileNavigate = useMobileNavigate();

  // const params = new URLSearchParams(location.search);
  // const category = params.get("category") || "전체";
  // const [clubs, setClubs] = useState<Club[]>([]);
  //
  // useEffect(() => {
  //   const fetchClubs = async () => {
  //     try {
  //       const response = await getClubs(category);
  //       setClubs(response.data);
  //       console.log(response);
  //     } catch (error) {
  //       console.error("동아리 가져오기 실패", error);
  //     }
  //   };
  //   fetchClubs();
  // }, [category]);

  return (
    <MobileClubPageWrapper>
      <MobileHeader title={"알림"} />

      <TitleCategorySelectorWrapper>
        {/*<CategorySelectorWrapper>*/}
        {/*  <CategorySelector />*/}
        {/*</CategorySelectorWrapper>*/}
      </TitleCategorySelectorWrapper>
    </MobileClubPageWrapper>
  );
}

const MobileClubPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  padding-top: 72px;
  padding-bottom: 32px;
  box-sizing: border-box;

  width: 100%;

  .upload-button {
    position: fixed;
    right: 20px;
    bottom: 100px;
    z-index: 999999;
    color: white;
    background-color: rgba(64, 113, 185, 1);
    border-radius: 100%;
    width: 64px;
    height: 64px;
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;

    img {
      height: 24px;
    }

    font-size: 12px;
  }
`;

const TitleCategorySelectorWrapper = styled.div`
  width: 100%;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
