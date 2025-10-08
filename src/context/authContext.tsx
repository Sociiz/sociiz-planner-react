import { createContext, useContext, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
    id: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const storedToken = localStorage.getItem("token");
    const initialUser = storedToken ? jwtDecode<User>(storedToken) : null;

    const [token, setToken] = useState<string | null>(storedToken);
    const [user, setUser] = useState<User | null>(
        initialUser
            ? { id: initialUser.id, email: initialUser.email, }
            : null
    );
    const [loading, setLoading] = useState(false);

    async function login(email: string, password: string) {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Erro ao fazer login");
            }

            const data = await res.json();
            const token = data.token;

            setToken(token);
            localStorage.setItem("token", token);

            const decoded: User = jwtDecode(token);
            setUser({
                id: decoded.id,
                email: decoded.email,
            });
        } finally {
            setLoading(false);
        }
    }

    async function register(email: string, password: string) {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || data.error || "Erro ao registrar usuário");
            }

            await login(email, password);
        } finally {
            setLoading(false);
        }
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
    }

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
