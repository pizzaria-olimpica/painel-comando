import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Search, Phone, MapPin, Calendar, ShoppingBag, DollarSign, Navigation, Home, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";

type Cliente = Tables<"clientes">;

const Clientes = () => {
  const [search, setSearch] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const { data: clientes, isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredClientes = clientes?.filter(cliente => 
    cliente.nome?.toLowerCase().includes(search.toLowerCase()) ||
    cliente.whatsapp?.includes(search)
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString("pt-BR");
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            <span className="neon-text-cyan">Clientes</span>
          </h2>
          <p className="text-muted-foreground">
            {clientes?.length || 0} clientes cadastrados
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nome ou WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
        />
      </div>

      {/* Clients List */}
      <Card className="glass-card neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Lista de Clientes
          </CardTitle>
          <CardDescription>
            {filteredClientes?.length || 0} resultados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClientes && filteredClientes.length > 0 ? (
            <div className="space-y-4">
              {filteredClientes.map((cliente) => (
                <div 
                  key={cliente.id}
                  onClick={() => setSelectedCliente(cliente)}
                  className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{cliente.nome || "Sem nome"}</h4>
                        {cliente.status && (
                          <Badge variant={cliente.status === "ativo" ? "default" : "secondary"}>
                            {cliente.status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {cliente.whatsapp && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cliente.whatsapp}
                          </span>
                        )}
                        {cliente.bairro && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {cliente.bairro}, {cliente.cidade}
                          </span>
                        )}
                        {cliente.aniversario && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {cliente.aniversario}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Compras</div>
                      <div className="font-medium neon-text-cyan">{cliente.compras || 0}</div>
                      {cliente.total_gasto && (
                        <div className="text-xs text-accent">
                          R$ {cliente.total_gasto.toFixed(2).replace(".", ",")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cliente encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Cliente */}
      <Dialog open={!!selectedCliente} onOpenChange={() => setSelectedCliente(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" />
              <span className="neon-text-cyan">{selectedCliente?.nome || "Cliente"}</span>
              {selectedCliente?.status && (
                <Badge variant={selectedCliente.status === "ativo" ? "default" : "secondary"}>
                  {selectedCliente.status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedCliente && (
            <div className="space-y-6 mt-4">
              {/* Informações de Contato */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contato
                </h3>
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-xs text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{selectedCliente.whatsapp || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Código</p>
                    <p className="font-medium">{selectedCliente.codigo || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Endereço
                </h3>
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Rua</p>
                    <p className="font-medium">{selectedCliente.rua || "-"}, {selectedCliente.numero || "S/N"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Complemento</p>
                    <p className="font-medium">{selectedCliente.complemento || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bairro</p>
                    <p className="font-medium">{selectedCliente.bairro || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cidade/Estado</p>
                    <p className="font-medium">{selectedCliente.cidade || "-"} / {selectedCliente.estado || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CEP</p>
                    <p className="font-medium">{selectedCliente.cep || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Entrega */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Informações de Entrega
                </h3>
                <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-xs text-muted-foreground">Área de Entrega</p>
                    <p className="font-medium">{selectedCliente.area_entrega || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Distância</p>
                    <p className="font-medium">{selectedCliente.distancia ? `${selectedCliente.distancia} m` : "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Distância Máxima</p>
                    <p className="font-medium">{selectedCliente.distancia_maxima ? `${selectedCliente.distancia_maxima} m` : "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor do Frete</p>
                    <p className="font-medium neon-text-green">
                      {selectedCliente.valor_frete ? `R$ ${selectedCliente.valor_frete.toFixed(2).replace(".", ",")}` : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Compras e Financeiro */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Histórico de Compras
                </h3>
                <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-xs text-muted-foreground">Total de Compras</p>
                    <p className="font-medium text-lg neon-text-cyan">{selectedCliente.compras || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Gasto</p>
                    <p className="font-medium text-lg neon-text-green">
                      R$ {(selectedCliente.total_gasto || 0).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Último Pedido</p>
                    <p className="font-medium">{selectedCliente.ultimo_pedido || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Última Compra</p>
                    <p className="font-medium">{formatDate(selectedCliente.ultima_compra)}</p>
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Datas
                </h3>
                <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-xs text-muted-foreground">Aniversário</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-accent" />
                      {selectedCliente.aniversario || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cadastrado em</p>
                    <p className="font-medium">{formatDateTime(selectedCliente.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Última Atualização</p>
                    <p className="font-medium">{formatDateTime(selectedCliente.ultima_atualizacao)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clientes;
