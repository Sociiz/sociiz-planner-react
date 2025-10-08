import { ThemeProvider } from "@/components/theme-provider"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/authContext"
import { PrivateRoute } from "@/PrivateRoute"

import Login from "@/pages/Login/Login"
import RegisterPage from "@/pages/Register/Register"
import PlannerApp from "./pages/PlannerApp/PlannerApp"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Rota privada */}
            <Route
              path="/planner"
              element={
                <PrivateRoute>
                  <PlannerApp />
                </PrivateRoute>
              }
            />

            {/* Redireciona qualquer outra rota para login */}
            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
