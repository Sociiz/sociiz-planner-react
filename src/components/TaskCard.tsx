import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, User as UserIcon, MoreVertical, GripVertical, Calendar, Briefcase, Package, Users } from 'lucide-react';
import { type Task, type User } from '../types/types';

interface TaskCardProps {
    task: Task;
    users: User[];
    onMoreClick?: (task: Task) => void;
    dragHandleProps?: React.SVGProps<SVGSVGElement>;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, users, onMoreClick, dragHandleProps }) => {
    const assignedUsers = task.assignedTo?.map(id => users.find(u => u._id === id)?.username || 'Desconhecido');

    const renderArrayField = (items: string[] | undefined, Icon: React.ElementType, label: string) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="flex flex-wrap gap-1 items-center text-xs text-slate-500 dark:text-slate-400">
                <Icon className="w-3 h-3 mr-1" />
                <span className="font-medium">{label}:</span>
                {items.map((item, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {item}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
            <CardHeader className="p-4 pb-2 flex justify-between items-start">
                <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    {task.title}
                </CardTitle>

                <div className="flex items-center gap-1">
                    <GripVertical
                        className="w-4 h-4 text-slate-400 cursor-grab"
                        {...dragHandleProps}
                    />

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMoreClick?.(task);
                        }}
                    >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-3">
                {task.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {task.description}
                    </p>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Clientes, Projetos, Produtos */}
                <div className="space-y-1">
                    {renderArrayField(task.client, Users, "Cliente(s)")}
                    {renderArrayField(task.project, Briefcase, "Projeto(s)")}
                    {renderArrayField(task.product, Package, "Produto(s)")}
                </div>

                {task.dueDate && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t dark:border-slate-700">
                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                        {assignedUsers && assignedUsers.length > 0 && (
                            <div className="flex items-center gap-1">
                                <UserIcon className="w-3 h-3" />
                                <span>{assignedUsers.join(', ')}</span>
                            </div>
                        )}
                    </div>

                    {task.subtasks && task.subtasks.length > 0 && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {task.subtasks?.filter(st => st.done).length}/{task.subtasks?.length}
                        </span>
                    )}
                    {task.priority && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'Urgente' ? 'bg-red-500 text-white' :
                            task.priority === 'Alta' ? 'bg-orange-500 text-white' :
                                task.priority === 'Média' ? 'bg-yellow-500 text-black' :
                                    'bg-gray-500 text-white'
                            }`}>
                            {task.priority}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

