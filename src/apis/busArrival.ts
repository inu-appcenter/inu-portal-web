import axios from "axios";

const BUS_API_KEY = import.meta.env.VITE_INCHEON_BUS_API_KEY;

export async function getBusArrival(bstopId: string) {
  if (!BUS_API_KEY) {
    console.warn("API KEY 없음");
    return [];
  }

  try {
    const response = await axios.get(
      "https://apis.data.go.kr/6280000/busArrivalService/getAllRouteBusArrivalList",
      {
        params: {
          serviceKey: BUS_API_KEY,
          bstopId,
          pageNo: 1,
          numOfRows: 30,
        },
        responseType: "text",
      },
    );

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "application/xml");
    const items = xmlDoc.getElementsByTagName("itemList");

    const result = Array.from(items).map((item) => {
      const get = (tag: string) =>
        item.getElementsByTagName(tag)[0]?.textContent ?? "";

      return {
        ARRIVALESTIMATETIME: get("ARRIVALESTIMATETIME"),
        BSTOPID: get("BSTOPID"),
        BUSID: get("BUSID"),
        BUS_NUM_PLATE: get("BUS_NUM_PLATE"),
        CONGESTION: get("CONGESTION"),
        DIRCD: get("DIRCD"),
        LASTBUSYN: get("LASTBUSYN"),
        LATEST_STOP_ID: get("LATEST_STOP_ID"),
        LATEST_STOP_NAME: get("LATEST_STOP_NAME"),
        LOW_TP_CD: get("LOW_TP_CD"),
        REMAIND_SEAT: get("REMAIND_SEAT"),
        REST_STOP_COUNT: get("REST_STOP_COUNT"),
        ROUTEID: get("ROUTEID"),
      };
    });

    console.log("결과", result);
    return result;
  } catch (error) {
    console.error("API 요청 실패", error);
    return [];
  }
}

