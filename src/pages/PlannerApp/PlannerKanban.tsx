import {
    DndContext,
    DragOverlay,
    closestCorners,
    type DragOverEvent,
    type DragStartEvent,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { COLUMNS } from "@/constants/constants";
import { Column } from "@/components/Column";
import { TaskCard } from "@/components/TaskCard";
import { type Task, type Status } from "@/types/types";

interface PlannerKanbanProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    openDialog: (task?: Task | null) => void;
    activeId: string | null;
    setActiveId: (id: string | null) => void;
}

export function PlannerKanban({
    tasks,
    setTasks,
    openDialog,
    activeId,
    setActiveId,
}: PlannerKanbanProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const getTasksByStatus = (status: Status) => tasks.filter((t) => t.status === status);

    const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);
    const handleDragEnd = () => setActiveId(null);

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find((t) => t.id === active.id);
        if (!activeTask) return;

        const overId = over.id as string;

        if (overId.startsWith("column-")) {
            const newStatus = overId.replace("column-", "") as Status;
            if (activeTask.status !== newStatus) {
                setTasks((prev) =>
                    prev.map((t) => (t.id === active.id ? { ...t, status: newStatus } : t))
                );
            }
            return;
        }

        const overTask = tasks.find((t) => t.id === overId);
        if (overTask && activeTask.status !== overTask.status) {
            setTasks((prev) =>
                prev.map((t) => (t.id === active.id ? { ...t, status: overTask.status } : t))
            );
        }
    };

    const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

    return (
        <div className="container mx-auto px-6 py-8">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <SortableContext items={COLUMNS.map((c) => `column-${c.id}`)}>
                        {COLUMNS.map((column) => (
                            <Column
                                key={column.id}
                                id={column.id}
                                title={column.title}
                                color={column.color}
                                tasks={getTasksByStatus(column.id)}
                                onTaskClick={(t) => openDialog(t)}
                            />
                        ))}
                    </SortableContext>
                </div>

                <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
            </DndContext>
        </div>
    );
}
