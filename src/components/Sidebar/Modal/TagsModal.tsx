import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { ItemForm } from "../../ItemForm";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

interface Tag {
    _id?: string;
    name: string;
}

interface TagsModalProps {
    open: boolean;
    onClose: () => void;
}

export function TagsModal({ open, onClose }: TagsModalProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });

    const fetchTags = async () => {
        try {
            const res = await api.get<Tag[]>("/tags");
            setTags(res.data);
        } catch (err) {
            console.error("Erro ao buscar tags:", err);
        }
    };

    useEffect(() => {
        if (open) fetchTags();
    }, [open]);

    const handleSubmit = async (data: { name: string }) => {
        setLoading(true);
        try {
            if (editingTag?._id) {
                await api.put(`/tags/${editingTag._id}`, data);
                setEditingTag(null);
            } else {
                await api.post("/tags", data);
            }
            fetchTags();
        } catch (err) {
            console.error("Erro ao salvar tag:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (tag: Tag) => setEditingTag(tag);

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/tags/${id}`);
            fetchTags();
            setConfirmDelete({ open: false, id: undefined });
        } catch (err) {
            console.error("Erro ao excluir tag:", err);
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
                        initialData={editingTag ?? undefined}
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel={editingTag ? "Salvar Alterações" : "Adicionar Tag"}
                    />

                    <ScrollArea className="mt-4 h-48">
                        {tags.map((t) => (
                            <div
                                key={t._id}
                                className="flex justify-between items-center border-b py-2 text-sm text-slate-700 dark:text-slate-200"
                            >
                                <span>{t.name}</span>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(t)}>
                                        Editar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setConfirmDelete({ open: true, id: t._id })}
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
                    itemName={tags.find((t) => t._id === confirmDelete.id)?.name ?? "item"}
                />
            )}
        </>
    );
}
