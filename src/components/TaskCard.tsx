import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, User, Calendar, MoreVertical } from 'lucide-react';
import { type Task } from '../types/types';
import { PRIORITY_CLASSES } from '../constants/constants';

interface TaskCardProps {
    task: Task;
    onClick?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
    return (
        <Card
            key={task.id}
            className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
            onClick={() => onClick?.(task)}
        >
            <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold text-slate-400">
                        {task.title}
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-3">
                {task.description && (
                    <p className="text-sm text-slate-400 line-clamp-2">{task.description}</p>
                )}

                <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-3 text-xs text-slate-200">
                        {task.assignee && (
                            <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{task.assignee}</span>
                            </div>
                        )}
                        {task.dueDate && (
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                        )}
                    </div>

                    <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_CLASSES[task.priority]}`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};