export type Theme = "light" | "dark" | "system";

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
export interface IStatus {
  _id: string;
  name: string;
  color?: string;
}
export interface IColaborador {
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

export type Filters = {
  clients: string[];
  projects: string[];
  products: string[];
  assignedTo: string[];
  tags: string[];
  priorities: string[];
  dueDate?: string;
};

export type FilterOption = {
  id: string;
  label: string;
};

export interface Task {
  colaborador?: string;
  _id: string;
  title: string;
  description?: string;
  status: string;
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
export interface Colaborador {
  _id: string;
  name: string;
}
