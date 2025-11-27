import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";
import { TaskDialog } from "@/components/TaskDialog/TaskDialog";
import { type Task, type Theme, type FilterOption } from "@/types/types";
import { useTheme } from "@/components/theme-provider";
import { PlannerHeader } from "./PlannerHeader";
import { PlannerKanban } from "./PlannerKanban";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PostItSidebar } from "@/components/SidebarPostIt/PostitSidebar";

export type Filters = {
    clients: string[];
    projects: string[];
    products: string[];
    assignedTo: string[];
    tags: string[];
    priorities: string[];
    dueDate?: string;
};

export default function PlannerApp() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [filters, setFilters] = useState<Filters>({
        clients: [],
        projects: [],
        products: [],
        assignedTo: [],
        tags: [],
        priorities: [],
        dueDate: undefined,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [usuarios, setUsuarios] = useState<{ _id: string; username: string }[]>([]);
    const [confirmDeleteTask, setConfirmDeleteTask] = useState<Task | null>(null);

    const [viewMode, setViewMode] = useState<"status" | "usuarios">(
        () => (localStorage.getItem("kanbanViewMode") as "status" | "usuarios") || "status"
    );

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const { theme, setTheme } = useTheme();
    const { logout, token, user } = useAuth();
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const openDialog = (task?: Task | null) => {
        setEditingTask(task ?? null);
        setIsDialogOpen(true);
    };

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    const refreshTasks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Erro ao buscar tasks");

            const data = await response.json();

            const filterData = user?.isAdmin || user?.isColaborador
                ? data
                : data.filter((task: Task) => {
                    if (!task.assignedTo || !user?.id) return false;
                    if (Array.isArray(task.assignedTo)) {
                        return task.assignedTo.includes(user.id);
                    }
                    return task.assignedTo === user.id;
                });
            setTasks(filterData);
        } catch (err) {
            console.error("Erro ao buscar tasks:", err);
        }
    };

    const handleRequestDelete = (task: Task) => {
        setConfirmDeleteTask(task);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteTask) return;
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${confirmDeleteTask._id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,

                }
            });

            if (!response.ok) throw new Error("Erro ao deletar task");

            setTasks((prev) => prev.filter((t) => t._id !== confirmDeleteTask._id));
        } catch (err) {
            console.error("Erro ao deletar task:", err);
        } finally {
            setConfirmDeleteTask(null);
        }
    };

    const handleCancelDelete = () => setConfirmDeleteTask(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/users`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) throw new Error("Erro ao buscar usuarios");

                const data = await response.json();
                setUsuarios(data);
            } catch (err) {
                console.error("Erro ao buscar usuarios:", err);
            }
        };

        refreshTasks();
        fetchUsers();
    }, [token, API_BASE_URL]);

    useEffect(() => {
        localStorage.setItem("kanbanViewMode", viewMode);
    }, [viewMode]);

    useEffect(() => {
        let filtered = [...tasks];

        if (filters.clients.length)
            filtered = filtered.filter(
                (t) => Array.isArray(t.client) && t.client.some((c) => filters.clients.includes(c))
            );

        if (filters.projects.length)
            filtered = filtered.filter(
                (t) => Array.isArray(t.project) && t.project.some((p) => filters.projects.includes(p))
            );

        if (filters.products.length)
            filtered = filtered.filter(
                (t) => Array.isArray(t.product) && t.product.some((p) => filters.products.includes(p))
            );

        if (filters.assignedTo.length)
            filtered = filtered.filter(
                (t) => Array.isArray(t.assignedTo) && t.assignedTo.some((a) => filters.assignedTo.includes(a))
            );

        if (filters.tags.length)
            filtered = filtered.filter(
                (t) => Array.isArray(t.tags) && t.tags.some((tag) => filters.tags.includes(tag))
            );

        if (filters.priorities.length)
            filtered = filtered.filter((t) => t.priority && filters.priorities.includes(t.priority));

        if (filters.dueDate)
            filtered = filtered.filter(
                (t) =>
                    t.dueDate &&
                    new Date(t.dueDate).toDateString() === new Date(filters.dueDate!).toDateString()
            );

        setFilteredTasks(filtered);
    }, [tasks, filters]);

    const handleSubmit = async (task: Task) => {
        try {
            const validSubtasks = (task.subtasks || []).filter((s) => s.title?.trim() !== "");
            const payload = { ...task, subtasks: validSubtasks };

            if (editingTask) {
                const response = await fetch(`${API_BASE_URL}/tasks/${task._id}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error("Erro ao atualizar task");
            } else {
                const response = await fetch(`${API_BASE_URL}/tasks`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error("Erro ao criar task");
            }

            setIsDialogOpen(false);
            setEditingTask(null);
            refreshTasks();
        } catch (err) {
            console.error("Erro ao salvar task:", err);
        }
    };

    const handleThemeChange = (newTheme: string) => {
        if (["light", "dark", "system"].includes(newTheme)) setTheme(newTheme as Theme);
    };

    const getUniqueValues = (tasks: Task[], key: keyof Task): string[] => {
        const values = tasks.flatMap((t) => {
            const value = t[key];

            if (!value) return [];

            if (Array.isArray(value)) {
                return value.filter((v): v is string => typeof v === "string");
            }

            if (typeof value === "string") {
                return [value];
            }

            return [];
        });

        return Array.from(new Set(values));
    };

    const assignedToOptions: FilterOption[] = usuarios.map((u) => ({ id: u._id, label: u.username }));

    return (
        <div className="flex flex-1 min-w-0">
            {/* Área Principal (Kanban) */}
            <div className="flex-1 flex flex-col min-w-0">
                <PlannerHeader
                    theme={theme}
                    setTheme={handleThemeChange}
                    onNewTask={() => openDialog(null)}
                    onLogout={() => { logout(); navigate("/login"); }}
                    filters={filters}
                    setFilters={setFilters}
                    clientsOptions={getUniqueValues(tasks, "client")}
                    projectsOptions={getUniqueValues(tasks, "project")}
                    productsOptions={getUniqueValues(tasks, "product")}
                    assignedToOptions={assignedToOptions}
                    tagsOptions={getUniqueValues(tasks, "tags")}
                    prioritiesOptions={["Baixa", "Média", "Alta", "Urgente"]}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isAdmin={user?.isAdmin || user?.isColaborador || false}
                    onToggleSidebar={toggleSidebar}
                />

                <main className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                    <PlannerKanban
                        viewMode={viewMode}
                        tasks={filteredTasks}
                        setTasks={setTasks}
                        openDialog={openDialog}
                        activeId={activeId}
                        setActiveId={setActiveId}
                        usuarios={usuarios}
                        onRequestDelete={handleRequestDelete}
                    />
                </main>

                <TaskDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onSubmit={handleSubmit}
                    editingTask={editingTask}
                    Usuarios={usuarios}
                />

                <Dialog open={!!confirmDeleteTask} onOpenChange={handleCancelDelete}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Confirmar exclusão</DialogTitle>
                        </DialogHeader>
                        <p>Tem certeza que deseja excluir a task "{confirmDeleteTask?.title}"?</p>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" onClick={handleCancelDelete}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleConfirmDelete}>Excluir</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {isSidebarOpen && (
                <PostItSidebar
                    isOpen={isSidebarOpen}
                    onToggle={toggleSidebar}
                />
            )}
        </div>
    );
};