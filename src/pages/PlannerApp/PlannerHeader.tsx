import { Sun, Moon, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlannerHeaderProps {
    theme: string;
    setTheme: (theme: string) => void;
    onNewTask: () => void;
    onLogout: () => void;
}

export function PlannerHeader({ theme, setTheme, onNewTask, onLogout }: PlannerHeaderProps) {
    return (
        <div className="bg-white dark:bg-slate-900 border-b shadow-sm">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        Planner Sociiz
                    </h1>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>

                        <Button
                            onClick={onNewTask}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Tarefa
                        </Button>

                        <Button
                            onClick={onLogout}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sair
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
