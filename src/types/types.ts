export type Status = "todo" | "inprogress" | "done" | "backlog";

export interface Subtask {
  _id?: string;
  title: string;
  assignedTo?: string[];
  dueDate?: string;
  done: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: Status;
  evaluationStatus?: "pending" | "approved" | "rejected";
  client?: string[];
  createdBy: string;
  assignedTo?: string[];
  tags?: string[];
  subtasks?: Subtask[];
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
}
