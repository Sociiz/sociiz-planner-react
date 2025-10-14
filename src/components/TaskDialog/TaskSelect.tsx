import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Option {
    label: string;
    value: string;
}

interface TaskSelectProps {
    label: string;
    value: string[] | string;
    options: Option[];
    onChange: (value: string | string[]) => void;
    multiple?: boolean;
}

export const TaskSelect: React.FC<TaskSelectProps> = ({
    label,
    value,
    options,
    onChange,
    multiple = false,
}) => {
    const handleSelect = (val: string) => {
        if (!multiple) return onChange(val);
        const arrayValue = Array.isArray(value) ? [...value] : [];
        if (arrayValue.includes(val)) {
            onChange(arrayValue.filter((v) => v !== val));
        } else {
            onChange([...arrayValue, val]);
        }
    };

    const renderValue = () => {
        if (multiple && Array.isArray(value)) {
            return (
                <div className="flex flex-wrap gap-1">
                    {value.map((v, idx) => (
                        <Badge key={`${v}-${idx}`} className="bg-blue-600 text-white">
                            {options.find((o) => o.value === v)?.label || v}
                        </Badge>
                    ))}
                </div>
            );
        }
        const single = options.find((o) => o.value === value)?.label || "";
        return single;
    };

    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
            </label>
            <Select
                onValueChange={handleSelect}
                value={!multiple && typeof value === "string" ? value : ""}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt, idx) => (
                        <SelectItem key={`${opt.value}-${idx}`} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {multiple && Array.isArray(value) && value.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">{renderValue()}</div>
            )}
        </div>
    );
};
