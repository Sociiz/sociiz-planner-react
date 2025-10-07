export type Priority = "low" | "medium" | "high";

export type Status = "todo" | "progress" | "done" | "backlog";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  assignee?: string;
  dueDate?: string;
  tags: string[];
}
