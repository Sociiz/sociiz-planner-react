import { createContext, useContext } from "react";
import { type Task, type FilterOption } from "@/types/types";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

export type Filters = {
    clients: string[];
    projects: string[];
    products: string[];
    assignedTo: string[];
    tags: string[];
    priorities: string[];
    dueDate?: string;
};

export type ViewMode = "status" | "usuarios";

export interface PlannerContextType {
    // Tasks
    tasks: Task[];
    filteredTasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    refreshTasks: () => Promise<void>;

    // Filtros
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;

    // Usuários
    usuarios: { _id: string; username: string }[];

    // Status
    statusList: { _id: string; name: string; color?: string }[];

    // View Mode
    viewMode: ViewMode;
    setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
    toggleViewMode: () => void;

    // Dialog
    isDialogOpen: boolean;
    setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editingTask: Task | null;
    openDialog: (task?: Task | null) => void;
    handleNewTask: () => void;

    // Delete Confirmation
    confirmDeleteTask: Task | null;
    handleRequestDelete: (task: Task) => void;
    handleConfirmDelete: () => Promise<void>;
    handleCancelDelete: () => void;

    // Drag and Drop
    activeId: string | null;
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
    handleDragStart: (event: DragStartEvent) => void;
    handleDragEnd: (event: DragEndEvent) => Promise<void>;

    // Sidebar
    isSidebarOpen: boolean;
    toggleSidebar: () => void;

    // Submit
    handleSubmit: (task: Task) => Promise<void>;

    // Filter Options
    getFilterOptions: () => {
        clientsOptions: string[];
        projectsOptions: string[];
        productsOptions: string[];
        assignedToOptions: FilterOption[];
        tagsOptions: string[];
        prioritiesOptions: string[];
    };

    isAdmin: boolean;
}

export const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const usePlanner = () => {
    const context = useContext(PlannerContext);
    if (!context) {
        throw new Error("usePlanner must be used within a PlannerProvider");
    }
    return context;
};