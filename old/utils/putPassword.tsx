const ModifyPassword = async (token: string, password: string,newPassword:string) => {
    console.log("akwwl",password,newPassword);
    const apiURL = `https://portal.inuappcenter.kr/api/members/password`;
    try {
        const response = await fetch(apiURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Auth': token
            },
            body: JSON.stringify({
                'password': password,
                'newPassword':newPassword
            })
        });

        if (response.status === 200) {
            const responseData = await response.json();
            return responseData;
        } else if (response.status === 401) {
            return 401;
        }
        else {
            return 404;
        }

    } catch (error) {
        console.log("에러?", error);
        throw error;
    }
};

export default ModifyPassword;
