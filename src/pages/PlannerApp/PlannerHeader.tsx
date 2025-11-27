import { Sun, Moon, Plus, LogOut, Menu, Layout, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlannerHeaderProps {
    theme: string;
    setTheme: (theme: string) => void;
    onNewTask: () => void;
    onLogout: () => void;
    viewMode: "status" | "usuarios";
    setViewMode: (mode: "status" | "usuarios") => void;
    onToggleSidebar?: () => void;
}

export function PlannerHeader({
    theme,
    setTheme,
    onNewTask,
    onLogout,
    viewMode,
    setViewMode,
    onToggleSidebar,
}: PlannerHeaderProps) {
    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    return (
        <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b shadow-sm z-10 overflow-hidden">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {onToggleSidebar && (
                            <Button
                                variant="outline"
                                size="icon"
                                className="md:hidden"
                                onClick={onToggleSidebar}
                            >
                                <Menu className="w-5 h-5" />
                            </Button>
                        )}

                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            Planner Sociiz
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                setViewMode(viewMode === "status" ? "usuarios" : "status")
                            }
                            title={
                                viewMode === "status"
                                    ? "Visualizar por usuarios"
                                    : "Visualizar por status"
                            }
                        >
                            {viewMode === "status" ? (
                                <Users className="w-5 h-5" />
                            ) : (
                                <Layout className="w-5 h-5" />
                            )}
                        </Button>

                        <Button variant="outline" size="icon" onClick={toggleTheme}>
                            {theme === "dark" ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </Button>

                        <Button
                            onClick={onNewTask}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Nova Tarefa
                        </Button>

                        <Button
                            onClick={onLogout}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Sair
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}