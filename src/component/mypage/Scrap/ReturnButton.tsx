// import { useNavigate } from "react-router-dom";

interface ReturnScrapButtonProps {
    setIsScrap:(scrap:boolean) => void;
    setIsScrapFolderPost:(scrapfolder:boolean) => void;
  }
  
export default function ReturnScrapButton ({setIsScrap,setIsScrapFolderPost}:ReturnScrapButtonProps) {
    // const navigate = useNavigate();
    const handleopen = () => {
        setIsScrap(true);
        setIsScrapFolderPost(false);
    }
  return (
    <span>
      <button onClick={() =>handleopen() }>돌아가기</button>
    </span>
  );
}