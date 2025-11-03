import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/authContext";

interface PrivateRouteProps {
    children: JSX.Element;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" replace />;
}
