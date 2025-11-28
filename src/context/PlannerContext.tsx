import { createContext, useContext } from "react";
import { type Task, type FilterOption } from "@/types/types";

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
    tasks: Task[];
    filteredTasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    refreshTasks: () => Promise<void>;

    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;

    usuarios: { _id: string; username: string }[];

    viewMode: ViewMode;
    setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
    toggleViewMode: () => void;

    isDialogOpen: boolean;
    setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    editingTask: Task | null;
    openDialog: (task?: Task | null) => void;
    handleNewTask: () => void;

    confirmDeleteTask: Task | null;
    handleRequestDelete: (task: Task) => void;
    handleConfirmDelete: () => Promise<void>;
    handleCancelDelete: () => void;

    activeId: string | null;
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>;

    isSidebarOpen: boolean;
    toggleSidebar: () => void;

    handleSubmit: (task: Task) => Promise<void>;

    getFilterOptions: () => {
        clientsOptions: string[];
        projectsOptions: string[];
        productsOptions: string[];
        assignedToOptions: FilterOption[];
        tagsOptions: string[];
        prioritiesOptions: string[];
    };
}

export const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const usePlanner = () => {
    const context = useContext(PlannerContext);
    if (!context) {
        throw new Error("usePlanner must be used within a PlannerProvider");
    }
    return context;
};