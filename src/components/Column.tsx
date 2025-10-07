import React from 'react';
import { COLUMNS } from '../constants/constants';
import { type Task } from '../types/types';
import { TaskCard } from './TaskCard';

interface ColumnProps {
    id: typeof COLUMNS[number]['id'];
    title: string;
    color: string;
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

export const Column: React.FC<ColumnProps> = ({ id, title, color, tasks, onTaskClick }) => {
    return (
        <div className="flex flex-col">
            <div className={`${color} rounded-t-lg px-4 py-3 border-b-2 border-slate-300`}>
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-slate-700">{title}</h2>
                    <span className="bg-white px-2 py-1 rounded text-sm font-medium text-slate-600">{tasks.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-b-lg p-4 space-y-3 min-h-[500px] shadow-sm">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                ))}
            </div>
        </div>
    );
};