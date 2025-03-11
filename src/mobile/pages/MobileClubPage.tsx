import CategorySelector from "mobile/components/club/ClubCategorySelector";
// import TipsPageTitle from "mobile/components/tips/TipsPageTitle";
import styled from "styled-components";
import {Club} from "types/club";
import {getClubs} from "apis/club";
import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import Title from "mobile/containers/mypage/Title.tsx"
import useMobileNavigate from "hooks/useMobileNavigate.ts"


export default function MobileClubPage() {
    const location = useLocation();
    const mobileNavigate = useMobileNavigate();

    const params = new URLSearchParams(location.search);
    const category = params.get("category") || "전체";
    const [clubs, setClubs] = useState<Club[]>([]);

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const response = await getClubs(category);
                setClubs(response.data);
                console.log(response);
            } catch (error) {
                console.error("동아리 가져오기 실패", error);
            }
        };
        fetchClubs();
    }, [category]);

    return (
        <MobileClubPageWrapper>

            <TitleCategorySelectorWrapper>
                {/*<TipsPageTitle value="동아리"/>*/}
                <Title title={"동아리"} onback={() => mobileNavigate('/home')}/>

                <CategorySelectorWrapper>
                    <CategorySelector/>

                </CategorySelectorWrapper>
            </TitleCategorySelectorWrapper>
            <ClubList>
                {clubs.map((club) => (
                    <ClubCard key={club.name}>
                        <img src={club.imageUrl} alt={club.name}/>
                        <div>
              <span className="wrapper">
                <h3>{club.name}</h3>
                <h4 className="club-category">{club.category}</h4>
              </span>
                            <span className="buttons-wrapper">
                {club.url && (
                    <button onClick={() => window.open(club.url, "_blank")}>
                        소개 페이지
                    </button>
                )}
                                {club.homeUrl && (
                                    <button onClick={() => window.open(club.homeUrl, "_blank")}>
                                        동아리 홈페이지
                                    </button>
                                )}
              </span>
                        </div>
                    </ClubCard>
                ))}
            </ClubList>
        </MobileClubPageWrapper>
    );
}

const MobileClubPageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 0 16px 0 16px;
    width: 100%;
`;

const TitleCategorySelectorWrapper = styled.div`
    width: 100%;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;

`;

const ClubList = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 8px;
`;

const ClubCard = styled.div`
    height: 96px;
    width: 96%;
    border: 2px solid #7aa7e5;
    border-radius: 10px;
    display: flex;
    gap: 16px;
    align-items: center;

    img {
        margin-left: 4px;
        max-width: 96px;
        border-radius: 10px;
    }

    div {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-right: 16px;

        .club-category {
            margin: 0;
            font-weight: 500;
            border-radius: 6px;
            padding: 4px 8px;
            font-size: 12px;
            background-color: rgba(236, 244, 255, 1);
        }

        h3 {
            margin: 0;
            font-weight: 500;
            font-size: 16px;
        }
    }

    .buttons-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    button {
        border: 2px solid #7aa7e5;
        background-color: #7aa7e5;
        border-radius: 12px;
        padding: 4px 8px;
        color: white;
    }
`;

const CategorySelectorWrapper = styled.div`
    position: absolute;
    right: 20px;
`