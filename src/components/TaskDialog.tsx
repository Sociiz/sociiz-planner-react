import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { type Task, type Priority, type Status } from '../types/types';

type TaskFormData = Omit<Task, 'tags'> & { tagsInput: string };

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (task: Task) => void;
    editingTask?: Task | null;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
    open,
    onOpenChange,
    onSubmit,
    editingTask,
}) => {
    const [formData, setFormData] = useState<TaskFormData>({
        id: '',
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee: '',
        dueDate: '',
        tagsInput: '',
    });

    useEffect(() => {
        if (editingTask) {
            setFormData({
                ...editingTask,
                tagsInput: editingTask.tags.join(', '),
            });
        } else {
            setFormData({
                id: '',
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
                assignee: '',
                dueDate: '',
                tagsInput: '',
            });
        }
    }, [editingTask, open]);

    const handleChange = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.title.trim()) return;

        const newTask: Task = {
            id: formData.id || Date.now().toString(),
            title: formData.title.trim(),
            description: formData.description?.trim() || '',
            status: formData.status,
            priority: formData.priority,
            assignee: formData.assignee?.trim() || '',
            dueDate: formData.dueDate || '',
            tags: formData.tagsInput
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
        };

        onSubmit(newTask);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            className="mt-2"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Digite o título da tarefa"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            className="mt-2"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Adicione detalhes sobre a tarefa"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2" htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange('status', value as Status)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="progress">In Progress</SelectItem>
                                    <SelectItem value="review">Review</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="mb-2" htmlFor="priority">Prioridade</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => handleChange('priority', value as Priority)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Baixa</SelectItem>
                                    <SelectItem value="medium">Média</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2" htmlFor="assignee">Responsável</Label>
                            <Input
                                id="assignee"
                                value={formData.assignee}
                                onChange={(e) => handleChange('assignee', e.target.value)}
                                placeholder="Nome do responsável"
                            />
                        </div>

                        <div>
                            <Label className="mb-2" htmlFor="dueDate">Data de Entrega</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => handleChange('dueDate', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="mb-2" htmlFor="tags">Tags (separadas por vírgula)</Label>
                        <Input
                            id="tags"
                            value={formData.tagsInput}
                            onChange={(e) => handleChange('tagsInput', e.target.value)}
                            placeholder="frontend, urgente, design"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {editingTask ? 'Salvar' : 'Criar'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
