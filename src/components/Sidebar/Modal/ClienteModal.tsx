import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ItemForm } from "@/components/ItemForm";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { uploadService } from "@/services/uploadService";

interface Client {
    _id?: string;
    name: string;
    imageUrl?: string;
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
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const fetchClients = async () => {
        const res = await api.get<Client[]>("/clients");
        setClients(res.data);
    };

    useEffect(() => {
        if (open) fetchClients();
    }, [open]);

    // Quando muda o file, atualiza o preview
    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const handleSubmit = async (data: { name: string }) => {
        setLoading(true);
        try {
            let imageUrl = editingClient?.imageUrl;

            if (file) {
                const uploaded = await uploadService.upload(file);
                imageUrl = uploaded.url;
            }

            const payload = { ...data, imageUrl };

            if (editingClient?._id) {
                await api.put(`/clients/${editingClient._id}`, payload);
                setEditingClient(null);
            } else {
                await api.post("/clients", payload);
            }

            setFile(null);
            setPreview(null);
            fetchClients();
        } catch (err) {
            console.error("Erro ao salvar cliente:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (client: Client) => {
        setEditingClient(client);
        setPreview(client.imageUrl || null);
    };

    const handleDelete = async (id: string) => {
        await api.delete(`/clients/${id}`);
        fetchClients();
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Clientes</DialogTitle>
                    </DialogHeader>

                    <div className="mb-4 grid gap-2">
                        <Label htmlFor="file">Imagem de capa</Label>
                        {preview && <img src={preview} alt="Preview" className="w-32 h-32 rounded object-cover border mb-2" />}
                        <Input
                            id="file"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </div>

                    <ItemForm
                        initialData={editingClient ?? undefined}
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel={editingClient ? "Salvar Alterações" : "Adicionar Cliente"}
                    />

                    <ScrollArea className="mt-4 h-48">
                        {clients.map((c) => (
                            <div key={c._id} className="flex justify-between items-center border-b py-2 text-sm text-slate-700 dark:text-slate-200">
                                <div className="flex items-center gap-3">
                                    {c.imageUrl && <img src={c.imageUrl} alt={c.name} className="w-10 h-10 rounded object-cover border" />}
                                    <span>{c.name}</span>
                                </div>
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
                    itemName={clients.find((c) => c._id === confirmDelete.id)?.name ?? "item"}
                />
            )}
        </>
    );
}
