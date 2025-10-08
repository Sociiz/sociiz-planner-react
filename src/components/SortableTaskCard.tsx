import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import { type Task } from '../types/types';

interface SortableTaskCardProps {
    task: Task;
    onTaskClick: (task: Task) => void;
    onMoreClick?: (task: Task) => void;
}

export const SortableTaskCard: React.FC<SortableTaskCardProps> = ({
    task,
    onTaskClick,
    onMoreClick,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleClick = (e: React.MouseEvent) => {
        if (!isDragging) {
            onTaskClick(task);
        }
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} onClick={handleClick}>
            <TaskCard
                task={task}
                onMoreClick={onMoreClick}
                dragHandleProps={listeners}
            />
        </div>
    );
};
