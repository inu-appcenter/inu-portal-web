const postFiresRating = async(token:string, rating:number, fireId:number) =>{
    const apiURL = `https://portal.inuappcenter.kr/api/fires/images/${fireId}`
    try{
        const response = await fetch(apiURL,{
            method: 'POST',
            headers:{
            'Content-Type': 'application/json',
            'Auth':token
            },
            body: JSON.stringify({'rating': rating})
        })
    
        if(response.status == 200){
            console.log(response);
            return 200;
        }
        else if (response.status == 404) {
            console.error('존재하지 않는 이미지 번호입니다. / 평점은 1~5이어야 합니다.');
            return 404;
        } else {
            console.error('평점 추가 실패:', response.statusText);
            return response.status;
        }
    } catch(error){
        console.error('에러:', error);
        throw error;
    }
}