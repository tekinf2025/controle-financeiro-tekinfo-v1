import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Expense } from "@/types/expense";
import { TrendingUp } from "lucide-react";

interface MonthlyCostsChartProps {
  expenses: Expense[];
}

export const MonthlyCostsChart = ({ expenses }: MonthlyCostsChartProps) => {
  const chartData = useMemo(() => {
    const monthlyData = expenses
      .filter(expense => expense.tipo === 'Saida' && expense.data_vencimento && expense.valor && expense.categoria)
      .reduce((acc, expense) => {
        const date = new Date(expense.data_vencimento!);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        if (!acc[monthKey]) {
          acc[monthKey] = {
            monthKey: monthKey,
            mes: monthName,
            custoFixo: 0,
            custoExtra: 0,
            total: 0
          };
        }
        
        if (expense.categoria === 'Custo Fixo') {
          acc[monthKey].custoFixo += expense.valor;
        } else if (expense.categoria === 'Custo Extra') {
          acc[monthKey].custoExtra += expense.valor;
        }
        
        acc[monthKey].total = acc[monthKey].custoFixo + acc[monthKey].custoExtra;
        
        return acc;
      }, {} as Record<string, any>);

    return Object.values(monthlyData).sort((a: any, b: any) => a.monthKey.localeCompare(b.monthKey));
  }, [expenses]);

  const chartConfig = {
    custoFixo: {
      label: "Custo Fixo",
      color: "hsl(var(--primary))"
    },
    custoExtra: {
      label: "Custo Extra", 
      color: "hsl(var(--accent))"
    }
  };

  return (
    <Card className="w-full hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Custos Mensais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="custoFixoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="custoExtraGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="custoFixo"
                stackId="1"
                stroke="hsl(var(--primary))"
                fill="url(#custoFixoGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="custoExtra"
                stackId="1"
                stroke="hsl(var(--accent))"
                fill="url(#custoExtraGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};