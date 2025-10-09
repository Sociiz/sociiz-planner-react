import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TaskFormFieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    textarea?: boolean;
}

export const TaskFormField: React.FC<TaskFormFieldProps> = ({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    textarea = false,
}) => (
    <div>
        <Label>{label}</Label>
        {textarea ? (
            <Textarea
                className="mt-2"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
            />
        ) : (
            <Input
                className="mt-2"
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        )}
    </div>
);
