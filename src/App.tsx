import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Empresa from "./pages/Empresa";
import Configuracoes from "./pages/Configuracoes";
import Campanhas from "./pages/Campanhas";
import Cardapio from "./pages/Cardapio";
import Relatorios from "./pages/Relatorios";
import MetricasVendas from "./pages/MetricasVendas";
import Clientes from "./pages/Clientes";
import Pedidos from "./pages/Pedidos";
import Horarios from "./pages/Horarios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/empresa" element={<Empresa />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/campanhas" element={<Campanhas />} />
            <Route path="/cardapio" element={<Cardapio />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/metricas" element={<MetricasVendas />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/horarios" element={<Horarios />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
