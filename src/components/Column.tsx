import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTaskCard } from "./SortableTaskCard";
import { type Task, type Status, type User } from "@/types/types";

interface ColumnProps {
    id: Status;
    title: string;
    color: string;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    users: User[];
    onRequestDelete?: (id: string) => void;
}

export const Column: React.FC<ColumnProps> = ({ id, title, color, tasks, onTaskClick, users, onRequestDelete }) => {
    const { setNodeRef } = useDroppable({ id: `column-${id}` });

    return (
        <div className="flex flex-col h-full">
            <div className={`${color} text-black px-4 py-3 rounded-t-lg`}>
                <h2 className="font-semibold flex items-center justify-between">
                    <span>{title}</span>
                    <span className="text-sm bg-white/20 px-2 py-1 rounded">{tasks.length}</span>
                </h2>
            </div>

            <div
                ref={setNodeRef}
                className="flex-1 bg-slate-50 dark:bg-slate-800 p-4 rounded-b-lg space-y-3 min-h-[500px]"
            >
                <SortableContext items={tasks.map((t) => t._id!)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <SortableTaskCard
                            key={task._id}
                            task={task}
                            onMoreClick={onTaskClick}
                            users={users}
                            onRequestDelete={(t: Task) => onRequestDelete?.(t._id!)}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};
