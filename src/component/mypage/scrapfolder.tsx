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

import deleteFolder from '../../utils/deletefolder';




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
    const [folderData, setFolderData] = useState<{[key:string]:number}>({"내 폴더":0});
     const [isOpenModal, setOpenModal] = useState<boolean>(false);
    const [folderPosts, setFolderPosts] = useState<PostInfo[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<number | undefined>(undefined); // 변경된 부분
    useEffect(() => {
        console.log("업데이트된 폴더, 업데이트된 게시물", folderData,folderPosts);
    }, [folderData,folderPosts]);


    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const response = await getFolder(token) as { id: number; name: string }[];
                console.log("여기 뭐가 나오는건데",response);

                const data:{ [key:string]:number} = {};
                response.forEach(item => {
                    data[item.name] = item.id;
                })
                console.log(data,"data에 뭐가 들어가있지");
                setFolderData(prevFolderData => ({ ...prevFolderData,...data}));
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
                console.log(folderData,"시작전이구");
                for (const folderName in folderData) {
                    const response = await getFolderPost(folderData[folderName]);
                    newFolderPosts.push(...response);
                }
                setFolderPosts(newFolderPosts);
            } catch (error) {
                console.error("스크랩 폴더의 게시글을 가져오지 못했습니다.", error);
            }
        };
    
        fetchFolderPosts(); 
    }, [folderData]);
    

    const handleMakeFolder =  () => {
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
    };



    const handleFolderCreate = async (folderName: string) => {
        try {
            const response = await CreateFolder(token,folderName);
            console.log(response,"생성",response.data);
            const newFolderId = response.data;
            setFolderData(prevData => ({ ...prevData, [folderName]: newFolderId }));
            setCurrentFolderId(newFolderId);
        } catch (error) {
            console.error("폴더를 생성하지 못했습니다.", error);
        }

    };

    const handleFolderDelete = async(folderIdToDelete:number) => {
        console.log(folderIdToDelete,"삭제할 폴더 아이디가 뭔데");
        try {
            const response = await deleteFolder(folderIdToDelete);
            console.log(response, "삭제한 폴더 ");
            const updatedFolderData = { ...folderData };
            delete updatedFolderData[Object.keys(folderData).find(key => folderData[key] === folderIdToDelete) || ""];
            setFolderData(updatedFolderData);
    
        } catch (error) {
            console.log("스크랩 폴더 삭제를 실패하였습니다.",error);
        }

    };

    const handleGetFolderPost = async (folderId: number) => {
        console.log(folderId,"id가 뭔데");
        try {
            const response = await getFolderPost(folderId); 
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
                {Object.keys(folderData).map((folderName,index)=>(
                     <FolderWrapper key={index} onClick={() => handleGetFolderPost(folderData[folderName])}>
                     <Folder src={folderImg} alt="" />
                     <FolderNameInput>{folderName}</FolderNameInput>
                     <button onClick={()=>handleFolderDelete(folderData[folderName])}>-</button>
                 </FolderWrapper>
                ))}
                {<Plus src={PlusImg} onClick={handleMakeFolder} />}
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
