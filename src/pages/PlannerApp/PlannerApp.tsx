import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";
import { TaskDialog } from "@/components/TaskDialog";
import { type Task } from "@/types/types";
import { INITIAL_TASKS } from "@/data/data";
import { useTheme } from "@/components/theme-provider";
import { PlannerHeader } from "./PlannerHeader";
import { PlannerKanban } from "./PlannerKanban";

export default function PlannerApp() {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    const { theme, setTheme } = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const openDialog = (task?: Task | null) => {
        setEditingTask(task ?? null);
        setIsDialogOpen(true);
    };

    const handleSubmit = (task: Task) => {
        if (editingTask) {
            setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
        } else {
            setTasks((prev) => [...prev, task]);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
            {/* Header */}
            <PlannerHeader
                theme={theme}
                setTheme={setTheme}
                onNewTask={() => openDialog(null)}
                onLogout={handleLogout}
            />

            {/* Kanban */}
            <PlannerKanban
                tasks={tasks}
                setTasks={setTasks}
                openDialog={openDialog}
                activeId={activeId}
                setActiveId={setActiveId}
            />

            {/* Dialog de Tarefa */}
            <TaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleSubmit}
                editingTask={editingTask}
            />
        </div>
    );
}
