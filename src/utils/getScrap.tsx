const getScrap = async (token:string,sort:string,page:number) => {
    console.log(token,".");
    const apiURL = `https://portal.inuappcenter.kr/api/members/scraps?sort=${sort}&page=${page}`;
    try {
        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Auth':token
            },
        });

        console.log(response, 'response');
        if (response.status == 200) {
            const data = await response.json();
            console.log(data);
            return data['data'];  // data['msg']가 결과, data['data']가 글 목록
          }
          else {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }


    } catch (error) {
        console.log("에러?", error);
        throw error;
    }
};

export default getScrap;
