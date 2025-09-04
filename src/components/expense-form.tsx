import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Plus, Wallet, Edit } from "lucide-react";
import { Expense, ExpenseCategory } from "@/types/expense";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  editingExpense?: Expense | null;
  onCancelEdit?: () => void;
}

const categories: ExpenseCategory[] = [
  'Custo Fixo',
  'Custo Extra', 
  'Receita'
];

export function ExpenseForm({ onAddExpense, editingExpense, onCancelEdit }: ExpenseFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    data_vencimento: '',
    descricao: '',
    observacao: '',
    categoria: '',
    tipo: 'Saida' as 'Receita' | 'Saida',
    valor: '',
    status: 'Aberto' as 'Aberto' | 'Fechado',
    codigo_barras: ''
  });

  // Populate form when editing expense changes
  useEffect(() => {
    if (editingExpense) {
      setFormData({
        data_vencimento: editingExpense.data_vencimento || '',
        descricao: editingExpense.descricao,
        observacao: editingExpense.observacao,
        categoria: editingExpense.categoria,
        tipo: editingExpense.tipo,
        valor: editingExpense.valor.toString(),
        status: editingExpense.status,
        codigo_barras: editingExpense.codigo_barras || ''
      });
    } else {
      setFormData({
        data_vencimento: '',
        descricao: '',
        observacao: '',
        categoria: '',
        tipo: 'Saida',
        valor: '',
        status: 'Aberto',
        codigo_barras: ''
      });
    }
  }, [editingExpense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.valor || !formData.categoria) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const expense: Omit<Expense, 'id'> = {
      ...formData,
      valor: parseFloat(formData.valor)
    };

    onAddExpense(expense);
    
    // Only reset form if not editing
    if (!editingExpense) {
      setFormData({
        data_vencimento: '',
        descricao: '',
        observacao: '',
        categoria: '',
        tipo: 'Saida',
        valor: '',
        status: 'Aberto',
        codigo_barras: ''
      });
    }
  };

  return (
    <Card className="bg-gradient-card border-border hover:shadow-soft transition-smooth">
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            {editingExpense ? (
              <Edit className="h-4 w-4 text-primary-foreground" />
            ) : (
              <Plus className="h-4 w-4 text-primary-foreground" />
            )}
          </div>
          <div>
            <CardTitle className="text-xl">
              {editingExpense ? "Editar Lançamento" : "Nova Transação"}
            </CardTitle>
            <CardDescription>
              {editingExpense 
                ? "Altere os dados do lançamento" 
                : "Adicione uma nova receita ou despesa"
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                placeholder="Ex: Conta de luz"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor *</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="pl-10"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={formData.tipo} onValueChange={(value: 'Receita' | 'Saida') => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receita">Receita</SelectItem>
                  <SelectItem value="Saida">Saida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_vencimento">Data de Vencimento</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-foreground" />
                <Input
                  id="data_vencimento"
                  type="date"
                  className="pl-10"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'Aberto' | 'Fechado') => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aberto">Aberto</SelectItem>
                  <SelectItem value="Fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observações</Label>
            <Textarea
              id="observacao"
              placeholder="Observações adicionais..."
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo_barras">Código de Barras</Label>
            <Input
              id="codigo_barras"
              placeholder="Código de barras (opcional)"
              value={formData.codigo_barras}
              onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            {editingExpense && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancelEdit}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              className={cn(
                "bg-gradient-primary hover:shadow-glow transition-smooth",
                editingExpense ? "flex-1" : "w-full"
              )}
            >
              {editingExpense ? (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Transação
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}