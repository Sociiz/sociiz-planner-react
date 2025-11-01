import api from "./api";

export interface ICommentUser {
  _id: string;
  name: string;
  username?: string;
}

export interface IComment {
  _id: string;
  taskId: string;
  userId: ICommentUser;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export class CommentService {
  async create(taskId: string, content: string): Promise<IComment> {
    const response = await api.post("/comments", { taskId, content });
    return response.data.data;
  }

  async getByTaskId(taskId: string): Promise<IComment[]> {
    const response = await api.get(`/comments/task/${taskId}`);
    return response.data.data;
  }

  async getById(id: string): Promise<IComment> {
    const response = await api.get(`/comments/${id}`);
    return response.data.data;
  }

  async getCount(taskId: string): Promise<number> {
    const response = await api.get(`/comments/task/${taskId}/count`);
    return response.data.count;
  }

  async update(id: string, content: string): Promise<IComment> {
    const response = await api.put(`/comments/${id}`, { content });
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  }
}

export const commentService = new CommentService();
