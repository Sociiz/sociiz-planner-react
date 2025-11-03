import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import api from "@/services/api";
import { useAuth } from "@/context/authContext";

interface User {
    _id?: string;
    username: string;
    email: string;
    password?: string;
    isAdmin: boolean;
}

interface UsersModalProps {
    open: boolean;
    onClose: () => void;
}

export function UsersModal({ open, onClose }: UsersModalProps) {
    const { user } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [formData, setFormData] = useState<User>({
        username: "",
        email: "",
        password: "",
        isAdmin: false,
    });
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({
        open: false,
        id: undefined,
    });
    const [noPermissionModal, setNoPermissionModal] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await api.get<User[]>("/users");
            setUsers(res.data);
        } catch (err) {
            console.error("Erro ao buscar usuários:", err);
        }
    };

    useEffect(() => {
        if (open) {
            if (user?.isAdmin) {
                fetchUsers();
            } else {
                setNoPermissionModal(true);
            }
        }
    }, [open, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingUser?._id) {
                await api.put(`/users/${editingUser._id}`, formData);
            } else {
                await api.post("/users", formData);
            }
            setFormData({ username: "", email: "", password: "", isAdmin: false });
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            console.error("Erro ao salvar usuário:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (u: User) => {
        setEditingUser(u);
        setFormData({
            username: u.username,
            email: u.email,
            password: "",
            isAdmin: u.isAdmin,
        });
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
            setConfirmDelete({ open: false, id: undefined });
        } catch (err) {
            console.error("Erro ao excluir usuário:", err);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Usuários</DialogTitle>
                    </DialogHeader>

                    {!user?.isAdmin && noPermissionModal && (
                        <div className="p-4 mb-4 bg-yellow-100 text-yellow-800 rounded">
                            ⚠️ Você precisa ser administrador para acessar esta área.
                        </div>
                    )}

                    {user?.isAdmin && (
                        <>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                <div>
                                    <Label className="mb-2">Nome de Usuário</Label>
                                    <Input
                                        value={formData.username}
                                        onChange={(e) =>
                                            setFormData({ ...formData, username: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2">Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="mb-2">
                                        {editingUser ? "Alterar senha" : "Senha"}
                                    </Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        required={!editingUser}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isAdmin"
                                        checked={formData.isAdmin}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, isAdmin: checked as boolean })
                                        }
                                    />
                                    <Label htmlFor="isAdmin">Administrador</Label>
                                </div>

                                <Button type="submit" className="w-full text-white" disabled={loading}>
                                    {editingUser ? "Salvar Alterações" : "Adicionar Usuário"}
                                </Button>
                            </form>

                            <ScrollArea className="mt-5 h-60">
                                {users.map((u) => (
                                    <div
                                        key={u._id}
                                        className="flex justify-between items-center border-b py-2 text-sm"
                                    >
                                        <div>
                                            <p className="font-medium">{u.username}</p>
                                            <p className="text-xs text-gray-500">{u.email}</p>
                                            <p className="text-xs text-gray-600">
                                                {u.isAdmin ? "Administrador" : "Usuário comum"}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(u)}>
                                                Editar
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setConfirmDelete({ open: true, id: u._id })}
                                            >
                                                Excluir
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </ScrollArea>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {confirmDelete.open && confirmDelete.id && (
                <ConfirmDeleteModal
                    open={confirmDelete.open}
                    onClose={() => setConfirmDelete({ open: false, id: undefined })}
                    onConfirm={() => handleDelete(confirmDelete.id!)}
                    itemName={users.find((u) => u._id === confirmDelete.id)?.username ?? "usuário"}
                />
            )}
        </>
    );
}
