import api from "./api";
import { type Task, type Subtask } from "../types/types";

export const TaskService = {
  // Tasks
  getAll: (status?: string) =>
    api.get<Task[]>("/tasks", { params: { status } }).then((res) => res.data),

  getOne: (id: string) => api.get<Task>(`/tasks/${id}`).then((res) => res.data),

  create: (task: Partial<Task>) =>
    api.post<Task>("/tasks", task).then((res) => res.data),

  update: (id: string, task: Partial<Task>) =>
    api.put<Task>(`/tasks/${id}`, task).then((res) => res.data),

  delete: (id: string) => api.delete(`/tasks/${id}`).then((res) => res.data),

  // Subtasks
  addSubtask: (taskId: string, subtask: Partial<Subtask>) =>
    api
      .post<Task>(`/tasks/${taskId}/subtasks`, subtask)
      .then((res) => res.data),

  deleteSubtask: (taskId: string, subtaskId: string) =>
    api
      .delete<Task>(`/tasks/${taskId}/subtasks/${subtaskId}`)
      .then((res) => res.data),
};
