import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { type Task } from "@/types/types";

type TaskFormData = Omit<Task, "_id" | "client" | "assignedTo" | "subtasks" | "tags"> & {
    clientInput: string;
    assignedToInput: string;
    subtasksInput: string;
    tagsInput: string;
};

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
    const { user } = useAuth();

    const [formData, setFormData] = useState<TaskFormData>({
        title: "",
        description: "",
        status: "todo",
        evaluationStatus: "pending",
        createdBy: user?.email || "",
        clientInput: "",
        assignedToInput: "",
        subtasksInput: "",
        tagsInput: "",
    });

    useEffect(() => {
        if (editingTask) {
            setFormData({
                title: editingTask.title || "",
                description: editingTask.description || "",
                status: editingTask.status || "todo",
                evaluationStatus: editingTask.evaluationStatus || "pending",
                createdBy: editingTask.createdBy || user?.email || "",
                clientInput: editingTask.client?.join(", ") || "",
                assignedToInput: editingTask.assignedTo?.join(", ") || "",
                subtasksInput: editingTask.subtasks?.map((s) => s.title).join(", ") || "",
                tagsInput: editingTask.tags?.join(", ") || "",
            });
        } else {
            setFormData({
                title: "",
                description: "",
                status: "todo",
                evaluationStatus: "pending",
                createdBy: user?.email || "",
                clientInput: "",
                assignedToInput: "",
                subtasksInput: "",
                tagsInput: "",
            });
        }
    }, [editingTask, open, user]);

    const handleChange = <K extends keyof TaskFormData>(
        field: K,
        value: TaskFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.title.trim()) return;

        const newTask: Task = {
            _id: editingTask?._id || "",
            title: formData.title.trim(),
            description: formData.description?.trim() || "",
            status: formData.status,
            evaluationStatus: formData.evaluationStatus,
            createdBy: formData.createdBy,
            client: formData.clientInput
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean),
            assignedTo: formData.assignedToInput
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean),
            subtasks: formData.subtasksInput
                .split(",")
                .map((title) => ({ title: title.trim(), done: false }))
                .filter((s) => s.title),
            tags: formData.tagsInput
                .split(",")
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
                    <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Título */}
                    <div>
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            className="mt-2"
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            placeholder="Digite o título da tarefa"
                        />
                    </div>

                    {/* Descrição */}
                    <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            className="mt-2"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Adicione detalhes sobre a tarefa"
                            rows={3}
                        />
                    </div>

                    {/* Status e Avaliação */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(v) => handleChange("status", v as Task["status"])}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="backlog">Backlog</SelectItem>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="inprogress">In Progress</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="evaluationStatus">Avaliação</Label>
                            <Select
                                value={formData.evaluationStatus}
                                onValueChange={(v) =>
                                    handleChange("evaluationStatus", v as Task["evaluationStatus"])
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="approved">Aprovada</SelectItem>
                                    <SelectItem value="rejected">Rejeitada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Clientes */}
                    <div>
                        <Label htmlFor="client">Clientes (separados por vírgula)</Label>
                        <Input
                            id="client"
                            value={formData.clientInput}
                            onChange={(e) => handleChange("clientInput", e.target.value)}
                            placeholder="DETRAN-AL, Prefeitura"
                        />
                    </div>

                    {/* Responsáveis */}
                    <div>
                        <Label htmlFor="assignedTo">Responsáveis (separados por vírgula)</Label>
                        <Input
                            id="assignedTo"
                            value={formData.assignedToInput}
                            onChange={(e) => handleChange("assignedToInput", e.target.value)}
                            placeholder="Arthur, Maria"
                        />
                    </div>

                    {/* Subtarefas */}
                    <div>
                        <Label htmlFor="subtasks">Subtarefas (separadas por vírgula)</Label>
                        <Input
                            id="subtasks"
                            value={formData.subtasksInput}
                            onChange={(e) => handleChange("subtasksInput", e.target.value)}
                            placeholder="Criar calendário, Definir orçamento"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                        <Input
                            id="tags"
                            value={formData.tagsInput}
                            onChange={(e) => handleChange("tagsInput", e.target.value)}
                            placeholder="frontend, urgente"
                        />
                    </div>

                    {/* Botões */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {editingTask ? "Salvar" : "Criar"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
