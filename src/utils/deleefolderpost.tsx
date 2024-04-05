const deleteFolderPost = async (token:string,postId:number,folderId: string) => {
    console.log(postId,"aa",folderId,"bbb");
    const apiURL = `https://portal.inuappcenter.kr/api/folders/${folderId}/posts`;

    try {
      const response = await fetch(apiURL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Auth':token
        },
        body: JSON.stringify({
            'postId': [postId]
        })
      });
  
      console.log(response,'response');
      if (response.status === 200) {
        const data = await response.json();
        console.log(data,"폴더 삭제 성공");
        return 200;
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.log("에러?", error);
      throw error;
    }
  };
  
  export default deleteFolderPost;
