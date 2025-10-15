import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";
import { TaskDialog } from "@/components/TaskDialog/TaskDialog";
import { type Task, type Theme, type FilterOption } from "@/types/types";
import { useTheme } from "@/components/theme-provider";
import { PlannerHeader } from "./PlannerHeader";
import { PlannerKanban } from "./PlannerKanban";
import api from "@/services/api";

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
    const [users, setUsers] = useState<{ _id: string; username: string }[]>([]);

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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("/users");
                setUsers(response.data);
            } catch (err) {
                console.error("Erro ao buscar usuários:", err);
            }
        };

        refreshTasks();
        fetchUsers();
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

    // Extrair valores únicos para filtros
    const getUniqueValues = (tasks: Task[], key: keyof Task): string[] => {
        const values = tasks.flatMap((t) => {
            const value = t[key];

            if (!value) return [];

            if (Array.isArray(value)) {
                return value.filter((v): v is string => typeof v === 'string');
            }

            if (typeof value === 'string') {
                return [value];
            }
            return [];
        });

        return Array.from(new Set(values));
    };

    const assignedToOptions: FilterOption[] = users.map((u) => ({ id: u._id, label: u.username }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
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

            <PlannerKanban
                tasks={filteredTasks}
                setTasks={setTasks}
                openDialog={openDialog}
                activeId={activeId}
                setActiveId={setActiveId}
            />

            <TaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleSubmit}
                editingTask={editingTask}
                users={users}
            />
        </div>
    );
}
