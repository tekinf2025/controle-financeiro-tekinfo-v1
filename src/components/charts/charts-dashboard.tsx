import { Expense } from "@/types/expense";
import { MonthlyCostsChart } from "./monthly-costs-chart";
import { ExpenseCategoriesChart } from "./expense-categories-chart";
import { MonthlyExpensesChart } from "./monthly-expenses-chart";

interface ChartsDashboardProps {
  expenses: Expense[];
}

export const ChartsDashboard = ({ expenses }: ChartsDashboardProps) => {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Análise Financeira</h2>
          <p className="text-muted-foreground">Visualize seus dados financeiros com gráficos interativos</p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {/* First row - Monthly comparisons */}
        <div className="grid gap-6 lg:grid-cols-2">
          <MonthlyCostsChart expenses={expenses} />
          <MonthlyExpensesChart expenses={expenses} />
        </div>
        
        {/* Second row - Category breakdown */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ExpenseCategoriesChart expenses={expenses} />
          </div>
          <div className="lg:col-span-2 flex items-center justify-center">
            <div className="text-center space-y-4 p-8">
              <div className="bg-gradient-primary w-16 h-16 rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Insights Financeiros</h3>
              <p className="text-muted-foreground max-w-md">
                Acompanhe seus gastos por categoria e identifique oportunidades de economia. 
                Use os gráficos para entender melhor seus padrões de consumo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};