// import { useState, useEffect, useCallback } from "react";
// import { jwtDecode } from "jwt-decode";

// interface JwtPayload {
//   id: string;
//   email?: string;
//   exp: number;
//   iat: number;
// }

// const WARNING_TIME_MS = 20 * 1000; // 20s antes do expirar para teste

// interface AuthTokenHook {
//   token: string | null;
//   isModalOpen: boolean;
//   timeUntilExpiration: number | null;
//   login: (newToken: string) => void;
//   logout: () => void;
//   closeModal: () => void;
//   refreshToken: () => Promise<boolean>;
// }

// export const useAuthToken = (): AuthTokenHook => {
//   const [token, setToken] = useState<string | null>(
//     localStorage.getItem("authToken")
//   );
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [timeUntilExpiration, setTimeUntilExpiration] = useState<number | null>(
//     null
//   );

//   const getTokenExpiration = useCallback((jwtToken: string): number | null => {
//     try {
//       const decoded = jwtDecode<JwtPayload>(jwtToken);
//       return decoded.exp * 1000;
//     } catch (error) {
//       console.warn("Token inválido:", error);
//       return null;
//     }
//   }, []);

//   const login = useCallback((newToken: string) => {
//     localStorage.setItem("authToken", newToken);
//     setToken(newToken);
//     setIsModalOpen(false);
//   }, []);

//   const logout = useCallback(() => {
//     localStorage.removeItem("authToken");
//     setToken(null);
//     setIsModalOpen(false);
//   }, []);

//   const closeModal = useCallback(() => {
//     setIsModalOpen(false);
//   }, []);

//   const refreshToken = useCallback(async (): Promise<boolean> => {
//     if (!token) return false;
//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_API_BASE_URL}/refresh-token`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!res.ok) {
//         logout();
//         return false;
//       }

//       const data = await res.json();
//       const newToken = data.token;
//       login(newToken);
//       return true;
//     } catch (err) {
//       console.error("Erro ao renovar token:", err);
//       logout();
//       return false;
//     }
//   }, [token, login, logout]);

//   // Monitoramento do token para abrir modal
//   useEffect(() => {
//     let timer: ReturnType<typeof setTimeout> | null = null;

//     if (token) {
//       const expirationTime = getTokenExpiration(token);
//       if (!expirationTime) return;

//       const now = Date.now();
//       const timeToExpire = expirationTime - now;
//       setTimeUntilExpiration(timeToExpire);

//       const timeToWarning = timeToExpire - WARNING_TIME_MS;

//       if (timeToWarning > 0) {
//         timer = setTimeout(() => setIsModalOpen(true), timeToWarning);
//       } else if (timeToExpire > 0) {
//         setIsModalOpen(true);
//       } else {
//         logout();
//       }
//     }

//     return () => {
//       if (timer) clearTimeout(timer);
//     };
//   }, [token, getTokenExpiration, logout]);

//   return {
//     token,
//     isModalOpen,
//     timeUntilExpiration,
//     login,
//     logout,
//     closeModal,
//     refreshToken,
//   };
// };
