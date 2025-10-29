import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { ItemForm } from "../../ItemForm";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

interface Status {
    _id?: string;
    name: string;
}

interface StatusModalProps {
    open: boolean;
    onClose: () => void;
}

export function StatusModal({ open, onClose }: StatusModalProps) {
    const [status, setStatus] = useState<Status[]>([]);
    const [editingStatus, setEditingStatus] = useState<Status | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });

    const fetchStatus = async () => {
        try {
            const res = await api.get<Status[]>("/status");
            setStatus(res.data);
        } catch (err) {
            console.error("Erro ao buscar status:", err);
        }
    };

    useEffect(() => {
        if (open) fetchStatus();
    }, [open]);

    const handleSubmit = async (data: { name: string }) => {
        setLoading(true);
        try {
            if (editingStatus?._id) {
                await api.put(`/status/${editingStatus._id}`, data);
                setEditingStatus(null);
            } else {
                await api.post("/status", data);
            }
            fetchStatus();
        } catch (err) {
            console.error("Erro ao salvar tag:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (status: Status) => setEditingStatus(status);

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/status/${id}`);
            fetchStatus();
            setConfirmDelete({ open: false, id: undefined });
        } catch (err) {
            console.error("Erro ao excluir status:", err);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Status (Colunas)</DialogTitle>
                    </DialogHeader>

                    <ItemForm
                        initialData={editingStatus ?? undefined}
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel={editingStatus ? "Salvar Alterações" : "Adicionar Status"}
                    />

                    <ScrollArea className="mt-4 h-48">
                        {status.map((s) => (
                            <div
                                key={s._id}
                                className="flex justify-between items-center border-b py-2 text-sm text-slate-700 dark:text-slate-200"
                            >
                                <span>{s.name}</span>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(s)}>
                                        Editar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setConfirmDelete({ open: true, id: s._id })}
                                    >
                                        Excluir
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {confirmDelete.open && confirmDelete.id && (
                <ConfirmDeleteModal
                    open={confirmDelete.open}
                    onClose={() => setConfirmDelete({ open: false, id: undefined })}
                    onConfirm={() => handleDelete(confirmDelete.id!)}
                    itemName={status.find((s) => s._id === confirmDelete.id)?.name ?? "item"}
                />
            )}
        </>
    );
}
