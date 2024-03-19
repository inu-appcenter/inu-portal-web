import styled from 'styled-components';

import folderImg from "../../../resource/assets/file-logo.png"
import PlusImg from "../../../resource/assets/plus-logo.png";
import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import CreateFolder from '../../../utils/postMakeFolder';
import getFolder from '../../../utils/getFolder';
import getFolderPost from '../../../utils/getfolderpost';

import deleteFolder from '../../../utils/deletefolder';
import { addFolder, removeFolder } from '../../../reducer/folderSlice';
import { ScrapFolderPost } from './ScrapFolderDetail';
import MakeModal from './ScrapFolderModal';

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
    const [folderData, setFolderData] = useState<{ [key: number]: string }>({ 0: "내 폴더" });
    const [isOpenModal, setOpenModal] = useState<boolean>(false);
    const [folderPosts, setFolderPosts] = useState<PostInfo[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<number | undefined>(undefined);
    const dispatch = useDispatch();
    const folders = useSelector((state: any) => state.folder.folders);
    useEffect(() => {
        console.log("업데이트된 폴더, 업데이트된 게시물", folderData, folderPosts,folders);
    }, [folderData, folderPosts,folders]);

    // useEffect(() => {
    //     console.log("redux0",folders);
    // }, [folders]);

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const response = await getFolder(token) as { id: number; name: string }[];
                const data: { [key: number]: string } = {};
                response.forEach(item => {
                    data[item.id] = item.name;
                });
                console.log("data형태",data);
                setFolderData(prevFolderData => ({ ...prevFolderData, ...data }));
                dispatch(addFolder(data));
            } catch (error) {
                console.error("폴더 이름을 가져오지 못했습니다.", error);
            }
        };
        fetchFolders();
    }, [token]);

    useEffect(() => {
        const fetchFolderPosts = async () => {
            try {
                const newFolderPosts: PostInfo[] = [];
                for (const folderId in folderData) {
                    const response = await getFolderPost(Number(folderId));
                    newFolderPosts.push(...response);
                }
                setFolderPosts(newFolderPosts);
            } catch (error) {
                console.error("스크랩 폴더의 게시글을 가져오지 못했습니다.", error);
            }
        };
        fetchFolderPosts();
    }, [folderData]);

    const handleMakeFolder = () => {
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
    };

    const handleFolderCreate = async (folderName: string) => {
        try {
            const response = await CreateFolder(token, folderName);
            const newFolderId = response.data;
            setFolderData(prevData => ({ ...prevData, [newFolderId]: folderName }));
            setCurrentFolderId(newFolderId);
            dispatch(addFolder({[newFolderId]: folderName}));
        } catch (error) {
            console.error("폴더를 생성하지 못했습니다.", error);
        }
    };

    const handleFolderDelete = async (folderIdToDelete: number) => {
        try {
            await deleteFolder(folderIdToDelete);
            setFolderData(prevData => {
                const updatedData = { ...prevData };
                delete updatedData[folderIdToDelete];
                return updatedData;
            });
            if (currentFolderId === folderIdToDelete) {
                setFolderPosts([]); 
                setCurrentFolderId(undefined); 
            }
            dispatch(removeFolder({ [folderIdToDelete]: true }));
        } catch (error) {
            console.error("스크랩 폴더 삭제를 실패하였습니다.", error);
        }
    };

    const handleGetFolderPost = async (folderId: number) => {
        try {
            const response = await getFolderPost(folderId);
            const responseInfo: PostInfo[] = response.map((item: any) => ({
                id: item.id,
                title: item.title,
                category: item.category
            }));
            setFolderPosts(responseInfo);
            setCurrentFolderId(folderId);
        } catch (error) {
            console.error("스크랩 폴더의 게시글을 가져오지 못했습니다.", error);
        }
    };

    return (
        <>
            <Container>
                {Object.entries(folderData).map(([folderId, folderName]) => (
                    <FolderWrapper key={folderId} onClick={() => handleGetFolderPost(Number(folderId))}>
                        <Folder src={folderImg} alt="" />
                        <FolderNameInput>{folderName}</FolderNameInput>
                        <button onClick={() => handleFolderDelete(Number(folderId))}></button>
                    </FolderWrapper>
                ))}
                <FolderAddWrapper>
                <Plus src={PlusImg} onClick={handleMakeFolder} />
                </FolderAddWrapper>
                {isOpenModal && <MakeModal closeModal={closeModal} onChange={handleFolderCreate} />}
            </Container>
            {folderPosts.length > 0 && <ScrapFolderPost postScrapFolderInfo={folderPosts} folderId={currentFolderId} />}
        </>
    );
}

const Container = styled.div`
    display: flex;
    align-items: center;

    flex-wrap:wrap;
    column-gap: 50px;
`
const FolderWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-top: 20px;
    position: relative;
    button {
        border:none;
        width: 11px;
        height: 11px;
        background-color: #4071B9;
        border-radius: 50%;
        color:white;
        line-height: 11px;
        position: absolute;
        left: 80%;
        top:10%;
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