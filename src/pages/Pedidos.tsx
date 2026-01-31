import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, MapPin, Phone, Clock, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";

const Pedidos = () => {
  const [search, setSearch] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const { data: pedidos, isLoading } = useQuery({
    queryKey: ["pedidos_goodzap", dataInicio, dataFim],
    queryFn: async () => {
      let query = supabase
        .from("pedidos_goodzap")
        .select("*")
        .order("created_at", { ascending: false });

      if (dataInicio) {
        query = query.gte("created_at", `${dataInicio}T00:00:00`);
      }

      if (dataFim) {
        query = query.lte("created_at", `${dataFim}T23:59:59`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    },
  });

  const filteredPedidos = pedidos?.filter((pedido) =>
    pedido.nome?.toLowerCase().includes(search.toLowerCase()) ||
    pedido.codigo_pedido?.includes(search) ||
    pedido.whatsapp?.includes(search)
  );

  // Calcular total de vendas no período
  const totalVendas = useMemo(() => {
    if (!filteredPedidos) return 0;
    return filteredPedidos.reduce((acc, pedido) => {
      const valor = parseFloat(pedido.total?.replace(/[^\d,.-]/g, "").replace(",", ".") || "0");
      return acc + valor;
    }, 0);
  }, [filteredPedidos]);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hoje = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            <span className="neon-text-magenta">Pedidos</span>
          </h2>
          <p className="text-muted-foreground">
            {filteredPedidos?.length || 0} pedidos no período
          </p>
        </div>

        {/* Card de Total de Vendas */}
        <Card className="glass-card neon-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total no período</p>
              <p className="text-2xl font-bold neon-text-green">{formatarMoeda(totalVendas)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, código ou WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-muted/50 border-border/50 focus:border-secondary"
        />
      </div>

      {/* Filtro por período */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Data inicial</label>
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="bg-muted/50 border-border/50"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Data final</label>
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="bg-muted/50 border-border/50"
          />
        </div>

        <Button
          variant="secondary"
          onClick={() => {
            setDataInicio(hoje);
            setDataFim(hoje);
          }}
        >
          Hoje
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            setDataInicio("");
            setDataFim("");
          }}
        >
          Limpar
        </Button>
      </div>

      {/* Lista de pedidos */}
      <Card className="glass-card neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-secondary" />
            Lista de Pedidos
          </CardTitle>
          <CardDescription>
            {filteredPedidos?.length || 0} resultados
          </CardDescription>
        </CardHeader>

        <CardContent>
          {filteredPedidos && filteredPedidos.length > 0 ? (
            <div className="space-y-4">
              {filteredPedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="neon-text-cyan">
                          #{pedido.codigo_pedido}
                        </Badge>
                        <span className="font-medium">{pedido.nome}</span>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(pedido.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <Badge variant="default" className="neon-text-green text-lg">
                      {pedido.total}
                    </Badge>
                  </div>

                  <div className="text-sm space-y-2">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">{pedido.pedido}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {pedido.whatsapp}
                      </span>

                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {pedido.endereco}
                      </span>
                    </div>

                    {pedido.pagamento && (
                      <Badge variant="secondary">{pedido.pagamento}</Badge>
                    )}

                    {pedido.observacoes && (
                      <p className="text-xs text-muted-foreground italic">
                        Obs: {pedido.observacoes}
                      </p>
                    )}
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
    </div>
  );
};

export default Pedidos;
