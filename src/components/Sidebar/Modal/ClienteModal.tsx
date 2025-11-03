import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ItemForm } from "@/components/ItemForm";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";


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
    const [imagePreview, setImagePreview] = useState<string>("");


    const fetchClients = async () => {
        const res = await api.get<Client[]>("/clients");
        setClients(res.data);
    };

    useEffect(() => {
        if (open) fetchClients();
    }, [open]);

    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result as string);
            };
            reader.onerror = (err) => {
                console.error("Erro ao converter arquivo para Base64:", err);
                reject(err);
            };
            reader.readAsDataURL(file);
        });

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImagePreview(await fileToBase64(file));
        }
    };





    const handleSubmit = async (data: { name: string }) => {
        setLoading(true);
        try {
            const payload = { ...data, coverImage: imagePreview };








            if (editingClient?._id) {
                await api.put(`/clients/${editingClient._id}`, payload);
                setEditingClient(null);
            } else {
                await api.post("/clients", payload);
            }
            setImagePreview("")


            fetchClients();
        } catch (err) {
            console.error("Erro ao salvar cliente:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (client: Client) => {
        setEditingClient(client);
        setImagePreview(client.imageUrl || "");
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/clients/${id}`);
            fetchClients();
            setConfirmDelete({ open: false, id: undefined })
        } catch (error) {
            console.error("Erro ao excluir projeto:", error);

        }
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
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 rounded object-cover border mb-2"
                            />
                        )}
                        <Input type="file" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <ItemForm
                        initialData={editingClient ?? undefined}
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel={editingClient ? "Salvar Alterações" : "Adicionar Cliente"}
                    />

                    <ScrollArea className="mt-4 h-48">
                        {clients.map((c) => (
                            <div
                                key={c._id}
                                className="flex justify-between items-center border-b py-2 text-sm text-slate-700 dark:text-slate-200"
                            >
                                <div className="flex items-center gap-2">
                                    {c.imageUrl && (
                                        <img
                                            src={c.imageUrl}
                                            className="w-20 h-20 rounded-md border object-cover"
                                        />
                                    )}
                                    <div>
                                        <p>{c.name}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditClick(c)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            setConfirmDelete({ open: true, id: c._id })
                                        }
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
                    onClose={() => setConfirmDelete({ open: false })}
                    onConfirm={() => handleDelete(confirmDelete.id!)}
                    itemName={clients.find((c) => c._id === confirmDelete.id)?.name ?? "item"}
                />
            )}
        </>
    );
}