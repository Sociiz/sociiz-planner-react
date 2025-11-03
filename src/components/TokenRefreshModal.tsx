import { useState, type FC } from "react";
import { useAuth } from "@/context/authContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
};

export const TokenRefreshModal: FC = () => {
    const { isModalOpen, timeUntilExpiration, closeModal, renewToken, logout } =
        useAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const timeRemaining = timeUntilExpiration
        ? formatTime(timeUntilExpiration)
        : "calculando...";

    const handleRefresh = async () => {
        setIsRefreshing(true);
        const success = await renewToken();
        setIsRefreshing(false);

        if (!success) {
            alert("Sua sessão expirou. Faça login novamente.");
        }
    };

    const handleLogout = () => {
        closeModal();
        logout();
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center text-black">
                <DialogHeader>
                    <DialogTitle>Sua sessão está expirando</DialogTitle>
                </DialogHeader>

                <p className="my-4 text-sm text-black">
                    Sua sessão irá expirar em aproximadamente{" "}
                    <span className="font-semibold">{timeRemaining}</span>. Deseja
                    renovar agora?
                </p>

                <DialogFooter className="flex justify-center gap-4">
                    <Button
                        variant="default"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="text-white font-medium"
                    >
                        {isRefreshing ? "Renovando..." : "Sim, Renovar Sessão"}
                    </Button>
                    <Button
                        onClick={handleLogout}
                        disabled={isRefreshing}
                        className="text-white bg-red-600 hover:bg-red-600 font-medium"
                    >
                        Não, Sair
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}