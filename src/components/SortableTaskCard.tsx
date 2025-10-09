import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./TaskCard";
import { type Task } from "@/types/types";

interface SortableTaskCardProps {
    task: Task;
    onMoreClick?: (task: Task) => void;
}

export const SortableTaskCard: React.FC<SortableTaskCardProps> = ({
    task,
    onMoreClick,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task._id! });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <TaskCard
                task={task}
                onMoreClick={onMoreClick}
                dragHandleProps={listeners}
            />
        </div>
    );
};
