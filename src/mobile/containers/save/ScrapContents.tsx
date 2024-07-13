interface ScrapContentsProps {
  folder: { id: number; name: string } | null;
}

export default function ScrapContents({ folder }: ScrapContentsProps) {
  return (
    <div>
      {folder ? (
        <div>{folder.name} 폴더의 스크랩 내용</div>
      ) : (
        <div>폴더를 선택해주세요.</div>
      )}
    </div>
  );
}
