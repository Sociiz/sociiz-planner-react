import { Sun, Moon, Plus, LogOut, Menu, Layout, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlanner } from "@/context/PlannerContext";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";

export function PlannerHeader() {
    const { theme, setTheme } = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { viewMode, toggleViewMode, handleNewTask, toggleSidebar } = usePlanner(); // Puxando do context

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b shadow-sm z-10 overflow-hidden">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            className="md:hidden"
                            onClick={toggleSidebar}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>

                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            Planner Sociiz
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleViewMode}
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
                            onClick={handleNewTask}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Nova Tarefa
                        </Button>

                        <Button
                            onClick={handleLogout}
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