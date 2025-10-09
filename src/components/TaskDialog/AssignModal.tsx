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
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Atribuir responsáveis</DialogTitle>
                </DialogHeader>

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
