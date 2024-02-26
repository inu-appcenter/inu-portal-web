

const postInsertFolders = async (postId:number,selectedFolderIds:number[]) => {

    const apiURL = `https://portal.inuappcenter.kr/api/folders/insert`;
    selectedFolderIds.map(async (id) => {
        try {
          const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }, 
            body: JSON.stringify({
              'folderId': id,
              'postId': [postId]
            })
          });
    
          console.log(response,'response');
          if (response.status === 201) {
            const data = await response.json();
            console.log("data",data);
            return data;
          } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        } catch (error) {
          console.log("에러?", error);
          throw error;
        }
      });
    };
  
  export default postInsertFolders;