import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { ItemForm } from "@/components/ItemForm";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Product {
    _id?: string;
    name: string;
    imageUrl?: string;
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
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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

            if (editingProduct?._id) {
                await api.put(`/products/${editingProduct._id}`, payload);
                setEditingProduct(null);
            } else {
                await api.post("/products", payload);
            }
            setImagePreview("")
            fetchProducts();
        } catch (err) {
            console.error("Erro ao salvar produto:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setImagePreview(product.imageUrl || null);
    };

    const handleDelete = async (id: string) => {
        await api.delete(`/products/${id}`);
        fetchProducts();
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Produtos</DialogTitle>
                    </DialogHeader>

                    {/* Upload e Preview */}
                    <div className="mb-4 grid gap-2">
                        <Label htmlFor="file">Imagem da Capa</Label>
                        {imagePreview && <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded object-cover border mb-2" />}
                        <Input id="file" type="file" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <ItemForm
                        initialData={editingProduct ?? undefined}
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel={editingProduct ? "Salvar Alterações" : "Adicionar Produto"}
                    />

                    {/* Lista de produtos */}
                    <ScrollArea className="mt-4 h-48">
                        {products.map((p) => (
                            <div key={p._id} className="flex justify-between items-center border-b py-2 text-sm text-slate-700 dark:text-slate-200">
                                <div className="flex items-center gap-2">
                                    {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-20 h-20 rounded-md border object-cover" />}
                                    <span>{p.name}</span>
                                </div>
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
                    itemName={products.find((p) => p._id === confirmDelete.id)?.name ?? "item"}
                />
            )}
        </>
    );
}
