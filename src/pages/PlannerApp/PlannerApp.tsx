import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";
import { TaskDialog } from "@/components/TaskDialog/TaskDialog";
import { type Task, type Theme, type FilterOption } from "@/types/types";
import { useTheme } from "@/components/theme-provider";
import { PlannerHeader } from "./PlannerHeader";
import { PlannerKanban } from "./PlannerKanban";
import api from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
    const [colaboradores, setColaboradores] = useState<{ _id: string; name: string }[]>([]);

    const [confirmDeleteTask, setConfirmDeleteTask] = useState<Task | null>(null);

    const { theme, setTheme } = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const openDialog = (task?: Task | null) => {
        setEditingTask(task ?? null);
        setIsDialogOpen(true);
    };

    const refreshTasks = async () => {
        try {
            const response = await api.get<Task[]>("/tasks");
            setTasks(response.data);
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
            await api.delete(`/tasks/${confirmDeleteTask._id}`);
            setTasks(prev => prev.filter(t => t._id !== confirmDeleteTask._id));
        } catch (err) {
            console.error("Erro ao deletar task:", err);
        } finally {
            setConfirmDeleteTask(null);
        }
    };

    const handleCancelDelete = () => setConfirmDeleteTask(null);

    useEffect(() => {
        const fetchColaboradores = async () => {
            try {
                const response = await api.get("/colaboradores");
                setColaboradores(response.data);
            } catch (err) {
                console.error("Erro ao buscar colaboradores:", err);
            }
        };

        refreshTasks();
        fetchColaboradores();
    }, []);

    // Filtra tasks
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
                await api.put(`/tasks/${task._id}`, payload);
            } else {
                await api.post("/tasks", payload);
            }

            setIsDialogOpen(false);
            setEditingTask(null);
            refreshTasks();
        } catch (err) {
            console.error("Erro ao salvar task:", err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
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

    const assignedToOptions: FilterOption[] = colaboradores.map((u) => ({ id: u._id, label: u.name }));

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
            <div className="flex-1 flex flex-col">
                <PlannerHeader
                    theme={theme}
                    setTheme={handleThemeChange}
                    onNewTask={() => openDialog(null)}
                    onLogout={handleLogout}
                    filters={filters}
                    setFilters={setFilters}
                    clientsOptions={getUniqueValues(tasks, "client")}
                    projectsOptions={getUniqueValues(tasks, "project")}
                    productsOptions={getUniqueValues(tasks, "product")}
                    assignedToOptions={assignedToOptions}
                    tagsOptions={getUniqueValues(tasks, "tags")}
                    prioritiesOptions={["Baixa", "Média", "Alta", "Urgente"]}
                />

                <main className="flex-1 overflow-y-auto p-4">
                    <PlannerKanban
                        tasks={filteredTasks}
                        setTasks={setTasks}
                        openDialog={openDialog}
                        activeId={activeId}
                        setActiveId={setActiveId}
                        colaboradores={colaboradores}
                        onRequestDelete={handleRequestDelete}
                    />
                </main>

                <TaskDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onSubmit={handleSubmit}
                    editingTask={editingTask}
                    colaboradores={colaboradores}
                />

                {/* Modal de confirmação de exclusão */}
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
        </div>
    );
}
