import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Plus, X } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { type Task, type Subtask, type Status, type EvaluationStatus, type IClient, type IProject, type IProduct } from "@/types/types";
import { TaskFormField } from "./TaskDialog/TaskFormField";
import { TaskSelect } from "./TaskDialog/TaskSelect";
import { SubtaskItem } from "./TaskDialog/SubtaskItem";
import { AssignModal } from "./TaskDialog/AssignModal";
import { ClientService } from "@/services/clientService";
import { ProjectService } from "@/services/projectService";
import { ProductService } from "@/services/productService";

type TaskFormData = Omit<Task, "_id" | "client" | "project" | "product" | "assignedTo" | "subtasks" | "tags"> & {
    clientNames: string[];
    projectNames: string[];
    productNames: string[];
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
    users = [],
}) => {
    const { user } = useAuth();
    const initialDataLoaded = useRef(false);

    const [formData, setFormData] = useState<TaskFormData>({
        title: "",
        description: "",
        status: "todo",
        evaluationStatus: "pending",
        createdBy: user?.id || "",
        clientNames: [],
        projectNames: [],
        productNames: [],
        assignedToInput: [],
        tagsInput: "",
        subtasksInputArray: [],
        dueDate: "",
    });

    const [clients, setClients] = useState<IClient[]>([]);
    const [projects, setProjects] = useState<IProject[]>([]);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    const [creatingClient, setCreatingClient] = useState(false);
    const [creatingProject, setCreatingProject] = useState(false);
    const [creatingProduct, setCreatingProduct] = useState(false);
    const [newClientName, setNewClientName] = useState("");
    const [newProjectName, setNewProjectName] = useState("");
    const [newProductName, setNewProductName] = useState("");
    const [savingNew, setSavingNew] = useState(false);

    const [subtaskAssignIndex, setSubtaskAssignIndex] = useState<number | null>(null);

    useEffect(() => {
        if (open && !initialDataLoaded.current) {
            fetchAllData();
            initialDataLoaded.current = true;
        }
        if (!open) {
            initialDataLoaded.current = false;
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            if (editingTask) {
                setFormData({
                    title: editingTask.title || "",
                    description: editingTask.description || "",
                    status: editingTask.status || "todo",
                    evaluationStatus: editingTask.evaluationStatus || "pending",
                    createdBy: editingTask.createdBy || user?.id || "",
                    clientNames: editingTask.client || [],
                    projectNames: editingTask.project || [],
                    productNames: editingTask.product || [],
                    assignedToInput: editingTask.assignedTo || [],
                    tagsInput: editingTask.tags?.join(", ") || "",
                    subtasksInputArray: editingTask.subtasks || [],
                    dueDate: editingTask.dueDate || "",
                });
            } else {
                setFormData({
                    title: "",
                    description: "",
                    status: "todo",
                    evaluationStatus: "pending",
                    createdBy: user?.id || "",
                    clientNames: [],
                    projectNames: [],
                    productNames: [],
                    assignedToInput: [],
                    tagsInput: "",
                    subtasksInputArray: [],
                    dueDate: "",
                });
            }
        }
    }, [editingTask, open, user?.id]);

    const fetchAllData = async () => {
        setLoadingData(true);
        try {
            const [clientsData, projectsData, productsData] = await Promise.all([
                ClientService.getAll(),
                ProjectService.getAll(),
                ProductService.getAll(),
            ]);
            setClients(clientsData);
            setProjects(projectsData);
            setProducts(productsData);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateClient = async () => {
        if (!newClientName.trim()) return;
        setSavingNew(true);
        try {
            const newClient = await ClientService.create({ name: newClientName.trim() });
            setClients((prev) => [...prev, newClient]);
            handleChange("clientNames", [...formData.clientNames, newClient.name]);
            setNewClientName("");
            setCreatingClient(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSavingNew(false);
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;
        setSavingNew(true);
        try {
            const newProject = await ProjectService.create({ name: newProjectName.trim() });
            setProjects((prev) => [...prev, newProject]);
            handleChange("projectNames", [...formData.projectNames, newProject.name]);
            setNewProjectName("");
            setCreatingProject(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSavingNew(false);
        }
    };

    const handleCreateProduct = async () => {
        if (!newProductName.trim()) return;
        setSavingNew(true);
        try {
            const newProduct = await ProductService.create({ name: newProductName.trim() });
            setProducts((prev) => [...prev, newProduct]);
            handleChange("productNames", [...formData.productNames, newProduct.name]);
            setNewProductName("");
            setCreatingProduct(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSavingNew(false);
        }
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
            client: formData.clientNames,
            project: formData.projectNames,
            product: formData.productNames,
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
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                            {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
                        </DialogTitle>
                    </DialogHeader>

                    {loadingData ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-gray-500">Carregando dados...</p>
                        </div>
                    ) : (
                        <div className="space-y-6 mt-2">
                            {/* Informações básicas */}
                            <div className="space-y-4">
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
                            </div>

                            {/* Status e Data */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    label="Data de Entrega"
                                    type="date"
                                    value={formData.dueDate || ""}
                                    onChange={(v) => handleChange("dueDate", v)}
                                />
                            </div>

                            {/* Cliente/Projeto/Produto */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Cliente */}
                                <div className="space-y-2">
                                    {!creatingClient ? (
                                        <>
                                            <TaskSelect
                                                label="Cliente"
                                                value={formData.clientNames}
                                                options={clients.map((c) => ({ label: c.name, value: c.name }))}
                                                onChange={(v) => handleChange("clientNames", v as string[])}
                                                multiple
                                            />
                                            <Button
                                                type="button"
                                                variant="link"
                                                size="sm"
                                                onClick={() => setCreatingClient(true)}
                                            >
                                                + Novo Cliente
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                value={newClientName}
                                                onChange={(e) => setNewClientName(e.target.value)}
                                                placeholder="Novo cliente"
                                            />
                                            <Button onClick={handleCreateClient} disabled={savingNew}>
                                                Salvar
                                            </Button>
                                            <Button variant="ghost" onClick={() => setCreatingClient(false)}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Projeto */}
                                <div className="space-y-2">
                                    {!creatingProject ? (
                                        <>
                                            <TaskSelect
                                                label="Projeto"
                                                value={formData.projectNames}
                                                options={projects.map((p) => ({ label: p.name, value: p.name }))}
                                                onChange={(v) => handleChange("projectNames", v as string[])}
                                                multiple
                                            />
                                            <Button
                                                type="button"
                                                variant="link"
                                                size="sm"
                                                onClick={() => setCreatingProject(true)}
                                            >
                                                + Novo Projeto
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                value={newProjectName}
                                                onChange={(e) => setNewProjectName(e.target.value)}
                                                placeholder="Novo projeto"
                                            />
                                            <Button onClick={handleCreateProject} disabled={savingNew}>
                                                Salvar
                                            </Button>
                                            <Button variant="ghost" onClick={() => setCreatingProject(false)}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Produto */}
                                <div className="space-y-2">
                                    {!creatingProduct ? (
                                        <>
                                            <TaskSelect
                                                label="Produto"
                                                value={formData.productNames}
                                                options={products.map((p) => ({ label: p.name, value: p.name }))}
                                                onChange={(v) => handleChange("productNames", v as string[])}
                                                multiple
                                            />
                                            <Button
                                                type="button"
                                                variant="link"
                                                size="sm"
                                                onClick={() => setCreatingProduct(true)}
                                            >
                                                + Novo Produto
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                value={newProductName}
                                                onChange={(e) => setNewProductName(e.target.value)}
                                                placeholder="Novo produto"
                                            />
                                            <Button onClick={handleCreateProduct} disabled={savingNew}>
                                                Salvar
                                            </Button>
                                            <Button variant="ghost" onClick={() => setCreatingProduct(false)}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Atribuir a */}
                            <div className="space-y-2">
                                <TaskSelect
                                    label="Atribuir a"
                                    value={formData.assignedToInput}
                                    options={users.map((u) => ({ label: u.username, value: u._id }))}
                                    onChange={(v) => handleChange("assignedToInput", v as string[])}
                                    multiple
                                />
                            </div>

                            {/* Subtasks */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subtarefas</label>
                                <div className="space-y-2">
                                    {formData.subtasksInputArray.map((subtask, index) => (
                                        <SubtaskItem
                                            key={index}
                                            index={index}
                                            subtask={subtask}
                                            users={users}
                                            onUpdate={(i, updatedSubtask) => {
                                                const newSubtasks = [...formData.subtasksInputArray];
                                                newSubtasks[i] = updatedSubtask;
                                                handleChange("subtasksInputArray", newSubtasks);
                                            }}
                                            onDelete={(i) => {
                                                const newSubtasks = formData.subtasksInputArray.filter(
                                                    (_, idx) => idx !== i
                                                );
                                                handleChange("subtasksInputArray", newSubtasks);
                                            }}
                                            onAssignClick={(i) => setSubtaskAssignIndex(i)}
                                        />
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handleChange("subtasksInputArray", [
                                            ...formData.subtasksInputArray,
                                            { title: "", done: false, assignedTo: [] },
                                        ])
                                    }
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Adicionar Subtarefa
                                </Button>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                                    Cancelar
                                </Button>
                                <Button className="text-white" type="submit" onClick={handleSubmit}>
                                    <Save className="h-4 w-4 mr-1 text-white" /> {editingTask ? "Salvar Alterações" : "Criar Tarefa"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {subtaskAssignIndex !== null && (
                <AssignModal
                    open={subtaskAssignIndex !== null}
                    onOpenChange={() => setSubtaskAssignIndex(null)}
                    users={users}
                    assignedUsers={formData.subtasksInputArray[subtaskAssignIndex]?.assignedTo || []}
                    onAssign={(assigned) => {
                        const newSubtasks = [...formData.subtasksInputArray];
                        if (newSubtasks[subtaskAssignIndex]) {
                            newSubtasks[subtaskAssignIndex] = {
                                ...newSubtasks[subtaskAssignIndex],
                                assignedTo: assigned,
                            };
                            handleChange("subtasksInputArray", newSubtasks);
                        }
                        setSubtaskAssignIndex(null);
                    }}
                />
            )}
        </>
    );
};
