const postPasswordCheck = async (token: string, password: string) => {
    const apiURL = `https://portal.inuappcenter.kr/api/members/checkPassword`;
    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Auth': token
            },
            body: JSON.stringify({
                'password': password
            })
        });

        if (response.status === 200) {
            const responseData = await response.json();
            return responseData;
        } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

    } catch (error) {
        console.log("에러?", error);
        throw error;
    }
};

export default postPasswordCheck;
