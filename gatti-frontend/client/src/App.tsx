import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { QueryProvider } from "./providers/QueryProvider";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { MainLayout } from "./components/layout/MainLayout";
import Login from "./pages/auth/Login";
import Forbidden from "./pages/403";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PrintersPage from "./pages/modules/Printers";
import PrinterDetailsPage from "./pages/modules/PrinterDetails";
import SuppliesPage from "./pages/modules/Supplies";
import StockPage from "./pages/modules/Stock";
import AlertsPage from "./pages/modules/Alerts";
import ReportsPage from "./pages/modules/Reports";
import AdminPage from "./pages/admin/Admin";
import { Loader2 } from "lucide-react";

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/auth/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/printers">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <PrintersPage />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/printers/:id">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <PrinterDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/supplies">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <SuppliesPage />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/stock">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <StockPage />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/alerts">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <AlertsPage />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/reports">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <ReportsPage />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/admin">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <AdminPage />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      {/* Error Routes */}
      <Route path="/403" component={Forbidden} />
      <Route path="/404" component={NotFound} />
      
      {/* Redirect root to dashboard */}
      <Route path="/">
        {() => {
          window.location.href = '/dashboard';
          return null;
        }}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
