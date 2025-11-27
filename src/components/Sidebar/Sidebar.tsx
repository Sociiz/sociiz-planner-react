import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, X } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { ClientModal } from "./Modal/ClienteModal";
import { ProjectModal } from "./Modal/ProjectModal";
import { ProductModal } from "./Modal/ProductModal";
import { TagsModal } from "./Modal/TagsModal";
import { StatusModal } from "./Modal/StatusModal";
import { UsersModal } from "./Modal/UsersModal";

export function Sidebar() {
    const [openModal, setOpenModal] = useState<"client" | "project" | "product" | "tags" | "status" | "users" | null>(null);
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => setIsOpen((prev) => !prev);

    return (
        <>
            {/* DESKTOP - Sidebar Fixa */}
            <aside
                className={`hidden md:flex flex-col h-screen flex-shrink-0 border-r bg-white dark:bg-slate-900 transition-all duration-300 ${isOpen ? "w-64" : "w-16"
                    }`}
            >
                <div className="flex justify-end p-4 border-b flex-shrink-0">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleSidebar}
                    >
                        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </Button>
                </div>

                <SidebarContent setOpenModal={setOpenModal} isCollapsed={!isOpen} />
            </aside>

            {/* Modals */}
            <ClientModal open={openModal === "client"} onClose={() => setOpenModal(null)} />
            <ProjectModal open={openModal === "project"} onClose={() => setOpenModal(null)} />
            <ProductModal open={openModal === "product"} onClose={() => setOpenModal(null)} />
            <TagsModal open={openModal === "tags"} onClose={() => setOpenModal(null)} />
            <StatusModal open={openModal === "status"} onClose={() => setOpenModal(null)} />
            <UsersModal open={openModal === "users"} onClose={() => setOpenModal(null)} />
        </>
    );
}

interface SidebarContentProps {
    setOpenModal: (v: "client" | "project" | "product" | "tags" | "status" | "users" | null) => void;
    isCollapsed?: boolean;
}

function SidebarContent({ setOpenModal, isCollapsed }: SidebarContentProps) {
    return (
        <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
                {!isCollapsed && (
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 px-2">
                        Gerenciar
                    </h2>
                )}

                <SidebarItem
                    label="Clientes"
                    onClick={() => setOpenModal("client")}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    label="Projetos"
                    onClick={() => setOpenModal("project")}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    label="Produtos"
                    onClick={() => setOpenModal("product")}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    label="Tags"
                    onClick={() => setOpenModal("tags")}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    label="Status"
                    onClick={() => setOpenModal("status")}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    label="Usuários"
                    onClick={() => setOpenModal("users")}
                    isCollapsed={isCollapsed}
                />
            </div>
        </ScrollArea>
    );
}