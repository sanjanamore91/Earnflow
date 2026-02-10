import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import Task from "./pages/Task";
import Payment from "./pages/Payment";
import Info from "./pages/Info";
import Hierarchy1499 from "./pages/Hierarchy1499";
import Sector1499 from "./pages/Sector1499";
import Sector45 from "./pages/Sector45";
import Sector99 from "./pages/Sector99";
import Sector167 from "./pages/Sector167";
import Sector245 from "./pages/Sector245";
import Sector467 from "./pages/Sector467";
import Sector689 from "./pages/Sector689";
import Sector999 from "./pages/Sector999";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plans"
            element={
              <ProtectedRoute requireVerifiedEmail={true}>
                <Plans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task"
            element={
              <ProtectedRoute requireVerifiedEmail={true}>
                <Task />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute requireVerifiedEmail={true}>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/info"
            element={
              <ProtectedRoute requireVerifiedEmail={true}>
                <Info />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hierarchy1499"
            element={
              <ProtectedRoute>
                <Hierarchy1499 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sector45"
            element={
              <ProtectedRoute>
                <Sector45 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sector99"
            element={
              <ProtectedRoute>
                <Sector99 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sector167"
            element={
              <ProtectedRoute>
                <Sector167 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sector245"
            element={
              <ProtectedRoute>
                <Sector245 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sector467"
            element={
              <ProtectedRoute>
                <Sector467 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sector689"
            element={
              <ProtectedRoute>
                <Sector689 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sector999"
            element={
              <ProtectedRoute>
                <Sector999 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sector1499"
            element={
              <ProtectedRoute>
                <Sector1499 />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
