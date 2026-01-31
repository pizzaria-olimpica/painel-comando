import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Phone, MapPin, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const Empresa = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nome_empresa: "",
    telefone_empresa: "",
    whatsapp_empresa: "",
    cep_empresa: "",
    rua_empresa: "",
    numero_empresa: "",
    bairro_empresa: "",
    cidade_empresa: "",
  });

  const { data: empresa, isLoading } = useQuery({
    queryKey: ["empresa_info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresa_info")
        .select("*")
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  useEffect(() => {
    if (empresa) {
      setFormData({
        nome_empresa: empresa.nome_empresa || "",
        telefone_empresa: empresa.telefone_empresa || "",
        whatsapp_empresa: empresa.whatsapp_empresa || "",
        cep_empresa: empresa.cep_empresa || "",
        rua_empresa: empresa.rua_empresa || "",
        numero_empresa: empresa.numero_empresa || "",
        bairro_empresa: empresa.bairro_empresa || "",
        cidade_empresa: empresa.cidade_empresa || "",
      });
    }
  }, [empresa]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (empresa?.id) {
        const { error } = await supabase
          .from("empresa_info")
          .update(data)
          .eq("id", empresa.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("empresa_info")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresa_info"] });
      toast({ title: "Sucesso!", description: "Informações salvas com sucesso." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao salvar informações.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
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
      <div>
        <h2 className="text-3xl font-bold mb-2">
          <span className="neon-text-cyan">Informações</span> da Empresa
        </h2>
        <p className="text-muted-foreground">
          Gerencie os dados da sua empresa
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="glass-card neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Dados Gerais
            </CardTitle>
            <CardDescription>Informações básicas da empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Empresa</Label>
              <Input 
                id="nome" 
                value={formData.nome_empresa}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_empresa: e.target.value }))}
                placeholder="Digite o nome da empresa"
                className="bg-muted/50 border-border/50 focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-secondary" />
              Contato
            </CardTitle>
            <CardDescription>Telefones para contato</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input 
                id="telefone" 
                value={formData.telefone_empresa}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone_empresa: e.target.value }))}
                placeholder="(00) 0000-0000"
                className="bg-muted/50 border-border/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input 
                id="whatsapp" 
                value={formData.whatsapp_empresa}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_empresa: e.target.value }))}
                placeholder="(00) 00000-0000"
                className="bg-muted/50 border-border/50 focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              Endereço
            </CardTitle>
            <CardDescription>Localização da empresa</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input 
                id="cep" 
                value={formData.cep_empresa}
                onChange={(e) => setFormData(prev => ({ ...prev, cep_empresa: e.target.value }))}
                placeholder="00000-000"
                className="bg-muted/50 border-border/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rua">Rua</Label>
              <Input 
                id="rua" 
                value={formData.rua_empresa}
                onChange={(e) => setFormData(prev => ({ ...prev, rua_empresa: e.target.value }))}
                placeholder="Nome da rua"
                className="bg-muted/50 border-border/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input 
                id="numero" 
                value={formData.numero_empresa}
                onChange={(e) => setFormData(prev => ({ ...prev, numero_empresa: e.target.value }))}
                placeholder="123"
                className="bg-muted/50 border-border/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input 
                id="bairro" 
                value={formData.bairro_empresa}
                onChange={(e) => setFormData(prev => ({ ...prev, bairro_empresa: e.target.value }))}
                placeholder="Nome do bairro"
                className="bg-muted/50 border-border/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input 
                id="cidade" 
                value={formData.cidade_empresa}
                onChange={(e) => setFormData(prev => ({ ...prev, cidade_empresa: e.target.value }))}
                placeholder="Nome da cidade"
                className="bg-muted/50 border-border/50 focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full md:w-auto neon-glow-cyan"
          disabled={mutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {mutation.isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>
    </div>
  );
};

export default Empresa;
