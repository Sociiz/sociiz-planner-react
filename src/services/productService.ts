import api from "./api";
import { type IProduct } from "../types/types";

export const ProductService = {
  getAll: () => api.get<IProduct[]>("/products").then((res) => res.data),

  getOne: (id: string) =>
    api.get<IProduct>(`/products/${id}`).then((res) => res.data),

  create: (product: Partial<IProduct>) =>
    api.post<IProduct>("/products", product).then((res) => res.data),

  update: (id: string, product: Partial<IProduct>) =>
    api.put<IProduct>(`/products/${id}`, product).then((res) => res.data),

  delete: (id: string) => api.delete(`/products/${id}`).then((res) => res.data),
};
