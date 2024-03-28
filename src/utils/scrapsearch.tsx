const scrapsearch = async (token:string,query: string, sort: string, page: string) => {
    const apiURL = `https://portal.inuappcenter.kr/api/search/scrap?query=${query}&sort=${sort}&page=${page}`;
    console.log("url몬가",apiURL);
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
  
  export default scrapsearch;