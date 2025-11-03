import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import {
    getToken,
    setToken as storeToken,
    getRefreshToken,
    setRefreshToken as storeRefreshToken,
    clearTokens,
} from "@/utils/auth";

interface User {
    id: string;
    email?: string;
    isAdmin?: boolean;
    isColaborador?: boolean;
}

interface JwtPayload {
    id: string;
    email?: string;
    isAdmin?: boolean;
    isColaborador?: boolean;
    exp: number;
    iat: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isModalOpen: boolean;
    timeUntilExpiration: number | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
    logout: () => void;
    renewToken: () => Promise<boolean>;
    closeModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const WARNING_TIME_MS = 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => getToken());
    const [refreshToken, setRefreshToken] = useState<string | null>(() =>
        getRefreshToken()
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [timeUntilExpiration, setTimeUntilExpiration] = useState<number | null>(null);
    const [user, setUser] = useState<User | null>(() => {
        const storedToken = getToken();
        if (!storedToken) return null;
        try {
            const decoded: JwtPayload = jwtDecode(storedToken);
            return {
                id: decoded.id,
                email: decoded.email,
                isAdmin: decoded.isAdmin ?? false,
                isColaborador: decoded.isColaborador ?? false,
            };
        } catch {
            clearTokens();
            return null;
        }
    });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const getTokenExpiration = useCallback((jwtToken: string): number | null => {
        try {
            const decoded = jwtDecode<JwtPayload>(jwtToken);
            return decoded.exp * 1000;
        } catch (error) {
            console.warn("Token inválido:", error);
            return null;
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        setRefreshToken(null);
        setIsModalOpen(false);
        clearTokens();
    }, []);

    const closeModal = useCallback(() => setIsModalOpen(false), []);

    const renewToken = useCallback(async (): Promise<boolean> => {
        if (!refreshToken) {
            logout();
            return false;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/refresh-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });

            if (!res.ok) {
                logout();
                return false;
            }

            const data = await res.json();
            setToken(data.token);
            setRefreshToken(data.refreshToken);
            storeToken(data.token);
            storeRefreshToken(data.refreshToken);

            const decoded: JwtPayload = jwtDecode(data.token);
            setUser({
                id: decoded.id,
                email: decoded.email,
                isAdmin: decoded.isAdmin ?? false,
                isColaborador: decoded.isColaborador ?? false,
            });
            setIsModalOpen(false);

            return true;
        } catch (err) {
            console.error("Erro ao renovar token:", err);
            logout();
            return false;
        }
    }, [refreshToken, API_BASE_URL, logout]);

    async function login(email: string, password: string) {
        const res = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) throw new Error("Erro ao fazer login");
        const data = await res.json();

        setToken(data.token);
        setRefreshToken(data.refreshToken);
        storeToken(data.token);
        storeRefreshToken(data.refreshToken);

        const decoded: JwtPayload = jwtDecode(data.token);
        setUser({
            id: decoded.id,
            email: decoded.email,
            isAdmin: decoded.isAdmin ?? false,
            isColaborador: decoded.isColaborador ?? false,

        });
    }

    async function register(email: string, password: string, username: string) {
        const res = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, username }),
        });

        if (!res.ok) throw new Error("Erro ao registrar usuário");
        const data = await res.json();

        setToken(data.token);
        setRefreshToken(data.refreshToken);
        storeToken(data.token);
        storeRefreshToken(data.refreshToken);

        const decoded: JwtPayload = jwtDecode(data.token);
        setUser({
            id: decoded.id,
            email: decoded.email,
            isAdmin: decoded.isAdmin ?? false,
            isColaborador: decoded.isColaborador ?? false,
        });
    }

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null;

        if (token) {
            const expirationTime = getTokenExpiration(token);
            if (!expirationTime) {
                logout();
                return;
            }

            const now = Date.now();
            const timeToExpire = expirationTime - now;
            setTimeUntilExpiration(timeToExpire);

            const timeToWarning = timeToExpire - WARNING_TIME_MS;
            if (timeToWarning > 0) {
                timer = setTimeout(() => setIsModalOpen(true), timeToWarning);
            } else if (timeToExpire > 0) {
                setIsModalOpen(true);
            } else {
                logout();
            }
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [token, getTokenExpiration, logout]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isModalOpen,
                timeUntilExpiration,
                login,
                register,
                logout,
                renewToken,
                closeModal,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within an AuthProvider");
    return context;
}
