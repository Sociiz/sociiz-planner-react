import api from "./api";
import { type IColaborador } from "../types/types";

export const ColaboradorService = {
  getAll: () =>
    api.get<IColaborador[]>("/colaboradores").then((res) => res.data),

  getOne: (id: string) =>
    api.get<IColaborador>(`/colaboradores/${id}`).then((res) => res.data),

  create: (tag: Partial<IColaborador>) =>
    api.post<IColaborador>("/colaboradores", tag).then((res) => res.data),

  update: (id: string, tag: Partial<IColaborador>) =>
    api.put<IColaborador>(`/colaboradores/${id}`, tag).then((res) => res.data),

  delete: (id: string) =>
    api.delete(`/colaboradores/${id}`).then((res) => res.data),
};
