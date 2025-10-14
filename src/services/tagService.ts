import api from "./api";
import { type Itag } from "../types/types";

export const tagService = {
  getAll: () => api.get<Itag[]>("/tags").then((res) => res.data),

  getOne: (id: string) => api.get<Itag>(`/tags/${id}`).then((res) => res.data),

  create: (tag: Partial<Itag>) =>
    api.post<Itag>("/tags", tag).then((res) => res.data),

  update: (id: string, tag: Partial<Itag>) =>
    api.put<Itag>(`/tags/${id}`, tag).then((res) => res.data),

  delete: (id: string) => api.delete(`/tags/${id}`).then((res) => res.data),
};
