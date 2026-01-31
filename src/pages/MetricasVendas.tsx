import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PieChart as PieChartIcon, TrendingUp, Package, DollarSign } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const CORES_NEON = [
  "hsl(186, 100%, 50%)",  // Cyan
  "hsl(300, 100%, 60%)",  // Magenta
  "hsl(150, 100%, 50%)",  // Green
  "hsl(270, 100%, 65%)",  // Purple
  "hsl(25, 100%, 55%)",   // Orange
  "hsl(60, 100%, 50%)",   // Yellow
  "hsl(340, 100%, 60%)",  // Pink
  "hsl(200, 100%, 55%)",  // Light Blue
  "hsl(120, 100%, 40%)",  // Dark Green
  "hsl(45, 100%, 50%)",   // Gold
];

// Função para extrair produtos de uma string de pedido
const extrairProdutos = (pedidoTexto: string): string[] => {
  const linhas = pedidoTexto.split('\n');
  const produtos: string[] = [];

  for (const linha of linhas) {
    // Ignorar linhas de subtotal, frete, total, observações
    const linhaLower = linha.toLowerCase();
    if (
      linhaLower.includes('subtotal') ||
      linhaLower.includes('frete') ||
      linhaLower.includes('total') ||
      linhaLower.includes('observ') ||
      linhaLower.includes('pagamento') ||
      linhaLower.includes('troco') ||
      linha.trim() === '' ||
      linha.trim() === '-'
    ) {
      continue;
    }

    // Extrair nome do produto removendo emojis, preços e quantidades
    let nomeProduto = linha
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
      .replace(/R\$\s*[\d.,]+/gi, '') // Remove preços
      .replace(/\d+x\s*/gi, '') // Remove quantidades como "2x"
      .replace(/^\s*-\s*/, '') // Remove traço inicial
      .replace(/[:|]\s*$/, '') // Remove : ou | no final
      .replace(/[:|]/g, '') // Remove : ou | no meio
      .trim()
      .toUpperCase();

    // Limpar espaços extras
    nomeProduto = nomeProduto.replace(/\s+/g, ' ').trim();

    if (nomeProduto.length > 2) {
      produtos.push(nomeProduto);
    }
  }

  return produtos;
};

// Função para formatar moeda
const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

// Função para extrair valor de uma string de total
const extrairValor = (totalStr: string): number => {
  if (!totalStr) return 0;
  const match = totalStr.replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(match) || 0;
};

