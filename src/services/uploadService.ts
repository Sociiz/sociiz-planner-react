import api from "./api";

export interface IUploadFile {
  originalName: string;
  filename: string;
  path: string;
  url: string;
}

export const uploadService = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api
      .post<{ success: boolean; message: string; file: IUploadFile }>(
        "/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      )
      .then((res) => res.data.file);
  },

  delete: (filename: string) =>
    api.delete(`/uploads/${filename}`).then((res) => res.data),

  getAll: () => api.get<IUploadFile[]>("/uploads").then((res) => res.data),
};
