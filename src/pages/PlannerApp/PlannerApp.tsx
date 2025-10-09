import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";
import { TaskDialog } from "@/components/TaskDialog";
import { type Task, type Theme } from "@/types/types";
import { useTheme } from "@/components/theme-provider";
import { PlannerHeader } from "./PlannerHeader";
import { PlannerKanban } from "./PlannerKanban";
import api from "@/services/api";

export default function PlannerApp() {
    const [tasks, setTasks] = useState<Task[]>([]);
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

    const handleSubmit = async (task: Task) => {
        try {
            const validSubtasks = (task.subtasks || []).filter(
                (s) => s.title && s.title.trim() !== ""
            );

            const payload = { ...task, subtasks: validSubtasks };

            if (editingTask) {
                const response = await api.put(`/tasks/${task._id}`, payload);
                setTasks((prev) =>
                    prev.map((t) => (t._id === task._id ? response.data : t))
                );
            } else {
                const response = await api.post("/tasks", payload);
                setTasks((prev) => [...prev, response.data]);
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
        if (newTheme === "light" || newTheme === "dark" || newTheme === "system") {
            setTheme(newTheme as Theme);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
            <PlannerHeader
                theme={theme}
                setTheme={handleThemeChange} 
                onNewTask={() => openDialog(null)}
                onLogout={handleLogout}
            />

            <PlannerKanban
                tasks={tasks}
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
