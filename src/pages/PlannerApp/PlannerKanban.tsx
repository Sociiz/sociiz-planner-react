import {
    DndContext,
    DragOverlay,
    closestCorners,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Column } from "@/components/Column";
import { SortableTaskCard } from "@/components/SortableTaskCard";
import { FilterPanel } from "@/components/FilterPanel";
import { usePlanner } from "@/context/PlannerContext";

export function PlannerKanban() {
    const {
        filteredTasks: tasks,
        openDialog,
        activeId,
        handleDragStart,
        handleDragEnd,
        usuarios,
        statusList,
        handleRequestDelete,
        viewMode,
        filters,
        setFilters,
        getFilterOptions,
        isAdmin,
    } = usePlanner();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const filterOptions = getFilterOptions();

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

    const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 px-6 py-4">
                <FilterPanel
                    filters={filters}
                    setFilters={setFilters}
                    clientsOptions={filterOptions.clientsOptions}
                    projectsOptions={filterOptions.projectsOptions}
                    productsOptions={filterOptions.productsOptions}
                    assignedToOptions={filterOptions.assignedToOptions}
                    tagsOptions={filterOptions.tagsOptions}
                    prioritiesOptions={filterOptions.prioritiesOptions}
                    isAdmin={isAdmin}
                />
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
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
                                    onRequestDelete={handleRequestDelete}
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
                                        onRequestDelete={handleRequestDelete}
                                    />
                                ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeTask && (
                        <SortableTaskCard
                            task={activeTask}
                            usuarios={usuarios}
                            onRequestDelete={handleRequestDelete}
                        />
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
}