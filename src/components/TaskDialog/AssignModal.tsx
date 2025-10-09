import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AssignModalProps {
    open: boolean;
    value: string;
    onChange: (v: string) => void;
    onClose: () => void;
    onSave: () => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({ open, value, onChange, onClose, onSave }) => (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm rounded-xl">
            <DialogHeader>
                <DialogTitle>Atribuir Responsáveis</DialogTitle>
            </DialogHeader>
            <div className="mt-2 space-y-4">
                <Label>Responsáveis (separados por vírgula)</Label>
                <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Ex: Arthur, Maria" />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button className="text-white" onClick={onSave}>
                        Salvar
                    </Button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
);
