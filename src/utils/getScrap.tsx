const getScrapInfo = async (token:string,sort:string) => {
    console.log(token,".");
    const apiURL = sort ==='date'?`https://portal.inuappcenter.kr/api/members/scraps`:`https://portal.inuappcenter.kr/api/members/scraps?sort=${sort}`;
    console.log(apiURL,"apiurl이뭘깡ㅇ");
    try {
        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Auth':token
            },
        });

        console.log(response, 'response');
        if (response.status == 400) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        } else {
            const data = await response.json();
            console.log(data);
            return data;
        }


    } catch (error) {
        console.log("에러?", error);
        throw error;
    }
};

export default getScrapInfo;
