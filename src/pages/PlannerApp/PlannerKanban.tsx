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
import { FilterPanel } from "@/components/FilterPanel";
import { type Task, type IUser, type IStatus, type FilterOption } from "@/types/types";
import { useAuth } from "@/context/authContext";
import type { Filters } from "./PlannerApp";

interface PlannerKanbanProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    openDialog: (task?: Task | null) => void;
    activeId: string | null;
    setActiveId: (id: string | null) => void;
    usuarios: IUser[];
    onRequestDelete?: (task: Task) => void;
    viewMode: "status" | "usuarios";
    filters: Filters;
    setFilters: (filters: Filters) => void;
    clientsOptions: string[];
    projectsOptions: string[];
    productsOptions: string[];
    assignedToOptions: FilterOption[];
    tagsOptions: string[];
    prioritiesOptions: string[];
    isAdmin: boolean;
}

export function PlannerKanban({
    tasks,
    setTasks,
    openDialog,
    activeId,
    setActiveId,
    usuarios,
    onRequestDelete,
    viewMode,
    filters,
    setFilters,
    clientsOptions,
    projectsOptions,
    productsOptions,
    assignedToOptions,
    tagsOptions,
    prioritiesOptions,
    isAdmin,
}: PlannerKanbanProps) {
    const [statusList, setStatusList] = useState<IStatus[]>([]);
    const { token } = useAuth();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await fetch(`${API_BASE_URL}/status`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!res.ok) throw new Error("Erro ao carregar status");

                const data = await res.json();
                setStatusList(data);
            } catch (err) {
                console.error("Erro ao carregar status:", err);
            }
        }
        fetchStatus();
    }, [token, API_BASE_URL]);

    useEffect(() => {
        localStorage.setItem("kanbanViewMode", viewMode);
    }, [viewMode]);

    const getTasksByStatus = (statusId: string) =>
        tasks.filter((t) => t.status === statusId);

    const getTasksByColaborador = (colabId: string) =>
        tasks.filter((t) => {
            if (!t.assignedTo) return false;
            if (Array.isArray(t.assignedTo)) {
                return t.assignedTo.some((a) => a === colabId);
            }
            return t.assignedTo === colabId;
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
                    ? activeTask.assignedTo.some((a) => a === newField)
                    : activeTask.assignedTo === newField;

        if (isSameField) return;

        const updatedTask: Task =
            viewMode === "status"
                ? { ...activeTask, status: newField }
                : { ...activeTask, assignedTo: [newField] };

        setTasks((prev) =>
            prev.map((t) => (t._id === activeTask._id ? updatedTask : t))
        );

        try {
            await fetch(`${API_BASE_URL}/tasks/${activeTask._id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedTask)
            });
        } catch (err) {
            console.error("Erro ao atualizar task:", err);
        }
    };

    const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 px-6 py-4">
                <FilterPanel
                    filters={filters}
                    setFilters={setFilters}
                    clientsOptions={clientsOptions}
                    projectsOptions={projectsOptions}
                    productsOptions={productsOptions}
                    assignedToOptions={assignedToOptions}
                    tagsOptions={tagsOptions}
                    prioritiesOptions={prioritiesOptions}
                    isAdmin={isAdmin}
                />
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* Container com rolagem horizontal SEMPRE VISÍVEL */}
                <div className="flex-1 overflow-x-scroll overflow-y-hidden px-6 py-6">
                    <div className="flex gap-6 h-full">
                        {viewMode === "status"
                            ? statusList.map((status) => (
                                <Column
                                    key={status._id}
                                    id={status._id}
                                    title={status.name}
                                    color={status.color ?? "bg-gray-200"}
                                    tasks={getTasksByStatus(status._id)}
                                    onTaskClick={openDialog}
                                    usuarios={usuarios}
                                    onRequestDelete={onRequestDelete}
                                />
                            ))
                            : [...usuarios]
                                .sort((a, b) => a.username.localeCompare(b.username))
                                .map((colab) => (
                                    <Column
                                        key={colab._id}
                                        id={colab._id}
                                        title={colab.username}
                                        color="bg-green-200"
                                        tasks={getTasksByColaborador(colab._id)}
                                        onTaskClick={openDialog}
                                        usuarios={usuarios}
                                        onRequestDelete={onRequestDelete}
                                    />
                                ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeTask && (
                        <SortableTaskCard
                            task={activeTask}
                            usuarios={usuarios}
                            onRequestDelete={onRequestDelete}
                        />
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
}