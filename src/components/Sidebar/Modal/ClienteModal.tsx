import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { ItemForm } from "@/components/ItemForm";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

interface Client {
    _id?: string;
    name: string;
}

interface ClientModalProps {
    open: boolean;
    onClose: () => void;
}

export function ClientModal({ open, onClose }: ClientModalProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });

    const fetchClients = async () => {
        try {
            const res = await api.get<Client[]>("/clients");
            setClients(res.data);
        } catch (err) {
            console.error("Erro ao buscar clientes:", err);
        }
    };

    useEffect(() => {
        if (open) fetchClients();
    }, [open]);

    const handleSubmit = async (data: { name: string }) => {
        setLoading(true);
        try {
            if (editingClient?._id) {
                await api.put(`/clients/${editingClient._id}`, data);
                setEditingClient(null);
            } else {
                await api.post("/clients", data);
            }
            fetchClients();
        } catch (err) {
            console.error("Erro ao salvar cliente:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (client: Client) => {
        setEditingClient(client);
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/clients/${id}`);
            fetchClients();
        } catch (err) {
            console.error("Erro ao excluir cliente:", err);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Clientes</DialogTitle>
                    </DialogHeader>

                    <ItemForm
                        initialData={editingClient ?? undefined}
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel={editingClient ? "Salvar Alterações" : "Adicionar Cliente"}
                    />

                    <ScrollArea className="mt-4 h-48">
                        {clients.map((c) => (
                            <div key={c._id} className="flex justify-between items-center border-b py-2 text-sm text-slate-700 dark:text-slate-200">
                                <span>{c.name}</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(c)}>Editar</Button>
                                    <Button variant="destructive" size="sm" onClick={() => setConfirmDelete({ open: true, id: c._id })}>Excluir</Button>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {confirmDelete.open && confirmDelete.id && (
                <ConfirmDeleteModal
                    open={confirmDelete.open}
                    onClose={() => setConfirmDelete({ open: false })}
                    onConfirm={() => handleDelete(confirmDelete.id!)}
                    itemName={clients.find(c => c._id === confirmDelete.id)?.name ?? "item"}
                />
            )}
        </>
    );
}
