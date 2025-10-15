"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
    label?: string;
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
}

export function MultiSelect({
    label,
    options,
    value,
    onChange,
    placeholder = "Selecione...",
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const toggleOption = (option: string) => {
        if (value.includes(option)) {
            onChange(value.filter((v) => v !== option));
        } else {
            onChange([...value, option]);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <span className="text-xs text-muted-foreground ml-1">{label}</span>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] justify-between"
                    >
                        <div className="flex flex-wrap gap-1">
                            {value.length === 0 ? (
                                <span className="text-muted-foreground">{placeholder}</span>
                            ) : (
                                value.map((v) => (
                                    <Badge
                                        key={v}
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                    >
                                        {v}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleOption(v);
                                            }}
                                        />
                                    </Badge>
                                ))
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder={`Buscar ${label?.toLowerCase() ?? ""}`} />
                        <CommandEmpty>Nenhum resultado.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option}
                                    onSelect={() => toggleOption(option)}
                                    className="cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value.includes(option)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {option}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
