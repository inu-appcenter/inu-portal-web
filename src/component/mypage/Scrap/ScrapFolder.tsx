

import styled from 'styled-components';

import folderImg from "../../../resource/assets/file-img.png"
import PlusImg from "../../../resource/assets/+.png";
import {  useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import CreateFolder from '../../../utils/postMakeFolder';

import deleteFolder from '../../../utils/deletefolder';
import { addFolder, removeFolder } from '../../../reducer/folderSlice';
import MakeModal from './ScrapFolderModal';
import deleteImg from "../../../resource/assets/delete-img.png"

interface loginInfo {
    user: {
        token: string;
    };
}


interface ScrapFolderInfoProps {
    folderData:{ [key: number]: string };
    handleFolderClick: (folderId: number) => void;
   setFolderData: (folder: { [key: number]: string }) => void;
    setIsScrap:(status:boolean) => void;
    setIsFolderScrap:(status:boolean) => void;
  }
  
export default function ScrapFolder({folderData,handleFolderClick,setFolderData,setIsScrap,setIsFolderScrap}:ScrapFolderInfoProps) {
    const token = useSelector((state: loginInfo) => state.user.token);
    const [isOpenModal, setOpenModal] = useState<boolean>(false);
    const dispatch = useDispatch();

    const handleMakeFolder = () => {
        console.log("ehlsrjsl");
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
    };
    
    const handleFolderCreate = async (folderName: string) => {
        try {
            const response = await CreateFolder(token, folderName);
            const newFolderId = response.data;
            setFolderData({ ...folderData, [newFolderId]: folderName });
            dispatch(addFolder({[newFolderId]: folderName}));
        } catch (error) {
            console.error("폴더를 생성하지 못했습니다.", error);
        }
    };
 
   


const handleFolderDelete = async (folderIdToDelete: number) => {
    try {
        await deleteFolder(token,folderIdToDelete);
        const updatedData = { ...folderData };
        delete updatedData[folderIdToDelete];
        setFolderData(updatedData);
        dispatch(removeFolder({ [folderIdToDelete]: true }));
        setIsScrap(true);
        setIsFolderScrap(false);
    } catch (error) {
        console.error("스크랩 폴더 삭제를 실패하였습니다.", error);
    }
};

    return (
        <>
            <Container>
                {Object.entries(folderData).map(([folderId, folderName]) => (
                    <FolderWrapper key={folderId}>
                        <Folder src={folderImg} alt=""  onClick={() => handleFolderClick(Number(folderId))}/>
                        <FolderNameInput>{folderName}</FolderNameInput>
                        <img className="delete" src={deleteImg} onClick={() => handleFolderDelete(Number(folderId))}></img>
                    </FolderWrapper>
                ))}
                <FolderAddWrapper>
                <Plus src={PlusImg} onClick={handleMakeFolder}/>
                </FolderAddWrapper>
                {isOpenModal && <MakeModal closeModal={closeModal} onChange={handleFolderCreate} />}
            </Container>
   </>
    );
}

const Container = styled.div`
    display: flex;
    align-items: center;

    flex-wrap:wrap;
    column-gap: 50px;
    padding:19px 77px;
    background: linear-gradient(#DBEBFF 10%, #FFFFFF);
`
const FolderWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-top: 20px;
    position: relative;
    .delete {
        border:none;
        width: 11px;
        height: 11px;
        background-color: #4071B9;
        border-radius: 50%;
        color:white;
        line-height: 11px;
        position: absolute;
        left: 90%;
        bottom:90%;
    }

`;

const Folder = styled.img`
position: relative;
`;

const FolderNameInput = styled.p`
    position: absolute;
    bottom: 10px;
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
const FolderAddWrapper = styled.div`
       width: 128px;
       height: 128px;
        display: flex;
        align-items: center;
        justify-content: center;
`