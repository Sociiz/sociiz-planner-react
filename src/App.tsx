import { ThemeProvider } from "@/components/theme-provider"
import PlannerApp from "./PlannerApp"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <PlannerApp />
    </ThemeProvider>
  )
}

export default App
