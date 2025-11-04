import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableTaskCard } from "./SortableTaskCard";
import { type Task, type IUser } from "@/types/types";

interface ColumnProps {
    id: string;
    title: string;
    color: string;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    usuarios: IUser[];
    onRequestDelete?: (task: Task) => void;
}

export const Column: React.FC<ColumnProps> = ({
    id,
    title,
    color,
    tasks,
    onTaskClick,
    usuarios,
    onRequestDelete
}) => {
    const { setNodeRef } = useDroppable({ id: `column-${id}` });

    return (
        <div className="flex flex-col shrink-0 h-[46rem] w-[280px] max-w-[280px] bg-slate-50 dark:bg-slate-800 rounded-lg shadow-md">
            <div className={`${color} text-black px-4 py-3 rounded-t-lg`}>
                <h2 className="font-semibold flex items-center justify-between">
                    <span>{title}</span>
                    <span className="text-sm bg-white/20 px-2 py-1 rounded">
                        {tasks.length}
                    </span>
                </h2>
            </div>

            <div
                ref={setNodeRef}
                className="flex-1 overflow-y-auto h-full p-4 space-y-3 rounded-b-lg scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
            >
                <SortableContext items={tasks.map((t) => t._id!)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <SortableTaskCard
                            key={task._id}
                            task={task}
                            onMoreClick={onTaskClick}
                            usuarios={usuarios}
                            onRequestDelete={onRequestDelete}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};
