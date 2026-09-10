import api from "./axiosClient";
export const getAnalytics=(days=30)=>api.get("/analytics/summary",{params:{days}}).then(r=>r.data);
export const createPainting=data=>api.post("/paintings",data,{headers:{"Content-Type":"multipart/form-data"}}).then(r=>r.data);
export const updatePainting=(id,data)=>api.patch(`/paintings/${id}`,data,{headers:{"Content-Type":"multipart/form-data"}}).then(r=>r.data);
export const deletePainting=id=>api.delete(`/paintings/${id}`);
export const createCategory=data=>api.post("/categories",data).then(r=>r.data);
export const updateCategory=(id,data)=>api.patch(`/categories/${id}`,data).then(r=>r.data);
export const deleteCategory=id=>api.delete(`/categories/${id}`);
export const getUsers=()=>api.get("/auth/users").then(r=>r.data);
export const updateUser=(id,data)=>api.patch(`/auth/users/${id}`,data).then(r=>r.data);

