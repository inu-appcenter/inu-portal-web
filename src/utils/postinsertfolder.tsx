

const postInsertFolders = async (token:string,postId:number,selectedFolderIds:number[]) => {

    
    selectedFolderIds.map(async (folderId) => {
      console.log("폴더 아이디가 뭔데",folderId);
      const apiURL = `https://portal.inuappcenter.kr/api/folders/${folderId}/posts`;
        try {
          const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Auth':token
            }, 
            body: JSON.stringify({
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