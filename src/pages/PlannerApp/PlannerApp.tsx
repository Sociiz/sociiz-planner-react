import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";
import { TaskDialog } from "@/components/TaskDialog/TaskDialog";
import { useTheme } from "@/components/theme-provider";
import { type Theme } from "@/types/types";
import { PlannerHeader } from "./PlannerHeader";
import { PlannerKanban } from "./PlannerKanban";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PostItSidebar } from "@/components/SidebarPostIt/PostitSidebar";
import { usePlanner } from "@/context/PlannerContext";

export default function PlannerApp() {
    const { theme, setTheme } = useTheme();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const {
        filteredTasks,
        setTasks,
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
    } = usePlanner();

    const handleThemeChange = (newTheme: string) => {
        if (["light", "dark", "system"].includes(newTheme)) setTheme(newTheme as Theme);
    };

    const filterOptions = getFilterOptions();

    return (
        <div className="flex flex-1 min-w-0">
            {/* Área Principal (Kanban) */}
            <div className="flex-1 flex flex-col min-w-0">
                <PlannerHeader
                    theme={theme}
                    setTheme={handleThemeChange}
                    onNewTask={() => openDialog(null)}
                    onLogout={() => { logout(); navigate("/login"); }}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
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
                        filters={filters}
                        setFilters={setFilters}
                        clientsOptions={filterOptions.clientsOptions}
                        projectsOptions={filterOptions.projectsOptions}
                        productsOptions={filterOptions.productsOptions}
                        assignedToOptions={filterOptions.assignedToOptions}
                        tagsOptions={filterOptions.tagsOptions}
                        prioritiesOptions={filterOptions.prioritiesOptions}
                        isAdmin={user?.isAdmin || user?.isColaborador || false}
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
}