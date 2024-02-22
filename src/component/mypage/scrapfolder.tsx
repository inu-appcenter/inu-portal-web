import styled from 'styled-components';
import folderImg from '../../resource/assets/file-logo.png';
import PlusImg from "../../resource/assets/plus-logo.png";
import { useState } from 'react';


type FolderName = string;


export default function ScrapFolder() {
    const [folders, setFolders] = useState<FolderName[]>(["내 폴더"]);
    
    const handleMakeFolder = async () => {
        try {
            const newFolderName: FolderName = await createFolder(); 
            setFolders([...folders, newFolderName]); 
        } catch (error) {
            console.error("폴더를 생성하지 못했습니다.", error);
        }
    };

    const handleNmaeFolder = (index: number, folderName: string) => {
        const updatedFolders = [...folders];
        updatedFolders[index] = folderName;
        setFolders(updatedFolders);
    };

    return (
        <Container>
            {folders.map((folderName, index) => (
                <FolderWrapper key={index}>
                    <Folder src={folderImg} alt="" />
                    <FolderNameInput 
                        type="text" 
                        value={folderName} 
                        onChange={(e) => handleNmaeFolder(index, e.target.value)} />
                </FolderWrapper>
            ))}
            <Plus src={PlusImg} onClick={handleMakeFolder}/>
        </Container>
    );
}


const Container = styled.div`
    display: flex;
    align-items: center;
    gap: 60%;
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

const FolderNameInput = styled.input`
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
