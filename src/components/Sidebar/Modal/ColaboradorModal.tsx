import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { ItemForm } from "../../ItemForm";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

interface Colaborador {
    _id?: string;
    name: string;
}

interface ColaboradorModalProps {
    open: boolean;
    onClose: () => void;
}

export function ColaboradorModal({ open, onClose }: ColaboradorModalProps) {
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });

    const fetchColaboradores = async () => {
        try {
            const res = await api.get<Colaborador[]>("/colaboradores");
            setColaboradores(res.data);
        } catch (err) {
            console.error("Erro ao buscar colaboradores:", err);
        }
    };

    useEffect(() => {
        if (open) fetchColaboradores();
    }, [open]);

    const handleSubmit = async (data: { name: string }) => {
        setLoading(true);
        try {
            if (editingColaborador?._id) {
                await api.put(`/colaboradores/${editingColaborador._id}`, data);
                setEditingColaborador(null);
            } else {
                await api.post("/colaboradores", data);
            }
            fetchColaboradores();
        } catch (err) {
            console.error("Erro ao salvar colaborador:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (colaborador: Colaborador) => setEditingColaborador(colaborador);

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/colaboradores/${id}`);
            fetchColaboradores();
            setConfirmDelete({ open: false, id: undefined });
        } catch (err) {
            console.error("Erro ao excluir colaborador:", err);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Colaboradores</DialogTitle>
                    </DialogHeader>

                    <ItemForm
                        initialData={editingColaborador ?? undefined}
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel={editingColaborador ? "Salvar Alterações" : "Adicionar Colaborador"}
                    />

                    <ScrollArea className="mt-4 h-48">
                        {colaboradores.map((c) => (
                            <div
                                key={c._id}
                                className="flex justify-between items-center border-b py-2 text-sm text-slate-700 dark:text-slate-200"
                            >
                                <span>{c.name}</span>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(c)}>
                                        Editar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setConfirmDelete({ open: true, id: c._id })}
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
                    itemName={colaboradores.find((c) => c._id === confirmDelete.id)?.name ?? "item"}
                />
            )}
        </>
    );
}
