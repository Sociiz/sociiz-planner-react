import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { ItemForm } from "../../ItemForm";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Project {
    _id?: string;
    name: string;
    description?: string;
    imageUrl?: string;
}

interface ProjectModalProps {
    open: boolean;
    onClose: () => void;
}

export function ProjectModal({ open, onClose }: ProjectModalProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false });
    const [imagePreview, setImagePreview] = useState<string>("");

    const fetchProjects = async () => {
        try {
            const res = await api.get<Project[]>("/projects");
            setProjects(res.data);
        } catch (err) {
            console.error("Erro ao buscar projetos:", err);
        }
    };

    useEffect(() => {
        if (open) fetchProjects();
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

    const handleSubmit = async (data: { name: string; description?: string }) => {
        setLoading(true);
        try {
            const payload = { ...data, coverImage: imagePreview };
            if (editingProject?._id) {
                await api.put(`/projects/${editingProject._id}`, payload);
                setEditingProject(null);
            } else {
                await api.post("/projects", payload);
            }

            setImagePreview("");
            fetchProjects();
        } catch (err) {
            console.error("Erro ao salvar projeto:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (project: Project) => {
        setEditingProject(project);
        setImagePreview(project.imageUrl || "");
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/projects/${id}`);
            fetchProjects();
            setConfirmDelete({ open: false, id: undefined });
        } catch (err) {
            console.error("Erro ao excluir projeto:", err);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Projetos</DialogTitle>
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
                        initialData={editingProject ?? undefined}
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel={editingProject ? "Salvar Alterações" : "Adicionar Projeto"}
                    />

                    <ScrollArea className="mt-4 h-48">
                        {projects.map((p) => (
                            <div
                                key={p._id}
                                className="flex justify-between items-center border-b py-2 text-sm text-slate-700 dark:text-slate-200"
                            >
                                <div className="flex items-center gap-2">
                                    {p.imageUrl && (
                                        <img
                                            src={p.imageUrl}
                                            alt={p.name}
                                            className="w-20 h-20 rounded-md border object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium">{p.name}</p>
                                        {p.description && (
                                            <p className="text-xs text-slate-500">{p.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditClick(p)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            setConfirmDelete({ open: true, id: p._id })
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
                    itemName={projects.find((p) => p._id === confirmDelete.id)?.name ?? "item"}
                />
            )}
        </>
    );
}
