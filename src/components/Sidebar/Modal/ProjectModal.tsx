import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { ItemForm } from "../../ItemForm";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

interface Project {
    _id?: string;
    name: string;
    description?: string;
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

    const handleSubmit = async (data: { name: string; description?: string }) => {
        setLoading(true);
        try {
            if (editingProject?._id) {
                await api.put(`/projects/${editingProject._id}`, data);
                setEditingProject(null);
            } else {
                await api.post("/projects", data);
            }
            fetchProjects();
        } catch (err) {
            console.error("Erro ao salvar projeto:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (project: Project) => setEditingProject(project);

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
                                <div>
                                    <p className="font-medium">{p.name}</p>
                                    {p.description && <p className="text-xs text-slate-500">{p.description}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(p)}>
                                        Editar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setConfirmDelete({ open: true, id: p._id })}
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
                    itemName={
                        projects.find((p) => p._id === confirmDelete.id)?.name ?? "item"
                    }
                />
            )}
        </>
    );
}
