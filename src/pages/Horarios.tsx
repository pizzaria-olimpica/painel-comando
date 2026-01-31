import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Clock, Calendar, Edit2, Plus, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const diasSemana = [
  { id: 0, nome: "Domingo" },
  { id: 1, nome: "Segunda-feira" },
  { id: 2, nome: "Terça-feira" },
  { id: 3, nome: "Quarta-feira" },
  { id: 4, nome: "Quinta-feira" },
  { id: 5, nome: "Sexta-feira" },
  { id: 6, nome: "Sábado" },
];

const Horarios = () => {
  const queryClient = useQueryClient();
  const [editingDia, setEditingDia] = useState<{
    dia_semana_id: number;
    dia_semana_nome: string;
    abre_as: string;
    fecha_as: string;
    ativo: boolean;
  } | null>(null);
  const [formData, setFormData] = useState({ abre_as: "", fecha_as: "" });

  const { data: horarios, isLoading } = useQuery({
    queryKey: ["horario_empresa_goodzap"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("horario_empresa_goodzap")
        .select("*")
        .order("dia_semana_id");
      if (error) throw error;
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ dia_semana_id, ativo }: { dia_semana_id: number; ativo: boolean }) => {
      const { error } = await supabase
        .from("horario_empresa_goodzap")
        .update({ ativo })
        .eq("dia_semana_id", dia_semana_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horario_empresa_goodzap"] });
      toast({ title: "Sucesso!", description: "Horário atualizado." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ dia_semana_id, abre_as, fecha_as }: { dia_semana_id: number; abre_as: string; fecha_as: string }) => {
      const { error } = await supabase
        .from("horario_empresa_goodzap")
        .update({ abre_as, fecha_as })
        .eq("dia_semana_id", dia_semana_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horario_empresa_goodzap"] });
      toast({ title: "Sucesso!", description: "Horário atualizado." });
      setEditingDia(null);
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao atualizar horário.", variant: "destructive" });
    },
  });

  const initMutation = useMutation({
    mutationFn: async () => {
      // Inserir todos os dias que não existem
      const existingIds = horarios?.map((h) => h.dia_semana_id) || [];
      const diasParaCriar = diasSemana.filter((d) => !existingIds.includes(d.id));
      
      if (diasParaCriar.length === 0) {
        throw new Error("Todos os dias já estão cadastrados.");
      }

      const { error } = await supabase.from("horario_empresa_goodzap").insert(
        diasParaCriar.map((d) => ({
          dia_semana_id: d.id,
          dia_semana_nome: d.nome,
          abre_as: "08:00",
          fecha_as: "22:00",
          ativo: true,
        }))
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horario_empresa_goodzap"] });
      toast({ title: "Sucesso!", description: "Dias da semana criados." });
    },
    onError: (error: Error) => {
      toast({ title: "Aviso", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (dia: typeof editingDia) => {
    if (dia) {
      setEditingDia(dia);
      setFormData({ abre_as: dia.abre_as, fecha_as: dia.fecha_as });
    }
  };

  const handleSave = () => {
    if (editingDia) {
      updateMutation.mutate({
        dia_semana_id: editingDia.dia_semana_id,
        abre_as: formData.abre_as,
        fecha_as: formData.fecha_as,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const diasFaltando = diasSemana.filter(
    (d) => !horarios?.some((h) => h.dia_semana_id === d.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            <span className="neon-text-cyan">Horários</span> de Funcionamento
          </h2>
          <p className="text-muted-foreground">
            Configure os dias e horários de atendimento
          </p>
        </div>
        {diasFaltando.length > 0 && (
          <Button
            onClick={() => initMutation.mutate()}
            disabled={initMutation.isPending}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Dias Faltantes ({diasFaltando.length})
          </Button>
        )}
      </div>

      <Card className="glass-card neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Dias da Semana
          </CardTitle>
          <CardDescription>Ative ou desative os dias de funcionamento e configure os horários</CardDescription>
        </CardHeader>
        <CardContent>
          {horarios && horarios.length > 0 ? (
            <div className="space-y-4">
              {horarios.map((dia) => (
                <div 
                  key={dia.dia_semana_id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    dia.ativo 
                      ? "bg-primary/5 border-primary/30" 
                      : "bg-muted/30 border-border/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Switch 
                      checked={dia.ativo}
                      onCheckedChange={(checked) => toggleMutation.mutate({ 
                        dia_semana_id: dia.dia_semana_id, 
                        ativo: checked 
                      })}
                    />
                    <div>
                      <h4 className={`font-medium ${dia.ativo ? "text-foreground" : "text-muted-foreground"}`}>
                        {dia.dia_semana_nome}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {dia.ativo && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="neon-text-cyan">
                          <Clock className="h-3 w-3 mr-1" />
                          {dia.abre_as}
                        </Badge>
                        <span className="text-muted-foreground">até</span>
                        <Badge variant="outline" className="neon-text-magenta">
                          <Clock className="h-3 w-3 mr-1" />
                          {dia.fecha_as}
                        </Badge>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(dia)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">Nenhum horário configurado</p>
              <Button onClick={() => initMutation.mutate()} disabled={initMutation.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Todos os Dias
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={!!editingDia} onOpenChange={(open) => !open && setEditingDia(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Horário - {editingDia?.dia_semana_nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="abre_as">Horário de Abertura</Label>
              <Input
                id="abre_as"
                type="time"
                value={formData.abre_as}
                onChange={(e) => setFormData({ ...formData, abre_as: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_as">Horário de Fechamento</Label>
              <Input
                id="fecha_as"
                type="time"
                value={formData.fecha_as}
                onChange={(e) => setFormData({ ...formData, fecha_as: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDia(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Horarios;
