const getCalendar= async (year:number,month:number) => {
    const apiURL = `https://portal.inuappcenter.kr/api/schedules?year=${year}&month=${month}`;
    try {
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status == 200) {
        const data = response.json();
        console.log(data,"data");
        return data;
      }
    } catch (error) {
      console.log('에러?', error);
      throw error;
    }
  };
  
  export default getCalendar;
  