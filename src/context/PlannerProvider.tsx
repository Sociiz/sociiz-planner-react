import { useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@/context/authContext";
import { type Task } from "@/types/types";
import { PlannerContext, type Filters, type ViewMode } from "./PlannerContext";

interface PlannerProviderProps {
    children: ReactNode;
}

export const PlannerProvider = ({ children }: PlannerProviderProps) => {
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

    const [viewMode, setViewMode] = useState<ViewMode>(
        () => (localStorage.getItem("kanbanViewMode") as ViewMode) || "status"
    );

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const { token, user } = useAuth();
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

    const getFilterOptions = () => ({
        clientsOptions: getUniqueValues(tasks, "client"),
        projectsOptions: getUniqueValues(tasks, "project"),
        productsOptions: getUniqueValues(tasks, "product"),
        assignedToOptions: usuarios.map((u) => ({ id: u._id, label: u.username })),
        tagsOptions: getUniqueValues(tasks, "tags"),
        prioritiesOptions: ["Baixa", "Média", "Alta", "Urgente"],
    });

    // Fetch inicial de usuários
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

    // Salvar viewMode no localStorage
    useEffect(() => {
        localStorage.setItem("kanbanViewMode", viewMode);
    }, [viewMode]);

    // Aplicar filtros
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

    const value = {
        tasks,
        filteredTasks,
        setTasks,
        refreshTasks,
        filters,
        setFilters,
        usuarios,
        viewMode,
        setViewMode,
        isDialogOpen,
        setIsDialogOpen,
        editingTask,
        openDialog,
        confirmDeleteTask,
        handleRequestDelete,
        handleConfirmDelete,
        handleCancelDelete,
        activeId,
        setActiveId,
        isSidebarOpen,
        toggleSidebar,
        handleSubmit,
        getFilterOptions,
    };

    return (
        <PlannerContext.Provider value={value}>
            {children}
        </PlannerContext.Provider>
    );
};