import { type ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar/Sidebar";

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    );
}
