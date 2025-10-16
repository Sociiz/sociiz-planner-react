import { Button } from "@/components/ui/button";

interface SidebarItemProps {
    label: string;
    onClick?: () => void;
    isCollapsed?: boolean;
}

export function SidebarItem({ label, onClick, isCollapsed }: SidebarItemProps) {
    return (
        <Button
            variant="ghost"
            className={`w-full justify-start text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 ${isCollapsed ? "justify-center px-0" : ""
                }`}
            onClick={onClick}
        >
            <span className={`${isCollapsed ? "hidden" : "inline"}`}>{label}</span>
        </Button>
    );
}
