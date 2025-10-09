import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, XCircle } from "lucide-react";
import { TaskSelect } from "./TaskSelect";

interface AssignModalProps {
    open: boolean;
    users: { _id: string; username: string }[];
    selectedUsers: string[];
    onChange: (value: string[]) => void;
    onClose: () => void;
    onSave: () => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({
    open,
    users,
    selectedUsers,
    onChange,
    onClose,
    onSave,
}) => {
    const removeUser = (id: string) => {
        onChange(selectedUsers.filter((u) => u !== id));
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Atribuir responsáveis</DialogTitle>
                </DialogHeader>

                {/* Badge com x para remover */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUsers.map((id) => {
                        const userObj = users.find((u) => u._id === id);
                        if (!userObj) return null;
                        return (
                            <div
                                key={id}
                                className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium"
                            >
                                {userObj.username}
                                <button
                                    type="button"
                                    className="ml-1 text-blue-600 hover:text-red-500"
                                    onClick={() => removeUser(id)}
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Adicionar novos usuários */}
                <div className="mt-2">
                    <TaskSelect
                        label="Selecionar usuários"
                        value={selectedUsers}
                        options={users.map((u) => ({
                            label: u.username,
                            value: u._id,
                        }))}
                        onChange={(v) =>
                            onChange(Array.isArray(v) ? v : [v])
                        }
                        multiple
                    />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex items-center"
                    >
                        <XCircle className="h-4 w-4 mr-1" /> Cancelar
                    </Button>
                    <Button
                        onClick={onSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                    >
                        <Save className="h-4 w-4 mr-1" /> Salvar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
