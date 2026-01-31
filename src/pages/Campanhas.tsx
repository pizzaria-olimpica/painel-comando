import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Gift, Users, Plus, Sparkles, Save, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const Campanhas = () => {
  const queryClient = useQueryClient();

  // States for Aniversariantes
  const [aniversarioForm, setAniversarioForm] = useState({
    mensagem_1: "",
    mensagem_2: "",
    mensagem_3: "",
    quant_msg: 1,
    status: "inativo",
  });

  // States for Recuperação de Clientes
  const [recuperacaoForm, setRecuperacaoForm] = useState({
    mensagem: "",
    promocao: "",
    data_inicio: "",
    data_final: "",
    status: "inativo",
    ativa_promocao: "nao",
  });

  const { data: promocoes, isLoading: loadingPromocoes } = useQuery({
    queryKey: ["promocoes_goodzap"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promocoes_goodzap")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: aniversario, isLoading: loadingAniversario } = useQuery({
    queryKey: ["promocao_aniversario"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promocao_aniversario")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: recuperacao, isLoading: loadingRecuperacao } = useQuery({
    queryKey: ["recuperacao_clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recuperacao_clientes")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Populate forms with data
  useEffect(() => {
    if (aniversario) {
      setAniversarioForm({
        mensagem_1: aniversario.mensagem_1 || "",
        mensagem_2: aniversario.mensagem_2 || "",
        mensagem_3: aniversario.mensagem_3 || "",
        quant_msg: aniversario.quant_msg || 1,
        status: aniversario.status || "inativo",
      });
    }
  }, [aniversario]);

  useEffect(() => {
    if (recuperacao) {
      setRecuperacaoForm({
        mensagem: recuperacao.mensagem || "",
        promocao: recuperacao.promocao || "",
        data_inicio: recuperacao.data_inicio ? new Date(recuperacao.data_inicio).toISOString().split('T')[0] : "",
        data_final: recuperacao.data_final ? new Date(recuperacao.data_final).toISOString().split('T')[0] : "",
        status: recuperacao.status || "inativo",
        ativa_promocao: recuperacao.ativa_promocao || "nao",
      });
    }
  }, [recuperacao]);

  const togglePromoMutation = useMutation({
    mutationFn: async ({ id, ativa }: { id: number; ativa: boolean }) => {
      const { error } = await supabase
        .from("promocoes_goodzap")
        .update({ ativa })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promocoes_goodzap"] });
      toast({ title: "Sucesso!", description: "Promoção atualizada." });
    },
  });

  const saveAniversarioMutation = useMutation({
    mutationFn: async (data: typeof aniversarioForm) => {
      if (aniversario?.id) {
        const { error } = await supabase
          .from("promocao_aniversario")
          .update(data)
          .eq("id", aniversario.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("promocao_aniversario")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promocao_aniversario"] });
      toast({ title: "Sucesso!", description: "Campanha de aniversário salva." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
    },
  });

  const saveRecuperacaoMutation = useMutation({
    mutationFn: async (data: typeof recuperacaoForm) => {
      const dataToSave = {
        ...data,
        data_inicio: data.data_inicio ? new Date(data.data_inicio).toISOString() : null,
        data_final: data.data_final ? new Date(data.data_final).toISOString() : null,
      };
      
      if (recuperacao?.id) {
        const { error } = await supabase
          .from("recuperacao_clientes")
          .update(dataToSave)
          .eq("id", recuperacao.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("recuperacao_clientes")
          .insert([dataToSave]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recuperacao_clientes"] });
      toast({ title: "Sucesso!", description: "Campanha de recuperação salva." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
    },
  });

  const isLoading = loadingPromocoes || loadingAniversario || loadingRecuperacao;

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
            <span className="neon-text-green">Campanhas</span> e Promoções
          </h2>
          <p className="text-muted-foreground">
            Gerencie suas campanhas de marketing
          </p>
        </div>
        <Button className="neon-glow-green">
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Aniversariantes */}
      <Card className="glass-card neon-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-secondary" />
                Aniversariantes
              </CardTitle>
              <CardDescription>
                Envie até 3 mensagens automáticas para clientes aniversariantes
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                variant={aniversarioForm.status === "ativo" ? "default" : "secondary"}
                className={aniversarioForm.status === "ativo" ? "bg-green-500/20 text-green-400 border-green-500/50" : ""}
              >
                {aniversarioForm.status === "ativo" ? "Ativo" : "Inativo"}
              </Badge>
              <Switch 
                checked={aniversarioForm.status === "ativo"}
                onCheckedChange={(checked) => setAniversarioForm(prev => ({ ...prev, status: checked ? "ativo" : "inativo" }))}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Quantidade de mensagens a enviar</Label>
            <div className="flex gap-2">
              {[1, 2, 3].map((num) => (
                <Button
                  key={num}
                  variant={aniversarioForm.quant_msg === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAniversarioForm(prev => ({ ...prev, quant_msg: num }))}
                  className={aniversarioForm.quant_msg === num ? "neon-glow-magenta" : ""}
                >
                  {num} {num === 1 ? "mensagem" : "mensagens"}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Mensagem 1 
                <span className="text-xs text-muted-foreground">(7 dias antes do aniversário)</span>
              </Label>
              <Textarea 
                value={aniversarioForm.mensagem_1}
                onChange={(e) => setAniversarioForm(prev => ({ ...prev, mensagem_1: e.target.value }))}
                placeholder="Ex: Feliz aniversário, {nome}! 🎂 Temos um presente especial para você..."
                className="bg-muted/50 min-h-[80px]"
              />
            </div>

            {aniversarioForm.quant_msg >= 2 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Mensagem 2
                  <span className="text-xs text-muted-foreground">(enviada 3 dias antes do aniversário)</span>
                </Label>
                <Textarea 
                  value={aniversarioForm.mensagem_2}
                  onChange={(e) => setAniversarioForm(prev => ({ ...prev, mensagem_2: e.target.value }))}
                  placeholder="Ex: Oi {nome}! Não deixe seu presente de aniversário passar..."
                  className="bg-muted/50 min-h-[80px]"
                />
              </div>
            )}

            {aniversarioForm.quant_msg >= 3 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Mensagem 3
                  <span className="text-xs text-muted-foreground">(enviada no dia do aniversário)</span>
                </Label>
                <Textarea 
                  value={aniversarioForm.mensagem_3}
                  onChange={(e) => setAniversarioForm(prev => ({ ...prev, mensagem_3: e.target.value }))}
                  placeholder="Ex: Última chance, {nome}! Seu desconto de aniversário expira hoje..."
                  className="bg-muted/50 min-h-[80px]"
                />
              </div>
            )}
          </div>

          <Button 
            onClick={() => saveAniversarioMutation.mutate(aniversarioForm)}
            disabled={saveAniversarioMutation.isPending}
            className="neon-glow-magenta"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveAniversarioMutation.isPending ? "Salvando..." : "Salvar Campanha de Aniversário"}
          </Button>
        </CardContent>
      </Card>

      {/* Recuperação de Clientes */}
      <Card className="glass-card neon-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Recuperação de Clientes
              </CardTitle>
              <CardDescription>
                Reative clientes inativos com ofertas especiais baseadas no período sem compras
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                variant={recuperacaoForm.status === "ativo" ? "default" : "secondary"}
                className={recuperacaoForm.status === "ativo" ? "bg-green-500/20 text-green-400 border-green-500/50" : ""}
              >
                {recuperacaoForm.status === "ativo" ? "Ativo" : "Inativo"}
              </Badge>
              <Switch 
                checked={recuperacaoForm.status === "ativo"}
                onCheckedChange={(checked) => setRecuperacaoForm(prev => ({ ...prev, status: checked ? "ativo" : "inativo" }))}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Clientes sem compra desde
              </Label>
              <Input 
                type="date"
                value={recuperacaoForm.data_inicio}
                onChange={(e) => setRecuperacaoForm(prev => ({ ...prev, data_inicio: e.target.value }))}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Até a data
              </Label>
              <Input 
                type="date"
                value={recuperacaoForm.data_final}
                onChange={(e) => setRecuperacaoForm(prev => ({ ...prev, data_final: e.target.value }))}
                className="bg-muted/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mensagem de recuperação</Label>
            <Textarea 
              value={recuperacaoForm.mensagem}
              onChange={(e) => setRecuperacaoForm(prev => ({ ...prev, mensagem: e.target.value }))}
              placeholder="Ex: Oi {nome}! Sentimos sua falta! Que tal voltar a pedir? Temos uma oferta especial para você..."
              className="bg-muted/50 min-h-[100px]"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Incluir promoção especial?</Label>
              <Switch 
                checked={recuperacaoForm.ativa_promocao === "sim"}
                onCheckedChange={(checked) => setRecuperacaoForm(prev => ({ ...prev, ativa_promocao: checked ? "sim" : "nao" }))}
              />
            </div>
            
            {recuperacaoForm.ativa_promocao === "sim" && (
              <div className="space-y-2">
                <Label>Descrição da promoção</Label>
                <Textarea 
                  value={recuperacaoForm.promocao}
                  onChange={(e) => setRecuperacaoForm(prev => ({ ...prev, promocao: e.target.value }))}
                  placeholder="Ex: 15% de desconto na próxima compra usando o código VOLTEI15"
                  className="bg-muted/50 min-h-[80px]"
                />
              </div>
            )}
          </div>

          <Button 
            onClick={() => saveRecuperacaoMutation.mutate(recuperacaoForm)}
            disabled={saveRecuperacaoMutation.isPending}
            className="neon-glow-cyan"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveRecuperacaoMutation.isPending ? "Salvando..." : "Salvar Campanha de Recuperação"}
          </Button>
        </CardContent>
      </Card>

      {/* Promotions List */}
      <Card className="glass-card neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Promoções Ativas
          </CardTitle>
          <CardDescription>Lista de promoções do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {promocoes && promocoes.length > 0 ? (
            <div className="space-y-4">
              {promocoes.map((promo) => (
                <div 
                  key={promo.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{promo.promocao}</h4>
                    {promo.regras && (
                      <p className="text-sm text-muted-foreground mt-1">{promo.regras}</p>
                    )}
                  </div>
                  <Switch 
                    checked={promo.ativa || false}
                    onCheckedChange={(checked) => togglePromoMutation.mutate({ id: promo.id, ativa: checked })}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma promoção cadastrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Campanhas;
