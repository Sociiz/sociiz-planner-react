import { useState } from 'react';
import { Plus, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INITIAL_TASKS } from './data/data';
import { COLUMNS } from './constants/constants';
import { type Task } from './types/types';
import { Column } from './components/Column';
import { TaskDialog } from './components/TaskDialog';
import { useTheme } from './components/theme-provider';

export default function PlannerApp() {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const { theme, setTheme } = useTheme();

    const openDialog = (task?: Task | null) => {
        setEditingTask(task ?? null);
        setIsDialogOpen(true);
    };

    const handleSubmit = (task: Task) => {
        if (editingTask) {
            setTasks(prev => prev.map(t => t.id === task.id ? task : t));
        } else {
            setTasks(prev => [...prev, task]);
        }
    };

    const getTasksByStatus = (status: Task['status']) =>
        tasks.filter(t => t.status === status);

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
                            {/* Botão tema */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            >
                                {theme === 'dark' ? (
                                    <Sun className="h-4 w-4" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )}
                            </Button>

                            {/* Nova Tarefa */}
                            <Button
                                onClick={() => openDialog(null)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Tarefa
                            </Button>
                        </div>
                    </div>

                    {/* Dialog */}
                    <TaskDialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        onSubmit={handleSubmit}
                        editingTask={editingTask}
                    />
                </div>
            </div>

            {/* Conteúdo */}
            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {COLUMNS.map(column => (
                        <Column
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            color={column.color}
                            tasks={getTasksByStatus(column.id)}
                            onTaskClick={t => openDialog(t)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
