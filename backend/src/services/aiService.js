const search=require("./searchService");
exports.chat=async(message)=>{const paintings=await search.search(message);return{answer:paintings.length?`Mình đã tìm thấy ${paintings.length} tác phẩm phù hợp với yêu cầu của bạn.`:"Mình chưa tìm thấy kết quả chính xác. Hãy thử mô tả phong cách, chất liệu, bề mặt, màu sắc hoặc chủ đề.",paintings};};
