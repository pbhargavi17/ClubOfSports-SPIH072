// Floodlit Clubhouse reminder: routes should keep the journey—discover, connect, play—clear from every screen.
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import "./review-pass.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Connections from "./pages/Connections";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Events from "./pages/Events";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import History from "./pages/History";

function Router() {
  return <Switch><Route path="/" component={Landing} /><Route path="/onboarding" component={Onboarding} /><Route path="/app" component={Dashboard} /><Route path="/app/discover" component={Discover} /><Route path="/app/events" component={Events} /><Route path="/app/connections" component={Connections} /><Route path="/app/profile" component={Profile} /><Route path="/app/history" component={History} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster theme="dark" position="top-right" richColors /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
