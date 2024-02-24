import styled from 'styled-components';
import folderImg from '../../resource/assets/file-logo.png';
import PlusImg from "../../resource/assets/plus-logo.png";
import { useEffect, useState } from 'react';
import MakeModal from './foldermakemodal';
import { useSelector } from 'react-redux';
import CreateFolder from '../../utils/postMakeFolder';
import getFolder from '../../utils/getFolder';
import getFolderPost from '../../utils/getfolderpost';

type FolderName = string;


// async function createFolder(): Promise<FolderName> {

//     return "New Folder";
// }

interface loginInfo {
    user: {
      token: string;
    };
  }


export default function ScrapFolder() {
    const token = useSelector((state: loginInfo) => state.user.token);
    const [folders, setFolders] = useState<FolderName[]>(["내 폴더"]);
    const [folderId, setFolderId] = useState<number[]>([0]);
    const [isOpenModal, setOpenModal] = useState<boolean>(false);

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                // 여기서 폴더 이름을 받아오는 API 호출 또는 처리
                const response = await getFolder(token);
                const names = (Object.values(response) as { name: string }[]).map(item => item.name);
                const folderId = (Object.values(response) as { id: number }[]).map(item => item.id);

                console.log(names,"폴더",folderId);
                setFolderId(prevFolderId => [...prevFolderId,...folderId]);
                setFolders(prevFolders => [...prevFolders, ...names]);
            } catch (error) {
                console.error("폴더 이름을 가져오지 못했습니다.", error);
            }
        };

        fetchFolders(); 
    }, [token]);

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

    const handleGetFolderPost = async (folderId:number) => {
        try {
            const respone = await getFolderPost(folderId);
            console.log(respone, "d요기양 ");
        }
        catch(error) {
            console.log("스크랩 폴더의 게시글을 담아오지 못했습니다." ,error);
        }
    }

    return (
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
    top: 18%;
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
