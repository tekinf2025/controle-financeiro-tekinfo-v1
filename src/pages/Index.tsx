import { useState, useMemo } from "react";
import { 
  Wallet,
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  CreditCard,
  Calculator,
  PiggyBank
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatsCard } from "@/components/stats-card";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { ChartsDashboard } from "@/components/charts/charts-dashboard";
import { Expense, ExpenseSummary } from "@/types/expense";
import { useToast } from "@/hooks/use-toast";

const initialExpenses: Expense[] = [];

const Index = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const summary: ExpenseSummary = useMemo(() => {
    const receitas = expenses.filter(e => e.tipo === 'Receita');
    const despesas = expenses.filter(e => e.tipo === 'Saida');
    
    const totalReceitas = receitas.reduce((sum, e) => sum + e.valor, 0);
    const totalDespesas = despesas.reduce((sum, e) => sum + e.valor, 0);
    const despesasAbertas = despesas.filter(e => e.status === 'Aberto').length;
    const despesasFechadas = despesas.filter(e => e.status === 'Fechado').length;

    return {
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
      despesasAbertas,
      despesasFechadas
    };
  }, [expenses]);

  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      // Edit existing expense
      const updatedExpense: Expense = {
        ...newExpense,
        id: editingExpense.id
      };
      setExpenses(prev => prev.map(exp => 
        exp.id === editingExpense.id ? updatedExpense : exp
      ));
      setEditingExpense(null);
      toast({
        title: "Lançamento atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    } else {
      // Add new expense
      const expense: Expense = {
        ...newExpense,
        id: Date.now().toString()
      };
      setExpenses(prev => [expense, ...prev]);
      toast({
        title: "Lançamento criado!",
        description: "Novo lançamento adicionado com sucesso.",
      });
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    toast({
      title: "Lançamento excluído!",
      description: "O lançamento foi removido com sucesso.",
    });
  };

  const handleToggleStatus = (id: string) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === id 
        ? { ...exp, status: exp.status === 'Aberto' ? 'Fechado' : 'Aberto' }
        : exp
    ));
    toast({
      title: "Status atualizado!",
      description: "Status do lançamento foi alterado.",
    });
  };

  const handleImportExpenses = (newExpenses: Expense[]) => {
    setExpenses(prev => [...newExpenses, ...prev]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4">
          <div className="flex items-center space-x-3">
            <Calculator className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-poppins text-xl md:text-2xl font-bold text-foreground tracking-wide">
                Dashboard Financeiro
              </h1>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Tekinformática</span> - <span className="italic">CEO Ricardo Moraes</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-1 items-center justify-end space-x-4">
            <p className="text-sm text-muted-foreground hidden md:block">
              Controle seus gastos de forma inteligente
            </p>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-screen-2xl px-4 py-4 space-y-6">

        {/* Stats Grid */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Saldo Atual"
            value={formatCurrency(summary.saldo)}
            description={summary.saldo >= 0 ? "Saldo positivo" : "Saldo negativo"}
            icon={<DollarSign />}
            variant={summary.saldo >= 0 ? "success" : "destructive"}
          />
          
          <StatsCard
            title="Total Receitas"
            value={formatCurrency(summary.totalReceitas)}
            description="Receitas do período"
            icon={<TrendingUp />}
            variant="success"
          />
          
          <StatsCard
            title="Total Despesas"
            value={formatCurrency(summary.totalDespesas)}
            description="Despesas do período"
            icon={<TrendingDown />}
            variant="destructive"
          />
          
          <StatsCard
            title="Contas Abertas"
            value={summary.despesasAbertas.toString()}
            description={`${summary.despesasFechadas} já pagas`}
            icon={<CreditCard />}
            variant="warning"
          />
        </section>

        {/* Charts Dashboard */}
        <ChartsDashboard expenses={expenses} />

        {/* Form and List Grid */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ExpenseForm 
              onAddExpense={handleAddExpense}
              editingExpense={editingExpense}
              onCancelEdit={() => setEditingExpense(null)}
            />
          </div>
          
          <div className="lg:col-span-2">
            <ExpenseList 
              expenses={expenses}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              onToggleStatus={handleToggleStatus}
              onImportExpenses={handleImportExpenses}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto max-w-screen-2xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-primary/20 rounded flex items-center justify-center">
                <Wallet className="h-3 w-3 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Tekinformática - Controle financeiro inteligente
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Desenvolvido com ❤️ usando React + Shadcn/UI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;