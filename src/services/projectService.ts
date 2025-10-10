import api from "./api";
import { type IProject } from "../types/types";

export const ProjectService = {
  getAll: () => api.get<IProject[]>("/projects").then((res) => res.data),

  getOne: (id: string) =>
    api.get<IProject>(`/projects/${id}`).then((res) => res.data),

  create: (project: Partial<IProject>) =>
    api.post<IProject>("/projects", project).then((res) => res.data),

  update: (id: string, project: Partial<IProject>) =>
    api.put<IProject>(`/projects/${id}`, project).then((res) => res.data),

  delete: (id: string) => api.delete(`/projects/${id}`).then((res) => res.data),
};
