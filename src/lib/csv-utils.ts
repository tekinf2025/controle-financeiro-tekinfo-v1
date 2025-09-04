import { Expense } from "@/types/expense";

export const exportToCSV = (expenses: Expense[], filename: string = 'financeiro-dados.csv') => {
  // Cabeçalhos do CSV
  const headers = [
    'id',
    'data_vencimento', 
    'descricao',
    'observacao',
    'categoria',
    'tipo',
    'valor',
    'status',
    'codigo_barras'
  ];

  // Converter dados para CSV
  const csvContent = [
    headers.join(','), // Linha de cabeçalho
    ...expenses.map(expense => [
      expense.id,
      expense.data_vencimento || '',
      `"${expense.descricao.replace(/"/g, '""')}"`, // Escapar aspas
      `"${expense.observacao.replace(/"/g, '""')}"`, // Escapar aspas
      expense.categoria,
      expense.tipo,
      expense.valor.toString(),
      expense.status,
      expense.codigo_barras || ''
    ].join(','))
  ].join('\n');

  // Criar e baixar arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const importFromCSV = (file: File): Promise<Expense[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          throw new Error('Arquivo CSV deve conter pelo menos uma linha de dados além do cabeçalho');
        }

        // Pular a primeira linha (cabeçalho)
        const dataLines = lines.slice(1);
        
        const expenses: Expense[] = dataLines.map((line, index) => {
          // Parse CSV considerando campos entre aspas
          const values = parseCSVLine(line);
          
          if (values.length < 8) {
            throw new Error(`Linha ${index + 2} possui formato inválido`);
          }

          const [
            id,
            data_vencimento,
            descricao, 
            observacao,
            categoria,
            tipo,
            valor,
            status,
            codigo_barras
          ] = values;

          // Validações
          if (!descricao?.trim()) {
            throw new Error(`Linha ${index + 2}: Descrição é obrigatória`);
          }

          if (!categoria?.trim()) {
            throw new Error(`Linha ${index + 2}: Categoria é obrigatória`);
          }

          if (!['Receita', 'Saida'].includes(tipo)) {
            throw new Error(`Linha ${index + 2}: Tipo deve ser 'Receita' ou 'Saida'`);
          }

          if (!['Aberto', 'Fechado'].includes(status)) {
            throw new Error(`Linha ${index + 2}: Status deve ser 'Aberto' ou 'Fechado'`);
          }

          const valorNumerico = parseFloat(valor);
          if (isNaN(valorNumerico) || valorNumerico <= 0) {
            throw new Error(`Linha ${index + 2}: Valor deve ser um número positivo`);
          }

          return {
            id: id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
            data_vencimento: data_vencimento || '',
            descricao: descricao.trim(),
            observacao: observacao || '',
            categoria: categoria.trim(),
            tipo: tipo as 'Receita' | 'Saida',
            valor: valorNumerico,
            status: status as 'Aberto' | 'Fechado',
            codigo_barras: codigo_barras || undefined
          };
        });

        resolve(expenses);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo CSV'));
    };

    reader.readAsText(file, 'utf-8');
  });
};

// Função auxiliar para fazer parse de uma linha CSV considerando aspas
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Aspas duplas escapadas
        current += '"';
        i += 2;
      } else {
        // Início ou fim de campo com aspas
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Separador de campo
      result.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  result.push(current);
  return result;
};

// Template CSV para download
export const downloadCSVTemplate = () => {
  const headers = [
    'id',
    'data_vencimento',
    'descricao', 
    'observacao',
    'categoria',
    'tipo',
    'valor',
    'status',
    'codigo_barras'
  ];

  const exampleData = [
    '',
    '2025-01-15',
    'Exemplo - Conta de Luz',
    'Observação exemplo',
    'Custo Fixo',
    'Saida',
    '150.00',
    'Aberto',
    ''
  ];

  const csvContent = [
    headers.join(','),
    exampleData.join(',')
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo-financeiro.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};