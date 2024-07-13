import styled from 'styled-components';

interface ScrapFoldersProps {
  folders: { id: number; name: string }[];
  selectedFolder: { id: number; name: string } | null;
  onSelectFolder: (folder: { id: number; name: string }) => void;
}

export default function ScrapFolders({ folders, selectedFolder, onSelectFolder }: ScrapFoldersProps) {
  return (
    <ScrapFoldersWrapper>
      {folders.map((folder) => (
        <FolderItem 
          key={folder.id}
          selected={selectedFolder?.id === folder.id}
          onClick={() => onSelectFolder(folder)}
        >
          {folder.name}
        </FolderItem>
      ))}
      <AddFolderButton>+</AddFolderButton>
    </ScrapFoldersWrapper>
  );
}

const ScrapFoldersWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100svw;
  overflow-x: auto;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
`;

const FolderItem = styled.div<{ selected: boolean }>`
  min-width: 100px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ selected }) => (selected ? '#4071B9' : '#000')};
  border-bottom: 2px solid ${({ selected }) => (selected ? '#4071B9' : '#E0E0E0')};
  font-size: 14px;
  font-weight: 700;
`;

const AddFolderButton = styled.div`
  min-width: 100px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E0E0E0;
  font-size: 30px;
  font-weight: 500;
  border-bottom: 2px solid #E0E0E0;

`