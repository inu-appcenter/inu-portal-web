

import ActiveInfo from "../Active/active";
import DeleteInfo from "../Delete/delete";
import ModifyInfo from "../Modify/Password/modify";
import ModifyMyInfo from "../Modify/Information/modifyme";
import ScrapInfo from "../Scrap/Scrap";


interface TipsDocumentsProps {
    selectedCategory: string;
    scrapsort: string;
    likesort: string;
    commentsort: string;
    postsort: string;
    page: string;
    setScrapSort: (sort: string) => void;
    setLikeSort: (sort: string) => void;
    setCommentSort:(sort: string) => void;
    setPostSort:(sort: string) => void;
    setPage: (page: string) => void;
}

export const MyPageLists = ({ selectedCategory, scrapsort,likesort,commentsort,postsort, page, setScrapSort,setLikeSort,setCommentSort,setPostSort, setPage }: TipsDocumentsProps) => {
    return (
        <>
                {selectedCategory === '스크랩' && <ScrapInfo scrapsort={scrapsort} page={page} setScrapSort={setScrapSort} setPage={setPage}/>}
                {selectedCategory === '내 활동' && <ActiveInfo likesort={likesort} commentsort={commentsort} postsort={postsort} setLikeSort={setLikeSort} setCommentSort={setCommentSort} setPostSort={setPostSort}/>}
                {selectedCategory === '비밀번호 변경' && <ModifyInfo />}
                {selectedCategory === '개인정보 수정' && <ModifyMyInfo />}
                {selectedCategory === '회원탈퇴' && <DeleteInfo />}
        </>
    )
}