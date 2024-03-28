interface ReturnScrapButtonProps {
    setIsScrap:(scrap:boolean) => void;
    setIsScrapFolderPost:(scrapfolder:boolean) => void;
    setIsSearch:(issearch:boolean) => void;
  }
  
export default function ReturnScrapButton ({setIsScrap,setIsScrapFolderPost,setIsSearch}:ReturnScrapButtonProps) {

    const handleopen = () => {
        setIsScrap(true);
        setIsScrapFolderPost(false);
        setIsSearch(false);
    }
  return (
    <span>
      <button onClick={() =>handleopen() }>돌아가기</button>
    </span>
  );
}