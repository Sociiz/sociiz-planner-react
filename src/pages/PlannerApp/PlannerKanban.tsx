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
    viewMode: "status" | "colaborador";
}

export function PlannerKanban({
    tasks,
    setTasks,
    openDialog,
    activeId,
    setActiveId,
    colaboradores,
    onRequestDelete,
    viewMode,
}: PlannerKanbanProps) {
    const [statusList, setStatusList] = useState<IStatus[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await api.get("/status");
                setStatusList(res.data);
            } catch (err) {
                console.error("Erro ao carregar status:", err);
            }
        }
        fetchStatus();
    }, []);

    useEffect(() => {
        localStorage.setItem("kanbanViewMode", viewMode);
    }, [viewMode]);

    const getTasksByStatus = (statusId: string) =>
        tasks.filter((t) => t.status === statusId);

    const getTasksByColaborador = (colabId: string) =>
        tasks.filter((t) => {
            if (!t.assignedTo) return false;
            if (Array.isArray(t.assignedTo)) {
                return t.assignedTo.some(
                    (a) =>
                        a === colabId);
            }
            return (
                t.assignedTo === colabId);
        });

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find((t) => t._id === active.id);
        if (!activeTask) return;

        let newField: string | null = null;

        if (over.id.toString().startsWith("column-")) {
            newField = over.id.toString().replace("column-", "");
        } else {
            const overTask = tasks.find((t) => t._id === over.id);
            if (overTask) {
                newField =
                    viewMode === "status"
                        ? overTask.status
                        : Array.isArray(overTask.assignedTo)
                            ? (overTask.assignedTo[0] ?? overTask.assignedTo[0])
                            : overTask.assignedTo ?? overTask.assignedTo ?? null;
            }
        }

        if (!newField) return;

        const isSameField =
            viewMode === "status"
                ? activeTask.status === newField
                : Array.isArray(activeTask.assignedTo)
                    ? activeTask.assignedTo.some(
                        (a) => a === newField
                    )
                    : activeTask.assignedTo === newField ||
                    activeTask.assignedTo === newField;

        if (isSameField) return;

        const updatedTask: Task =
            viewMode === "status"
                ? { ...activeTask, status: newField }
                : { ...activeTask, assignedTo: [newField] };

        setTasks((prev) =>
            prev.map((t) => (t._id === activeTask._id ? updatedTask : t))
        );

        try {
            await api.put(`/tasks/${activeTask._id}`, updatedTask);
        } catch (err) {
            console.error("Erro ao atualizar task:", err);
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
                <div
                    className={`grid gap-6 ${viewMode === "colaborador"
                        ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-5"
                        : "grid-cols-1 md:grid-cols-4"
                        }`}
                >
                    {viewMode === "status"
                        ? statusList.map((status) => (
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
                        ))
                        // pra ordenar de a-z pego o nome de cada e comparo e faço uma map
                        : [...colaboradores]
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((colab) => (
                                <Column
                                    key={colab._id}
                                    id={colab._id}
                                    title={colab.name}
                                    color="bg-green-200"
                                    tasks={getTasksByColaborador(colab._id)}
                                    onTaskClick={openDialog}
                                    colaboradores={colaboradores}
                                    onRequestDelete={onRequestDelete}
                                />
                            ))}
                </div>

                <DragOverlay>
                    {activeTask && (
                        <SortableTaskCard
                            task={activeTask}
                            colaboradores={colaboradores}
                            onRequestDelete={onRequestDelete}
                        />
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
