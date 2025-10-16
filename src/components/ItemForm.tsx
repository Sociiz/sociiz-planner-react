// Modal genérico pra nao ficar repetindo alterar e salvar nos componentes 

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ItemFormProps {
    initialData?: { name: string; description?: string };
    onSubmit: (data: { name: string; description?: string }) => Promise<void>;
    loading?: boolean;
    submitLabel?: string;
}

export function ItemForm({ initialData, onSubmit, loading = false, submitLabel }: ItemFormProps) {
    const [formData, setFormData] = useState(initialData || { name: "", description: "" });

    useEffect(() => {
        if (initialData) setFormData(initialData);
    }, [initialData]);

    return (
        <div className="space-y-3">
            <Input
                placeholder="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
                placeholder="Descrição (opcional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Button
                className="text-white"
                onClick={() => onSubmit(formData)}
                disabled={loading || !formData.name.trim()}
            >
                {loading ? "Salvando..." : submitLabel || "Salvar"}
            </Button>
        </div>
    );
}
