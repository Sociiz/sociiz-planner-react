import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle, Save, Plus } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { type Task, type Subtask, type Status, type EvaluationStatus } from "@/types/types";
import { TaskFormField } from "./TaskDialog/TaskFormField";
import { TaskSelect } from "./TaskDialog/TaskSelect";
import { SubtaskItem } from "./TaskDialog/SubtaskItem";
import { AssignModal } from "./TaskDialog/AssignModal";

type TaskFormData = Omit<Task, "_id" | "client" | "assignedTo" | "subtasks" | "tags"> & {
    clientInput: string;
    assignedToInput: string[];
    tagsInput: string;
    subtasksInputArray: Subtask[];
    dueDate?: string;
};

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (task: Task) => void;
    editingTask?: Task | null;
    users: { _id: string; username: string }[];
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
    open,
    onOpenChange,
    onSubmit,
    editingTask,
    users,
}) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState<TaskFormData>({
        title: "",
        description: "",
        status: "todo",
        evaluationStatus: "pending",
        createdBy: user?.email || "",
        clientInput: "",
        assignedToInput: [],
        tagsInput: "",
        subtasksInputArray: [],
        dueDate: "",
    });
    const [subtaskAssignIndex, setSubtaskAssignIndex] = useState<number | null>(null);
    const [assignUsers, setAssignUsers] = useState<string[]>([]);

    useEffect(() => {
        if (editingTask) {
            setFormData({
                title: editingTask.title || "",
                description: editingTask.description || "",
                status: editingTask.status || "todo",
                evaluationStatus: editingTask.evaluationStatus || "pending",
                createdBy: editingTask.createdBy || user?.email || "",
                clientInput: editingTask.client?.join(", ") || "",
                assignedToInput: editingTask.assignedTo || [],
                tagsInput: editingTask.tags?.join(", ") || "",
                subtasksInputArray: editingTask.subtasks || [],
                dueDate: editingTask.dueDate || "",
            });
        }
    }, [editingTask, open, user]);

    const handleChange = <K extends keyof TaskFormData>(field: K, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.title.trim()) return;
        onSubmit({
            _id: editingTask?._id || "",
            title: formData.title.trim(),
            description: formData.description?.trim() || "",
            status: formData.status,
            evaluationStatus: formData.evaluationStatus,
            createdBy: formData.createdBy,
            client: formData.clientInput.split(",").map((c) => c.trim()).filter(Boolean),
            assignedTo: formData.assignedToInput,
            subtasks: formData.subtasksInputArray,
            tags: formData.tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
            dueDate: formData.dueDate,
        });
        onOpenChange(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                            {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 mt-2">
                        <TaskFormField
                            label="Título"
                            value={formData.title}
                            onChange={(v) => handleChange("title", v)}
                            placeholder="Digite o título da tarefa"
                        />

                        <TaskFormField
                            label="Descrição"
                            value={formData.description || ""}
                            onChange={(v) => handleChange("description", v)}
                            placeholder="Adicione detalhes sobre a tarefa"
                            textarea
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TaskFormField
                                label="Data de Entrega"
                                type="date"
                                value={formData.dueDate || ""}
                                onChange={(v) => handleChange("dueDate", v)}
                            />

                            <TaskSelect
                                label="Status"
                                value={formData.status}
                                options={[
                                    { label: "Backlog", value: "backlog" },
                                    { label: "A Fazer", value: "todo" },
                                    { label: "Em Progresso", value: "inprogress" },
                                    { label: "Concluído", value: "done" },
                                ]}
                                onChange={(v) => handleChange("status", v as Status)}
                            />

                            <TaskSelect
                                label="Avaliação"
                                value={formData.evaluationStatus || "pending"} 
                                options={[
                                    { label: "Pendente", value: "pending" },
                                    { label: "Aprovada", value: "approved" },
                                    { label: "Rejeitada", value: "rejected" },
                                ]}
                                onChange={(v) => handleChange("evaluationStatus", v as EvaluationStatus)}
                            />

                            <TaskFormField
                                label="Clientes"
                                value={formData.clientInput}
                                onChange={(v) => handleChange("clientInput", v)}
                                placeholder="Ex: DETRAN-AL, Prefeitura"
                            />
                        </div>

                        <TaskSelect
                            label="Responsáveis"
                            value={formData.assignedToInput}
                            options={users.map((u) => ({
                                label: u.username,
                                value: u._id,
                            }))}
                            onChange={(v) => handleChange("assignedToInput", Array.isArray(v) ? v : [v])}
                            multiple
                        />

                        <div>
                            <span className="font-semibold">Subtarefas</span>
                            <div className="space-y-2 mt-2">
                                {formData.subtasksInputArray.map((subtask, index) => (
                                    <SubtaskItem
                                        key={index}
                                        index={index}
                                        subtask={subtask}
                                        onUpdate={(idx, updated) => {
                                            const newArray = [...formData.subtasksInputArray];
                                            newArray[idx] = updated;
                                            handleChange("subtasksInputArray", newArray);
                                        }}
                                        onDelete={(idx) => {
                                            const newArray = formData.subtasksInputArray.filter((_, i) => i !== idx);
                                            handleChange("subtasksInputArray", newArray);
                                        }}
                                        onAssignClick={(idx) => {
                                            setSubtaskAssignIndex(idx);
                                            setAssignUsers(subtask.assignedTo || []);
                                        }}
                                    />
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() =>
                                        handleChange("subtasksInputArray", [
                                            ...formData.subtasksInputArray,
                                            { title: "", done: false, assignedTo: [], dueDate: "" },
                                        ])
                                    }
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Adicionar Subtarefa
                                </Button>
                            </div>
                        </div>

                        <TaskFormField
                            label="Tags"
                            value={formData.tagsInput}
                            onChange={(v) => handleChange("tagsInput", v)}
                            placeholder="frontend, urgente"
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                <XCircle className="h-4 w-4 mr-1" /> Cancelar
                            </Button>
                            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Save className="h-4 w-4 mr-1" /> {editingTask ? "Salvar" : "Criar"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AssignModal
                open={subtaskAssignIndex !== null}
                users={users}
                selectedUsers={assignUsers}
                onChange={setAssignUsers}
                onClose={() => setSubtaskAssignIndex(null)}
                onSave={() => {
                    if (subtaskAssignIndex === null) return;
                    const updated = [...formData.subtasksInputArray];
                    updated[subtaskAssignIndex].assignedTo = assignUsers;
                    handleChange("subtasksInputArray", updated);
                    setSubtaskAssignIndex(null);
                }}
            />
        </>
    );
};