const MetricasVendas = () => {
  const [dataInicio, setDataInicio] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Query para buscar pedidos
  const { data: pedidos, isLoading } = useQuery({
    queryKey: ['pedidos-metricas', dataInicio, dataFim],
    queryFn: async () => {
      const inicio = startOfDay(new Date(dataInicio)).toISOString();
      const fim = endOfDay(new Date(dataFim)).toISOString();

      const { data, error } = await supabase
        .from('pedidos_goodzap')
        .select('pedido, total, created_at')
        .gte('created_at', inicio)
        .lte('created_at', fim)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Calcular métricas
  const metricas = useMemo(() => {
    if (!pedidos || pedidos.length === 0) {
      return {
        produtosContagem: new Map<string, number>(),
        totalProdutos: 0,
        produtoMaisVendido: '-',
        faturamento: 0,
        dadosGrafico: []
      };
    }

    const produtosContagem = new Map<string, number>();
    let faturamento = 0;

    for (const pedido of pedidos) {
      // Extrair e contar produtos
      const produtos = extrairProdutos(pedido.pedido);
      for (const produto of produtos) {
        produtosContagem.set(produto, (produtosContagem.get(produto) || 0) + 1);
      }

      // Somar faturamento
      faturamento += extrairValor(pedido.total);
    }

    // Ordenar por quantidade
    const produtosOrdenados = Array.from(produtosContagem.entries())
      .sort((a, b) => b[1] - a[1]);

    const totalProdutos = produtosOrdenados.reduce((acc, [, qtd]) => acc + qtd, 0);
    const produtoMaisVendido = produtosOrdenados[0]?.[0] || '-';

    // Preparar dados para o gráfico (top 10 + outros)
    const top10 = produtosOrdenados.slice(0, 10);
    const outrosQtd = produtosOrdenados.slice(10).reduce((acc, [, qtd]) => acc + qtd, 0);

    const dadosGrafico = top10.map(([nome, quantidade], index) => ({
      name: nome.length > 20 ? nome.substring(0, 20) + '...' : nome,
      fullName: nome,
      value: quantidade,
      porcentagem: ((quantidade / totalProdutos) * 100).toFixed(1),
      cor: CORES_NEON[index % CORES_NEON.length]
    }));

    if (outrosQtd > 0) {
      dadosGrafico.push({
        name: 'OUTROS',
        fullName: 'OUTROS',
        value: outrosQtd,
        porcentagem: ((outrosQtd / totalProdutos) * 100).toFixed(1),
        cor: 'hsl(0, 0%, 50%)'
      });
    }

    return {
      produtosContagem,
      totalProdutos,
      produtoMaisVendido,
      faturamento,
      dadosGrafico,
      produtosOrdenados
    };
  }, [pedidos]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-3 border border-primary/30">
          <p className="text-foreground font-medium">{data.fullName}</p>
          <p className="text-primary">{data.value} vendas</p>
          <p className="text-muted-foreground">{data.porcentagem}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold neon-text flex items-center gap-3">
            <PieChartIcon className="h-8 w-8" />
            Métricas de Vendas
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise de vendas por produto
          </p>
        </div>

        {/* Filtros de data */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">De:</span>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-40 bg-background/50 border-border/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Até:</span>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-40 bg-background/50 border-border/50"
            />
          </div>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Produtos Vendidos
            </CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold neon-text">
              {isLoading ? '...' : metricas.totalProdutos}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              No período selecionado
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produto Mais Vendido
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-secondary truncate" title={metricas.produtoMaisVendido}>
              {isLoading ? '...' : metricas.produtoMaisVendido}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Campeão de vendas
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento no Período
            </CardTitle>
            <DollarSign className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold neon-text-green">
              {isLoading ? '...' : formatarMoeda(metricas.faturamento)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total em vendas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico e Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza */}
        <Card className="glass-card neon-border overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Distribuição de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {isLoading ? (
              <div className="h-64 sm:h-80 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Carregando...</div>
              </div>
            ) : metricas.dadosGrafico.length === 0 ? (
              <div className="h-64 sm:h-80 flex items-center justify-center">
                <p className="text-muted-foreground">Nenhum dado disponível</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Gráfico */}
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metricas.dadosGrafico}
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        innerRadius="40%"
                        dataKey="value"
                        labelLine={false}
                        label={({ porcentagem }) => `${porcentagem}%`}
                      >
                        {metricas.dadosGrafico.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.cor}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legenda customizada */}
                <div className="flex flex-wrap justify-center gap-2 px-2">
                  {metricas.dadosGrafico.map((entry, index) => (
                    <div 
                      key={`legend-${index}`}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <div 
                        className="w-3 h-3 rounded-sm shrink-0" 
                        style={{ backgroundColor: entry.cor }}
                      />
                      <span className="text-foreground truncate max-w-[100px] sm:max-w-[120px]" title={entry.fullName}>
                        {entry.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Ranking */}
        <Card className="glass-card neon-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              Ranking de Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Carregando...</div>
              </div>
            ) : !metricas.produtosOrdenados || metricas.produtosOrdenados.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">Nenhum dado disponível</p>
              </div>
            ) : (
              <div className="h-80 overflow-y-auto pr-2 space-y-2">
                {metricas.produtosOrdenados.slice(0, 15).map(([produto, quantidade], index) => (
                  <div
                    key={produto}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'border-yellow-500 text-yellow-500' :
                          index === 1 ? 'border-gray-400 text-gray-400' :
                          index === 2 ? 'border-amber-600 text-amber-600' :
                          'border-muted-foreground text-muted-foreground'
                        }`}
                      >
                        {index + 1}
                      </Badge>
                      <span className="text-sm font-medium text-foreground truncate max-w-[200px]" title={produto}>
                        {produto}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">
                        {quantidade}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({((quantidade / metricas.totalProdutos) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetricasVendas;
