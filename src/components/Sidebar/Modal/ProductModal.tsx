import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { ItemForm } from "@/components/ItemForm";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

interface Product {
    _id?: string;
    name: string;
    price?: number;
}

interface ProductModalProps {
    open: boolean;
    onClose: () => void;
}

export function ProductModal({ open, onClose }: ProductModalProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });

    const fetchProducts = async () => {
        try {
            const res = await api.get<Product[]>("/products");
            setProducts(res.data);
        } catch (err) {
            console.error("Erro ao buscar produtos:", err);
        }
    };

    useEffect(() => {
        if (open) fetchProducts();
    }, [open]);

    const handleSubmit = async (data: { name: string; price?: number }) => {
        setLoading(true);
        try {
            if (editingProduct?._id) {
                await api.put(`/products/${editingProduct._id}`, data);
                setEditingProduct(null);
            } else {
                await api.post("/products", data);
            }
            fetchProducts();
        } catch (err) {
            console.error("Erro ao salvar produto:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) {
            console.error("Erro ao excluir produto:", err);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Produtos</DialogTitle>
                    </DialogHeader>

                    <ItemForm
                        initialData={editingProduct ?? undefined}
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel={editingProduct ? "Salvar Alterações" : "Adicionar Produto"}
                    />

                    <ScrollArea className="mt-4 h-48">
                        {products.map((p) => (
                            <div key={p._id} className="flex justify-between items-center border-b py-2 text-sm text-slate-700 dark:text-slate-200">
                                <span>{p.name}</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(p)}>Editar</Button>
                                    <Button variant="destructive" size="sm" onClick={() => setConfirmDelete({ open: true, id: p._id })}>Excluir</Button>
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
                    itemName={products.find(p => p._id === confirmDelete.id)?.name ?? "item"}
                />
            )}
        </>
    );
}
