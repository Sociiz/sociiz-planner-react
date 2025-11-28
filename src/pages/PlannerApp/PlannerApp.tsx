import { TaskDialog } from "@/components/TaskDialog/TaskDialog";
import { PlannerHeader } from "./PlannerHeader";
import { PlannerKanban } from "./PlannerKanban";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PostItSidebar } from "@/components/SidebarPostIt/PostitSidebar";
import { usePlanner } from "@/context/PlannerContext";

export default function PlannerApp() {
    const {
        usuarios,
        isDialogOpen,
        setIsDialogOpen,
        editingTask,
        confirmDeleteTask,
        handleConfirmDelete,
        handleCancelDelete,
        isSidebarOpen,
        toggleSidebar,
        handleSubmit,
    } = usePlanner();

    return (
        <div className="flex flex-1 min-w-0">
            {/* Área Principal (Kanban) */}
            <div className="flex-1 flex flex-col min-w-0">
                <PlannerHeader />

                <main className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                    <PlannerKanban />
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