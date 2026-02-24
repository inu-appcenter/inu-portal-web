import styled from "styled-components";
import folderImg from "../../../resource/assets/file-img.svg";
import PlusImg from "../../../resource/assets/+.svg";
import { useDispatch, useSelector } from "react-redux";
import { deleteFolders } from "old/utils/API/Folders";
import { removeFolder } from "old/reducer/folderSlice";
import deleteImg from "../../../resource/assets/deletebtn.svg";

interface loginInfo {
  user: {
    token: string;
  };
}

interface ScrapFolderInfoProps {
  folderData: { [key: number]: string };
  handleFolderClick: (folderId: number) => void;
  setFolderData: (folder: { [key: number]: string }) => void;
  setIsScrap: (status: boolean) => void;
  onMakeFolder: () => void;
}

export default function ScrapFolder({
  folderData,
  handleFolderClick,
  setFolderData,
  setIsScrap,
  onMakeFolder,
}: ScrapFolderInfoProps) {
  const token = useSelector((state: loginInfo) => state.user.token);
  const dispatch = useDispatch();

  const handleFolderDelete = async (folderIdToDelete: number) => {
    try {
      const response = await deleteFolders(token, folderIdToDelete);
      if (response.status === 200) {
        const updatedData = { ...folderData };
        delete updatedData[folderIdToDelete];
        setFolderData(updatedData);
        dispatch(removeFolder({ [folderIdToDelete]: true }));
        setIsScrap(true);
        console.log("폴더 삭제 성공:", response.body);
      } else {
        console.error("폴더 삭제 실패:", response.status);
      }
    } catch (error) {
      console.error("스크랩 폴더 삭제를 실패하였습니다.", error);
    }
  };

  return (
    <>
      <Container>
        {Object.entries(folderData).map(([folderId, folderName]) => (
          <FolderWrapper key={folderId}>
            <Folder
              src={folderImg}
              alt=""
              onClick={() => handleFolderClick(Number(folderId))}
            />
            <FolderNameInput>{folderName}</FolderNameInput>
            <img
              className="delete"
              src={deleteImg}
              onClick={() => handleFolderDelete(Number(folderId))}
            ></img>
          </FolderWrapper>
        ))}
        <FolderAddWrapper>
          <Plus src={PlusImg} onClick={onMakeFolder} />
        </FolderAddWrapper>
      </Container>
    </>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 50px;
  padding: 19px 77px;
  background: linear-gradient(#dbebff 10%, #ffffff);
`;

const FolderWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;
  position: relative;
  .delete {
    border: none;
    width: 11px;
    height: 11px;
    background-color: #4071b9;
    border-radius: 50%;
    color: white;
    line-height: 11px;
    position: absolute;
    left: 90%;
    bottom: 90%;
  }
`;

const Folder = styled.img`
  position: relative;
`;

const FolderNameInput = styled.p`
  position: absolute;
  bottom: 10px;
  margin-left: 20px;
  width: 84px;
  height: 22px;
  border: none;
  border-radius: 5px;
  background-color: #ffffffb2;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
`;

const Plus = styled.img`
  width: 30px;
  height: 30px;
  color: gray;
`;

const FolderAddWrapper = styled.div`
  width: 128px;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
