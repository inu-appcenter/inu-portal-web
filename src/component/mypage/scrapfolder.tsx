import styled from 'styled-components';
import folderImg from '../../resource/assets/file-logo.png';
import PlusImg from "../../resource/assets/plus-logo.png";
import { useEffect, useState } from 'react';
import MakeModal from './foldermakemodal';
import { useSelector } from 'react-redux';
import CreateFolder from '../../utils/postMakeFolder';
import getFolder from '../../utils/getFolder';

type FolderName = string;


// async function createFolder(): Promise<FolderName> {

//     return "New Folder";
// }

interface loginInfo {
    user: {
      token: string;
    };
  }

interface folder {
    name:string;
}

export default function ScrapFolder() {
    const token = useSelector((state: loginInfo) => state.user.token);
    const [folders, setFolders] = useState<FolderName[]>(["내 폴더"]);
    const [isOpenModal, setOpenModal] = useState<boolean>(false);

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                // 여기서 폴더 이름을 받아오는 API 호출 또는 처리
                const response = await getFolder(token);
                const names = (Object.values(response) as { name: string }[]).map(item => item.name);


                console.log(names,"폴더");
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
            console.log(response);
            setFolders([...folders, folderName]); 
        } catch (error) {
            console.error("폴더를 생성하지 못했습니다.", error);
        }

    };

    return (
        <Container>
            {folders.map((folderName, index) => (
                <FolderWrapper key={index}>
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
