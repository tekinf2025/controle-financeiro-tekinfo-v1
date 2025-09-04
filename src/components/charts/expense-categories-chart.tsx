import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Expense } from "@/types/expense";
import { PieChartIcon } from "lucide-react";

interface ExpenseCategoriesChartProps {
  expenses: Expense[];
}

export const ExpenseCategoriesChart = ({ expenses }: ExpenseCategoriesChartProps) => {
  const chartData = useMemo(() => {
    const categoryData = expenses
      .filter(expense => expense.tipo === 'Saida')
      .reduce((acc, expense) => {
        const description = expense.descricao;
        
        if (!acc[description]) {
          acc[description] = {
            descricao: description,
            valor: 0,
            quantidade: 0
          };
        }
        
        acc[description].valor += expense.valor;
        acc[description].quantidade += 1;
        
        return acc;
      }, {} as Record<string, any>);

    return Object.values(categoryData);
  }, [expenses]);

  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))", 
    "hsl(var(--accent))",
    "hsl(var(--warning))",
    "hsl(var(--destructive))",
    "hsl(var(--primary-light))",
    "hsl(var(--secondary-light))",
    "hsl(var(--accent-light))"
  ];

  const chartConfig = chartData.reduce((config, item, index) => {
    config[item.descricao] = {
      label: item.descricao,
      color: colors[index % colors.length]
    };
    return config;
  }, {} as any);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.descricao}</p>
          <p className="text-sm text-muted-foreground">
            Valor: R$ {data.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-muted-foreground">
            Quantidade: {data.quantidade} lançamento{data.quantidade !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-secondary" />
          Gastos por Descrição
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ descricao, percent }) => 
                  percent > 0.05 ? `${descricao} ${(percent * 100).toFixed(0)}%` : ''
                }
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="valor"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};