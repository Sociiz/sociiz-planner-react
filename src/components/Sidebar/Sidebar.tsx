import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { ClientModal } from "./Modal/ClienteModal";
import { ProjectModal } from "./Modal/ProjectModal";
import { ProductModal } from "./Modal/ProductModal";
import { ColaboradorModal } from "./Modal/ColaboradorModal";
import { TagsModal } from "./Modal/TagsModal";
import { StatusModal } from "./Modal/StatusModal";
import { UsersModal } from "./Modal/UsersModal";

export function Sidebar() {
    const [openModal, setOpenModal] = useState<"client" | "project" | "product" | "colaborador" | "tags" | "status" | "users" | null>(null);
    const [isOpen, setIsOpen] = useState(true); // controla sidebar desktop

    const toggleSidebar = () => setIsOpen((prev) => !prev);

    return (
        <>
            {/* Mobile */}
            <div className="md:hidden p-2">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-4 w-64">
                        <SidebarContent setOpenModal={setOpenModal} onClose={toggleSidebar} />
                    </SheetContent>
                </Sheet>
            </div>

            <div className="hidden md:flex">
                <aside
                    className={`flex flex-col h-screen border-r bg-white dark:bg-slate-900 transition-all duration-300 ${isOpen ? "w-64" : "w-16"
                        }`}
                >
                    <div className="flex justify-end p-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleSidebar}
                            className="mb-2"
                        >
                            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </Button>
                    </div>

                    <SidebarContent setOpenModal={setOpenModal} isCollapsed={!isOpen} />
                </aside>
            </div>

            <ClientModal open={openModal === "client"} onClose={() => setOpenModal(null)} />
            <ProjectModal open={openModal === "project"} onClose={() => setOpenModal(null)} />
            <ProductModal open={openModal === "product"} onClose={() => setOpenModal(null)} />
            <ColaboradorModal open={openModal === "colaborador"} onClose={() => setOpenModal(null)} />
            <TagsModal open={openModal === "tags"} onClose={() => setOpenModal(null)} />
            <StatusModal open={openModal === "status"} onClose={() => setOpenModal(null)} />
            <UsersModal open={openModal === "users"} onClose={() => setOpenModal(null)} />
        </>
    );
}

interface SidebarContentProps {
    setOpenModal: (v: "client" | "project" | "product" | "colaborador" | "tags" | "status" | "users" | null) => void;
    isCollapsed?: boolean;
    onClose?: () => void;
}

function SidebarContent({ setOpenModal, isCollapsed }: SidebarContentProps) {
    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
                <h2
                    className={`text-lg font-semibold text-slate-800 dark:text-slate-100 transition-opacity duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"
                        }`}
                >
                    Gerenciar
                </h2>

                <SidebarItem
                    label="Colaboradores"
                    onClick={() => setOpenModal("colaborador")}
                    isCollapsed={isCollapsed}
                />
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
