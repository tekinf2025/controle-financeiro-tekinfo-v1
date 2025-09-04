import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/types/expense';
import { useToast } from '@/hooks/use-toast';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch expenses from database
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financeiro_lancamentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os lançamentos.",
          variant: "destructive",
        });
        return;
      }

      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os lançamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new expense
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('financeiro_lancamentos')
        .insert([{
          ...expenseData,
          id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: expenseData.status || 'Pendente'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding expense:', error);
        toast({
          title: "Erro ao criar lançamento",
          description: "Não foi possível criar o lançamento.",
          variant: "destructive",
        });
        return false;
      }

      setExpenses(prev => [data, ...prev]);
      toast({
        title: "Lançamento criado!",
        description: "Novo lançamento adicionado com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Erro ao criar lançamento",
        description: "Não foi possível criar o lançamento.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Update expense
  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    try {
      const { data, error } = await supabase
        .from('financeiro_lancamentos')
        .update({
          ...expenseData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating expense:', error);
        toast({
          title: "Erro ao atualizar lançamento",
          description: "Não foi possível atualizar o lançamento.",
          variant: "destructive",
        });
        return false;
      }

      setExpenses(prev => prev.map(exp => exp.id === id ? data : exp));
      toast({
        title: "Lançamento atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Erro ao atualizar lançamento",
        description: "Não foi possível atualizar o lançamento.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete expense
  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financeiro_lancamentos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting expense:', error);
        toast({
          title: "Erro ao excluir lançamento",
          description: "Não foi possível excluir o lançamento.",
          variant: "destructive",
        });
        return false;
      }

      setExpenses(prev => prev.filter(exp => exp.id !== id));
      toast({
        title: "Lançamento excluído!",
        description: "O lançamento foi removido com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Erro ao excluir lançamento",
        description: "Não foi possível excluir o lançamento.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Toggle expense status
  const toggleExpenseStatus = async (id: string) => {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return false;

    const newStatus = expense.status === 'Aberto' ? 'Fechado' : 'Aberto';
    return await updateExpense(id, { status: newStatus });
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    toggleExpenseStatus,
    refetch: fetchExpenses
  };
}