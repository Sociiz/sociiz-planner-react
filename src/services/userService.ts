import api from "./api";
import { type IUser } from "../types/types";

export const userService = {
  getAll: () => api.get<IUser[]>("/users").then((res) => res.data),

  getOne: (id: string) =>
    api.get<IUser>(`/users/${id}`).then((res) => res.data),

  create: (user: Partial<IUser>) =>
    api.post<IUser>("/users", user).then((res) => res.data),

  update: (id: string, user: Partial<IUser>) =>
    api.put<IUser>(`/users/${id}`, user).then((res) => res.data),

  delete: (id: string) => api.delete(`/users/${id}`).then((res) => res.data),
};
