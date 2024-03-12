const search = async (query: string, sort: string, page: string) => {
  const apiURL = `https://portal.inuappcenter.kr/api/search?query=${query}&sort=${sort}&page=${page}`;
  try {
    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log(response,'response');
    if (response.status === 200) {
      const data = await response.json();
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

export default search;