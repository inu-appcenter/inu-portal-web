const getFolder = async (token: string) => {
    const apiURL = `https://portal.inuappcenter.kr/api/folders`;
    try {
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Auth: token} : {})
        }
      });
  
      console.log(response,'response');
      if (response.status == 200) {
        const data = await response.json();
        console.log(data);
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
  
  export default getFolder;