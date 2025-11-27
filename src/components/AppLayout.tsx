import { type ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar/Sidebar";

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="h-screen w-screen overflow-hidden flex">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {children}
            </div>
        </div>
    );
}