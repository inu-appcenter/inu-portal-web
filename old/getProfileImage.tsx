// const getProfileImages = async () => {
//     const images = [];
//     const apiURL = `https://portal.inuappcenter.kr/api/images/1`;
//       try {
//         const response = await fetch(apiURL, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           }
//         });
  
//         if (response.status === 200) {
//           const data = await response.json();
//           console.log("이미지 리턴값이 뭘까",data);
//           images.push(data.data);
//         } else {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//       } catch (error) {
//         console.log("에러?", error);
//         throw error;
//       }
//     // for (let id = 1; id <= 12; id++) {
//     // //   const apiURL = `https://portal.inuappcenter.kr/api/images/${id}`;
//     // //   try {
//     // //     const response = await fetch(apiURL, {
//     // //       method: 'GET',
//     // //       headers: {
//     // //         'Content-Type': 'application/json',
//     // //       }
//     // //     });
  
//     // //     if (response.status === 200) {
//     // //       const data = await response.json();
//     // //       console.log("이미지 리턴값이 뭘까",data);
//     // //       images.push(data.data);
//     // //     } else {
//     // //       throw new Error(`HTTP error! Status: ${response.status}`);
//     // //     }
//     // //   } catch (error) {
//     // //     console.log("에러?", error);
//     // //     throw error;
//     // //   }
//     // }
//     return images;
//   };
  
//   export default getProfileImages;
  