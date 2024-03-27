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


interface Document{
    id: number;
    title: string;
    category: string;
    writer: string;
    content: string;
    like: number;
    scrap: number;
    createDate: string;
    modifiedDate: string;
  }

interface loginInfo {
    user: {
        token: string;
    };
}

interface folderInfo {
    folder: {
      folders: { [key: number]: string };
    };
  }

interface ScrapFolderInfoProps {
    scrap:boolean;
    setIsScrap:(scrap:boolean) => void;
  }
  




export default function ScrapFolder({scrap,setIsScrap}:ScrapFolderInfoProps) {
    const token = useSelector((state: loginInfo) => state.user.token);
    const [folderData, setFolderData] = useState<{ [key: number]: string }>({ 0: "내 폴더" });
    const [isOpenModal, setOpenModal] = useState<boolean>(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<number>(0);
    const [isscrapfolderpost , setIsScrapFolderPost] = useState(false);
    const [totalPages, setTotalPages] = useState<number>(1);
    const dispatch = useDispatch();
    const folders = useSelector((state: folderInfo) => state.folder.folders);

    const [postsort, setPostSort] = useState<string>('date');
  
    const [page, setPage] = useState<string>('1');
    useEffect(() => {
        console.log("업데이트된 폴더, 업데이트된 게시물", folderData, documents,folders);
    }, [folderData, documents,folders]);


    // 처음 folder 정보 가져옴
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
                    const docs = await getFolderPost(token,currentFolderId,postsort,page);                
                    setDocuments(docs['posts']);
                    setTotalPages(docs['pages']);
            } catch (error) {
                console.error("스크랩 폴더의 게시글을 가져오지 못했습니다.", error);
            }
        };
        fetchFolderPosts();
    }, [postsort,page]);



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
            await deleteFolder(token,folderIdToDelete);
            setFolderData(prevData => {
                const updatedData = { ...prevData };
                delete updatedData[folderIdToDelete];
                return updatedData;
            });
            if (currentFolderId === folderIdToDelete) {
                setDocuments([]); 
                setCurrentFolderId(0); 
            }
            dispatch(removeFolder({ [folderIdToDelete]: true }));
        } catch (error) {
            console.error("스크랩 폴더 삭제를 실패하였습니다.", error);
        }
    };

    const handleGetFolderPost = async (folderId: number) => {
        setIsScrapFolderPost(!isscrapfolderpost);
        setIsScrap(!scrap);
        console.log('클릭한 포스트아이디', folderId);
        try {
            const docs = await getFolderPost(token,folderId,postsort,page);
            console.log("가지곤폴더에담겨있는게시글",docs);
            setDocuments(docs['posts']);
            setTotalPages(docs['pages']);
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
            {documents.length > 0 &&  isscrapfolderpost && <ScrapFolderPost postScrapFolderInfo={documents} folderId={currentFolderId}  totalPages={totalPages} postsort={postsort} page={page} setPostSort={setPostSort} setPage={setPage}/>}
        </>
    );
}

const Container = styled.div`
    display: flex;
    align-items: center;

    flex-wrap:wrap;
    column-gap: 50px;
    padding: 19px 77px;
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