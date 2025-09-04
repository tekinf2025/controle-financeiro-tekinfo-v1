export interface Expense {
  id: string;
  data_vencimento: string;
  descricao: string;
  observacao: string;
  categoria: string;
  tipo: 'Receita' | 'Saida';
  valor: number;
  status: 'Aberto' | 'Fechado';
  codigo_barras?: string;
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