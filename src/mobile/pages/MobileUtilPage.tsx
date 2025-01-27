import MobileUtilHeader from "mobile/components/util/MobileUtilHeader";
import {useLocation} from "react-router-dom";
import styled from "styled-components";
import UploadBook from "mobile/components/util/UploadBook";
import BookList from "mobile/components/util/BookList";
import UploadLost from "mobile/components/util/UploadLost";
import LostList from "mobile/components/util/LostList";
import {useState} from "react";
import useUserStore from "stores/useUserStore";

import MobileRentalPage from "mobile/pages/MobileRentalPage.tsx"

export default function MobileUtilPage() {
    const {userInfo} = useUserStore();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    let type = params.get("type") || "book";

    const [reloadKey, setReloadKey] = useState(0);
    const [isBookUploadOpen, setIsBookUploadOpen] = useState(false);
    const [isLostUploadOpen, setIsLostUploadOpen] = useState(false);

    const handleBookUploaded = () => {
        setReloadKey((prevKey) => prevKey + 1);
        setIsBookUploadOpen(false);
    };

    const handleLostUploaded = () => {
        setReloadKey((prevKey) => prevKey + 1);
        setIsLostUploadOpen(false);
    };

    return (
        <MobileUtilPageWrapper>
            <MobileUtilHeader selectedType={type}/>
            {type === "book" && (
                <>
                    {userInfo.role == "admin" && (
                        <button
                            onClick={() => {
                                setIsBookUploadOpen(true);
                            }}
                        >
                            책 등록
                        </button>
                    )}
                    <UploadBook
                        isOpen={isBookUploadOpen}
                        onClose={() => {
                            setIsBookUploadOpen(false);
                        }}
                        onUploaded={handleBookUploaded}
                    />
                    <BookList reloadKey={reloadKey}/>
                </>
            )}
            {type === "lost" && (
                <>
                    {userInfo.role == "admin" && (
                        <button onClick={() => setIsLostUploadOpen(true)}>
                            분실물 등록
                        </button>
                    )}
                    <UploadLost
                        isOpen={isLostUploadOpen}
                        onClose={() => {
                            setIsLostUploadOpen(false);
                        }}
                        onUploaded={handleLostUploaded}
                    />
                    <LostList reloadKey={reloadKey}/>
                </>
            )}
            {type === "rental" && (
                <MobileRentalPage/>
            )}
        </MobileUtilPageWrapper>
    );
}

const MobileUtilPageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;

    padding: 0px 10px 0px 10px;
`;
