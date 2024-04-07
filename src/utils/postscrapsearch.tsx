const postscrapsearch = async (token:string,folderId:number,query: string, sort: string, page: number) => {
    
    const apiURL = `https://portal.inuappcenter.kr/api/search/folder/${folderId}?query=${query}&sort=${sort}&page=${page}`;
    console.log("url몬가",apiURL,folderId);
    try {
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Auth':token
        }
      });
  
      console.log(response,'response');
      if (response.status === 200) {
        const data = await response.json();
        console.log(data.data);
        return data.data;
      }
      else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
  
    } catch (error) {
      console.log("에러?", error);
      throw error;
    }
  };
  
  export default postscrapsearch;