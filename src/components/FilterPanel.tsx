import { type Filters, type FilterOption } from "@/types/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useAuth } from "@/context/authContext";

interface FilterPanelProps {
    filters: Filters;
    setFilters: (filters: Filters) => void;
    clientsOptions: string[];
    projectsOptions: string[];
    productsOptions: string[];
    assignedToOptions: FilterOption[];
    tagsOptions: string[];
    prioritiesOptions: string[];
}

export function FilterPanel({
    filters,
    setFilters,
    clientsOptions,
    projectsOptions,
    productsOptions,
    assignedToOptions = [],
    tagsOptions,
    prioritiesOptions,
}: FilterPanelProps) {

    const { user } = useAuth();

    const handleMultiSelectChange = (key: keyof Filters, values: string[]) => {
        setFilters({ ...filters, [key]: values });
    };

    const clearFilter = (key: keyof Filters) => {
        if (key === "dueDate") {
            setFilters({ ...filters, [key]: "" });
        } else {
            setFilters({ ...filters, [key]: [] });
        }
    };

    return (
        <div className="flex flex-wrap gap-3 justify-center mb-2">
            {/* Cliente */}
            <div className="relative">
                <Select
                    value={filters.clients[0] || ""}
                    onValueChange={(val) => handleMultiSelectChange("clients", val ? [val] : [])}
                >
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Clientes" />
                    </SelectTrigger>
                    <SelectContent>
                        {clientsOptions.map((c) => (
                            <SelectItem key={c} value={c}>
                                {c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {filters.clients.length > 0 && (
                    <button
                        onClick={() => clearFilter("clients")}
                        className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-red-400 rounded"
                    >
                        <X className="h-3.5 w-3.5 text-white" />
                    </button>
                )}
            </div>

            {/* Projeto */}
            <div className="relative">
                <Select
                    value={filters.projects[0] || ""}
                    onValueChange={(val) => handleMultiSelectChange("projects", val ? [val] : [])}
                >
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Projetos" />
                    </SelectTrigger>
                    <SelectContent>
                        {projectsOptions.map((p) => (
                            <SelectItem key={p} value={p}>
                                {p}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {filters.projects.length > 0 && (
                    <button
                        onClick={() => clearFilter("projects")}
                        className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-red-400 rounded"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* Produto */}
            <div className="relative">
                <Select
                    value={filters.products[0] || ""}
                    onValueChange={(val) => handleMultiSelectChange("products", val ? [val] : [])}
                >
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Produtos" />
                    </SelectTrigger>
                    <SelectContent>
                        {productsOptions.map((p) => (
                            <SelectItem key={p} value={p}>
                                {p}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {filters.products.length > 0 && (
                    <button
                        onClick={() => clearFilter("products")}
                        className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-red-400 rounded"
                    >
                        <X className="h-3.5 w-3.5 " />
                    </button>
                )}
            </div>

            {/* Filtro de atribuido so aparece se for um admin, se não some  */}
            {user?.isAdmin && (
                <div className="relative">
                    <Select
                        value={filters.assignedTo[0] || ""}
                        onValueChange={(val) => handleMultiSelectChange("assignedTo", val ? [val] : [])}
                    >
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Atribuído a" />
                        </SelectTrigger>
                        <SelectContent>
                            {assignedToOptions.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {filters.assignedTo.length > 0 && (
                        <button
                            onClick={() => clearFilter("assignedTo")}
                            className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-red-400 rounded"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* Tags */}
            <div className="relative">
                <Select
                    value={filters.tags[0] || ""}
                    onValueChange={(val) => handleMultiSelectChange("tags", val ? [val] : [])}
                >
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Tags" />
                    </SelectTrigger>
                    <SelectContent>
                        {tagsOptions.map((t) => (
                            <SelectItem key={t} value={t}>
                                {t}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {filters.tags.length > 0 && (
                    <button
                        onClick={() => clearFilter("tags")}
                        className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-red-400 rounded"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* Prioridade */}
            <div className="relative">
                <Select
                    value={filters.priorities[0] || ""}
                    onValueChange={(val) => handleMultiSelectChange("priorities", val ? [val] : [])}
                >
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                        {prioritiesOptions.map((p) => (
                            <SelectItem key={p} value={p}>
                                {p}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {filters.priorities.length > 0 && (
                    <button
                        onClick={() => clearFilter("priorities")}
                        className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-red-400 rounded"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* Data de entrega */}
            <div className="relative">
                <Input
                    type="date"
                    value={filters.dueDate || ""}
                    onChange={(e) => setFilters({ ...filters, dueDate: e.target.value })}
                    className="w-36"
                    placeholder="Data"
                />
                {filters.dueDate && (
                    <button
                        onClick={() => clearFilter("dueDate")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-red-400 rounded"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
