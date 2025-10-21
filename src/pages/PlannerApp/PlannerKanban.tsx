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
import { COLUMNS } from "@/constants/constants";
import { Column } from "@/components/Column";
import { SortableTaskCard } from "@/components/SortableTaskCard";
import { type Task, type Status, type User } from "@/types/types";
import api from "@/services/api";

interface PlannerKanbanProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    openDialog: (task?: Task | null) => void;
    activeId: string | null;
    setActiveId: (id: string | null) => void;
    onRequestDelete?: (task: Task) => void; // <-- função de solicitação de exclusão via modal
}

export function PlannerKanban({
    tasks,
    setTasks,
    openDialog,
    activeId,
    setActiveId,
    onRequestDelete,
}: PlannerKanbanProps) {
    const [users, setUsers] = useState<User[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const getTasksByStatus = (status: Status) =>
        tasks.filter((t) => t.status === status);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksRes, usersRes] = await Promise.all([
                    api.get<Task[]>("/tasks"),
                    api.get<User[]>("/users"),
                ]);
                setTasks(tasksRes.data);
                setUsers(usersRes.data);
            } catch (err) {
                console.error("Erro ao buscar dados:", err);
            }
        };
        fetchData();
    }, [setTasks]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find((t) => t._id === active.id);
        if (!activeTask) return;

        let newStatus: Status | null = null;
        if (over.id.toString().startsWith("column-")) {
            newStatus = over.id.toString().replace("column-", "") as Status;
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
                    {COLUMNS.map((column) => (
                        <Column
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            color={column.color}
                            tasks={getTasksByStatus(column.id)}
                            onTaskClick={openDialog}
                            users={users}
                            onRequestDelete={onRequestDelete}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <SortableTaskCard
                            task={activeTask}
                            users={users}
                            onRequestDelete={onRequestDelete}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
