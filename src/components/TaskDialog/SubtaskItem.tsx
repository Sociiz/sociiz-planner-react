import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2 } from "lucide-react";
import { type Subtask } from "@/types/types";

interface SubtaskItemProps {
    subtask: Subtask;
    index: number;
    users: { _id: string; username: string }[];
    onUpdate: (index: number, updated: Subtask) => void;
    onDelete: (index: number) => void;
    onAssignClick: (index: number) => void;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
    subtask,
    index,
    users = [],
    onUpdate,
    onDelete,
    onAssignClick,
}) => {
    const handleFieldChange = (field: keyof Subtask, value: unknown) => {
        onUpdate(index, { ...subtask, [field]: value });
    };

    const getUsername = (id: string) =>
        users.find((u) => u._id === id)?.username || "Desconhecido";

    return (
        <div className="flex items-center gap-3 border rounded-xl p-2 bg-muted/40 hover:bg-muted/60 transition">
            <input
                type="checkbox"
                checked={subtask.done}
                onChange={(e) => handleFieldChange("done", e.target.checked)}
                className="h-4 w-4 accent-blue-600"
            />
            <Input
                value={subtask.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="Título da subtask"
                className="flex-1"
            />

            {/* Data em formato pill */}
            <div className="relative">
                <input
                    id={`subtask-date-${index}`}
                    type="date"
                    value={subtask.dueDate || ""}
                    onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                />
                <span
                    className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm text-center cursor-pointer w-24"
                    onClick={() =>
                        document.getElementById(`subtask-date-${index}`)?.click()
                    }
                >
                    {subtask.dueDate
                        ? new Date(subtask.dueDate).toLocaleDateString("pt-BR")
                        : "Selecione a data"}
                </span>
            </div>

            {/* Avatares com nomes */}
            <div className="flex -space-x-2">
                {subtask.assignedTo?.slice(0, 3).map((userId) => {
                    const username = getUsername(userId);
                    return (
                        <div
                            key={userId}
                            className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center border border-white"
                            title={username}
                        >
                            {username
                                .split(" ")
                                .map((n) => n[0].toUpperCase())
                                .join("")}
                        </div>
                    );
                })}
                {subtask.assignedTo && subtask.assignedTo.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center border border-white">
                        +{subtask.assignedTo.length - 3}
                    </div>
                )}
            </div>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Atribuir responsáveis"
                onClick={() => onAssignClick(index)}
            >
                <UserPlus className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Excluir subtask"
                onClick={() => onDelete(index)}
            >
                <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
        </div>
    );
};
