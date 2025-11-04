import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Plus, Check, X, Send, MessageSquare, Pencil } from "lucide-react";
import { useAuth } from "@/context/authContext";
import {
    type Task,
    type Subtask,
    type IStatus,
    type EvaluationStatus,
    type IClient,
    type IProject,
    type IProduct,
    type Itag,
    type Priority,
    type IUser,
    // type IColaborador,
} from "@/types/types";
import { TaskFormField } from "./TaskFormField";
import { TaskSelect } from "./TaskSelect";
import { SubtaskItem } from "./SubtaskItem";
import { AssignModal } from "./AssignModal";
import { ClientService } from "@/services/clientService";
import { ProjectService } from "@/services/projectService";
import { ProductService } from "@/services/productService";
import { tagService } from "@/services/tagService";
// import { ColaboradorService } from "@/services/colaboradorService";
import { statusService } from "@/services/statusService";
import { commentService, type IComment } from "@/services/commentService";
import { userService } from "@/services/userService";

type TaskFormData = {
    title: string;
    description?: string;
    status: string;
    evaluationStatus: EvaluationStatus;
    createdBy: string;
    clientNames: string[];
    projectNames: string[];
    productNames: string[];
    tagNames: string[];
    assignedToInput: string[];
    subtasksInputArray: Subtask[];
    dueDate?: string;
    priority: Priority;
};

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (task: Task) => void;
    editingTask?: Task | null;
    Usuarios: IUser[];
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
    open,
    onOpenChange,
    onSubmit,
    editingTask,
}) => {
    const { user } = useAuth();
    const initialDataLoaded = useRef(false);
    const commentsEndRef = useRef<HTMLDivElement>(null);

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
        priority: "Média",
    });

    const [statusList, setStatusList] = useState<IStatus[]>([]);
    const [clients, setClients] = useState<IClient[]>([]);
    const [projects, setProjects] = useState<IProject[]>([]);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [tags, setTags] = useState<Itag[]>([]);
    const [usuarios, setUsuarios] = useState<IUser[]>([]);
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

    // comentários
    const [comments, setComments] = useState<IComment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [sendingComment, setSendingComment] = useState(false);

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
                priority: editingTask.priority || "Média",
                clientNames: Array.isArray(editingTask.client)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? editingTask.client.map((c: any) => (typeof c === "string" ? c : c.name))
                    : [],
                projectNames: Array.isArray(editingTask.project)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? editingTask.project.map((p: any) => (typeof p === "string" ? p : p.name))
                    : [],
                productNames: Array.isArray(editingTask.product)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? editingTask.product.map((p: any) => (typeof p === "string" ? p : p.name))
                    : [],
                tagNames: Array.isArray(editingTask.tags)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? editingTask.tags.map((t: any) => (typeof t === "string" ? t : t.name))
                    : [],
                assignedToInput: (editingTask.assignedTo as string[]) || [],
                subtasksInputArray: editingTask.subtasks || [],
                dueDate: editingTask.dueDate || "",
            });

            // Carregar comentários se tiver editando a task
            if (editingTask._id) {
                fetchComments(editingTask._id);
            }
        } else {
            setFormData({
                title: "",
                description: "",
                status: "todo",
                evaluationStatus: "pending",
                createdBy: user?.id || "",
                priority: "Média",
                clientNames: [],
                projectNames: [],
                productNames: [],
                tagNames: [],
                assignedToInput: [],
                subtasksInputArray: [],
                dueDate: "",
            });
            setComments([]);
        }
    }, [editingTask, open, user?.id]);

    useEffect(() => {
        if (commentsEndRef.current && comments.length > 0) {
            commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [comments]);

    const fetchAllData = async () => {
        setLoadingData(true);
        try {
            const [clientsData, projectsData, productsData, tagsData, userData, statusData] =
                await Promise.all([
                    ClientService.getAll(),
                    ProjectService.getAll(),
                    ProductService.getAll(),
                    tagService.getAll(),
                    userService.getAll(),
                    statusService.getAll(),
                ]);

            setClients(clientsData);
            setProjects(projectsData);
            setProducts(productsData);
            setTags(tagsData);
            setUsuarios(userData);
            setStatusList(statusData);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoadingData(false);
        }
    };

    // Funções para os comentários 
    const fetchComments = async (taskId: string) => {
        setLoadingComments(true);
        try {
            const comments = await commentService.getByTaskId(taskId);
            setComments(comments);
        } catch (error) {
            console.error("Erro ao buscar comentários:", error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleStartEdit = (comment: IComment) => {
        setEditingCommentId(comment._id)
        setEditingContent(comment.content)
    }

    const handleSaveEdit = async (commentId: string) => {
        if (!editingContent.trim()) return;
        try {
            const updated = await commentService.update(commentId, editingContent.trim());
            setComments(prev => prev.map(c => c._id === commentId ? updated : c));
            setEditingCommentId(null);
            setEditingContent("")
        } catch (error) {
            console.error("Erro ao editar comentário:", error);
        }
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditingContent("")
    }

    const handleSendComment = async () => {
        if (!newComment.trim() || !editingTask?._id) return;

        setSendingComment(true);
        try {
            const comment = await commentService.create(editingTask._id, newComment.trim());
            setComments(prev => [...prev, comment]);
            setNewComment("");
        } catch (error) {
            console.error("Erro ao enviar comentário:", error);
        } finally {
            setSendingComment(false);
        }
    };
    // Formato das datas
    const formatCommentDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "agora";
        if (diffMins < 60) return `${diffMins}min atrás`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h atrás`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d atrás`;

        return date.toLocaleDateString('pt-BR');
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
            console.error("Erro ao criar item:", error);
        } finally {
            setSavingNew(false);
        }
    };

    const handleSubmit = () => {
        if (!formData.title.trim()) return;

        const newTask: Task = {
            _id: editingTask?._id || "",
            title: formData.title.trim(),
            description: formData.description?.trim() || "",
            status: formData.status,
            evaluationStatus: formData.evaluationStatus,
            priority: formData.priority,
            createdBy: formData.createdBy,
            client: formData.clientNames,
            project: formData.projectNames,
            product: formData.productNames,
            tags: formData.tagNames,
            assignedTo: formData.assignedToInput,
            subtasks: formData.subtasksInputArray,
            dueDate: formData.dueDate,
        };

        onSubmit(newTask);
        onOpenChange(false);
    };

    const Users = usuarios.map((u) => ({
        _id: u._id || "",
        username: u.username || "",
    }));

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
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                            if (e.key === "Enter")
                                handleCreateEntity(type, newName, () => {
                                    setCreating(false);
                                    setNewName("");
                                });
                            if (e.key === "Escape") {
                                setCreating(false);
                                setNewName("");
                            }
                        }}
                    />
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() =>
                            handleCreateEntity(type, newName, () => {
                                setCreating(false);
                                setNewName("");
                            })
                        }
                        disabled={!newName.trim() || savingNew}
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                            setCreating(false);
                            setNewName("");
                        }}
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
                <DialogContent className="!max-w-[90rem] max-h-[90vh] overflow-hidden rounded-2xl p-0">
                    <div className="flex h-[90vh]">
                        {/* Coluna Principal - Formulário */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <DialogHeader className="border-b pb-2 mb-4">
                                <DialogTitle className="text-xl font-semibold">
                                    {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
                                </DialogTitle>
                            </DialogHeader>

                            {loadingData ? (
                                <div className="flex items-center justify-center py-8">
                                    <p className="text-gray-500">Carregando dados...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-8">
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

                                    {/* Status e Prazo */}
                                    <section>
                                        <h3 className="text-base font-medium text-white mb-3">Status e Prazo</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <TaskSelect
                                                label="Status"
                                                value={formData.status}
                                                options={statusList.map((s) => ({
                                                    label: s.name,
                                                    value: s._id,
                                                }))}
                                                onChange={(v) => handleChange("status", v as string)}
                                            />
                                            <TaskSelect
                                                label="Avaliação"
                                                value={formData.evaluationStatus}
                                                options={[
                                                    { label: "Pendente", value: "pending" },
                                                    { label: "Aprovada", value: "approved" },
                                                    { label: "Rejeitada", value: "rejected" },
                                                ]}
                                                onChange={(v) => handleChange("evaluationStatus", v as EvaluationStatus)}
                                            />
                                            <TaskSelect
                                                label="Prioridade"
                                                value={formData.priority}
                                                options={[
                                                    { label: "Baixa", value: "Baixa" },
                                                    { label: "Média", value: "Média" },
                                                    { label: "Alta", value: "Alta" },
                                                    { label: "Urgente", value: "Urgente" },
                                                ]}
                                                onChange={(v) => handleChange("priority", v as Priority)}
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {renderEntityField(
                                                "Cliente",
                                                formData.clientNames,
                                                clients.map((c) => ({ label: c.name, value: c.name })),
                                                creatingClient,
                                                setCreatingClient,
                                                newClientName,
                                                setNewClientName,
                                                "client"
                                            )}
                                            {renderEntityField(
                                                "Projeto",
                                                formData.projectNames,
                                                projects.map((p) => ({ label: p.name, value: p.name })),
                                                creatingProject,
                                                setCreatingProject,
                                                newProjectName,
                                                setNewProjectName,
                                                "project"
                                            )}
                                            {renderEntityField(
                                                "Produto",
                                                formData.productNames,
                                                products.map((p) => ({ label: p.name, value: p.name })),
                                                creatingProduct,
                                                setCreatingProduct,
                                                newProductName,
                                                setNewProductName,
                                                "product"
                                            )}
                                            {renderEntityField(
                                                "Tag",
                                                formData.tagNames,
                                                tags.map((t) => ({ label: t.name, value: t.name })),
                                                creatingTag,
                                                setCreatingTag,
                                                newTagName,
                                                setNewTagName,
                                                "tag"
                                            )}
                                        </div>
                                    </section>

                                    {/* Responsáveis */}
                                    <section>
                                        <h3 className="text-base font-medium text-white mb-3">Responsáveis</h3>
                                        <TaskSelect
                                            label="Atribuir a"
                                            value={formData.assignedToInput}
                                            options={Users.map((u) => ({
                                                label: u.username,
                                                value: u._id || "",
                                            }))}
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
                                                    users={Users}
                                                    onUpdate={(i, updated) => {
                                                        const newSubtasks = [...formData.subtasksInputArray];
                                                        newSubtasks[i] = updated;
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
                        </div>

                        {/* Coluna de Comentários */}
                        {editingTask?._id && (
                            <div className="w-96 border-l bg-gray-50 dark:bg-gray-900 flex flex-col">
                                {/* Header */}
                                <div className="p-4 border-b flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Comentários
                                        </h3>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            ({comments.length})
                                        </span>
                                    </div>
                                </div>

                                {/* Lista de Comentários */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {loadingComments ? (
                                        <div className="flex items-center justify-center py-8">
                                            <p className="text-sm text-gray-500">Carregando comentários...</p>
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Nenhum comentário ainda
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                Seja o primeiro a comentar
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {comments
                                                .filter((comment: IComment) => comment?.userId)
                                                .map((comment: IComment) => (
                                                    <div
                                                        key={comment._id}
                                                        className={`p-3 rounded-lg ${comment?.userId?._id === user?.id
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 ml-4'
                                                            : 'bg-white dark:bg-gray-800 mr-4'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-1">
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {comment.userId?.username || "Usuário removido"}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {formatCommentDate(comment.createdAt)}
                                                                </span>
                                                                {/* So edita o proprio comentario */}
                                                                {comment.userId._id === user?.id && editingCommentId !== comment._id && (
                                                                    <button
                                                                        onClick={() => handleStartEdit(comment)}
                                                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                                                    >
                                                                        <Pencil className="h-3 w-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Editando */}
                                                        {editingCommentId === comment._id ? (
                                                            <div className="space-y-2">
                                                                <Input
                                                                    value={editingContent}
                                                                    onChange={(e) => setEditingContent(e.target.value)}
                                                                    className="text-sm"
                                                                    autoFocus
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === "Enter" && !e.shiftKey) {
                                                                            e.preventDefault();
                                                                            handleSaveEdit(comment._id);
                                                                        }
                                                                        if (e.key === "Escape") {
                                                                            handleCancelEdit();
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleSaveEdit(comment._id)}
                                                                        disabled={!editingContent.trim()}
                                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                                    >
                                                                        <Check className="h-3 w-3 mr-1" /> Salvar
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={handleCancelEdit}
                                                                    >
                                                                        <X className="h-3 w-3 mr-1" /> Cancelar
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                                {comment.content}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            <div ref={commentsEndRef} />
                                        </>
                                    )}
                                </div>

                                {/* novo comentario */}
                                <div className="p-4 border-t bg-white dark:bg-gray-800">
                                    <div className="flex gap-2">
                                        <Input
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Digite seu comentário..."
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendComment();
                                                }
                                            }}
                                            disabled={sendingComment}
                                            className="flex-1"
                                        />
                                        <Button
                                            size="icon"
                                            onClick={handleSendComment}
                                            disabled={!newComment.trim() || sendingComment}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Pressione Enter para enviar
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {subtaskAssignIndex !== null && (
                <AssignModal
                    open={subtaskAssignIndex !== null}
                    onOpenChange={() => setSubtaskAssignIndex(null)}
                    users={Users}
                    assignedUsers={
                        formData.subtasksInputArray[subtaskAssignIndex]?.assignedTo || []
                    }
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