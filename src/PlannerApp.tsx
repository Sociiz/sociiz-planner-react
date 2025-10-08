import { useState } from 'react';
import {
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
    DragOverlay,
    closestCorners,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INITIAL_TASKS } from './data/data';
import { COLUMNS } from './constants/constants';
import { type Task, type Status } from './types/types';
import { Column } from './components/Column';
import { TaskDialog } from './components/TaskDialog';
import { TaskCard } from './components/TaskCard';
import { useTheme } from './components/theme-provider';

export default function PlannerApp() {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    const { theme, setTheme } = useTheme();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const openDialog = (task?: Task | null) => {
        setEditingTask(task ?? null);
        setIsDialogOpen(true);
    };

    const handleSubmit = (task: Task) => {
        if (editingTask) {
            setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
        } else {
            setTasks((prev) => [...prev, task]);
        }
    };

    const getTasksByStatus = (status: Status) => tasks.filter((t) => t.status === status);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find((t) => t.id === active.id);
        if (!activeTask) return;

        const overId = over.id as string;

        // Dragging over a column
        if (overId.startsWith('column-')) {
            const newStatus = overId.replace('column-', '') as Status;
            if (activeTask.status !== newStatus) {
                setTasks((prev) =>
                    prev.map((t) => (t.id === active.id ? { ...t, status: newStatus } : t))
                );
            }
            return;
        }

        // Dragging over another task
        const overTask = tasks.find((t) => t.id === overId);
        if (overTask && activeTask.status !== overTask.status) {
            setTasks((prev) =>
                prev.map((t) => (t.id === active.id ? { ...t, status: overTask.status } : t))
            );
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
    };

    const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
            {/* Header */}
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
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            >
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>

                            <Button
                                onClick={() => openDialog(null)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Tarefa
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kanban */}
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

                    <DragOverlay>
                        {activeTask ? <TaskCard task={activeTask} /> : null}
                    </DragOverlay>
                </DndContext>
            </div>

            <TaskDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleSubmit}
                editingTask={editingTask}
            />
        </div>
    );
}