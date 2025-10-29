import React, { useEffect, useState } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    type DragEndEvent,
    type DragStartEvent,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Column } from "@/components/Column";
import { SortableTaskCard } from "@/components/SortableTaskCard";
import { type Task, type Colaborador, type IStatus } from "@/types/types";
import api from "@/services/api";

interface PlannerKanbanProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    openDialog: (task?: Task | null) => void;
    activeId: string | null;
    setActiveId: (id: string | null) => void;
    colaboradores: Colaborador[];
    onRequestDelete?: (task: Task) => void;
}

export function PlannerKanban({
    tasks,
    setTasks,
    openDialog,
    activeId,
    setActiveId,
    colaboradores,
    onRequestDelete,
}: PlannerKanbanProps) {
    const [statusList, setStatusList] = useState<IStatus[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Puxar status do backend
    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await api.get("/status");
                setStatusList(res.data); // [{_id, name, color}]
            } catch (err) {
                console.error("Erro ao carregar status:", err);
            }
        }
        fetchStatus();
    }, []);

    // Filtrar tasks por status dinâmico
    const getTasksByStatus = (statusId: string) =>
        tasks.filter((t) => t.status === statusId);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find((t) => t._id === active.id);
        if (!activeTask) return;

        let newStatus: string | null = null;

        if (over.id.toString().startsWith("column-")) {
            newStatus = over.id.toString().replace("column-", "");
        } else {
            const overTask = tasks.find((t) => t._id === over.id);
            if (overTask) newStatus = overTask.status;
        }

        if (!newStatus || newStatus === activeTask.status) return;

        const updatedTask = { ...activeTask, status: newStatus };
        setTasks((prev) =>
            prev.map((t) => (t._id === activeTask._id ? updatedTask : t))
        );

        try {
            await api.put(`/tasks/${activeTask._id}`, updatedTask);
        } catch (err) {
            console.error("Erro ao atualizar status da task:", err);
        }
    };

    const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;

    return (
        <div className="container mx-auto px-6 py-8">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {statusList.map((status) => (
                        <Column
                            key={status._id}
                            id={status._id}
                            title={status.name}
                            color={status.color ?? "bg-gray-200"}
                            tasks={getTasksByStatus(status._id)}
                            onTaskClick={openDialog}
                            colaboradores={colaboradores}
                            onRequestDelete={onRequestDelete}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <SortableTaskCard
                            task={activeTask}
                            colaboradores={colaboradores}
                            onRequestDelete={onRequestDelete}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
