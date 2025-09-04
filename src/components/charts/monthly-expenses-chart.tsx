import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Expense } from "@/types/expense";
import { BarChart3 } from "lucide-react";

interface MonthlyExpensesChartProps {
  expenses: Expense[];
}

export const MonthlyExpensesChart = ({ expenses }: MonthlyExpensesChartProps) => {
  const chartData = useMemo(() => {
    const monthlyData = expenses.reduce((acc, expense) => {
      // Skip expenses without valid data
      if (!expense.data_vencimento || !expense.valor || !expense.tipo) return acc;
      
      const date = new Date(expense.data_vencimento);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          monthKey: monthKey,
          mes: monthName,
          receitas: 0,
          despesas: 0,
          saldo: 0
        };
      }
      
      if (expense.tipo === 'Receita') {
        acc[monthKey].receitas += expense.valor;
      } else {
        acc[monthKey].despesas += expense.valor;
      }
      
      acc[monthKey].saldo = acc[monthKey].receitas - acc[monthKey].despesas;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyData).sort((a: any, b: any) => a.monthKey.localeCompare(b.monthKey));
  }, [expenses]);

  const chartConfig = {
    receitas: {
      label: "Receitas",
      color: "hsl(var(--secondary))"
    },
    despesas: {
      label: "Despesas",
      color: "hsl(var(--destructive))"
    },
    saldo: {
      label: "Saldo",
      color: "hsl(var(--warning))"
    }
  };

  return (
    <Card className="w-full hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-destructive" />
          Receitas vs Despesas Mensais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barCategoryGap="20%"
            >
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
              <Bar 
                dataKey="receitas" 
                fill="hsl(var(--secondary))"
                radius={[4, 4, 0, 0]}
                stroke="hsl(var(--secondary))"
                strokeWidth={1}
              />
              <Bar 
                dataKey="despesas" 
                fill="hsl(var(--destructive))"
                radius={[4, 4, 0, 0]}
                stroke="hsl(var(--destructive))"
                strokeWidth={1}
              />
              <Bar 
                dataKey="saldo" 
                fill="hsl(var(--warning))"
                radius={[4, 4, 0, 0]}
                stroke="hsl(var(--warning))"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};