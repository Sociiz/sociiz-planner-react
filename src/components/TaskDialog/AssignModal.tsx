import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type User } from "@/types/types";

interface AssignModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    users: User[];
    assignedUsers: string[];
    onAssign: (assigned: string[]) => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({
    open,
    onOpenChange,
    users,
    assignedUsers,
    onAssign,
}) => {
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    useEffect(() => {
        setSelectedUsers(assignedUsers);
    }, [assignedUsers]);

    const handleToggleUser = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleSave = () => {
        onAssign(selectedUsers);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Atribuir Usuários</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                        {users.length === 0 ? (
                            <p className="text-center text-gray-500">Nenhum usuário disponível.</p>
                        ) : (
                            users.map((user) => (
                                <div key={user._id} className="flex items-center space-x-2 py-1">
                                    <Checkbox
                                        id={`user-${user._id}`}
                                        checked={selectedUsers.includes(user._id)}
                                        onCheckedChange={() => handleToggleUser(user._id)}
                                    />
                                    <label
                                        htmlFor={`user-${user._id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {user.username}
                                    </label>
                                </div>
                            ))
                        )}
                    </ScrollArea>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button className="text-white" onClick={handleSave}>Salvar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

