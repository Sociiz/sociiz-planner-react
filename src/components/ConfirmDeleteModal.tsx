import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
}

export function ConfirmDeleteModal({ open, onClose, onConfirm, itemName }: ConfirmDeleteModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Confirmação de exclusão</DialogTitle>
                </DialogHeader>
                <div className="py-2 text-sm text-slate-700 dark:text-slate-200">
                    Tem certeza que deseja excluir <strong>{itemName}</strong>? Esta ação não pode ser desfeita.
                </div>
                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }}>
                        Excluir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
