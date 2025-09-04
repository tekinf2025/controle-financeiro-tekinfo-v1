export interface Expense {
  id: string;
  data_vencimento: string | null;
  descricao: string | null;
  observacao: string | null;
  categoria: string | null;
  tipo: string | null;
  valor: number | null;
  status: string | null;
  codigo_barras: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseSummary {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  despesasAbertas: number;
  despesasFechadas: number;
}

export type ExpenseCategory = 
  | 'Custo Fixo'
  | 'Custo Extra'
  | 'Receita';