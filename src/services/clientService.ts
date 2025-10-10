import api from "./api";
import { type IClient } from "../types/types";

export const ClientService = {
  getAll: () => api.get<IClient[]>("/clients").then((res) => res.data),

  getOne: (id: string) =>
    api.get<IClient>(`/clients/${id}`).then((res) => res.data),

  create: (client: Partial<IClient>) =>
    api.post<IClient>("/clients", client).then((res) => res.data),

  update: (id: string, client: Partial<IClient>) =>
    api.put<IClient>(`/clients/${id}`, client).then((res) => res.data),

  delete: (id: string) => api.delete(`/clients/${id}`).then((res) => res.data),
};
