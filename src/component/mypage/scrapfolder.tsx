import styled from 'styled-components';
import folderImg from '../../resource/assets/file-logo.png';
import PlusImg from "../../resource/assets/plus-logo.png";
import { useEffect, useState } from 'react';
import MakeModal from './foldermakemodal';
import { useSelector } from 'react-redux';
import CreateFolder from '../../utils/postMakeFolder';
import getFolder from '../../utils/getFolder';
import getFolderPost from '../../utils/getfolderpost';
import { ScrapFolderPost } from './scrapfolderdetail';
type FolderName = string;


interface loginInfo {
    user: {
      token: string;
    };
  }


  interface PostInfo {
    id: number;
    title: string;
    category: string;
  }
  

  export default function ScrapFolder() {
    const token = useSelector((state: loginInfo) => state.user.token);
    const [folders, setFolders] = useState<FolderName[]>(["내 폴더"]);
    const [folderId, setFolderId] = useState<number[]>([0]);
    const [isOpenModal, setOpenModal] = useState<boolean>(false);
    const [folderPosts, setFolderPosts] = useState<PostInfo[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<number | undefined>(undefined); // 변경된 부분
    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const response = await getFolder(token) as { id: number; name: string }[];
                console.log("여기 뭐가 나오는건데",response);
                // const names = (Object.values(response) as { name: string }[]).map(item => item.name);
                // const folderId = (Object.values(response) as { id: number }[]).map(item => item.id);
                const folderId = response.map(item => item.id);
                const names = response.map(item => item.name);
                console.log(names);
                setFolderId(prevFolderId => [...prevFolderId, ...folderId]);
                setFolders(prevFolders => [...prevFolders, ...names]);
                
            } catch (error) {
                console.error("폴더 이름을 가져오지 못했습니다.", error);
            }
        };

        fetchFolders(); 
    }, [token]);

    useEffect(() => {
        const fetchFolderPosts = async () => {
            try {
                // const newFolderPosts: ScrapFolderPostProps[] = [];
                console.log(folderId,"시작전이구");
                for (let id = 1; id < folderId.length; id++) {
                    const response = await getFolderPost(folderId[id]) as PostInfo[];
                    console.log(response,"결과가 뭔데?");
                    // const scrapFolderPost: ScrapFolderPostProps = { postScrapFolderInfo: response };
                    // newFolderPosts.push(scrapFolderPost);
                    setFolderPosts(response);
                }
                // setFolderPosts(prevPosts => [...prevPosts, ...newFolderPosts]);
                console.log(folderPosts,"처음 렌더링할때 뭐가 있니?")
            } catch (error) {
                console.error("스크랩 폴더의 게시글을 가져오지 못했습니다.", error);
            }
        };
    
        fetchFolderPosts(); 
    }, [folderId]);
    

    const handleMakeFolder =  () => {
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
    };



    const handleFolderCreate = async (folderName: string) => {
        try {
            const response = await CreateFolder(token,folderName);
            console.log(response,"생성");
            setFolders([...folders, folderName]); 
            setFolderId([...folderId,response.data.id]);
            console.log(folderId,"폴더 아이디들",folders,"폴더들");
        } catch (error) {
            console.error("폴더를 생성하지 못했습니다.", error);
        }

    };

    const handleGetFolderPost = async (folderId: number) => {
        try {
            const response = await getFolderPost(folderId); // 폴더 게시글의 목록이라고 가정
            console.log(response, "폴더 게시글 목록");
            const responseInfo: PostInfo[] = response.map((item: any) => ({
                id: item.id,
                title: item.title,
                category: item.category
            }));
            console.log(responseInfo);
            setFolderPosts(responseInfo);
            setCurrentFolderId(folderId);
        } catch(error) {
            console.log("스크랩 폴더의 게시글을 가져오지 못했습니다.", error);
        }
    }

    return (
        <>
            <Container>
                {folders.map((folderName, index) => (
                    
                    <FolderWrapper key={index} onClick={() => handleGetFolderPost(folderId[index])}>
                        <Folder src={folderImg} alt="" />
                        <FolderNameInput>{folderName}</FolderNameInput>
                    </FolderWrapper>
                ))}
                <Plus src={PlusImg} onClick={handleMakeFolder} />
                {isOpenModal && <MakeModal closeModal={closeModal} onChange={handleFolderCreate}/>}

            </Container>
            {folderPosts.length > 0 && <ScrapFolderPost postScrapFolderInfo={folderPosts} folderId={currentFolderId}/>}
        </>
    );
}


const Container = styled.div`
    display: flex;
    align-items: center;

    flex-wrap: nowrap;
`
const FolderWrapper = styled.div`
    display: flex;
    align-items: center;
    
    margin-top: 20px;
`;

const Folder = styled.img`
    position: relative;
`;

const FolderNameInput = styled.p`
    position: absolute;
    top: 16%;
    margin-left:20px;
    width: 84px;
    height: 22px;
    border: none;
    border-radius: 5px;
    background-color:  #FFFFFFB2;
    text-align: center;
    font-family: Inter;
    font-size: 12px;
    font-weight: 700;
`;

const Plus = styled.img`
  width: 30px;
  height: 30px;
  color:gray;
`
