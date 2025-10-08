import { type Status } from "../types/types";

export const COLUMNS: { id: Status; title: string; color: string }[] = [
  { id: "backlog", title: "Backlog", color: "bg-slate-100" },
  { id: "todo", title: "To Do", color: "bg-slate-100" },
  { id: "progress", title: "In Progress", color: "bg-blue-100" },
  { id: "done", title: "Done", color: "bg-green-200" },
];

export const PRIORITY_CLASSES: Record<string, string> = {
  low: "bg-gray-200 text-gray-700",
  medium: "bg-yellow-200 text-yellow-800",
  high: "bg-red-200 text-red-800",
};
