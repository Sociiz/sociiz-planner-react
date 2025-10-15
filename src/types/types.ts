export type Theme = "light" | "dark" | "system";

export type Status = "backlog" | "todo" | "inprogress" | "done";

export type EvaluationStatus = "pending" | "approved" | "rejected";

export type Priority = "Baixa" | "Média" | "Alta" | "Urgente";

export interface IClient {
  _id: string;
  name: string;
}
export interface IProject {
  _id: string;
  name: string;
}
export interface IProduct {
  _id: string;
  name: string;
}

export interface Itag {
  _id: string;
  name: string;
}

export interface Subtask {
  _id?: string;
  title: string;
  assignedTo: string[];
  dueDate?: string;
  done: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: Status;
  evaluationStatus?: EvaluationStatus;
  priority?: Priority;
  client?: string[];
  project?: string[];
  product?: string[];
  createdBy: string;
  assignedTo: string[];
  tags?: string[];
  subtasks?: Subtask[];
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
}

export interface User {
  _id: string;
  username: string;
}
