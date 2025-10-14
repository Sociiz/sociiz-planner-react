import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Plus, Check, X, Tag } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { type Task, type Subtask, type Status, type EvaluationStatus, type IClient, type IProject, type IProduct, type Itag } from "@/types/types";
import { TaskFormField } from "./TaskFormField";
import { TaskSelect } from "./TaskSelect";
import { SubtaskItem } from "./SubtaskItem";
import { AssignModal } from "./AssignModal";
import { ClientService } from "@/services/clientService";
import { ProjectService } from "@/services/projectService";
import { ProductService } from "@/services/productService";
import { tagService } from "@/services/tagService";

type TaskFormData = Omit<Task, "_id" | "client" | "project" | "product" | "assignedTo" | "subtasks" | "tags"> & {
    clientNames: string[];
    projectNames: string[];
    productNames: string[];
    tagNames: string[];
    assignedToInput: string[];
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
        tagNames: [],
        assignedToInput: [],
        subtasksInputArray: [],
        dueDate: "",
    });

    const [clients, setClients] = useState<IClient[]>([]);
    const [tags, setTags] = useState<Itag[]>([]);
    const [projects, setProjects] = useState<IProject[]>([]);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    const [creatingClient, setCreatingClient] = useState(false);
    const [creatingProject, setCreatingProject] = useState(false);
    const [creatingProduct, setCreatingProduct] = useState(false);
    const [creatingTag, setCreatingTag] = useState(false);
    const [newClientName, setNewClientName] = useState("");
    const [newProjectName, setNewProjectName] = useState("");
    const [newProductName, setNewProductName] = useState("");
    const [newTagName, setNewTagName] = useState("");
    const [savingNew, setSavingNew] = useState(false);

    const [subtaskAssignIndex, setSubtaskAssignIndex] = useState<number | null>(null);

    useEffect(() => {
        if (open && !initialDataLoaded.current) {
            fetchAllData();
            initialDataLoaded.current = true;
        }
        if (!open) initialDataLoaded.current = false;
    }, [open]);

    useEffect(() => {
        if (!open) return;
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
                tagNames: editingTask.tags || [],
                assignedToInput: editingTask.assignedTo || [],
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
                tagNames: [],
                subtasksInputArray: [],
                dueDate: "",
            });
        }
    }, [editingTask, open, user?.id]);

    const fetchAllData = async () => {
        setLoadingData(true);
        try {
            const [clientsData, projectsData, productsData, tagsData] = await Promise.all([
                ClientService.getAll(),
                ProjectService.getAll(),
                ProductService.getAll(),
                tagService.getAll(),
            ]);
            setClients(clientsData);
            setProjects(projectsData);
            setProducts(productsData);
            setTags(tagsData);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateEntity = async (
        type: "client" | "project" | "product" | "tag",
        name: string,
        reset: () => void
    ) => {
        if (!name.trim()) return;
        setSavingNew(true);
        try {
            let newItem: IClient | IProject | IProduct | Itag;

            if (type === "client") {
                newItem = await ClientService.create({ name });
                setClients((prev) => [...prev, newItem]);
                handleChange("clientNames", [...formData.clientNames, newItem.name]);
            } else if (type === "project") {
                newItem = await ProjectService.create({ name });
                setProjects((prev) => [...prev, newItem]);
                handleChange("projectNames", [...formData.projectNames, newItem.name]);
            } else if (type === "product") {
                newItem = await ProductService.create({ name });
                setProducts((prev) => [...prev, newItem]);
                handleChange("productNames", [...formData.productNames, newItem.name]);
            } else if (type === "tag") {
                newItem = await tagService.create({ name });
                setTags((prev) => [...prev, newItem]);
                handleChange("tagNames", [...formData.tagNames, newItem.name]);
            }

            reset();
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
            tags: formData.tagNames,
            assignedTo: formData.assignedToInput,
            subtasks: formData.subtasksInputArray,
            dueDate: formData.dueDate,
        });

        onOpenChange(false);
    };

    const renderEntityField = (
        label: string,
        value: string[],
        options: { label: string; value: string }[],
        creating: boolean,
        setCreating: (v: boolean) => void,
        newName: string,
        setNewName: (v: string) => void,
        type: "client" | "project" | "product" | "tag"
    ) => (
        <div className="space-y-2">
            {!creating ? (
                <>
                    <TaskSelect
                        label={label}
                        value={value}
                        options={options}
                        onChange={(v) => handleChange(`${type}Names` as any, v as string[])}
                        multiple
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => setCreating(true)}
                    >
                        <Plus className="h-3 w-3" /> Novo {label}
                    </Button>
                </>
            ) : (
                <div className="flex gap-2">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={`Novo ${label}`}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateEntity(type, newName, () => { setCreating(false); setNewName(""); });
                            if (e.key === "Escape") { setCreating(false); setNewName(""); }
                        }}
                    />
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleCreateEntity(type, newName, () => { setCreating(false); setNewName(""); })}
                        disabled={!newName.trim() || savingNew}
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => { setCreating(false); setNewName(""); }}
                        disabled={savingNew}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
                    <DialogHeader className="border-b pb-2">
                        <DialogTitle className="text-xl font-semibold">
                            {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
                        </DialogTitle>
                    </DialogHeader>

                    {loadingData ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-gray-500">Carregando dados...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8 mt-4">

                            {/* Informações básicas */}
                            <section className="space-y-4">
                                <h3 className="text-base font-medium text-white">Informações básicas</h3>
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
                            </section>

                            {/* Status, Avaliação e Data */}
                            <section>
                                <h3 className="text-base font-medium text-white mb-3">Status e Prazo</h3>
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
                            </section>

                            {/* Vínculos */}
                            <section>
                                <h3 className="text-base font-medium text-white mb-3">Vínculos e Categorias</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    {renderEntityField("Cliente", formData.clientNames, clients.map(c => ({ label: c.name, value: c.name })), creatingClient, setCreatingClient, newClientName, setNewClientName, "client")}
                                    {renderEntityField("Projeto", formData.projectNames, projects.map(p => ({ label: p.name, value: p.name })), creatingProject, setCreatingProject, newProjectName, setNewProjectName, "project")}
                                    {renderEntityField("Produto", formData.productNames, products.map(p => ({ label: p.name, value: p.name })), creatingProduct, setCreatingProduct, newProductName, setNewProductName, "product")}
                                    {renderEntityField("Tag", formData.tagNames, tags.map(t => ({ label: t.name, value: t.name })), creatingTag, setCreatingTag, newTagName, setNewTagName, "tag")}
                                </div>
                            </section>

                            {/* Responsáveis */}
                            <section>
                                <h3 className="text-base font-medium text-white mb-3">Responsáveis</h3>
                                <TaskSelect
                                    label="Atribuir a"
                                    value={formData.assignedToInput}
                                    options={users.map((u) => ({ label: u.username, value: u._id }))}
                                    onChange={(v) => handleChange("assignedToInput", v as string[])}
                                    multiple
                                />
                            </section>

                            {/* Subtarefas */}
                            <section>
                                <h3 className="text-base font-medium text-white mb-3">Subtarefas</h3>
                                <div className="space-y-2">
                                    {formData.subtasksInputArray.map((subtask, index) => (
                                        <SubtaskItem
                                            key={index}
                                            index={index}
                                            subtask={subtask}
                                            users={users}
                                            onUpdate={(i, updated) => {
                                                const newSubtasks = [...formData.subtasksInputArray];
                                                newSubtasks[i] = updated;
                                                handleChange("subtasksInputArray", newSubtasks);
                                            }}
                                            onDelete={(i) => {
                                                const newSubtasks = formData.subtasksInputArray.filter((_, idx) => idx !== i);
                                                handleChange("subtasksInputArray", newSubtasks);
                                            }}
                                            onAssignClick={(i) => setSubtaskAssignIndex(i)}
                                        />
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2"
                                        onClick={() =>
                                            handleChange("subtasksInputArray", [
                                                ...formData.subtasksInputArray,
                                                { title: "", done: false, assignedTo: [] },
                                            ])
                                        }
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Adicionar Subtarefa
                                    </Button>
                                </div>
                            </section>

                            {/* Ações */}
                            <section className="border-t pt-4 flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                                    Cancelar
                                </Button>
                                <Button className="text-white" onClick={handleSubmit}>
                                    <Save className="h-4 w-4 mr-1 text-white" />
                                    {editingTask ? "Salvar Alterações" : "Criar Tarefa"}
                                </Button>
                            </section>

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
