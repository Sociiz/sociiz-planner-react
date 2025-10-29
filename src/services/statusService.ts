import api from "./api";
import { type IStatus } from "../types/types";

export const statusService = {
  getAll: () => api.get<IStatus[]>("/status").then((res) => res.data),

  getOne: (id: string) =>
    api.get<IStatus>(`/status/${id}`).then((res) => res.data),

  create: (tag: Partial<IStatus>) =>
    api.post<IStatus>("/status", tag).then((res) => res.data),

  update: (id: string, tag: Partial<IStatus>) =>
    api.put<IStatus>(`/status/${id}`, tag).then((res) => res.data),

  delete: (id: string) => api.delete(`/status/${id}`).then((res) => res.data),
};
