import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type Task } from "../types/types";

interface Props {
    task: Task;
    onClick?: (task: Task) => void;
}

export const DraggableTaskCard: React.FC<Props> = ({ task, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick?.(task)}
            className="bg-white dark:bg-slate-800 rounded shadow p-4 cursor-pointer hover:shadow-md"
        >
            <h3 className="font-semibold">{task.title}</h3>
            <p className="text-sm text-slate-500">{task.description}</p>
        </div>
    );
};
