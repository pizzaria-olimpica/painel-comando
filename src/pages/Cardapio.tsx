import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { UtensilsCrossed, Coffee, Pizza, Plus, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Prato {
  id: number;
  nome_do_prato: string | null;
  descricao: string | null;
  preco: number | null;
}

interface Bebida {
  id: number;
  nome: string | null;
  tipo: string | null;
  tamanho: string | null;
  valor: number | null;
}

interface Borda {
  id: number;
  tamanho_pizza: string | null;
  valor_borda_recheada: number | null;
}

const Cardapio = () => {
  const queryClient = useQueryClient();
  
  // Dialog states
  const [pratoDialogOpen, setPratoDialogOpen] = useState(false);
  const [bebidaDialogOpen, setBebidaDialogOpen] = useState(false);
  const [bordaDialogOpen, setBordaDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Edit states
  const [editingPrato, setEditingPrato] = useState<Prato | null>(null);
  const [editingBebida, setEditingBebida] = useState<Bebida | null>(null);
  const [editingBorda, setEditingBorda] = useState<Borda | null>(null);
  
  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'prato' | 'bebida' | 'borda'; id: number; name: string } | null>(null);
  
  // Form states
  const [pratoForm, setPratoForm] = useState({ nome_do_prato: "", descricao: "", preco: "" });
  const [bebidaForm, setBebidaForm] = useState({ nome: "", tipo: "", tamanho: "", valor: "" });
  const [bordaForm, setBordaForm] = useState({ tamanho_pizza: "", valor_borda_recheada: "" });

  const { data: cardapio, isLoading: loadingCardapio } = useQuery({
    queryKey: ["cardapio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cardapio")
        .select("*")
        .order("nome_do_prato");
      if (error) throw error;
      return data;
    },
  });

  const { data: bebidas, isLoading: loadingBebidas } = useQuery({
    queryKey: ["bebidas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bebidas")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: bordas } = useQuery({
    queryKey: ["borda_recheada"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("borda_recheada")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Mutations for Pratos
  const savePratoMutation = useMutation({
    mutationFn: async (prato: { id?: number; nome_do_prato: string; descricao: string; preco: number }) => {
      if (prato.id) {
        const { error } = await supabase.from("cardapio").update({
          nome_do_prato: prato.nome_do_prato,
          descricao: prato.descricao,
          preco: prato.preco,
        }).eq("id", prato.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cardapio").insert({
          nome_do_prato: prato.nome_do_prato,
          descricao: prato.descricao,
          preco: prato.preco,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardapio"] });
      toast.success(editingPrato ? "Prato atualizado!" : "Prato adicionado!");
      setPratoDialogOpen(false);
      setEditingPrato(null);
      setPratoForm({ nome_do_prato: "", descricao: "", preco: "" });
    },
    onError: () => toast.error("Erro ao salvar prato"),
  });

  // Mutations for Bebidas
  const saveBebidaMutation = useMutation({
    mutationFn: async (bebida: { id?: number; nome: string; tipo: string; tamanho: string; valor: number }) => {
      if (bebida.id) {
        const { error } = await supabase.from("bebidas").update({
          nome: bebida.nome,
          tipo: bebida.tipo,
          tamanho: bebida.tamanho,
          valor: bebida.valor,
        }).eq("id", bebida.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("bebidas").insert({
          nome: bebida.nome,
          tipo: bebida.tipo,
          tamanho: bebida.tamanho,
          valor: bebida.valor,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bebidas"] });
      toast.success(editingBebida ? "Bebida atualizada!" : "Bebida adicionada!");
      setBebidaDialogOpen(false);
      setEditingBebida(null);
      setBebidaForm({ nome: "", tipo: "", tamanho: "", valor: "" });
    },
    onError: () => toast.error("Erro ao salvar bebida"),
  });

  // Mutations for Bordas
  const saveBordaMutation = useMutation({
    mutationFn: async (borda: { id?: number; tamanho_pizza: string; valor_borda_recheada: number }) => {
      if (borda.id) {
        const { error } = await supabase.from("borda_recheada").update({
          tamanho_pizza: borda.tamanho_pizza,
          valor_borda_recheada: borda.valor_borda_recheada,
        }).eq("id", borda.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("borda_recheada").insert({
          tamanho_pizza: borda.tamanho_pizza,
          valor_borda_recheada: borda.valor_borda_recheada,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borda_recheada"] });
      toast.success(editingBorda ? "Borda atualizada!" : "Borda adicionada!");
      setBordaDialogOpen(false);
      setEditingBorda(null);
      setBordaForm({ tamanho_pizza: "", valor_borda_recheada: "" });
    },
    onError: () => toast.error("Erro ao salvar borda"),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: 'prato' | 'bebida' | 'borda'; id: number }) => {
      const table = type === 'prato' ? 'cardapio' : type === 'bebida' ? 'bebidas' : 'borda_recheada';
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardapio"] });
      queryClient.invalidateQueries({ queryKey: ["bebidas"] });
      queryClient.invalidateQueries({ queryKey: ["borda_recheada"] });
      toast.success("Item excluído!");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    },
    onError: () => toast.error("Erro ao excluir item"),
  });

  const isLoading = loadingCardapio || loadingBebidas;

  const formatPrice = (price: number | null) => {
    if (!price) return "R$ 0,00";
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  };

  const openEditPrato = (prato: Prato) => {
    setEditingPrato(prato);
    setPratoForm({
      nome_do_prato: prato.nome_do_prato || "",
      descricao: prato.descricao || "",
      preco: prato.preco?.toString() || "",
    });
    setPratoDialogOpen(true);
  };

  const openEditBebida = (bebida: Bebida) => {
    setEditingBebida(bebida);
    setBebidaForm({
      nome: bebida.nome || "",
      tipo: bebida.tipo || "",
      tamanho: bebida.tamanho || "",
      valor: bebida.valor?.toString() || "",
    });
    setBebidaDialogOpen(true);
  };

  const openEditBorda = (borda: Borda) => {
    setEditingBorda(borda);
    setBordaForm({
      tamanho_pizza: borda.tamanho_pizza || "",
      valor_borda_recheada: borda.valor_borda_recheada?.toString() || "",
    });
    setBordaDialogOpen(true);
  };

  const openNewPrato = () => {
    setEditingPrato(null);
    setPratoForm({ nome_do_prato: "", descricao: "", preco: "" });
    setPratoDialogOpen(true);
  };

  const openNewBebida = () => {
    setEditingBebida(null);
    setBebidaForm({ nome: "", tipo: "", tamanho: "", valor: "" });
    setBebidaDialogOpen(true);
  };

  const openNewBorda = () => {
    setEditingBorda(null);
    setBordaForm({ tamanho_pizza: "", valor_borda_recheada: "" });
    setBordaDialogOpen(true);
  };

  const confirmDelete = (type: 'prato' | 'bebida' | 'borda', id: number, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleSavePrato = () => {
    savePratoMutation.mutate({
      id: editingPrato?.id,
      nome_do_prato: pratoForm.nome_do_prato,
      descricao: pratoForm.descricao,
      preco: parseFloat(pratoForm.preco.replace(",", ".")) || 0,
    });
  };

  const handleSaveBebida = () => {
    saveBebidaMutation.mutate({
      id: editingBebida?.id,
      nome: bebidaForm.nome,
      tipo: bebidaForm.tipo,
      tamanho: bebidaForm.tamanho,
      valor: parseFloat(bebidaForm.valor.replace(",", ".")) || 0,
    });
  };

  const handleSaveBorda = () => {
    saveBordaMutation.mutate({
      id: editingBorda?.id,
      tamanho_pizza: bordaForm.tamanho_pizza,
      valor_borda_recheada: parseFloat(bordaForm.valor_borda_recheada.replace(",", ".")) || 0,
    });
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
            <span className="neon-text-cyan">Cardápio</span>
          </h2>
          <p className="text-muted-foreground">
            Gerencie os itens do seu cardápio
          </p>
        </div>
      </div>

      <Tabs defaultValue="pratos" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="pratos" className="data-[state=active]:bg-primary/20">
            <UtensilsCrossed className="h-4 w-4 mr-2" />
            Pratos
          </TabsTrigger>
          <TabsTrigger value="bebidas" className="data-[state=active]:bg-secondary/20">
            <Coffee className="h-4 w-4 mr-2" />
            Bebidas
          </TabsTrigger>
          <TabsTrigger value="bordas" className="data-[state=active]:bg-accent/20">
            <Pizza className="h-4 w-4 mr-2" />
            Bordas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pratos" className="mt-6">
          <Card className="glass-card neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pratos do Cardápio</CardTitle>
                <CardDescription>{cardapio?.length || 0} itens cadastrados</CardDescription>
              </div>
              <Button onClick={openNewPrato} className="neon-glow-cyan">
                <Plus className="h-4 w-4 mr-2" />
                Novo Prato
              </Button>
            </CardHeader>
            <CardContent>
              {cardapio && cardapio.length > 0 ? (
                <div className="grid gap-4">
                  {cardapio.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.nome_do_prato}</h4>
                        {item.descricao && (
                          <p className="text-sm text-muted-foreground mt-1">{item.descricao}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="neon-text-cyan">
                          {formatPrice(item.preco)}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditPrato(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => confirmDelete('prato', item.id, item.nome_do_prato || 'Item')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum prato cadastrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bebidas" className="mt-6">
          <Card className="glass-card neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bebidas</CardTitle>
                <CardDescription>{bebidas?.length || 0} bebidas cadastradas</CardDescription>
              </div>
              <Button onClick={openNewBebida} className="neon-glow-magenta">
                <Plus className="h-4 w-4 mr-2" />
                Nova Bebida
              </Button>
            </CardHeader>
            <CardContent>
              {bebidas && bebidas.length > 0 ? (
                <div className="grid gap-4">
                  {bebidas.map((bebida) => (
                    <div 
                      key={bebida.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-secondary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{bebida.nome}</h4>
                        <div className="flex gap-2 mt-1">
                          {bebida.tipo && <Badge variant="secondary">{bebida.tipo}</Badge>}
                          {bebida.tamanho && <Badge variant="outline">{bebida.tamanho}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="neon-text-magenta">
                          {formatPrice(bebida.valor)}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditBebida(bebida)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => confirmDelete('bebida', bebida.id, bebida.nome || 'Item')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Coffee className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma bebida cadastrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bordas" className="mt-6">
          <Card className="glass-card neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bordas Recheadas</CardTitle>
                <CardDescription>Preços por tamanho de pizza</CardDescription>
              </div>
              <Button onClick={openNewBorda} className="neon-glow-green">
                <Plus className="h-4 w-4 mr-2" />
                Nova Borda
              </Button>
            </CardHeader>
            <CardContent>
              {bordas && bordas.length > 0 ? (
                <div className="grid gap-4">
                  {bordas.map((borda) => (
                    <div 
                      key={borda.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">Pizza {borda.tamanho_pizza}</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="neon-text-green">
                          {formatPrice(borda.valor_borda_recheada)}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditBorda(borda)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => confirmDelete('borda', borda.id, borda.tamanho_pizza || 'Item')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Pizza className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma borda cadastrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for Prato */}
      <Dialog open={pratoDialogOpen} onOpenChange={setPratoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPrato ? "Editar Prato" : "Novo Prato"}</DialogTitle>
            <DialogDescription>
              {editingPrato ? "Atualize as informações do prato" : "Adicione um novo prato ao cardápio"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Prato</Label>
              <Input 
                value={pratoForm.nome_do_prato}
                onChange={(e) => setPratoForm({ ...pratoForm, nome_do_prato: e.target.value })}
                placeholder="Ex: Pizza Margherita"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea 
                value={pratoForm.descricao}
                onChange={(e) => setPratoForm({ ...pratoForm, descricao: e.target.value })}
                placeholder="Descrição do prato..."
              />
            </div>
            <div className="space-y-2">
              <Label>Preço (R$)</Label>
              <Input 
                value={pratoForm.preco}
                onChange={(e) => setPratoForm({ ...pratoForm, preco: e.target.value })}
                placeholder="0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPratoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSavePrato} disabled={savePratoMutation.isPending}>
              {savePratoMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Bebida */}
      <Dialog open={bebidaDialogOpen} onOpenChange={setBebidaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBebida ? "Editar Bebida" : "Nova Bebida"}</DialogTitle>
            <DialogDescription>
              {editingBebida ? "Atualize as informações da bebida" : "Adicione uma nova bebida ao cardápio"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Bebida</Label>
              <Input 
                value={bebidaForm.nome}
                onChange={(e) => setBebidaForm({ ...bebidaForm, nome: e.target.value })}
                placeholder="Ex: Coca-Cola"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Input 
                  value={bebidaForm.tipo}
                  onChange={(e) => setBebidaForm({ ...bebidaForm, tipo: e.target.value })}
                  placeholder="Ex: Refrigerante"
                />
              </div>
              <div className="space-y-2">
                <Label>Tamanho</Label>
                <Input 
                  value={bebidaForm.tamanho}
                  onChange={(e) => setBebidaForm({ ...bebidaForm, tamanho: e.target.value })}
                  placeholder="Ex: 2L"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input 
                value={bebidaForm.valor}
                onChange={(e) => setBebidaForm({ ...bebidaForm, valor: e.target.value })}
                placeholder="0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBebidaDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveBebida} disabled={saveBebidaMutation.isPending}>
              {saveBebidaMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Borda */}
      <Dialog open={bordaDialogOpen} onOpenChange={setBordaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBorda ? "Editar Borda" : "Nova Borda"}</DialogTitle>
            <DialogDescription>
              {editingBorda ? "Atualize as informações da borda" : "Adicione uma nova borda recheada"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tamanho da Pizza</Label>
              <Input 
                value={bordaForm.tamanho_pizza}
                onChange={(e) => setBordaForm({ ...bordaForm, tamanho_pizza: e.target.value })}
                placeholder="Ex: Grande"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor da Borda (R$)</Label>
              <Input 
                value={bordaForm.valor_borda_recheada}
                onChange={(e) => setBordaForm({ ...bordaForm, valor_borda_recheada: e.target.value })}
                placeholder="0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBordaDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveBorda} disabled={saveBordaMutation.isPending}>
              {saveBordaMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteTarget?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteTarget && deleteMutation.mutate({ type: deleteTarget.type, id: deleteTarget.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cardapio;
