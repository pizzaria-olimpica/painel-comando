import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Users, ShoppingCart, TrendingUp, Calendar, Eye, Printer, Phone, MapPin, CreditCard, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Pedido {
  id: number;
  codigo_pedido: string;
  nome: string;
  whatsapp: string;
  endereco: string;
  cep: string | null;
  pedido: string;
  observacoes: string | null;
  pagamento: string | null;
  total: string;
  created_at: string;
}

const Relatorios = () => {
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: clientes } = useQuery({
    queryKey: ["clientes_count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: pedidos } = useQuery({
    queryKey: ["pedidos_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedidos_goodzap")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Pedido[];
    },
  });

  const totalPedidos = pedidos?.length || 0;
  const faturamentoTotal = pedidos?.reduce((acc, p) => {
    const valor = parseFloat(p.total?.replace(/[^\d,.-]/g, "").replace(",", ".") || "0");
    return acc + valor;
  }, 0) || 0;

  const openDetails = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setDetailsOpen(true);
  };

  const handlePrint = (pedido: Pedido) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedDate = new Date(pedido.created_at).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pedido #${pedido.codigo_pedido}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 300px; margin: 0 auto; }
            h1 { font-size: 18px; text-align: center; margin-bottom: 10px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .info { margin: 5px 0; font-size: 12px; }
            .label { font-weight: bold; }
            .items { margin: 10px 0; }
            .total { font-size: 16px; font-weight: bold; text-align: right; margin-top: 10px; }
            .obs { font-style: italic; font-size: 11px; margin-top: 10px; padding: 5px; background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>PEDIDO #${pedido.codigo_pedido}</h1>
          <div class="divider"></div>
          <div class="info"><span class="label">Data:</span> ${formattedDate}</div>
          <div class="info"><span class="label">Cliente:</span> ${pedido.nome}</div>
          <div class="info"><span class="label">Telefone:</span> ${pedido.whatsapp}</div>
          <div class="info"><span class="label">Endereço:</span> ${pedido.endereco}</div>
          ${pedido.cep ? `<div class="info"><span class="label">CEP:</span> ${pedido.cep}</div>` : ''}
          <div class="divider"></div>
          <div class="items">
            <div class="label">Itens do Pedido:</div>
            <pre style="font-size: 11px; white-space: pre-wrap;">${pedido.pedido}</pre>
          </div>
          ${pedido.observacoes ? `<div class="obs"><span class="label">Obs:</span> ${pedido.observacoes}</div>` : ''}
          <div class="divider"></div>
          ${pedido.pagamento ? `<div class="info"><span class="label">Pagamento:</span> ${pedido.pagamento}</div>` : ''}
          <div class="total">TOTAL: ${pedido.total}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">
          <span className="neon-text-magenta">Relatórios</span>
        </h2>
        <p className="text-muted-foreground">
          Análise de desempenho do seu negócio
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card neon-border hover:neon-glow-cyan transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold neon-text-cyan">{clientes}</div>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border hover:neon-glow-magenta transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pedidos Recentes
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold neon-text-magenta">{totalPedidos}</div>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border hover:neon-glow-green transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold neon-text-green">
              R$ {faturamentoTotal.toFixed(2).replace(".", ",")}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border hover:neon-glow-cyan transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold neon-text-cyan">
              R$ {totalPedidos > 0 ? (faturamentoTotal / totalPedidos).toFixed(2).replace(".", ",") : "0,00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="glass-card neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Últimos Pedidos
          </CardTitle>
          <CardDescription>Histórico recente de pedidos</CardDescription>
        </CardHeader>
        <CardContent>
          {pedidos && pedidos.length > 0 ? (
            <div className="space-y-3">
              {pedidos.slice(0, 10).map((pedido) => (
                <div 
                  key={pedido.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-sm text-muted-foreground min-w-[140px]">
                      {new Date(pedido.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{pedido.nome}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {pedido.whatsapp}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="neon-text-green">
                      {pedido.total}
                    </Badge>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openDetails(pedido)}
                        className="hover:bg-primary/20"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handlePrint(pedido)}
                        className="hover:bg-secondary/20"
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Imprimir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pedido encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Pedido #{selectedPedido?.codigo_pedido}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPedido && (
            <div className="space-y-4" ref={printRef}>
              {/* Data e Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedPedido.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
                <Badge variant="outline" className="neon-text-green text-lg">
                  {selectedPedido.total}
                </Badge>
              </div>

              <Separator />

              {/* Informações do Cliente */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Dados do Cliente
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground min-w-[80px]">Nome:</span>
                    <span className="font-medium">{selectedPedido.nome}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{selectedPedido.whatsapp}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span>{selectedPedido.endereco}</span>
                      {selectedPedido.cep && (
                        <span className="text-muted-foreground ml-2">CEP: {selectedPedido.cep}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Itens do Pedido */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Itens do Pedido
                </h4>
                <div className="bg-muted/30 rounded-lg p-3">
                  <pre className="text-sm whitespace-pre-wrap font-sans">{selectedPedido.pedido}</pre>
                </div>
              </div>

              {/* Observações */}
              {selectedPedido.observacoes && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold">Observações</h4>
                    <div className="bg-accent/10 rounded-lg p-3 text-sm italic">
                      {selectedPedido.observacoes}
                    </div>
                  </div>
                </>
              )}

              {/* Pagamento */}
              {selectedPedido.pagamento && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Pagamento:</span>
                    <Badge variant="secondary">{selectedPedido.pagamento}</Badge>
                  </div>
                </>
              )}

              <Separator />

              {/* Ações */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={() => handlePrint(selectedPedido)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Relatorios;
